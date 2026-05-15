'use client'

interface Props {
  before: Record<string, unknown>
  after: Record<string, unknown>
  diffKeys: string[]
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não'
  if (typeof v === 'object') return JSON.stringify(v, null, 2)
  return String(v)
}

function isColor(v: unknown): boolean {
  return typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)
}

export function ConfigDiff({ before, after, diffKeys }: Props) {
  const FIELD_LABELS: Record<string, string> = {
    primary_color: 'Cor principal', secondary_color: 'Cor secundária',
    background_color: 'Fundo', text_color: 'Texto', border_color: 'Borda',
    border_radius: 'Arredondamento', padding: 'Padding', shadow: 'Sombra',
    title: 'Título', button_text: 'Botão', logo_url: 'Logo',
    container_width: 'Largura', show_timer: 'Temporizador',
    card_installments: 'Parcelas', custom_css: 'CSS',
  }

  return (
    <div className="space-y-2 mt-2">
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Alterações</p>
      <div className="space-y-1.5">
        {diffKeys.map(key => {
          const bv = before[key]; const av = after[key]
          const label = FIELD_LABELS[key] ?? key
          return (
            <div key={key} className="flex items-start gap-2 text-xs bg-gray-950 rounded-lg p-2.5">
              <span className="text-gray-500 flex-shrink-0 w-28 truncate">{label}</span>
              <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                {/* Antes */}
                <div className="flex items-center gap-1.5">
                  {isColor(bv) && (
                    <span className="w-3.5 h-3.5 rounded-sm inline-block border border-gray-700 flex-shrink-0"
                      style={{ background: bv as string }} />
                  )}
                  <span className="text-red-400 line-through font-mono text-[10px] truncate max-w-[100px]">
                    {formatValue(bv)}
                  </span>
                </div>
                <span className="text-gray-700">→</span>
                {/* Depois */}
                <div className="flex items-center gap-1.5">
                  {isColor(av) && (
                    <span className="w-3.5 h-3.5 rounded-sm inline-block border border-gray-700 flex-shrink-0"
                      style={{ background: av as string }} />
                  )}
                  <span className="text-emerald-400 font-mono text-[10px] truncate max-w-[100px]">
                    {formatValue(av)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
