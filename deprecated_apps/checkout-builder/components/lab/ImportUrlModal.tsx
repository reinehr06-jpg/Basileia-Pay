'use client'

import { useState, useRef, useEffect } from 'react'
import { ImportUrlResult } from './ImportUrlResult'

interface ExtractedData {
  url: string
  colors: { primary: string; secondary: string; background: string; text: string; all: string[] }
  logo_url: string | null
  favicon_url: string | null
  fonts: string[]
  title: string
  border_radius: number
  button_text: string
  meta: { description?: string; og_image?: string }
}

interface Props {
  onClose: () => void
  onApply: (extracted: ExtractedData) => void
}

type Step = 'input' | 'loading' | 'result' | 'error'

export function ImportUrlModal({ onClose, onApply }: Props) {
  const [url, setUrl]       = useState('')
  const [step, setStep]     = useState<Step>('input')
  const [data, setData]     = useState<ExtractedData | null>(null)
  const [error, setError]   = useState('')
  const inputRef            = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleImport = async () => {
    if (!url.trim()) return
    setStep('loading')
    setError('')

    try {
      const res  = await fetch('/api/lab/import-url', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.message ?? 'Erro ao importar. Tente outra URL.')
        setStep('error')
        return
      }

      setData(json)
      setStep('result')
    } catch {
      setError('Falha de conexão. Tente novamente.')
      setStep('error')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-base font-bold text-white">🔗 Importar de URL</h2>
            <p className="text-xs text-gray-500 mt-0.5">Cola qualquer site e extraímos cores, logo e fontes</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center text-lg transition">
            ×
          </button>
        </div>

        <div className="p-6">

          {(step === 'input' || step === 'error') && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleImport() }}
                  placeholder="https://exemplo.com.br"
                  className="flex-1 bg-gray-800 text-gray-100 text-sm rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-violet-500 placeholder:text-gray-600"
                />
                <button type="button" onClick={handleImport}
                  disabled={!url.trim()}
                  className="px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-40">
                  Extrair
                </button>
              </div>

              {step === 'error' && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">O que é extraído</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    ['🎨', 'Cores dominantes (primária, fundo, texto)'],
                    ['🖼️', 'Logo e favicon'],
                    ['🔤', 'Fontes (Google Fonts detectadas)'],
                    ['📐', 'Border-radius médio dos elementos'],
                    ['✍️', 'Textos: título e botão de CTA'],
                    ['🌐', 'Descrição (Open Graph / meta)'],
                  ].map(([icon, label]) => (
                    <div key={label as string} className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{icon}</span><span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-gray-700">
                O scrape é feito server-side. Sites com proteção anti-bot podem não funcionar.
              </p>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-violet-800" />
                <div className="absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white font-medium">Analisando o site...</p>
                <p className="text-xs text-gray-500 mt-1 animate-pulse">Extraindo cores, logo e fontes</p>
              </div>
              <div className="flex flex-col items-center gap-1 mt-2">
                {['Acessando a URL...', 'Extraindo cores CSS...', 'Detectando logo...', 'Identificando fontes...'].map((msg, i) => (
                  <p key={msg} className="text-[11px] text-gray-700" style={{ animationDelay: `${i * 0.8}s` }}>{msg}</p>
                ))}
              </div>
            </div>
          )}

          {step === 'result' && data && (
            <ImportUrlResult
              data={data}
              onApply={() => onApply(data)}
              onBack={() => setStep('input')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
