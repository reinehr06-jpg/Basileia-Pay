'use client'

import { useEditor } from '@/stores/EditorContext'
import { PanelBrand }   from './panels/PanelBrand'
import { PanelLayout }  from './panels/PanelLayout'
import { PanelFields }  from './panels/PanelFields'
import { PanelMethods } from './panels/PanelMethods'
import { PanelTexts }   from './panels/PanelTexts'
import { PanelCss }     from './panels/PanelCss'
import { PanelNotifications } from './panels/PanelNotifications'

const MAP: Record<string, React.FC> = {
  brand: PanelBrand, layout: PanelLayout, fields: PanelFields,
  methods: PanelMethods, texts: PanelTexts, css: PanelCss,
  notifications: PanelNotifications,
}

export function EditorPanel() {
  const { state } = useEditor()
  const Panel = MAP[state.activePanel] ?? PanelBrand
  return <div className="p-4 h-full overflow-y-auto"><Panel /></div>
}
