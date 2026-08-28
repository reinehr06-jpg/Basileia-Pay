'use client';

import { useStudioStore } from '@/lib/studio/editor/store';
import { updateBrandTokens } from '@/lib/studio/editor/commands';

export function GlobalSettingsEditor() {
  const brandTokens = useStudioStore((state) => state.schema.brand_tokens);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h3 className="text-sm font-bold text-ink mb-1">Cores da Marca</h3>
        <p className="text-xs text-ink-subtle mb-3">Defina as cores globais do checkout.</p>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink">Cor Primária</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted uppercase">{brandTokens.primary_color}</span>
              <input 
                type="color" 
                value={brandTokens.primary_color}
                onChange={(e) => updateBrandTokens({ primary_color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink">Cor Secundária</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted uppercase">{brandTokens.secondary_color}</span>
              <input 
                type="color" 
                value={brandTokens.secondary_color}
                onChange={(e) => updateBrandTokens({ secondary_color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink">Cor de Fundo</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted uppercase">{brandTokens.background_color}</span>
              <input 
                type="color" 
                value={brandTokens.background_color}
                onChange={(e) => updateBrandTokens({ background_color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border my-2" />

      <div>
        <h3 className="text-sm font-bold text-ink mb-1">Bordas</h3>
        
        <div className="flex flex-col gap-3 mt-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <label className="text-xs font-semibold text-ink">Botões (px)</label>
              <span className="text-xs text-ink-muted">{brandTokens.button_radius}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="32" 
              value={brandTokens.button_radius}
              onChange={(e) => updateBrandTokens({ button_radius: Number(e.target.value) })}
              className="w-full accent-[var(--brand-primary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <label className="text-xs font-semibold text-ink">Cards (px)</label>
              <span className="text-xs text-ink-muted">{brandTokens.card_radius}px</span>
            </div>
            <input 
              type="range" 
              min="0" max="40" 
              value={brandTokens.card_radius}
              onChange={(e) => updateBrandTokens({ card_radius: Number(e.target.value) })}
              className="w-full accent-[var(--brand-primary)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
