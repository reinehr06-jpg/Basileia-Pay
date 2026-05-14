'use client'

import { useEditor } from '@/stores/EditorContext'
import { useState } from 'react'

type Tab = 'pix' | 'card' | 'boleto'

export function CheckoutPreview() {
  const { state: { config: c } } = useEditor()
  const [tab, setTab] = useState<Tab>('pix')

  const activeMethods = (['pix','card','boleto'] as Tab[]).filter(m => c.methods[m])
  const activeTab = activeMethods.includes(tab) ? tab : activeMethods[0]

  const s = {
    card: { background: c.background_color, color: c.text_color, borderRadius: c.border_radius, padding: c.padding, width: c.container_width, maxWidth: c.container_max_width, boxShadow: c.shadow ? '0 25px 60px rgba(0,0,0,0.3)' : 'none', fontFamily: 'system-ui,sans-serif' } as React.CSSProperties,
    input: { border: `1.5px solid ${c.border_color}`, borderRadius: Math.min(c.border_radius,10), padding:'10px 12px', width:'100%', fontSize:14, background:'transparent', color:c.text_color, boxSizing:'border-box' as const, marginBottom:10, outline:'none' } as React.CSSProperties,
    btn: { background: c.primary_color, borderRadius: Math.min(c.border_radius,12), color:'#fff', width:'100%', padding:'14px', fontWeight:700, fontSize:15, border:'none', cursor:'pointer', marginTop:8 } as React.CSSProperties,
    tab: (a: boolean): React.CSSProperties => ({ flex:1, padding:'9px 4px', fontSize:13, fontWeight:500, borderRadius:Math.min(c.border_radius,8), border:`1.5px solid ${a ? c.primary_color : c.border_color}`, background: a ? c.primary_color+'18':'transparent', color: a ? c.primary_color : c.text_muted_color, cursor:'pointer' }),
    muted: { color: c.text_muted_color, fontSize:12 } as React.CSSProperties,
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-gray-600">Preview em tempo real</p>
      <div style={s.card} className="ck-card">
        {c.custom_css && <style dangerouslySetInnerHTML={{ __html: c.custom_css }} />}

        {c.show_timer && c.timer_position==='top' && (
          <div style={{...s.muted, textAlign:'center', marginBottom:12, fontSize:11}}>
            ⏱️ Sessão expira em <strong style={{color:c.primary_color}}>14:59</strong>
          </div>
        )}

        {c.logo_url && (
          <div style={{ textAlign: c.logo_position, marginBottom:20 }}>
            <img src={c.logo_url} alt="logo" style={{ width:c.logo_width, display:'inline-block', maxWidth:'100%' }} />
          </div>
        )}

        <div style={{ marginBottom:20 }}>
          <h1 style={{ fontSize:20, fontWeight:700, margin:0, color:c.text_color }}>{c.title}</h1>
          {c.description && <p style={{...s.muted, margin:'6px 0 0'}}>{c.description}</p>}
        </div>

        {activeMethods.length > 0 && (
          <div style={{ display:'flex', gap:8, marginBottom:20 }}>
            {activeMethods.map(m => (
              <button key={m} style={s.tab(activeTab===m)} onClick={() => setTab(m)}>
                {({pix:'⚡ PIX', card:'💳 Cartão', boleto:'🔖 Boleto'})[m]}
              </button>
            ))}
          </div>
        )}

        <div>
          {c.show_name     && <input style={s.input} placeholder="Nome completo" readOnly />}
          {c.show_email    && <input style={s.input} placeholder="E-mail" readOnly />}
          {c.show_phone    && <input style={s.input} placeholder="(00) 00000-0000" readOnly />}
          {c.show_document && <input style={s.input} placeholder="CPF / CNPJ" readOnly />}
          {c.show_address  && <input style={s.input} placeholder="Endereço" readOnly />}
        </div>

        {activeTab==='pix' && (
          <div style={{background:c.primary_color+'12',borderRadius:10,padding:16,marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
              <div style={{width:80,height:80,background:c.border_color,borderRadius:8}} />
            </div>
            <p style={{...s.muted,textAlign:'center',fontSize:11}}>{c.pix_instructions||'Escaneie o QR code ou copie o código PIX'}</p>
            {c.pix_copy_enabled && <button style={{...s.btn,marginTop:8,background:c.secondary_color,fontSize:13,padding:'9px'}}>Copiar código PIX</button>}
          </div>
        )}

        {activeTab==='card' && (
          <div style={{marginBottom:12}}>
            <input style={s.input} placeholder="Número do cartão" readOnly />
            <div style={{display:'flex',gap:8}}>
              <input style={{...s.input,flex:1}} placeholder="MM/AA" readOnly />
              <input style={{...s.input,flex:1}} placeholder="CVV" readOnly />
            </div>
            {c.card_installments > 1 && (
              <select style={{...s.input,cursor:'pointer'}}>
                {Array.from({length:c.card_installments},(_,i)=>(
                  <option key={i+1}>{i+1}x sem juros</option>
                ))}
              </select>
            )}
          </div>
        )}

        {activeTab==='boleto' && (
          <div style={{background:c.primary_color+'10',borderRadius:10,padding:16,marginBottom:12,textAlign:'center'}}>
            <p style={{...s.muted,fontSize:11}}>{c.boleto_instructions||`Vence em ${c.boleto_due_days} dias úteis`}</p>
          </div>
        )}

        <button style={s.btn} className="ck-btn">{c.button_text}</button>

        {c.show_timer && c.timer_position==='bottom' && (
          <div style={{...s.muted,textAlign:'center',marginTop:10,fontSize:11}}>
            ⏱️ Sessão expira em <strong style={{color:c.primary_color}}>14:59</strong>
          </div>
        )}
        <p style={{...s.muted,textAlign:'center',marginTop:14,fontSize:11}}>🔒 Ambiente seguro e criptografado</p>
        {c.show_receipt_link && <p style={{...s.muted,textAlign:'center',marginTop:4,fontSize:11}}><a href="#" style={{color:c.primary_color}}>Ver comprovante</a></p>}
      </div>
    </div>
  )
}
