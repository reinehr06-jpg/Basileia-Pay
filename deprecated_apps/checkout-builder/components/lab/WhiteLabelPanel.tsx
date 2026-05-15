'use client'

import { useState, useEffect } from 'react'
import { TextInput } from './controls/TextInput'
import { ColorPicker } from './controls/ColorPicker'
import { ImageUpload } from './controls/ImageUpload'

interface WhiteLabel {
  company_name: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  lab_title: string
  support_email: string
  custom_domain: string | null
  hide_basileia_branding: boolean
}

const DEFAULT_WL: WhiteLabel = {
  company_name: '', logo_url: null, favicon_url: null,
  primary_color: '#7c3aed', lab_title: 'Lab de Testes',
  support_email: '', custom_domain: null, hide_basileia_branding: false,
}

export function WhiteLabelPanel() {
  const [form, setForm] = useState<WhiteLabel>(DEFAULT_WL)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/white-label', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data?.company_name) setForm(data) })
      .catch(() => {})
  }, [])

  const set = (key: keyof WhiteLabel, v: unknown) => setForm(f => ({ ...f, [key]: v as any }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/dashboard/white-label', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">🎨 White-label</h1>
        <p className="text-sm text-gray-500 mt-1">Personalize o Lab com a identidade da sua empresa</p>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">Identidade</h2>
        <TextInput label="Nome da empresa"  value={form.company_name}  onChange={v => set('company_name', v)} placeholder="Basileia" />
        <TextInput label="Título do Lab"    value={form.lab_title}     onChange={v => set('lab_title', v)}    placeholder="Lab de Testes" />
        <ColorPicker label="Cor principal"  value={form.primary_color} onChange={v => set('primary_color', v)} />
        <ImageUpload label="Logo"           value={form.logo_url}      onChange={v => set('logo_url', v)} />
        <ImageUpload label="Favicon"        value={form.favicon_url}   onChange={v => set('favicon_url', v)} />
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">Domínio e Suporte</h2>
        <TextInput label="Domínio personalizado" value={form.custom_domain ?? ''} onChange={v => set('custom_domain', v || null)}
          placeholder="lab.suaempresa.com.br"
          hint="Configure um CNAME apontando para lab.basileia.com" />
        <TextInput label="E-mail de suporte"     value={form.support_email} onChange={v => set('support_email', v)}
          placeholder="suporte@suaempresa.com.br" />
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Branding</h2>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs text-gray-300 block">Ocultar marca Basileia</span>
            <span className="text-[10px] text-gray-500 block mt-0.5">Remove "Powered by Basileia" do rodapé do Lab</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.hide_basileia_branding}
            onClick={() => set('hide_basileia_branding', !form.hide_basileia_branding)}
            className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors ${form.hide_basileia_branding ? 'bg-violet-600' : 'bg-gray-700'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.hide_basileia_branding ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <button type="button" onClick={handleSave} disabled={saving}
        className={`w-full py-3 font-semibold text-sm rounded-xl transition ${saved ? 'bg-emerald-600 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'} disabled:opacity-50`}>
        {saving ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar configurações'}
      </button>
    </div>
  )
}
