import { Block } from '@/lib/studio/schema/types';

export function HeroBlock({ block }: { block: Block }) {
  const { content, style } = block;

  return (
    <div 
      className="p-6 md:p-8 flex flex-col md:flex-row gap-6 w-full text-white"
      style={{
        background: `linear-gradient(to right, ${style?.background_gradient_start || 'var(--brand-primary)'}, ${style?.background_gradient_end || 'var(--brand-secondary)'})`,
        paddingTop: `${style?.padding_top || 32}px`,
        paddingBottom: `${style?.padding_bottom || 32}px`,
        borderRadius: `var(--radius-card)`,
        color: style?.text_color || '#FFFFFF',
      }}
    >
      <div className="flex-1 flex flex-col gap-4">
        {content.badge && (
          <span 
            className="text-xs font-bold px-2 py-1 rounded w-max uppercase tracking-wider"
            style={{ backgroundColor: content.badge_color || '#F59E0B' }}
          >
            {content.badge}
          </span>
        )}
        
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
          {content.title}
        </h1>
        
        <p className="text-white/90 text-sm md:text-base">
          {content.subtitle}
        </p>

        {content.benefits && content.benefits.length > 0 && (
          <ul className="mt-2 space-y-2">
            {content.benefits.map((benefit: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm font-medium">
                <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[10px]">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        )}
      </div>

      {content.image && style?.image_position !== 'hidden' && (
        <div className="flex-1 flex justify-center items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image} alt="Produto" className="max-w-full h-auto rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
}
