'use client';

import { useState } from 'react';
import { 
  Monitor, Smartphone, Tablet, Undo, Redo, ZoomIn, ZoomOut, ChevronLeft, Check, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useStudioStore } from '@/lib/studio/editor/store';
import { selectDevice, setZoom, undo, redo } from '@/lib/studio/editor/commands';
import { checkoutSchemaValidator } from '@/lib/studio/schema/validation';
import { publishCheckoutVersion } from '@/lib/studio/api';

export function TopToolbar() {
  const checkoutId = useStudioStore((state) => state.checkoutId);
  const versionId = useStudioStore((state) => state.versionId);
  const schema = useStudioStore((state) => state.schema);
  const selectedDevice = useStudioStore((state) => state.selectedDevice);
  const zoom = useStudioStore((state) => state.zoom);
  const saveStatus = useStudioStore((state) => state.saveStatus);
  const historyIndex = useStudioStore((state) => state.historyIndex);
  const historyStackLength = useStudioStore((state) => state.historyStack.length);
  const unsavedChanges = useStudioStore((state) => state.unsavedChanges);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < historyStackLength - 1;

  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      // 1. Validação Zod estrita
      const result = checkoutSchemaValidator.safeParse(schema);
      if (!result.success) {
        const errResult = result as any;
        console.error('Erros de validação Zod:', errResult.error.errors);
        // Pega o primeiro erro amigável para mostrar no toast
        const firstError = errResult.error.errors[0];
        const errorPath = firstError.path.join('.');
        showToast(`Erro de validação em "${errorPath}": ${firstError.message}`, 'error');
        setIsPublishing(false);
        return;
      }

      // 2. Chama API
      await publishCheckoutVersion(checkoutId, versionId, schema);
      showToast('Checkout publicado com sucesso!', 'success');

    } catch (error) {
      console.error(error);
      showToast('Erro interno ao tentar publicar.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-border flex items-center px-4 shrink-0 justify-between relative z-20">
        
        {/* Esquerda: Voltar e Nome */}
        <div className="flex items-center">
          <Link
            href="/dashboard/checkouts"
            className="p-1.5 hover:bg-surface-raised rounded-lg transition-colors mr-3"
          >
            <ChevronLeft size={18} className="text-ink-subtle" />
          </Link>
          <div className="h-5 w-px bg-border mr-3" />
          <div>
            <h1 className="text-sm font-bold text-ink">Checkout Studio</h1>
            <p className="text-[10px] font-bold text-ink-subtle">ID: {checkoutId}</p>
          </div>
        </div>
        
        {/* Centro: Controles de Viewport */}
        <div className="flex items-center gap-6">
          <div className="flex items-center bg-surface-raised rounded-lg p-1 border border-border">
            <button onClick={undo} disabled={!canUndo} className={`p-1.5 rounded transition-colors ${canUndo ? 'hover:bg-white text-ink hover:shadow-sm' : 'text-ink-muted cursor-not-allowed'}`} title="Desfazer">
              <Undo size={16} />
            </button>
            <button onClick={redo} disabled={!canRedo} className={`p-1.5 rounded transition-colors ${canRedo ? 'hover:bg-white text-ink hover:shadow-sm' : 'text-ink-muted cursor-not-allowed'}`} title="Refazer">
              <Redo size={16} />
            </button>
          </div>

          <div className="flex items-center bg-surface-raised rounded-lg p-1 border border-border">
            <button onClick={() => selectDevice('desktop')} className={`p-1.5 rounded transition-colors ${selectedDevice === 'desktop' ? 'bg-white shadow-sm text-ink' : 'text-ink-subtle hover:text-ink'}`}>
              <Monitor size={16} />
            </button>
            <button onClick={() => selectDevice('tablet')} className={`p-1.5 rounded transition-colors ${selectedDevice === 'tablet' ? 'bg-white shadow-sm text-ink' : 'text-ink-subtle hover:text-ink'}`}>
              <Tablet size={16} />
            </button>
            <button onClick={() => selectDevice('mobile')} className={`p-1.5 rounded transition-colors ${selectedDevice === 'mobile' ? 'bg-white shadow-sm text-ink' : 'text-ink-subtle hover:text-ink'}`}>
              <Smartphone size={16} />
            </button>
          </div>

          <div className="flex items-center bg-surface-raised rounded-lg p-1 border border-border">
            <button onClick={() => setZoom(zoom - 10)} className="p-1.5 rounded transition-colors text-ink-subtle hover:text-ink hover:bg-white">
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-bold w-12 text-center select-none text-ink">{zoom}%</span>
            <button onClick={() => setZoom(zoom + 10)} className="p-1.5 rounded transition-colors text-ink-subtle hover:text-ink hover:bg-white">
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Direita: Status e Ações */}
        <div className="flex items-center gap-3">
           <span className="text-xs text-ink-subtle flex items-center gap-1">
             {saveStatus === 'saving' && 'Salvando rascunho...'}
             {saveStatus === 'error' && <span className="text-danger flex items-center gap-1"><AlertTriangle size={12}/> Erro ao salvar</span>}
             {saveStatus === 'saved' && unsavedChanges === false && 'Salvo na nuvem'}
             {saveStatus === 'idle' && unsavedChanges && 'Alterações não salvas'}
           </span>
           <button 
             onClick={handlePublish}
             disabled={isPublishing}
             className="px-4 py-1.5 bg-[var(--brand-primary)] text-white text-xs font-bold rounded-lg shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
           >
             {isPublishing ? 'Publicando...' : 'Publicar'}
           </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-bold text-white animate-in slide-in-from-bottom-5
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
          {toast.message}
        </div>
      )}
    </>
  );
}
