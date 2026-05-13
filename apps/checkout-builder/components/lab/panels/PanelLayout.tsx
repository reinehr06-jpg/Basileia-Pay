'use client'

import { useEditor } from '@/stores/EditorContext'
import { SliderInput } from '../controls/SliderInput'
import { ToggleInput } from '../controls/ToggleInput'
import { SelectInput } from '../controls/SelectInput'

export function PanelLayout() {
  const { state, setField } = useEditor()
  const c = state.config
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Layout</h2>
      <SliderInput label="Largura do cartão" min={300} max={800} step={10} value={c.container_width} onChange={v => setField('container_width',v)} unit="px" />
      <SliderInput label="Largura máxima"    min={400} max={1000} step={10} value={c.container_max_width} onChange={v => setField('container_max_width',v)} unit="px" />
      <SliderInput label="Padding interno"   min={8}   max={64}   step={4}  value={c.padding}       onChange={v => setField('padding',v)} unit="px" />
      <SliderInput label="Arredondamento"    min={0}   max={48}   step={2}  value={c.border_radius}  onChange={v => setField('border_radius',v)} unit="px" />
      <ToggleInput label="Sombra" value={c.shadow} onChange={v => setField('shadow',v)} />
      <ToggleInput label="Temporizador" description="Contador de tempo na tela de pagamento" value={c.show_timer} onChange={v => setField('show_timer',v)} />
      {c.show_timer && (
        <SelectInput label="Posição do timer" value={c.timer_position}
          options={[{value:'top',label:'Topo'},{value:'bottom',label:'Rodapé'}]}
          onChange={v => setField('timer_position',v)} />
      )}
      <ToggleInput label="Botão de comprovante" description="Link após aprovação" value={c.show_receipt_link} onChange={v => setField('show_receipt_link',v)} />
    </div>
  )
}
