'use client'

import { useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface Props { configId: number; onRequested?: () => void }

export function PublishApprovalBanner({ configId, onRequested }: Props) {
  const { can } = usePermissions()
  const [status, setStatus] = useState<'idle'|'loading'|'requested'|'error'>('idle')
  const [note, setNote] = useState('')

  if (can('canPublish')) return null

  const requestApproval = async () => {
    setStatus('loading')
    try {
      await fetch(`/api/dashboard/checkout-configs/${configId}/request-publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ note }),
      })
      setStatus('requested')
      onRequested?.()
    } catch { setStatus('error') }
  }

  if (status === 'requested') return (
    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
      <span className="text-2xl">✅</span>
      <div>
        <p className="text-sm font-semibold text-emerald-300">Aprovação solicitada</p>
        <p className="text-xs text-emerald-600">Um administrador será notificado para revisar.</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-3 p-4 bg-amber-900/20 border border-amber-800/40 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-300">Publicação requer aprovação</p>
          <p className="text-xs text-amber-600 mt-0.5">Você é editor — um admin ou owner precisa aprovar antes de publicar.</p>
        </div>
      </div>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={2}
        placeholder="Nota opcional para o revisor..."
        className="w-full bg-gray-900 text-gray-200 text-xs rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-amber-500 resize-none placeholder:text-gray-600"
      />
      <button
        type="button"
        onClick={requestApproval}
        disabled={status === 'loading'}
        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
      >
        {status === 'loading' ? 'Solicitando...' : 'Solicitar aprovação'}
      </button>
      {status === 'error' && <p className="text-xs text-red-400">Erro ao solicitar. Tente novamente.</p>}
    </div>
  )
}
