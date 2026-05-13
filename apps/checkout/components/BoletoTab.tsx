'use client'
import { useState } from 'react'
import { processCheckout } from '@/lib/api'

export default function BoletoTab({ checkout }: { checkout: any }) {
  const [form, setForm] = useState({ name: '', email: '', document: '' })
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await processCheckout(checkout.uuid, { ...form, method: 'boleto' })
      setBoletoUrl(res.boleto_url ?? res.boletoUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (boletoUrl) return (
    <div className="space-y-4 text-center">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <p className="text-2xl mb-2">📄</p>
        <p className="text-amber-800 font-semibold text-sm">Boleto gerado com sucesso!</p>
        <p className="text-amber-600 text-xs mt-1">Vence em 1–3 dias úteis</p>
      </div>
      <a
        href={boletoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-sm transition"
      >
        📥 Visualizar / Imprimir Boleto
      </a>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="Nome completo" required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-400" />
      <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        type="email" placeholder="E-mail" required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-400" />
      <input value={form.document} onChange={e => setForm(f => ({ ...f, document: e.target.value }))}
        placeholder="CPF / CNPJ" required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-400" />
      <button type="submit" disabled={loading}
        className="w-full h-12 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition">
        {loading ? 'Gerando boleto...' : '📄 Gerar Boleto'}
      </button>
      <p className="text-xs text-slate-400 text-center">Compensação em até 3 dias úteis</p>
    </form>
  )
}
