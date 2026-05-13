'use client'

import { useState, useEffect } from 'react'
import { ThemeCard } from './ThemeCard'
import { useRouter } from 'next/navigation'
import { CheckoutConfig } from '@/types/checkout-config'
import { usePermissions } from '@/hooks/usePermissions'
import { ImportUrlButton } from './controls/ImportUrlButton'
import { ImportAiButton } from './controls/ImportAiButton'

interface Theme {
  id: number
  name: string
  slug: string
  is_active: boolean
  description: string | null
  updated_at: string
  config: Partial<CheckoutConfig>
}

export function ThemeList() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { can } = usePermissions()

  useEffect(() => {
    fetch('/api/dashboard/checkout-configs', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setThemes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleNew = async () => {
    const res = await fetch('/api/dashboard/checkout-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: 'Novo Checkout', config: {} }),
    })
    const data = await res.json()
    router.push(`/lab/${data.id}`)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir esta config?')) return
    await fetch(`/api/dashboard/checkout-configs/${id}`, { method: 'DELETE', credentials: 'include' })
    setThemes(prev => prev.filter(t => t.id !== id))
  }

  const handleDuplicate = async (theme: Theme) => {
    const res = await fetch('/api/dashboard/checkout-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: theme.name + ' (cópia)', config: theme.config }),
    })
    const data = await res.json()
    setThemes(prev => [data, ...prev])
  }

  const handleImport = (config: Record<string, unknown>) => {
    fetch('/api/dashboard/checkout-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: 'Importado', config }),
    }).then(r => r.json()).then(data => setThemes(prev => [data, ...prev]))
  }

  const triggerImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const json = JSON.parse(ev.target?.result as string)
          handleImport(json.config ?? json)
        } catch { alert('JSON inválido') }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-gray-500 text-sm animate-pulse">Carregando temas...</span>
    </div>
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Lab de Testes</h1>
          <p className="text-sm text-gray-500 mt-1">Configure e publique checkouts visuais</p>
        </div>
        <div className="flex items-center gap-3">
          {can('canPublish') && (
            <button onClick={() => router.push('/lab/approvals')}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700">
              🔔 Aprovações
            </button>
          )}
          {can('canViewAudit') && (
            <button onClick={() => router.push('/lab/audit')}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700">
              📋 Auditoria
            </button>
          )}
          {can('canManageWhiteLabel') && (
            <button onClick={() => router.push('/lab/settings')}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700">
              🎨 White-label
            </button>
          )}
          <ImportUrlButton onApplied={() => {
            fetch('/api/dashboard/checkout-configs', { credentials: 'include' })
              .then(r => r.json())
              .then(data => { setThemes(data); setLoading(false) })
          }} />
          <ImportAiButton onApplied={() => {
            fetch('/api/dashboard/checkout-configs', { credentials: 'include' })
              .then(r => r.json())
              .then(data => { setThemes(data); setLoading(false) })
          }} />
          <button onClick={triggerImport}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700">
            📥 Importar JSON
          </button>
          <button onClick={() => router.push('/lab/ab-test')}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700">
            ⚡ A/B Test
          </button>
          <button onClick={handleNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-violet-900/30">
            + Novo Checkout
          </button>
        </div>
      </div>

      {/* Grid de temas */}
      {themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 border-2 border-dashed border-gray-800 rounded-2xl">
          <span className="text-4xl">🧪</span>
          <p className="text-gray-500 text-sm">Nenhum checkout criado ainda</p>
          <button onClick={handleNew}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition">
            Criar primeiro checkout
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {themes.map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onEdit={() => router.push(`/lab/${theme.id}`)}
              onDelete={() => handleDelete(theme.id)}
              onDuplicate={() => handleDuplicate(theme)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
