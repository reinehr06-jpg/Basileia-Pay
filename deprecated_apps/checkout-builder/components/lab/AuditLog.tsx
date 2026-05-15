'use client'

import { useState, useEffect } from 'react'
import { AuditLog as AuditLogType, AuditAction } from '@/types/audit'
import { ConfigDiff } from './ConfigDiff'

const ACTION_LABELS: Record<AuditAction, { label: string; icon: string; color: string }> = {
  created:              { label: 'Criado',              icon: '✨', color: 'text-emerald-400' },
  updated:              { label: 'Editado',             icon: '✏️', color: 'text-blue-400'    },
  published:            { label: 'Publicado',           icon: '⚡', color: 'text-violet-400'  },
  unpublished:          { label: 'Despublicado',        icon: '📴', color: 'text-gray-400'    },
  deleted:              { label: 'Excluído',            icon: '🗑️', color: 'text-red-400'     },
  duplicated:           { label: 'Duplicado',           icon: '📋', color: 'text-indigo-400'  },
  restored_version:     { label: 'Versão restaurada',   icon: '↩️', color: 'text-amber-400'   },
  requested_publish:    { label: 'Aprovação solicitada',icon: '🔔', color: 'text-amber-400'   },
  approved_publish:     { label: 'Aprovação aceita',    icon: '✅', color: 'text-emerald-400' },
  rejected_publish:     { label: 'Aprovação rejeitada', icon: '❌', color: 'text-red-400'     },
  test_link_generated:  { label: 'Link de teste gerado',icon: '🔗', color: 'text-cyan-400'    },
  ab_test_started:      { label: 'A/B Test iniciado',   icon: '⚡', color: 'text-violet-400'  },
  ab_test_stopped:      { label: 'A/B Test pausado',    icon: '⏸', color: 'text-gray-400'    },
}

interface Props { configId?: number }

export function AuditLog({ configId }: Props) {
  const [logs, setLogs] = useState<AuditLogType[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const url = configId
      ? `/api/dashboard/checkout-configs/${configId}/audit`
      : `/api/dashboard/audit?page=${page}`
    setLoading(true)
    fetch(url, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const items: AuditLogType[] = Array.isArray(data) ? data : data.data ?? []
        setLogs(prev => page === 1 ? items : [...prev, ...items])
        setHasMore(items.length === 20)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [configId, page])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div className="space-y-2">
      {loading && page === 1 ? (
        <div className="flex items-center justify-center h-32">
          <span className="text-xs text-gray-600 animate-pulse">Carregando auditoria...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <span className="text-2xl">📋</span>
          <p className="text-xs text-gray-600">Nenhum registro ainda</p>
        </div>
      ) : (
        <>
          {logs.map(log => {
            const meta = ACTION_LABELS[log.action] ?? { label: log.action, icon: '•', color: 'text-gray-400' }
            const isOpen = expanded === log.id
            return (
              <div key={log.id}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : log.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800/60 transition">
                  <span className="text-lg">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs text-gray-500 truncate">{log.config_name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-600">{log.user_name}</span>
                      <span className="text-[10px] text-gray-700">·</span>
                      <span className="text-[10px] text-gray-600">{formatDate(log.created_at)}</span>
                      {log.diff_keys?.length > 0 && (
                        <span className="text-[10px] text-gray-700">{log.diff_keys.length} campo(s) alterado(s)</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-gray-600 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-800 px-4 py-3 space-y-2">
                    <div className="flex items-center gap-4 text-[10px] text-gray-600">
                      <span>IP: {log.ip_address}</span>
                      <span>Usuário #{log.user_id}</span>
                      <span>{log.user_email}</span>
                    </div>
                    {log.diff_keys?.length > 0 && log.before && log.after && (
                      <ConfigDiff before={log.before} after={log.after} diffKeys={log.diff_keys} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {hasMore && (
            <button type="button" onClick={() => setPage(p => p + 1)} disabled={loading}
              className="w-full py-3 text-xs text-gray-500 hover:text-gray-300 transition disabled:opacity-50">
              {loading ? 'Carregando...' : 'Carregar mais'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
