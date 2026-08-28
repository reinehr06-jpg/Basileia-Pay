'use client';

import React from 'react';
import { Block, CheckoutSchema } from '@/lib/studio/schema/types';

// Importaremos os blocos aqui conforme formos criando
import { HeroBlock } from './blocks/HeroBlock';
import { SecureHeaderBlock } from './blocks/SecureHeaderBlock';
import { CustomerFieldsBlock } from './blocks/CustomerFieldsBlock';
import { PaymentMethodsBlock } from './blocks/PaymentMethodsBlock';
import { OrderSummaryBlock } from './blocks/OrderSummaryBlock';
import { CouponBlock } from './blocks/CouponBlock';
import { CTABlock } from './blocks/CTABlock';
import { GuaranteeBlock } from './blocks/GuaranteeBlock';

import { useStudioStore } from '@/lib/studio/editor/store';
import { selectBlock } from '@/lib/studio/editor/commands';

interface BlockRendererProps {
  block: Block;
  schema: CheckoutSchema;
  mode?: 'live' | 'preview';
}

export function BlockRenderer({ block, schema, mode = 'live' }: BlockRendererProps) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const selectedBlockId = mode === 'preview' ? useStudioStore((state) => state.selectedBlockId) : null;
  const isSelected = selectedBlockId === block.id;

  if (!block.visible && mode === 'live') return null;

  const renderInnerBlock = () => {
    switch (block.type) {
      case 'hero':
        return <HeroBlock block={block} />;
      case 'secure_header':
        return <SecureHeaderBlock block={block} />;
      case 'customer_fields':
        return <CustomerFieldsBlock block={block} />;
      case 'payment_methods':
        return <PaymentMethodsBlock block={block} schema={schema} />;
      case 'order_summary':
        return <OrderSummaryBlock block={block} />;
      case 'coupon':
        return <CouponBlock block={block} />;
      case 'cta':
        return <CTABlock block={block} />;
      case 'guarantee':
        return <GuaranteeBlock block={block} />;
      default:
        return (
          <div className="p-4 border border-red-500 bg-red-50 text-red-700 text-sm rounded">
            Bloco tipo "{block.type}" não implementado no Renderer.
          </div>
        );
    }
  };

  if (mode === 'live') {
    return renderInnerBlock();
  }

  // Wrapper do Editor
  return (
    <div 
      onClick={() => selectBlock(block.id)}
      className={`relative rounded-[var(--radius-card)] transition-all cursor-pointer group
        ${isSelected ? 'ring-2 ring-[var(--brand-primary)] ring-offset-2 ring-offset-[var(--brand-bg)]' : 'hover:ring-2 hover:ring-[var(--brand-primary)]/50 hover:ring-offset-2 hover:ring-offset-[var(--brand-bg)]'}
        ${!block.visible ? 'opacity-50 grayscale' : ''}
      `}
    >
      {renderInnerBlock()}
      
      {/* Label on Hover / Selected */}
      {(isSelected || true) && (
        <div className={`absolute -top-3 left-4 px-2 py-0.5 bg-[var(--brand-primary)] text-white text-[10px] font-bold rounded shadow-sm z-10 transition-opacity
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          {block.name} {!block.visible && '(Oculto)'}
        </div>
      )}
    </div>
  );
}
