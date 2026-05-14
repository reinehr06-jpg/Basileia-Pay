'use client'

import { useState, useCallback } from 'react'

interface Props { configId: number }

export function TestLinkBanner({ configId }: Props) {
  const [testUrl, setTestUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/checkout-configs/${configId}/test-link`, {
        method: 'POST', credentials: 'include',
      })
      const data = await res.json()
      setTestUrl(data.url)
      setExpiresAt(data.expires_at)
    } finally { setLoading(false) }
  }, [configId])

  const copy = useCallback(() => {
    if (!testUrl) return
    navigator.clipboard.writeText(testUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [testUrl])

  const qrUrl = testUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(testUrl)}`
    : null

  if (!testUrl) return (
    <button type="button" onClick={generate} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition border border-gray-700 disabled:opacity-50">
      {loading ? '⏳ Gerando...' : '🔗 Gerar link de teste'}
    </button>
  )

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
      {qrUrl && <img src={qrUrl} alt="QR" className="w-12 h-12 rounded-lg flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">Link de teste ativo</p>
        <p className="text-xs text-gray-300 truncate font-mono mt-0.5">{testUrl}</p>
        {expiresAt && (
          <p className="text-[10px] text-gray-600 mt-0.5">
            Expira em {new Date(expiresAt).toLocaleString('pt-BR')}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={copy}
          className={`px-3 py-1 text-[11px] rounded-lg transition ${copied ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
        <a href={testUrl} target="_blank" rel="noopener noreferrer"
          className="px-3 py-1 text-[11px] rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-center transition">
          Abrir
        </a>
      </div>
    </div>
  )
}
