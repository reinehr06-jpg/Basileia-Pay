import { Block } from '@/lib/studio/schema/types';

export function SecureHeaderBlock({ block }: { block: Block }) {
  const { content } = block;

  return (
    <div className="w-full flex items-center justify-center gap-2 py-3">
      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      <span className="text-xs font-bold text-ink-subtle uppercase tracking-widest">
        {content.text || 'Ambiente Seguro'}
      </span>
    </div>
  );
}
