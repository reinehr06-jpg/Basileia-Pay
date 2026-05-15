import { useCallback } from 'react'
import { useEditor } from '@/stores/EditorContext'

export function useCheckoutSave() {
  const { state, setSaving, setSaved } = useEditor()

  const save = useCallback(async (options: { publish?: boolean } = {}) => {
    const { config, configId, configName } = state
    setSaving(true)
    try {
      const url = configId ? `/api/dashboard/checkout-configs/${configId}` : '/api/dashboard/checkout-configs'
      const res = await fetch(url, {
        method: configId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: configName, config, publish: options.publish ?? false }),
      })
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.message ?? `HTTP ${res.status}`) }
      const data = await res.json()
      setSaved(data.id)
      return data
    } finally { setSaving(false) }
  }, [state, setSaving, setSaved])

  return { save }
}
