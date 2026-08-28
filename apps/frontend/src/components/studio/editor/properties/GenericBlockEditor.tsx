'use client';

import { Block } from '@/lib/studio/schema/types';
import { updateBlockContent } from '@/lib/studio/editor/commands';

export function GenericBlockEditor({ block }: { block: Block }) {
  // Ignoramos arrays e objetos complexos no editor genérico por enquanto
  // O editor genérico vai lidar primariamente com strings e numbers diretos
  const editableFields = Object.entries(block.content).filter(
    ([_, value]) => typeof value === 'string' || typeof value === 'number'
  );

  if (editableFields.length === 0) {
    return (
      <div className="p-4 text-xs text-ink-subtle">
        Este bloco não possui propriedades simples configuráveis via editor genérico.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-sm font-bold text-ink mb-1">Conteúdo</h3>
      
      {editableFields.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink capitalize">
            {key.replace(/_/g, ' ')}
          </label>
          <input 
            type={typeof value === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => {
              const newValue = typeof value === 'number' ? Number(e.target.value) : e.target.value;
              updateBlockContent(block.id, { [key]: newValue });
            }}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
            style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  );
}
