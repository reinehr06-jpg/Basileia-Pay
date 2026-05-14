import { useReducer, useState, useCallback } from 'react';
import type { BreakpointId } from './core/types';
import { sceneReducer } from './core/sceneReducer';
import { createDefaultScene } from './core/initialScene';
import { Toolbar } from './editor/Toolbar';
import { Canvas } from './editor/Canvas';
import { PropsPanel } from './editor/PropsPanel';
import { LayersPanel } from './editor/LayersPanel';
import { ComponentPalette } from './editor/ComponentPalette';
import { CheckoutRuntime } from './runtime/CheckoutRuntime';
import './App.css';

type StudioMode = 'builder' | 'preview' | 'split';

export default function App() {
  const [scene, dispatch] = useReducer(sceneReducer, null, createDefaultScene);
  const [mode, setMode] = useState<StudioMode>('builder');
  const [breakpoint, setBreakpoint] = useState<BreakpointId>('desktop');
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const handleExportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkout-scene-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scene]);

  const handleMove = useCallback(
    (nodeId: string, newParentId: string, index?: number) => {
      dispatch({ type: 'MOVE_NODE', nodeId, newParentId, index });
    },
    []
  );

  // Determine which parent to add components into
  const addTarget = selectedId
    ? (() => {
        const node = scene.nodes[selectedId];
        if (!node) return scene.rootId;
        // If selected node can have children (section/stack/page), use it
        if (node.kind !== 'element') return node.id;
        // Otherwise use its parent
        return node.parentId ?? scene.rootId;
      })()
    : scene.rootId;

  const showCanvas = mode === 'builder' || mode === 'split';
  const showPreview = mode === 'preview' || mode === 'split';

  return (
    <div className="studio-app">
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        breakpoint={breakpoint}
        onBreakpointChange={setBreakpoint}
        onExportJSON={handleExportJSON}
      />

      <div className="studio-body">
        {/* Left sidebar: Layers + Components */}
        {showCanvas && (
          <div className="studio-sidebar-left">
            <LayersPanel
              scene={scene}
              selectedId={selectedId}
              onSelect={setSelectedId}
              dispatch={dispatch}
            />
            <ComponentPalette targetParentId={addTarget} dispatch={dispatch} />
          </div>
        )}

        {/* Main canvas / preview area */}
        <main className={`studio-main ${mode === 'split' ? 'studio-main-split' : ''}`}>
          {showCanvas && (
            <div className={mode === 'split' ? 'studio-half' : 'studio-full'}>
              <Canvas
                scene={scene}
                breakpoint={breakpoint}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onMove={handleMove}
              />
            </div>
          )}
          {showPreview && (
            <div className={mode === 'split' ? 'studio-half' : 'studio-full'}>
              <div className="preview-badge">PREVIEW</div>
              <CheckoutRuntime
                scene={scene}
                breakpoint={breakpoint}
                state={{ step: 'payment', method: 'pix' }}
                onPixPay={() => console.log('Simular Pix')}
                onCardPay={() => console.log('Simular Cartão')}
              />
            </div>
          )}
        </main>

        {/* Right sidebar: Props */}
        {showCanvas && (
          <PropsPanel
            scene={scene}
            selectedId={selectedId}
            breakpoint={breakpoint}
            dispatch={dispatch}
          />
        )}
      </div>
    </div>
  );
}
