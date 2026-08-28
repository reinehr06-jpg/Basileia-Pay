'use client';

import { useState } from 'react';
import { Block, CheckoutSchema } from '@/lib/studio/schema/types';

export function PaymentMethodsBlock({ block, schema }: { block: Block; schema: CheckoutSchema }) {
  const { content } = block;
  const config = schema.payment_config;
  
  const [activeMethod, setActiveMethod] = useState(content.default_method || config.methods[0]);

  return (
    <div className="bg-white p-6 rounded-[var(--radius-card)] shadow-sm border border-border w-full">
      <h2 className="text-lg font-bold text-ink mb-4">{content.title || block.name}</h2>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {config.methods.includes('pix') && config.pix.enabled && (
          <button 
            onClick={() => setActiveMethod('pix')}
            className={`flex-1 py-2.5 px-4 rounded-[var(--radius-btn)] border text-sm font-bold transition-colors whitespace-nowrap
              ${activeMethod === 'pix' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 text-[var(--brand-primary)]' : 'border-border text-ink-subtle hover:bg-surface-raised'}`}
          >
            Pix {config.pix.discount_percent > 0 && <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">-{config.pix.discount_percent}%</span>}
          </button>
        )}
        
        {config.methods.includes('credit_card') && config.credit_card.enabled && (
          <button 
            onClick={() => setActiveMethod('credit_card')}
            className={`flex-1 py-2.5 px-4 rounded-[var(--radius-btn)] border text-sm font-bold transition-colors whitespace-nowrap
              ${activeMethod === 'credit_card' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 text-[var(--brand-primary)]' : 'border-border text-ink-subtle hover:bg-surface-raised'}`}
          >
            Cartão
          </button>
        )}

        {config.methods.includes('boleto') && config.boleto.enabled && (
          <button 
            onClick={() => setActiveMethod('boleto')}
            className={`flex-1 py-2.5 px-4 rounded-[var(--radius-btn)] border text-sm font-bold transition-colors whitespace-nowrap
              ${activeMethod === 'boleto' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 text-[var(--brand-primary)]' : 'border-border text-ink-subtle hover:bg-surface-raised'}`}
          >
            Boleto
          </button>
        )}
      </div>

      <div className="bg-surface-raised p-4 rounded-lg border border-border">
        {activeMethod === 'pix' && (
          <div className="text-center">
            <p className="text-sm font-bold text-ink">Pague com Pix e receba agora!</p>
            <p className="text-xs text-ink-subtle mt-1">{config.pix.custom_message}</p>
          </div>
        )}
        {activeMethod === 'credit_card' && (
          <div className="flex flex-col gap-3">
             <div className="flex flex-col gap-1.5">
               <label className="text-xs font-semibold text-ink">Número do Cartão</label>
               <input type="text" className="px-3 py-2 border border-border rounded-[var(--radius-input)] text-sm" placeholder="0000 0000 0000 0000" />
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-semibold text-ink">Validade</label>
                 <input type="text" className="px-3 py-2 border border-border rounded-[var(--radius-input)] text-sm" placeholder="MM/AA" />
               </div>
               <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-semibold text-ink">CVV</label>
                 <input type="text" className="px-3 py-2 border border-border rounded-[var(--radius-input)] text-sm" placeholder="123" />
               </div>
             </div>
          </div>
        )}
        {activeMethod === 'boleto' && (
          <div className="text-center">
            <p className="text-sm font-bold text-ink">Boleto Bancário</p>
            <p className="text-xs text-ink-subtle mt-1">O acesso será liberado após a compensação (até 3 dias úteis).</p>
          </div>
        )}
      </div>
    </div>
  );
}
