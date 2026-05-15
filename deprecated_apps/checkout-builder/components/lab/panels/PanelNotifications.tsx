'use client'

import { useEditor } from '@/stores/EditorContext'
import { TextInput } from '../controls/TextInput'
import { ToggleInput } from '../controls/ToggleInput'

export function PanelNotifications() {
  const { state, setNested } = useEditor()
  const n = (state.config as Record<string, unknown>).notifications as Record<string, unknown> ?? {}

  const set = (key: string, v: unknown) => setNested(`notifications.${key}`, v)

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-white">🔔 Notificações</h2>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        Disparados automaticamente quando este checkout é publicado.
      </p>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Webhook</h3>
        <ToggleInput label="Ativar webhook" value={Boolean(n.webhook_enabled)} onChange={v => set('webhook_enabled', v)} />
        {n.webhook_enabled && (
          <>
            <TextInput label="URL do webhook" value={String(n.webhook_url ?? '')} onChange={v => set('webhook_url', v)}
              placeholder="https://seu-sistema.com/webhook" />
            <TextInput label="Secret (HMAC)" value={String(n.webhook_secret ?? '')} onChange={v => set('webhook_secret', v)}
              placeholder="chave-secreta" hint="Enviado no header X-Basileia-Signature" />
          </>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">E-mail</h3>
        <ToggleInput label="Notificar por e-mail" value={Boolean(n.email_enabled)} onChange={v => set('email_enabled', v)} />
        {n.email_enabled && (
          <TextInput label="E-mails (um por linha)" value={String(n.email_recipients ?? '')}
            onChange={v => set('email_recipients', v)}
            multiline placeholder={"admin@empresa.com\ndesenv@empresa.com"}
            hint="Cada e-mail em uma linha" />
        )}
      </div>
    </div>
  )
}
