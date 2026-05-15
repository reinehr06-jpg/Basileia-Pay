import { notFound } from 'next/navigation'

interface Props { params: { token: string } }

async function getTestConfig(token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/test/${token}`,
      { cache: 'no-store' }
    )
    if (res.status === 404 || res.status === 410) return null
    return res.json()
  } catch { return null }
}

export default async function PreviewPage({ params }: Props) {
  const data = await getTestConfig(params.token)
  if (!data) notFound()

  // Inline CSS approach based on config (similar to CheckoutPreview component)
  const c = data.config
  const s = {
    card: { background: c.background_color, color: c.text_color, borderRadius: c.border_radius, padding: c.padding, width: c.container_width, maxWidth: c.container_max_width, boxShadow: c.shadow ? '0 25px 60px rgba(0,0,0,0.3)' : 'none', fontFamily: 'system-ui,sans-serif' } as React.CSSProperties,
    input: { border: `1.5px solid ${c.border_color}`, borderRadius: Math.min(c.border_radius,10), padding:'10px 12px', width:'100%', fontSize:14, background:'transparent', color:c.text_color, boxSizing:'border-box' as const, marginBottom:10, outline:'none' } as React.CSSProperties,
    btn: { background: c.primary_color, borderRadius: Math.min(c.border_radius,12), color:'#fff', width:'100%', padding:'14px', fontWeight:700, fontSize:15, border:'none', cursor:'pointer', marginTop:8 } as React.CSSProperties,
    tab: (a: boolean): React.CSSProperties => ({ flex:1, padding:'9px 4px', fontSize:13, fontWeight:500, borderRadius:Math.min(c.border_radius,8), border:`1.5px solid ${a ? c.primary_color : c.border_color}`, background: a ? c.primary_color+'18':'transparent', color: a ? c.primary_color : c.text_muted_color, cursor:'pointer' }),
    muted: { color: c.text_muted_color, fontSize:12 } as React.CSSProperties,
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Banner de aviso */}
      <div className="mb-6 px-5 py-2.5 bg-amber-900/30 border border-amber-700/50 rounded-xl flex items-center gap-3">
        <span className="text-amber-400 text-lg">🧪</span>
        <div>
          <p className="text-sm font-semibold text-amber-300">Modo de Teste</p>
          <p className="text-xs text-amber-500">Este checkout não processa pagamentos reais</p>
        </div>
        {data.expires_at && (
          <span className="ml-4 text-xs text-amber-600">
            Expira: {new Date(data.expires_at).toLocaleString('pt-BR')}
          </span>
        )}
      </div>

      <div style={s.card} className="ck-card">
        {c.custom_css && <style dangerouslySetInnerHTML={{ __html: c.custom_css }} />}

        {c.logo_url && (
          <div style={{ textAlign: c.logo_position, marginBottom:20 }}>
            <img src={c.logo_url} alt="logo" style={{ width:c.logo_width, display:'inline-block', maxWidth:'100%' }} />
          </div>
        )}

        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:20, fontWeight:700, margin:0, color:c.text_color }}>{c.title}</h1>
          {c.description && <p style={{...s.muted, margin:'6px 0 0'}}>{c.description}</p>}
        </div>

        <div>
          {c.show_name     && <input style={s.input} placeholder="Nome completo" readOnly />}
          {c.show_email    && <input style={s.input} placeholder="E-mail" readOnly />}
          {c.show_document && <input style={s.input} placeholder="CPF / CNPJ" readOnly />}
        </div>

        <button style={s.btn} className="ck-btn">{c.button_text}</button>
      </div>
    </div>
  )
}
