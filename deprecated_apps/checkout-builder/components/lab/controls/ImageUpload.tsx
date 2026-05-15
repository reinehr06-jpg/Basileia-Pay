'use client'

import { useState, useRef, useCallback } from 'react'

interface Props { label: string; value: string | null; onChange: (url: string | null) => void }

export function ImageUpload({ label, value, onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Apenas imagens.'); return }
    if (file.size > 2*1024*1024) { setError('Máximo 2MB.'); return }
    setError(null); setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/dashboard/upload', { method: 'POST', body: form, credentials: 'include' })
      if (!res.ok) throw new Error('Upload falhou')
      const { url } = await res.json()
      onChange(url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro no upload')
    } finally { setLoading(false) }
  }, [onChange])

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-300">{label}</label>
      {value && (
        <div className="relative w-full h-20 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center group">
          <img src={value} alt="preview" className="max-h-16 max-w-full object-contain" />
          <button type="button" onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-red-600/80 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
        </div>
      )}
      <div onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if(f) uploadFile(f) }}
        className={`flex flex-col items-center justify-center gap-1.5 w-full py-4 rounded-xl border-2 border-dashed cursor-pointer select-none transition ${dragOver ? 'border-violet-400 bg-violet-900/20' : 'border-gray-700 hover:border-violet-600'} ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <span className="text-xl">{loading ? '⏳' : '🖼️'}</span>
        <span className="text-xs text-gray-400">{loading ? 'Enviando...' : 'Clique ou arraste uma imagem'}</span>
        <span className="text-[10px] text-gray-600">PNG, JPG, SVG — máx 2MB</span>
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if(f) uploadFile(f); e.target.value='' }} />
    </div>
  )
}
