'use client';

import React from 'react';
import { CheckoutSchema, Block } from '@/lib/studio/schema/types';
import { BlockRenderer } from './BlockRenderer';

interface CheckoutRendererProps {
  schema: CheckoutSchema;
  mode: 'live' | 'preview';
}

export function CheckoutRenderer({ schema, mode }: CheckoutRendererProps) {
  // Configurando as variáveis CSS baseadas nos brand_tokens
  const cssVariables = {
    '--brand-primary': schema.brand_tokens.primary_color,
    '--brand-secondary': schema.brand_tokens.secondary_color,
    '--brand-bg': schema.brand_tokens.background_color,
    '--radius-btn': `${schema.brand_tokens.button_radius}px`,
    '--radius-card': `${schema.brand_tokens.card_radius}px`,
    '--radius-input': `${schema.brand_tokens.input_radius}px`,
  } as React.CSSProperties;

  // Ordena os blocos com base no order (desktop por padrão)
  // No futuro, isso precisa ser adaptável se renderizando no server vs client
  const sortedBlocks = [...schema.blocks].sort((a, b) => a.order - b.order);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center" 
      style={{ ...cssVariables, backgroundColor: 'var(--brand-bg)', fontFamily: schema.brand_tokens.font_family }}
    >
      <div className={`w-full max-w-5xl mx-auto px-4 py-8 flex gap-8 flex-col ${schema.settings.layout === 'two_columns' ? 'md:flex-row' : ''}`}>
        
        {/* Renderiza todos os blocos */}
        <div className="flex-1 flex flex-col gap-4">
          {sortedBlocks.map(block => (
            <BlockRenderer key={block.id} block={block} schema={schema} mode={mode} />
          ))}
        </div>
        
      </div>
    </div>
  );
}
