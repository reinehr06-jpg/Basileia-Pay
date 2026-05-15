'use client'

interface ExtractedData {
  url: string
  colors: { primary: string; secondary: string; background: string; text: string; all: string[] }
  logo_url: string | null
  fonts: string[]
  title: string
  border_radius: number
  button_text: string
  meta: { description?: string }
}

interface Props {
  data: ExtractedData
  onApply: () => void
  onBack: () => void
}

export function ImportUrlResult({ data, onApply, onBack }: Props) {
  const domain = (() => { try { return new URL(data.url).hostname } catch { return data.url } })()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>🌐</span>
        <span className="font-mono truncate">{domain}</span>
        <span className="text-emerald-400 font-semibold">✓ Extraído</span>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Cores extraídas</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Primária',   value: data.colors.primary,    key: 'primary'    },
            { label: 'Secundária', value: data.colors.secondary,  key: 'secondary'  },
            { label: 'Fundo',      value: data.colors.background, key: 'background' },
            { label: 'Texto',      value: data.colors.text,       key: 'text'       },
          ].map(c => (
            <div key={c.key} className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-2.5 py-1.5">
              <span className="w-4 h-4 rounded-md flex-shrink-0 border border-gray-700"
                style={{ background: c.value }} />
              <div>
                <p className="text-[9px] text-gray-600">{c.label}</p>
                <p className="text-[10px] text-gray-300 font-mono">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {data.colors.all.map(c => (
            <div key={c} title={c}
              className="w-5 h-5 rounded border border-gray-700 flex-shrink-0 cursor-default"
              style={{ background: c }} />
          ))}
        </div>
      </div>

      {data.logo_url && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Logo detectada</p>
          <div className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
            <img src={data.logo_url} alt="logo" className="h-8 max-w-[120px] object-contain" />
            <p className="text-[10px] text-gray-500 font-mono truncate">{data.logo_url}</p>
          </div>
        </div>
      )}

      {data.fonts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Fontes</p>
          <div className="flex flex-wrap gap-1.5">
            {data.fonts.map(f => (
              <span key={f} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-700">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-xl p-3 space-y-0.5">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest">Título</p>
          <p className="text-xs text-gray-200 font-medium truncate">{data.title}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 space-y-0.5">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest">Botão CTA</p>
          <p className="text-xs text-gray-200 font-medium truncate">{data.button_text}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 space-y-0.5">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest">Border-radius</p>
          <p className="text-xs text-gray-200 font-medium">{data.border_radius}px</p>
        </div>
        {data.meta.description && (
          <div className="bg-gray-800 rounded-xl p-3 space-y-0.5 col-span-2">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest">Descrição</p>
            <p className="text-[11px] text-gray-400 line-clamp-2">{data.meta.description}</p>
          </div>
        )}
      </div>

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
