'use client';

import { useStudioStore } from '@/lib/studio/editor/store';
import { removeBlock, selectBlock } from '@/lib/studio/editor/commands';
import { GlobalSettingsEditor } from './properties/GlobalSettingsEditor';
import { GenericBlockEditor } from './properties/GenericBlockEditor';
import { Trash2, X } from 'lucide-react';

export function RightSidebar() {
  const schema = useStudioStore((state) => state.schema);
  const selectedBlockId = useStudioStore((state) => state.selectedBlockId);

  const selectedBlock = schema.blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="w-[320px] h-full bg-white border-l border-border flex flex-col shrink-0">
      
      {/* Header / Tabs */}
      <div className="flex items-center justify-between border-b border-border shrink-0 px-4 h-[49px]">
        {selectedBlock ? (
          <div className="flex items-center justify-between w-full">
            <h2 className="text-sm font-bold text-ink truncate flex-1">{selectedBlock.name}</h2>
            <button 
              onClick={() => selectBlock(null)}
              className="p-1 text-ink-subtle hover:text-ink hover:bg-surface-raised rounded transition-colors ml-2"
              title="Fechar painel do bloco"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center w-full">
            <button className="flex-1 h-[49px] text-sm font-bold text-ink border-b-2 border-[var(--brand-primary)]">
              Design Global
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {selectedBlock ? (
          <GenericBlockEditor block={selectedBlock} />
        ) : (
          <GlobalSettingsEditor />
        )}
      </div>

      {/* Footer (Ações do Bloco) */}
      {selectedBlock && !selectedBlock.locked && (
        <div className="p-4 border-t border-border bg-surface-raised shrink-0">
          <button
            onClick={() => removeBlock(selectedBlock.id)}
            className="w-full flex items-center justify-center gap-2 py-2 text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-lg transition-all text-sm font-bold"
          >
            <Trash2 size={16} />
            Remover Bloco
          </button>
        </div>
      )}
      
      {selectedBlock && selectedBlock.locked && (
        <div className="p-4 border-t border-border bg-surface-raised shrink-0">
          <p className="text-xs text-ink-subtle text-center">Este é um bloco de sistema e não pode ser removido.</p>
        </div>
      )}

    </div>
  );
}
