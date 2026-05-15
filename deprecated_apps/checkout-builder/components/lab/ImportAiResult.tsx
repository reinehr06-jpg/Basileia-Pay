'use client'

import { AiExtractedConfig } from './ImportAiModal'

interface Props {
  config:  AiExtractedConfig
  onApply: () => void
  onBack:  () => void
}

export function ImportAiResult({ config, onApply, onBack }: Props) {
  const conf = config.confidence

  const confColor = conf >= 90 ? 'text-emerald-400'
    : conf >= 70 ? 'text-blue-400'
    : conf >= 50 ? 'text-amber-400'
    : 'text-red-400'

  const confLabel = conf >= 90 ? 'Alta confiança'
    : conf >= 70 ? 'Boa confiança'
    : conf >= 50 ? 'Confiança parcial'
    : 'Baixa confiança'

  const colorFields = [
    { key: 'primary_color',     label: 'Primária'    },
    { key: 'secondary_color',   label: 'Secundária'  },
    { key: 'background_color',  label: 'Fundo'       },
    { key: 'text_color',        label: 'Texto'       },
    { key: 'border_color',      label: 'Borda'       },
    { key: 'success_color',     label: 'Sucesso'     },
    { key: 'error_color',       label: 'Erro'        },
  ] as const

  return (
    <div className="space-y-5">

      {/* Confiança */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${conf >= 70 ? 'bg-emerald-900/20 border-emerald-800/40' : 'bg-amber-900/20 border-amber-800/40'}`}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${confColor}`}>{confLabel}</span>
            <span className={`text-xs font-mono font-bold ${confColor}`}>{conf}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${conf}%`, background: conf >= 70 ? '#10b981' : conf >= 50 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
      </div>
      {config.notes && (
        <p className="text-[11px] text-gray-500 italic">💬 {config.notes}</p>
      )}

      {/* Cores */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Cores extraídas</p>
        <div className="flex flex-wrap gap-2">
          {colorFields.map(({ key, label }) => {
            const val = config[key]
            return val ? (
              <div key={key} className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-2.5 py-1.5">
                <span className="w-4 h-4 rounded-md flex-shrink-0 border border-gray-700" style={{ background: val }} />
                <div>
                  <p className="text-[9px] text-gray-600">{label}</p>
                  <p className="text-[10px] text-gray-300 font-mono">{val}</p>
                </div>
              </div>
            ) : null
          })}
        </div>
      </div>

      {/* Layout + Textos */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Título',         value: config.title         },
          { label: 'Botão',          value: config.button_text   },
          { label: 'Border-radius',  value: config.border_radius != null ? `${config.border_radius}px` : null },
          { label: 'Sombra',         value: config.shadow ? 'Sim' : 'Não' },
        ].map(({ label, value }) => value != null ? (
          <div key={label} className="bg-gray-800 rounded-xl p-2.5 space-y-0.5">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest">{label}</p>
            <p className="text-xs text-gray-200 truncate">{value}</p>
          </div>
        ) : null)}
      </div>

      {/* Métodos */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Métodos detectados</p>
        <div className="flex gap-2">
          {[
            { key: 'pix',    icon: '⚡', label: 'PIX'    },
            { key: 'card',   icon: '💳', label: 'Cartão' },
            { key: 'boleto', icon: '🔖', label: 'Boleto' },
          ].map(m => {
            const active = config.methods?.[m.key as keyof typeof config.methods]
            return (
              <div key={m.key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition ${active ? 'bg-violet-900/20 border-violet-700 text-violet-300' : 'bg-gray-800 border-gray-700 text-gray-600'}`}>
                <span>{m.icon}</span><span>{m.label}</span>
                {active ? <span className="text-emerald-400 text-[10px]">✓</span> : <span className="text-gray-700 text-[10px]">✗</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Campos */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Campos detectados</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'name',     label: 'Nome'      },
            { key: 'email',    label: 'E-mail'    },
            { key: 'phone',    label: 'Telefone'  },
            { key: 'document', label: 'Documento' },
            { key: 'address',  label: 'Endereço'  },
          ].map(f => {
            const active = config.fields?.[f.key as keyof typeof config.fields]
            return (
              <span key={f.key}
                className={`text-[11px] px-2.5 py-1 rounded-lg border ${active ? 'bg-violet-900/20 border-violet-700 text-violet-300' : 'bg-gray-800 border-gray-700 text-gray-600 line-through'}`}>
                {f.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack}
          className="px-4 py-2.5 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700">
          ← Voltar
        </button>
        <button type="button" onClick={onApply}
          className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition">
          ✨ Aplicar no editor
        </button>
      </div>
    </div>
  )
}
