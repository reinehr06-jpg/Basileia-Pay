'use client';

import { useState } from 'react';
import { Shield, ChevronDown, CheckCircle } from 'lucide-react';

export function GuaranteeBadge({ config }: { config: any }) {
  const [expanded, setExpanded] = useState(false);

  if (!config || !config.enabled) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface mb-6">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-raised transition-colors text-left"
      >
        <div className="flex items-center gap-3">
            <Shield size={20} className="text-success" />
            <div>
                <div className="text-sm font-bold text-ink">{config.title}</div>
                <div className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Clique para saber mais</div>
            </div>
        </div>
        <ChevronDown size={16} className={`text-ink-subtle transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border bg-surface-raised/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs text-ink-muted leading-relaxed mb-4 mt-4">
                {config.description || 'Estamos tão confiantes na qualidade do nosso produto que oferecemos uma garantia incondicional.'}
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-success">
                <CheckCircle size={14} />
                Satisfação garantida ou seu dinheiro de volta em {config.guarantee_days} dias.
            </div>
        </div>
      )}
    </div>
  );
}
