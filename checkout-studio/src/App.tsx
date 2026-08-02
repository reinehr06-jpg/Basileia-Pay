import { useState, useCallback, useEffect, useRef } from 'react';
import type { BreakpointId, Scene } from './core/types';
import { sceneReducer, genId } from './core/sceneReducer';
import type { SceneAction } from './core/sceneReducer';
import { createDefaultScene } from './core/initialScene';
import { TEMPLATES, type Template } from './core/templates';
import { analyzeTrust, type TrustScore } from './core/trustRadar';
import { useUndoRedo } from './core/useUndoRedo';
import { fetchCheckouts, fetchCheckout, saveCheckout, publishCheckout, type CheckoutScene } from './core/api';
import { setToken, setApiUrl } from './core/session';
import { Toolbar } from './editor/Toolbar';
import { Canvas } from './editor/Canvas';
import { PropsPanel } from './editor/PropsPanel';
import { LayersPanel } from './editor/LayersPanel';
import { ComponentPalette } from './editor/ComponentPalette';
import { CheckoutRuntime } from './runtime/CheckoutRuntime';
import { ErrorBoundary } from './ErrorBoundary';
import { CONFIG } from './config';
import { trackEvent } from './core/analytics';
import './App.css';

type StudioMode = 'builder' | 'preview' | 'split';
type SidePanel = 'layers' | 'templates' | 'trust' | 'saved';

export default function App() {
  const { scene, dispatch, undo, redo, canUndo, canRedo, setScene } = useUndoRedo(createDefaultScene());
  const [mode, setMode] = useState<StudioMode>('builder');
  const [breakpoint, setBreakpoint] = useState<BreakpointId>('desktop');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [sidePanel, setSidePanel] = useState<SidePanel>('layers');
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [templates, setTemplates] = useState<Template[]>(TEMPLATES);
  const [savedCheckouts, setSavedCheckouts] = useState<CheckoutScene[]>([]);
  const [checkoutName, setCheckoutName] = useState('Meu Checkout');
  const [currentCheckoutId, setCurrentCheckoutId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // URL params for public rendering
  const urlParams = new URLSearchParams(window.location.search);
  const isPublicMode = urlParams.get('public') === 'true';
  const publicSystemId = urlParams.get('system_id');

  const [publicLoading, setPublicLoading] = useState(isPublicMode);

  // Analyze trust on scene change
  useEffect(() => {
    setTrustScore(analyzeTrust(scene));
  }, [scene]);

  // Load public checkout
  useEffect(() => {
    if (isPublicMode && publicSystemId) {
      const fetchPublic = async () => {
        try {
          const res = await fetch(getApiUrl(`/public/checkouts/${publicSystemId}`));
          if (res.ok) {
            const data = await res.json();
            if (data.data?.config) {
              setScene(data.data.config);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setPublicLoading(false);
        }
      };
      fetchPublic();
    }
  }, [isPublicMode, publicSystemId, setScene]);

  // Load saved checkouts
  useEffect(() => {
    fetchCheckouts().then(data => {
      setSavedCheckouts(data);
      setLoading(false);
    }).catch((err) => {
      setLoading(false);
      showToast('Erro ao carregar checkouts salvos.');
      console.error('fetchCheckouts error:', err);
    });
  }, []);

  // Refs for postMessage communication (stable across renders)
  const loadCheckoutRef = useRef<typeof handleLoadCheckout>(async () => {});
  const undoRef = useRef<() => void>(() => {});

  // PostMessage communication with parent (dashboard iframe)
  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      const { type, payload } = event.data || {};
      if (type === 'STUDIO_INIT') {
        if (payload?.token) {
          setToken(payload.token);
        }
        if (payload?.apiUrl) {
          setApiUrl(payload.apiUrl);
        }
        if (payload?.checkoutId) {
          await loadCheckoutRef.current(payload.checkoutId);
        }
      }
      if (type === 'STUDIO_UNDO') {
        undoRef.current();
      }
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: 'STUDIO_READY' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), CONFIG.TOAST_DURATION);
  }, []);

  const handleSave = useCallback(async (): Promise<string | null> => {
    setSaving(true);
    const payload: CheckoutScene = { name: checkoutName, config: scene as unknown as Record<string, unknown>, status: 'draft' };
    if (currentCheckoutId) payload.id = currentCheckoutId;
    const result = await saveCheckout(payload);
    setSaving(false);
    if (result) {
      setCurrentCheckoutId(result.id ?? null);
      showToast('Checkout salvo com sucesso!');
      fetchCheckouts().then(setSavedCheckouts);
      trackEvent('studio_checkout_saved', { checkoutId: result.id, elementsCount: Object.keys(scene.nodes).length });
      window.parent.postMessage({ type: 'STUDIO_SAVED', payload: { id: result.id } }, '*');
      return result.id ?? null;
    } else {
      showToast('Erro ao salvar. Verifique a conexao com a API.');
      window.parent.postMessage({ type: 'STUDIO_ERROR', payload: { message: 'Erro ao salvar' } }, '*');
      return null;
    }
  }, [checkoutName, scene, currentCheckoutId, showToast]);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    const id = currentCheckoutId ?? await handleSave();
    if (!id) {
      showToast('Salve o checkout antes de publicar.');
      setPublishing(false);
      window.parent.postMessage({ type: 'STUDIO_ERROR', payload: { message: 'Salve antes de publicar' } }, '*');
      return;
    }
    const result = await publishCheckout(id);
    setPublishing(false);
    if (result) {
      showToast('Checkout publicado!');
      trackEvent('studio_checkout_published', { checkoutId: id });
      window.parent.postMessage({ type: 'STUDIO_PUBLISHED', payload: { id } }, '*');
    } else {
      showToast('Erro ao publicar.');
      window.parent.postMessage({ type: 'STUDIO_ERROR', payload: { message: 'Erro ao publicar' } }, '*');
    }
  }, [currentCheckoutId, handleSave, showToast]);

  const handleLoadTemplate = useCallback((tpl: Template) => {
    setScene(tpl.scene);
    setCheckoutName(tpl.name);
    showToast(`Template "${tpl.name}" carregado`);
  }, [setScene, showToast]);

  const handleLoadCheckout = useCallback(async (id: string) => {
    showToast('Carregando checkout...');
    const data = await fetchCheckout(id);
    if (data?.config) {
      const loadedScene = data.config as unknown as Scene;
      setScene(loadedScene);
      setCheckoutName(data.name);
      setCurrentCheckoutId(data.id ?? id);
      showToast(`Checkout "${data.name}" carregado`);
      trackEvent('studio_loaded', { checkoutId: data.id ?? id, isNew: false });
    } else {
      showToast('Erro ao carregar checkout.');
    }
  }, [setScene, showToast]);

  // Wire refs for postMessage
  useEffect(() => { loadCheckoutRef.current = handleLoadCheckout; }, [handleLoadCheckout]);
  useEffect(() => { undoRef.current = undo; }, [undo]);

  // Keyboard Shortcuts and Copy/Paste
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (cmdOrCtrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          dispatch({ type: 'DELETE_NODE', nodeId: selectedId });
          setSelectedId(undefined);
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        if (selectedId) {
          const buildTree = (id: string): any => {
            const n = scene.nodes[id];
            if (!n) return null;
            return { ...n, _childrenNodes: n.children.map(buildTree).filter(Boolean) };
          };
          const tree = buildTree(selectedId);
          if (tree && tree.kind !== 'page') {
            e.preventDefault();
            await navigator.clipboard.writeText(JSON.stringify({ __type: 'STUDIO_NODE', tree }));
            showToast('Componente copiado!');
          }
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
        try {
          const text = await navigator.clipboard.readText();
          const data = JSON.parse(text);
          if (data.__type === 'STUDIO_NODE' && data.tree) {
            e.preventDefault();
            
            const nodesToAdd: any[] = [];
            const restoreTree = (n: any, parentId?: string): string => {
              const newId = genId(n.kind[0]);
              const newChildrenIds = (n._childrenNodes || []).map((child: any) => restoreTree(child, newId));
              const node = { ...n, id: newId, parentId, children: newChildrenIds };
              delete node._childrenNodes;
              nodesToAdd.push(node);
              return newId;
            };

            const parentTarget = selectedId 
              ? (scene.nodes[selectedId]?.kind === 'element' ? scene.nodes[selectedId]?.parentId : selectedId) 
              : scene.rootId;
            
            if (parentTarget) {
              const newRootId = restoreTree(data.tree, parentTarget);
              const parentNode = scene.nodes[parentTarget];
              
              if (parentNode) {
                const newNodes = { ...scene.nodes };
                nodesToAdd.forEach(n => { newNodes[n.id] = n; });
                newNodes[parentTarget] = {
                  ...parentNode,
                  children: [...parentNode.children, newRootId]
                };
                dispatch({ type: 'LOAD_SCENE', scene: { ...scene, nodes: newNodes } });
                showToast('Componente colado!');
              }
            }
          }
        } catch (err) {
          // ignore
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, scene, undo, redo, dispatch, showToast]);

  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exportado com sucesso');
  }, [scene, showToast]);

  const handleMove = useCallback((nodeId: string, newParentId: string, index?: number) => {
    dispatch({ type: 'MOVE_NODE', nodeId, newParentId, index } as SceneAction);
  }, [dispatch]);

  const addTarget = selectedId
    ? (() => {
        const node = scene.nodes[selectedId];
        if (!node) return scene.rootId;
        if (node.kind !== 'element') return node.id;
        return node.parentId ?? scene.rootId;
      })()
    : scene.rootId;

  const showCanvas = mode === 'builder' || mode === 'split';
  const showPreview = mode === 'preview' || mode === 'split';

  if (isPublicMode) {
    if (publicLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>Carregando checkout...</div>;
    return (
      <div className="public-checkout-runtime">
        <CheckoutRuntime scene={scene} breakpoint="desktop" state={{ step: 'payment', method: 'pix' }} onPixPay={() => alert('Pix pay!')} onCardPay={() => alert('Card pay!')} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="studio-app">
        {toast && <div className="studio-toast">{toast}</div>}

        <Toolbar
          mode={mode}
          onModeChange={setMode}
          breakpoint={breakpoint}
          onBreakpointChange={setBreakpoint}
          onExportJSON={handleExportJSON}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div className="studio-body">
          {/* Left sidebar */}
          {showCanvas && (
            <div className="studio-sidebar-left">
              <div className="sidebar-tabs">
                <button className={sidePanel === 'layers' ? 'active' : ''} onClick={() => setSidePanel('layers')}>Layers</button>
                <button className={sidePanel === 'templates' ? 'active' : ''} onClick={() => setSidePanel('templates')}>Templates</button>
                <button className={sidePanel === 'trust' ? 'active' : ''} onClick={() => setSidePanel('trust')}>Trust</button>
                <button className={sidePanel === 'saved' ? 'active' : ''} onClick={() => setSidePanel('saved')}>Saved</button>
              </div>

              {sidePanel === 'layers' && <LayersPanel scene={scene} selectedId={selectedId} onSelect={setSelectedId} dispatch={dispatch} />}
              {sidePanel === 'templates' && (
                <div className="templates-panel">
                  <h4 className="palette-title">Templates</h4>
                  <div className="templates-grid">
                    {templates.map(t => (
                      <button key={t.id} className="template-card" onClick={() => handleLoadTemplate(t)}>
                        <span className="template-icon">{t.category === 'pix' ? 'QR' : t.category === 'card' ? 'CC' : 'SUB'}</span>
                        <span className="template-name">{t.name}</span>
                        <span className="template-desc">{t.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {sidePanel === 'trust' && trustScore && (
                <div className="trust-panel">
                  <h4 className="palette-title">Trust Radar</h4>
                  <div className="trust-score-display">
                    <div className="trust-circle" style={{ background: `conic-gradient(${trustScore.score > 70 ? '#10b981' : trustScore.score > 40 ? '#f59e0b' : '#ef4444'} ${trustScore.score * 3.6}deg, #1e293b 0deg)` }}>
                      <span className="trust-value">{trustScore.score}</span>
                    </div>
                    <span className="trust-label">/ 100</span>
                  </div>
                  {trustScore.issues.map(issue => (
                    <div key={issue.id} className={`trust-issue ${issue.severity}`}>
                      <span className="issue-severity">{issue.severity === 'critical' ? 'CRIT' : issue.severity === 'warning' ? 'WARN' : 'INFO'}</span>
                      <div>
                        <strong>{issue.message}</strong>
                        <p>{issue.suggestion}</p>
                      </div>
                    </div>
                  ))}
                  <div className="trust-breakdown">
                    {Object.entries(trustScore.breakdown).map(([key, val]) => (
                      <div key={key} className="trust-bar">
                        <span>{key}</span>
                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${val * 10}%` }} /></div>
                        <span>{val}/15</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {sidePanel === 'saved' && (
                <div className="saved-panel">
                  <h4 className="palette-title">Checkouts Salvos</h4>
                  {loading ? <p className="loading-text">Carregando...</p> : savedCheckouts.length === 0 ? <p className="empty-text">Nenhum checkout salvo</p> : savedCheckouts.map(sc => (
                    <button key={sc.id || sc.name} className="saved-item" onClick={() => handleLoadCheckout(sc.id || '')}>
                      <span>{sc.name}</span>
                      <span className="saved-status">{sc.status}</span>
                    </button>
                  ))}
                </div>
              )}
              <ComponentPalette targetParentId={addTarget} dispatch={dispatch} />
            </div>
          )}

          {/* Main canvas / preview */}
          <main className={`studio-main ${mode === 'split' ? 'studio-main-split' : ''}`}>
            {showCanvas && (
              <div className={mode === 'split' ? 'studio-half' : 'studio-full'}>
                <div className="checkout-name-bar">
                  <input className="checkout-name-input" value={checkoutName} onChange={e => setCheckoutName(e.target.value)} placeholder="Nome do checkout" />
                  <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
                  <button className="btn-publish" onClick={handlePublish} disabled={publishing}>{publishing ? 'Publicando...' : 'Publicar'}</button>
                </div>
                <Canvas scene={scene} breakpoint={breakpoint} selectedId={selectedId} onSelect={setSelectedId} onMove={handleMove} />
              </div>
            )}
            {showPreview && (
              <div className={mode === 'split' ? 'studio-half' : 'studio-full'}>
                <div className="preview-badge">PREVIEW</div>
                <CheckoutRuntime scene={scene} breakpoint={breakpoint} state={{ step: 'payment', method: 'pix' }} onPixPay={() => showToast('Pix gerado!')} onCardPay={() => showToast('Cartao processado!')} />
              </div>
            )}
          </main>

          {/* Right sidebar: Props */}
          {showCanvas && <PropsPanel scene={scene} selectedId={selectedId} breakpoint={breakpoint} dispatch={dispatch} trustScore={trustScore} />}
        </div>
      </div>
    </ErrorBoundary>
  );
}
