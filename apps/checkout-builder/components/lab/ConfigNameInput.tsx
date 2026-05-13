'use client'

import { useEditor } from '@/stores/EditorContext'

export function ConfigNameInput() {
  const { state, setName } = useEditor()
  return (
    <div className="px-4 py-3 border-b border-gray-800">
      <label className="text-[10px] text-gray-600 uppercase tracking-widest block mb-1">Nome do checkout</label>
      <input type="text" value={state.configName} onChange={e => setName(e.target.value)}
        placeholder="Ex: Checkout Principal"
        className="w-full bg-transparent text-sm text-white font-medium focus:outline-none placeholder:text-gray-700" />
    </div>
  )
}
