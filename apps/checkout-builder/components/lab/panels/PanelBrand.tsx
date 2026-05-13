'use client'

import { useEditor } from '@/stores/EditorContext'
import { ColorPicker } from '../controls/ColorPicker'
import { ImageUpload } from '../controls/ImageUpload'
import { SliderInput } from '../controls/SliderInput'
import { SelectInput } from '../controls/SelectInput'

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return <div className="space-y-3"><h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2">{t}</h3>{children}</div>
}

export function PanelBrand() {
  const { state, setField } = useEditor()
  const c = state.config
  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-white">Marca</h2>
      <S t="Logo">
        <ImageUpload label="Logotipo" value={c.logo_url} onChange={v => setField('logo_url', v)} />
        <SliderInput label="Largura" min={40} max={300} step={10} value={c.logo_width} onChange={v => setField('logo_width', v)} unit="px" />
        <SelectInput label="Alinhamento" value={c.logo_position}
          options={[{value:'left',label:'Esquerda'},{value:'center',label:'Centro'},{value:'right',label:'Direita'}]}
          onChange={v => setField('logo_position', v)} />
      </S>
      <S t="Cores principais">
        <ColorPicker label="Cor principal"  value={c.primary_color}   onChange={v => setField('primary_color', v)} />
        <ColorPicker label="Cor secundária" value={c.secondary_color} onChange={v => setField('secondary_color', v)} />
      </S>
      <S t="Interface">
        <ColorPicker label="Fundo"      value={c.background_color} onChange={v => setField('background_color', v)} />
        <ColorPicker label="Texto"      value={c.text_color}       onChange={v => setField('text_color', v)} />
        <ColorPicker label="Texto suave" value={c.text_muted_color} onChange={v => setField('text_muted_color', v)} />
        <ColorPicker label="Borda"      value={c.border_color}     onChange={v => setField('border_color', v)} />
      </S>
      <S t="Feedback">
        <ColorPicker label="Sucesso" value={c.success_color} onChange={v => setField('success_color', v)} />
        <ColorPicker label="Erro"    value={c.error_color}   onChange={v => setField('error_color', v)} />
      </S>
    </div>
  )
}
