'use client'
import { CardBrand } from '@/lib/card-engine'

const BRAND_COLORS: Record<string, string> = {
  visa:       'from-blue-700 to-blue-900',
  mastercard: 'from-gray-800 to-gray-950',
  amex:       'from-teal-600 to-teal-900',
  elo:        'from-yellow-500 to-yellow-700',
  hipercard:  'from-red-600 to-red-900',
  unknown:    'from-violet-700 to-violet-950',
}

interface Props {
  number: string
  holder: string
  expiry: string
  brand: CardBrand
  flipped: boolean
}

export default function CardPreview({ number, holder, expiry, brand, flipped }: Props) {
  const gradient = BRAND_COLORS[brand] ?? BRAND_COLORS.unknown
  const displayNumber = (number.replace(/\s/g, '') + '0000000000000000').slice(0, 16)
    .match(/.{1,4}/g)?.join(' ') ?? '•••• •••• •••• ••••'

  return (
    <div className="perspective-1000 h-44 mb-2">
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${flipped ? 'rotate-y-180' : ''}`}>
        {/* Frente */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl p-5 flex flex-col justify-between backface-hidden shadow-lg`}>
          <div className="flex justify-between items-start">
            <div className="w-10 h-7 bg-yellow-300 rounded-md opacity-80" />
            <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{brand === 'unknown' ? '' : brand}</span>
          </div>
          <div className="font-mono text-white text-lg tracking-widest">{displayNumber}</div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/40 text-[10px] uppercase">Titular</p>
              <p className="text-white text-sm font-semibold truncate max-w-[180px]">
                {holder || 'NOME NO CARTÃO'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[10px] uppercase">Validade</p>
              <p className="text-white text-sm font-semibold">{expiry || 'MM/AA'}</p>
            </div>
          </div>
        </div>

        {/* Verso */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl rotate-y-180 backface-hidden shadow-lg overflow-hidden`}>
          <div className="w-full h-10 bg-black/40 mt-6" />
          <div className="px-5 mt-4">
            <div className="bg-white/20 rounded h-8 flex items-center justify-end px-3">
              <span className="text-white font-mono text-sm tracking-widest">•••</span>
            </div>
            <p className="text-white/40 text-[10px] mt-1 text-right">CVV</p>
          </div>
        </div>
      </div>
    </div>
  )
}
