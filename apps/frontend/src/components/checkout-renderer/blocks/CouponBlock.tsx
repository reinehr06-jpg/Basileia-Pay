import { Block } from '@/lib/studio/schema/types';

export function CouponBlock({ block }: { block: Block }) {
  const { content } = block;

  return (
    <div className="bg-white p-6 rounded-[var(--radius-card)] shadow-sm border border-border w-full">
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder={content.placeholder || "Tem um cupom?"}
          className="flex-1 px-3 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm uppercase"
          style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
        />
        <button 
          className="px-4 py-2 bg-surface-raised border border-border text-ink text-sm font-bold rounded-[var(--radius-btn)] hover:bg-surface-hover transition-colors"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
