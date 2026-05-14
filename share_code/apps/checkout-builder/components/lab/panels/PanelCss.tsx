'use client'

import { useEditor } from '@/stores/EditorContext'

export function PanelCss() {
  const { state, setField } = useEditor()
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-white">CSS Personalizado</h2>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        CSS injetado no checkout publicado. Use <code className="text-violet-400">.ck-card</code>, <code className="text-violet-400">.ck-btn</code>, <code className="text-violet-400">.ck-input</code>.
      </p>
      <textarea value={state.config.custom_css} onChange={e => setField('custom_css', e.target.value)}
        rows={22} spellCheck={false}
        placeholder={".ck-card {\n  /* container */\n}\n\n.ck-btn {\n  /* botão pagar */\n}"}
        className="w-full bg-gray-950 text-green-400 text-xs font-mono rounded-xl p-3 border border-gray-800 focus:outline-none focus:border-violet-600 resize-none leading-relaxed" />
    </div>
  )
}
