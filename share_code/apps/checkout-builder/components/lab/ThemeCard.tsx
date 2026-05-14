'use client'

import { useState } from 'react'
import { CheckoutConfig } from '@/types/checkout-config'

interface Theme {
  id: number; name: string; slug: string
  is_active: boolean; description: string | null
  updated_at: string; config: Partial<CheckoutConfig>
}

interface Props {
  theme: Theme
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}

// Thumbnail gerada via SVG inline — zero canvas, zero lib
function ThemeThumbnail({ config }: { config: Partial<CheckoutConfig> }) {
  const bg  = config.background_color ?? '#ffffff'
  const pri = config.primary_color    ?? '#7c3aed'
  const bdr = config.border_color     ?? '#e2e8f0'
  const txt = config.text_color       ?? '#1e293b'
  const r   = Math.min(config.border_radius ?? 16, 12)

  return (
    <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="280" height="160" fill="#0f0f0f" />
      <rect x="40" y="10" width="200" height="140" rx={r} fill={bg} />
      <rect x="110" y="22" width="60" height="10" rx="3" fill={pri} opacity="0.7" />
      <rect x="60" y="42" width="160" height="7" rx="3" fill={txt} opacity="0.6" />
      <rect x="56" y="58" width="168" height="10" rx="3" fill={bdr} />
      <rect x="56" y="75" width="168" height="10" rx="3" fill={bdr} />
      <rect x="56" y="92" width="168" height="10" rx="3" fill={bdr} />
      <rect x="56" y="112" width="168" height="22" rx={Math.min(r, 8)} fill={pri} />
      <rect x="100" y="119" width="80" height="7" rx="3" fill="white" opacity="0.8" />
    </svg>
  )
}

export function ThemeCard({ theme, onEdit, onDelete, onDuplicate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ name: theme.name, config: theme.config }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${theme.slug}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const updatedAgo = (() => {
    const diff = Date.now() - new Date(theme.updated_at).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}min atrás`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h atrás`
    return `${Math.floor(hrs / 24)}d atrás`
  })()

  return (
    <div className="group relative bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-violet-700 transition-all hover:shadow-xl hover:shadow-violet-900/20">
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-gray-950 cursor-pointer overflow-hidden" onClick={onEdit}>
        <ThemeThumbnail config={theme.config} />
      </div>

      {/* Badge ativo */}
      {theme.is_active && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur rounded-full px-2 py-0.5">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-semibold text-white">Publicado</span>
        </div>
      )}

      {/* Menu de contexto */}
      <div className="absolute top-2 right-2">
        <button type="button"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
          className="w-7 h-7 rounded-lg bg-gray-950/80 backdrop-blur text-gray-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-lg">
          ⋯
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 w-44 py-1"
            onMouseLeave={() => setMenuOpen(false)}>
            {[
              { icon: '✏️', label: 'Editar',    action: onEdit },
              { icon: '📋', label: 'Duplicar',  action: () => { onDuplicate(); setMenuOpen(false) } },
              { icon: '📤', label: 'Exportar JSON', action: () => { exportJson(); setMenuOpen(false) } },
              { icon: '🔗', label: 'Link de teste', action: () => { window.open(`/checkout/preview/${theme.slug}`, '_blank'); setMenuOpen(false) } },
              { icon: '🗑️', label: 'Excluir',   action: () => { onDelete(); setMenuOpen(false) }, danger: true },
            ].map(item => (
              <button key={item.label} type="button" onClick={item.action}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition ${'danger' in item && item.danger ? 'text-red-400 hover:bg-red-900/20' : 'text-gray-300 hover:bg-gray-800'}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info inferior */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">{theme.name}</h3>
        {theme.description && <p className="text-[11px] text-gray-500 truncate mt-0.5">{theme.description}</p>}
        <p className="text-[10px] text-gray-600 mt-1.5">Atualizado {updatedAgo}</p>
      </div>

      {/* Botão editar (hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
        <button type="button" onClick={onEdit}
          className="pointer-events-auto px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg transition">
          Editar
        </button>
      </div>
    </div>
  )
}
