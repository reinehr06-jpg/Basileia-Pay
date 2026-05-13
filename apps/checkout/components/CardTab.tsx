'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processCheckout } from '@/lib/api'
import { detectBrand, formatCardNumber, formatExpiry, validateLuhn } from '@/lib/card-engine'
import CardPreview from './CardPreview'

export default function CardTab({ checkout }: { checkout: any }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', email: '', document: '',
    card_number: '', card_holder: '', card_expiry: '', card_cvv: '',
    installments: '1',
  })
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const brand = detectBrand(form.card_number)

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLuhn(form.card_number)) {
      setError('Número do cartão inválido.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await processCheckout(checkout.uuid, { ...form, method: 'creditcard' })
      router.push(`/${checkout.uuid}/success`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <CardPreview
        number={form.card_number}
        holder={form.card_holder}
        expiry={form.card_expiry}
        brand={brand}
        flipped={flipped}
      />

      {/* Dados pessoais */}
      <input value={form.name} onChange={set('name')}
        placeholder="Nome completo" required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-violet-400" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.email} onChange={set('email')} type="email"
          placeholder="E-mail" required
          className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-violet-400" />
        <input value={form.document} onChange={set('document')}
          placeholder="CPF / CNPJ" required
          className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-violet-400" />
      </div>

      {/* Dados do cartão */}
      <input
        value={form.card_number}
        onChange={e => setForm(f => ({ ...f, card_number: formatCardNumber(e.target.value) }))}
        placeholder="Número do cartão"
        maxLength={19}
        required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:outline-none focus:border-violet-400"
      />
      <input value={form.card_holder}
        onChange={e => setForm(f => ({ ...f, card_holder: e.target.value.toUpperCase() }))}
        placeholder="Nome no cartão"
        required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm uppercase focus:outline-none focus:border-violet-400" />
      <div className="grid grid-cols-2 gap-3">
        <input
          value={form.card_expiry}
          onChange={e => setForm(f => ({ ...f, card_expiry: formatExpiry(e.target.value) }))}
          placeholder="MM/AA"
          maxLength={5}
          required
          className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-violet-400"
        />
        <input
          value={form.card_cvv}
          onChange={set('card_cvv')}
          placeholder="CVV"
          maxLength={4}
          onFocus={() => setFlipped(true)}
          onBlur={() => setFlipped(false)}
          required
          className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-violet-400"
        />
      </div>

      {/* Parcelas */}
      <select value={form.installments} onChange={set('installments')}
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-violet-400">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
          <option key={n} value={n}>
            {n}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
              .format(checkout.amount / n)}
            {n === 1 ? ' (sem juros)' : ''}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
      >
        {loading ? 'Processando...' : '💳 Pagar com Cartão'}
      </button>
    </form>
  )
}
