'use client'

import { useState, useEffect } from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface Approval { id: number; status: string; note: string | null; created_at: string }

export default function ApprovalPage({ params }: { params: { id: string } }) {
  const { can } = usePermissions()
  const [approvals, setApprovals] = useState<Approval[]>([])

  useEffect(() => {
    fetch('/api/dashboard/approvals', { credentials: 'include' })
      .then(r => r.json()).then(setApprovals).catch(() => {})
  }, [])

  const review = async (approvalId: number, action: 'approve' | 'reject', note = '') => {
    await fetch(`/api/dashboard/approvals/${approvalId}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ review_note: note }),
    })
    setApprovals(prev => prev.filter(a => a.id !== approvalId))
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">🔔 Fila de Aprovação</h1>
      {approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 border-2 border-dashed border-gray-800 rounded-2xl">
          <span className="text-3xl">✅</span>
          <p className="text-gray-500 text-sm">Nenhuma aprovação pendente</p>
        </div>
      ) : approvals.map(a => (
        <div key={a.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-amber-300">Aprovação pendente</p>
            {a.note && <p className="text-xs text-gray-400 mt-1">"{a.note}"</p>}
            <p className="text-[10px] text-gray-600 mt-1">{new Date(a.created_at).toLocaleString('pt-BR')}</p>
          </div>
          {can('canPublish') && (
            <div className="flex gap-3">
              <button onClick={() => review(a.id, 'approve')}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition">
                ✅ Aprovar e Publicar
              </button>
              <button onClick={() => review(a.id, 'reject')}
                className="flex-1 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition">
                ❌ Rejeitar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
