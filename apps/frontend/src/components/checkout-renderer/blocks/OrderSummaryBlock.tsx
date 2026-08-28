import { Block } from '@/lib/studio/schema/types';

export function OrderSummaryBlock({ block }: { block: Block }) {
  const { content } = block;

  const items = content.items || [{ name: 'Item Padrão', price: 99.90 }];
  const total = items.reduce((acc: number, item: any) => acc + item.price, 0);

  return (
    <div className="bg-white p-6 rounded-[var(--radius-card)] shadow-sm border border-border w-full">
      <h2 className="text-lg font-bold text-ink mb-4">{content.title || block.name}</h2>
      
      <div className="flex flex-col gap-3">
        {items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-ink font-medium">{item.name}</span>
            <span className="text-ink font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
            </span>
          </div>
        ))}
        
        <div className="h-px bg-border my-2" />
        
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-ink">Total</span>
          <span className="text-lg font-extrabold text-[var(--brand-primary)]">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
