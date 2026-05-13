'use client'

import { useState } from 'react'
import { ImportUrlModal } from '../ImportUrlModal'
import { useEditor } from '@/stores/EditorContext'

interface ExtractedData {
  colors: { primary: string; secondary: string; background: string; text: string }
  logo_url: string | null
  fonts: string[]
  title: string
  border_radius: number
  button_text: string
  meta: { description?: string }
}

interface Props {
  onApplied?: () => void
}

export function ImportUrlButton({ onApplied }: Props) {
  const [open, setOpen] = useState(false)
  
  let setField: ((k: string, v: unknown) => void) | null = null
  try { 
    const editor = useEditor()
    setField = editor.setField 
  } catch { 
    /* fora do editor */ 
  }

  const handleApply = (data: ExtractedData) => {
    if (setField) {
      setField('primary_color',    data.colors.primary)
      setField('secondary_color',  data.colors.secondary)
      setField('background_color', data.colors.background)
      setField('text_color',       data.colors.text)
      setField('border_radius',    data.border_radius)
      setField('title',            data.title)
      setField('button_text',      data.button_text)
      if (data.logo_url)         setField('logo_url',    data.logo_url)
      if (data.meta.description) setField('description', data.meta.description)
    }
    setOpen(false)
    onApplied?.()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700"
      >
        🔗 Importar de URL
      </button>

      {open && (
        <ImportUrlModal
          onClose={() => setOpen(false)}
          onApply={handleApply}
        />
      )}
    </>
  )
}
