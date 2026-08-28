import { Block } from '@/lib/studio/schema/types';

export function CustomerFieldsBlock({ block }: { block: Block }) {
  const { content } = block;

  return (
    <div className="bg-white p-6 rounded-[var(--radius-card)] shadow-sm border border-border w-full">
      <h2 className="text-lg font-bold text-ink mb-4">{block.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.fields?.map((field: any, i: number) => (
          <div key={i} className={`flex flex-col gap-1.5 ${field.name === 'email' || field.name === 'full_name' ? 'md:col-span-2' : ''}`}>
            <label className="text-sm font-semibold text-ink">
              {field.label}
              {field.required && <span className="text-danger ml-1">*</span>}
            </label>
            <input 
              type="text" 
              placeholder={`Digite seu ${field.label.toLowerCase()}`}
              className="px-3 py-2 border border-border rounded-[var(--radius-input)] focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
              style={{ '--tw-ring-color': 'var(--brand-primary)' } as React.CSSProperties}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
