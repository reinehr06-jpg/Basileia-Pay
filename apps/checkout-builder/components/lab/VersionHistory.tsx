'use client'

import { useState, useEffect } from 'react'

interface Version {
  id: number
  config_id: number
  label: string | null
  snapshot: Record<string, unknown>
  created_by: string
  created_at: string
}

interface Props {
  configId: number
  onRestore: (snapshot: Record<string, unknown>) => void
}

export function VersionHistory({ configId, onRestore }: Props) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/dashboard/checkout-configs/${configId}/versions`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setVersions(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [configId])

  const handleRestore = async (v: Version) => {
    if (!confirm(`Restaurar versão "${v.label ?? formatDate(v.created_at)}"?`)) return
    setRestoring(v.id)
    try {
      await fetch(`/api/dashboard/checkout-configs/${configId}/versions/${v.id}/restore`, {
        method: 'POST', credentials: 'include',
      })
      onRestore(v.snapshot)
    } finally { setRestoring(null) }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div className="w-[280px] flex-shrink-0 border-l border-gray-800 bg-gray-950 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">🕐 Histórico</h3>
        <p className="text-[10px] text-gray-500 mt-0.5">Versões salvas automaticamente</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-xs text-gray-600 animate-pulse">Carregando...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="text-2xl">📭</span>
            <span className="text-xs text-gray-600">Nenhuma versão salva</span>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {versions.map((v, i) => (
              <div key={v.id}
                className="group p-3 rounded-xl hover:bg-gray-800/60 transition cursor-default">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {i === 0 && <span className="text-[9px] bg-violet-600 text-white rounded-full px-1.5 py-0.5">Atual</span>}
                      <span className="text-xs text-gray-300 truncate">
                        {v.label ?? `Versão ${versions.length - i}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5">{formatDate(v.created_at)}</p>
                    <p className="text-[10px] text-gray-700">{v.created_by}</p>
                  </div>
                  {i !== 0 && (
                    <button type="button"
                      onClick={() => handleRestore(v)}
                      disabled={restoring === v.id}
                      className="opacity-0 group-hover:opacity-100 transition px-2 py-1 text-[10px] bg-violet-700 hover:bg-violet-600 text-white rounded-lg disabled:opacity-50">
                      {restoring === v.id ? '...' : 'Restaurar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
