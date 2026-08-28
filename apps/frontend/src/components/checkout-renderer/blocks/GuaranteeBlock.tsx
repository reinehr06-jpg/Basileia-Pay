import { Block } from '@/lib/studio/schema/types';
import { ShieldCheck } from 'lucide-react';

export function GuaranteeBlock({ block }: { block: Block }) {
  const { content } = block;

  return (
    <div className="bg-white p-6 rounded-[var(--radius-card)] shadow-sm border border-border w-full flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
        <ShieldCheck size={24} />
      </div>
      <div>
        <h3 className="text-base font-bold text-ink">
          {content.title || `${content.days || 7} Dias de Garantia`}
        </h3>
        <p className="text-sm text-ink-subtle mt-1">
          {content.description || 'Seu risco é zero. Satisfação garantida ou seu dinheiro de volta.'}
        </p>
      </div>
    </div>
  );
}
