'use client'

import { useEffect, useState } from 'react'
import { EditorProvider, useEditor } from '@/stores/EditorContext'
import { useCheckoutSave } from '@/hooks/useCheckoutSave'
import { EditorSidebar }   from './EditorSidebar'
import { EditorPanel }     from './EditorPanel'
import { ConfigNameInput } from './ConfigNameInput'
import { CheckoutPreview } from './CheckoutPreview'
import { VersionHistory }  from './VersionHistory'
import { TestLinkBanner }  from './TestLinkBanner'
import { PublishApprovalBanner } from './PublishApprovalBanner'
import { ImportUrlButton } from './controls/ImportUrlButton'
import { ImportAiButton } from './controls/ImportAiButton'
import { CheckoutConfig }  from '@/types/checkout-config'
import { usePermissions } from '@/hooks/usePermissions'

function EditorInner({ initialConfigId, initialConfigName, initialConfig }: {
  initialConfigId?: number; initialConfigName?: string; initialConfig?: Partial<CheckoutConfig>
}) {
  const { state, loadConfig } = useEditor()
  const { save } = useCheckoutSave()
  const { can } = usePermissions()
  const [showHistory, setShowHistory] = useState(false)
  const [showTestLink, setShowTestLink] = useState(false)

  useEffect(() => {
    if (initialConfigId && initialConfig)
      loadConfig(initialConfigId, initialConfigName ?? 'Checkout', initialConfig as CheckoutConfig)
  }, []) // eslint-disable-line

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <EditorSidebar />

      {/* Painel de opções */}
      <div className="w-[300px] flex-shrink-0 border-r border-gray-800 flex flex-col overflow-hidden bg-gray-900">
        <ConfigNameInput />
        <div className="flex-1 overflow-y-auto"><EditorPanel /></div>
      </div>

      {/* Preview + topbar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-gray-800 bg-gray-900/80 backdrop-blur flex-shrink-0 flex-wrap gap-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full inline-block ${state.isDirty ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            <span className="text-xs text-gray-400">
              {state.isSaving ? 'Salvando...' : state.isDirty ? 'Alterações não salvas' : 'Salvo'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Link de teste */}
            {state.configId && (
              <button type="button" onClick={() => setShowTestLink(v => !v)}
                className={`px-3 py-1.5 text-xs rounded-lg transition border ${showTestLink ? 'border-emerald-600 text-emerald-400 bg-emerald-900/20' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                🔗 Teste
              </button>
            )}
            {/* Histórico */}
            {state.configId && (
              <button type="button" onClick={() => setShowHistory(v => !v)}
                className={`px-3 py-1.5 text-xs rounded-lg transition border ${showHistory ? 'border-violet-600 text-violet-400 bg-violet-900/20' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                🕐 Histórico
              </button>
            )}
            <ImportUrlButton />
            <ImportAiButton />
            <button type="button" onClick={() => save()} disabled={state.isSaving || !state.isDirty}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 transition border border-gray-700">
              Salvar rascunho
            </button>
            {can('canPublish') && (
              <button type="button" onClick={() => save({ publish: true })} disabled={state.isSaving}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition">
                {state.isSaving ? 'Publicando...' : '⚡ Publicar'}
              </button>
            )}
          </div>
        </div>

        {/* Banners */}
        <div className="flex flex-col border-b border-gray-800 bg-gray-900/40">
          {showTestLink && state.configId && (
            <div className="px-5 py-3 border-b border-gray-800/50">
              <TestLinkBanner configId={state.configId} />
            </div>
          )}
          {state.configId && (
            <div className="px-5 py-2">
              <PublishApprovalBanner configId={state.configId} />
            </div>
          )}
        </div>

        {/* Área central + histórico */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto bg-[#0f0f0f] flex items-start justify-center p-8">
            <CheckoutPreview />
          </div>
          {showHistory && state.configId && (
            <VersionHistory
              configId={state.configId}
              onRestore={(snapshot) => loadConfig(state.configId!, state.configName, snapshot as CheckoutConfig)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function CheckoutEditor(props: { initialConfigId?: number; initialConfigName?: string; initialConfig?: Partial<CheckoutConfig> }) {
  return <EditorProvider><EditorInner {...props} /></EditorProvider>
}
