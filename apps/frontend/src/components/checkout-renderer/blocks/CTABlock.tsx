import { Block } from '@/lib/studio/schema/types';
import { Lock } from 'lucide-react';

export function CTABlock({ block }: { block: Block }) {
  const { content } = block;

  return (
    <div className="w-full flex flex-col items-center gap-3 mt-4 mb-6">
      <button 
        className="w-full py-4 px-8 bg-[var(--brand-primary)] text-white text-lg font-extrabold rounded-[var(--radius-btn)] shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
      >
        {content.text || 'Finalizar Compra'}
      </button>
      
      {content.subtext && (
        <div className="flex items-center gap-1.5 text-ink-subtle text-xs font-medium">
          <Lock size={12} />
          <span>{content.subtext}</span>
        </div>
      )}
    </div>
  );
}
