'use client'
import { useState } from 'react'
import PixTab from './PixTab'
import CardTab from './CardTab'
import BoletoTab from './BoletoTab'

const TABS = [
  { id: 'pix',        label: '⚡ Pix',    color: 'text-emerald-600' },
  { id: 'creditcard', label: '💳 Cartão', color: 'text-violet-600' },
  { id: 'boleto',     label: '📄 Boleto', color: 'text-amber-600' },
]

export default function PaymentTabs({ checkout }: { checkout: any }) {
  const [active, setActive] = useState(checkout.payment_method ?? 'pix')

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-100">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 py-3 text-sm font-semibold transition-all
              ${active === tab.id
                ? `${tab.color} border-b-2 border-current bg-slate-50`
                : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {active === 'pix'        && <PixTab checkout={checkout} />}
        {active === 'creditcard' && <CardTab checkout={checkout} />}
        {active === 'boleto'     && <BoletoTab checkout={checkout} />}
      </div>
    </div>
  )
}
