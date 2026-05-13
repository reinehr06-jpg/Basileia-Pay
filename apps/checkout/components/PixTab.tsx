'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { processCheckout } from '@/lib/api'
import { usePolling } from '@/hooks/usePolling'
import { QRCodeSVG } from 'qrcode.react'

export default function PixTab({ checkout }: { checkout: any }) {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'qr'>('form')
  const [form, setForm] = useState({ name: '', email: '', document: '' })
  const [pixData, setPixData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const { status } = usePolling(
    checkout.uuid,
    step === 'qr',
    () => router.push(`/${checkout.uuid}/success`)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await processCheckout(checkout.uuid, { ...form, method: 'pix' })
      setPixData(res.pix ?? res)
      setStep('qr')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(pixData?.copy_paste ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (step === 'qr') return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 w-full text-center">
        <p className="text-sm text-emerald-700 font-semibold mb-4">
          Escaneie o QR Code com o app do seu banco
        </p>
        {pixData?.qr_code && (
          <div className="flex justify-center mb-4">
            <QRCodeSVG value={pixData.qr_code} size={200} fgColor="#065f46" />
          </div>
        )}
        {pixData?.copy_paste && (
          <button
            onClick={copyCode}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition"
          >
            {copied ? '✅ Copiado!' : '📋 Copiar código Pix'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        Aguardando pagamento...
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}
      <input
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="Nome completo"
        required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-400"
      />
      <input
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder="E-mail"
        type="email"
        required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-400"
      />
      <input
        value={form.document}
        onChange={e => setForm(f => ({ ...f, document: e.target.value }))}
        placeholder="CPF / CNPJ"
        required
        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-emerald-400"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition"
      >
        {loading ? 'Gerando Pix...' : '⚡ Gerar QR Code Pix'}
      </button>
    </form>
  )
}
