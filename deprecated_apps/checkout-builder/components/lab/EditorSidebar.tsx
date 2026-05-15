'use client'

import { useEditor } from '@/stores/EditorContext'

const PANELS = [
  { id: 'brand',   label: 'Marca',  icon: '🎨', hint: 'Cores e logo' },
  { id: 'layout',  label: 'Layout', icon: '📐', hint: 'Tamanhos e espaçamento' },
  { id: 'fields',  label: 'Campos', icon: '📝', hint: 'Campos do formulário' },
  { id: 'methods', label: 'Pagto.', icon: '💳', hint: 'Métodos de pagamento' },
  { id: 'texts',   label: 'Textos', icon: '✏️', hint: 'Títulos e mensagens' },
  { id: 'css',     label: 'CSS',    icon: '🛠️', hint: 'CSS personalizado' },
  { id: 'notifications', label: 'Notif.', icon: '🔔', hint: 'Notificações (Webhook/Email)' },
]

export function EditorSidebar() {
  const { state, setPanel } = useEditor()
  return (
    <div className="w-[72px] flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4 gap-1.5">
      {PANELS.map(p => (
        <button key={p.id} type="button" onClick={() => setPanel(p.id)} title={p.hint}
          className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition ${state.activePanel===p.id ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'}`}>
          <span className="text-[18px] leading-none">{p.icon}</span>
          <span className="text-[9px] font-medium">{p.label}</span>
        </button>
      ))}
    </div>
  )
}
