'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/hooks/usePermissions'

interface Approval {
  id: number
  config_id: number
  config_name: string
  requested_by: string
  requested_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { can } = usePermissions()

  useEffect(() => {
    fetch('/api/dashboard/approvals', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setApprovals(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/dashboard/approvals/${id}/${action}`, {
      method: 'POST',
      credentials: 'include'
    })
    if (res.ok) {
      setApprovals(prev => prev.filter(a => a.id !== id))
    }
  }

  if (!can('canPublish')) return <div className="p-8 text-white">Acesso negado.</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/lab')} className="text-gray-500 hover:text-white transition">← Voltar</button>
        <h1 className="text-2xl font-bold text-white">Solicitações de Publicação</h1>
      </div>

      {loading ? (
        <div className="text-gray-500 animate-pulse">Carregando solicitações...</div>
      ) : approvals.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
          <p className="text-gray-500">Nenhuma solicitação pendente.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {approvals.map(a => (
            <div key={a.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{a.config_name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span>Solicitado por <strong>{a.requested_by}</strong></span>
                  <span>•</span>
                  <span>{new Date(a.requested_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handleAction(a.id, 'reject')}
                  className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/30 rounded-xl transition border border-red-900/50">
                  Rejeitar
                </button>
                <button onClick={() => handleAction(a.id, 'approve')}
                  className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-lg shadow-emerald-900/20">
                  Aprovar e Publicar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
