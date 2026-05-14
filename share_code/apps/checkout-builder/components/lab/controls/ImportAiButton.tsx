'use client'

import { useState, useCallback } from 'react'
import { ImportAiModal, AiExtractedConfig } from '../ImportAiModal'
import { useEditor } from '@/stores/EditorContext'

interface Props { onApplied?: () => void }

export function ImportAiButton({ onApplied }: Props) {
  const [open, setOpen] = useState(false)
  let setField: ((k: string, v: unknown) => void) | null = null
  let setNested: ((path: string, v: unknown) => void) | null = null
  try { 
    const editor = useEditor()
    setField = editor.setField
    setNested = editor.setNested
  } catch { 
    /* fora do EditorProvider */ 
  }

  const handleApply = useCallback((config: AiExtractedConfig) => {
    if (!setField || !setNested) return

    // Cores
    const colorFields = [
      'primary_color',
      'secondary_color',
      'background_color',
      'text_color',
      'text_muted_color',
      'border_color',
      'success_color',
      'error_color',
    ] as const

    colorFields.forEach(field => {
      if (config[field] != null) setField!(field, config[field])
    })

    // Layout
    if (config.border_radius != null) setField('border_radius', config.border_radius)
    if (config.shadow != null) setField('shadow', config.shadow)

    // Textos
    if (config.title)           setField('title',           config.title)
    if (config.description)     setField('description',     config.description)
    if (config.button_text)     setField('button_text',     config.button_text)
    if (config.success_title)   setField('success_title',   config.success_title)
    if (config.success_message) setField('success_message', config.success_message)
    if (config.logo_url)        setField('logo_url',        config.logo_url)

    // Métodos
    if (config.methods) {
      setNested!('methods.pix',    config.methods.pix)
      setNested!('methods.card',   config.methods.card)
      setNested!('methods.boleto', config.methods.boleto)
    }

    // Campos
    if (config.fields) {
      Object.entries(config.fields).forEach(([k, v]) => setNested!(`fields.${k}`, v))
    }

    // Parcelas
    if (config.card_installments != null) setField('card_installments', config.card_installments)

    setOpen(false)
    onApplied?.()
  }, [setField, setNested, onApplied])

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-300 bg-violet-900/20 hover:bg-violet-900/40 rounded-xl transition border border-violet-800/50">
        ✨ Importar com IA
      </button>
      {open && <ImportAiModal onClose={() => setOpen(false)} onApply={handleApply} />}
    </>
  )
}
