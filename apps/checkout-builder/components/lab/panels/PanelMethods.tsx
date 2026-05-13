'use client'

import { useEditor } from '@/stores/EditorContext'
import { ToggleInput } from '../controls/ToggleInput'
import { SliderInput } from '../controls/SliderInput'
import { SelectInput } from '../controls/SelectInput'
import { TextInput } from '../controls/TextInput'

const D = ({ t }: { t: string }) => <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pt-2">{t}</h3>

export function PanelMethods() {
  const { state, setField, setNested } = useEditor()
  const c = state.config
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Métodos de Pagamento</h2>
      <D t="Ativar" />
      <ToggleInput label="PIX"    value={c.methods.pix}    onChange={v => setNested('methods.pix',v)} />
      <ToggleInput label="Cartão" value={c.methods.card}   onChange={v => setNested('methods.card',v)} />
      <ToggleInput label="Boleto" value={c.methods.boleto} onChange={v => setNested('methods.boleto',v)} />
      {c.methods.card && <>
        <D t="Cartão de crédito" />
        <SliderInput label="Parcelas máximas" min={1} max={12} step={1} value={c.card_installments}     onChange={v => setField('card_installments',v)} unit="x" />
        <SliderInput label="Parcela mínima"   min={1} max={12} step={1} value={c.card_min_installments} onChange={v => setField('card_min_installments',v)} unit="x" />
        <SliderInput label="Desconto à vista" min={0} max={30} step={1} value={c.card_discount}         onChange={v => setField('card_discount',v)} unit="%" />
      </>}
      {c.methods.pix && <>
        <D t="PIX" />
        <ToggleInput label="Botão copiar código" value={c.pix_copy_enabled} onChange={v => setField('pix_copy_enabled',v)} />
        <SelectInput label="Tipo de chave" value={c.pix_key_type}
          options={[{value:'cpf',label:'CPF'},{value:'email',label:'E-mail'},{value:'phone',label:'Telefone'},{value:'random',label:'Aleatória'}]}
          onChange={v => setField('pix_key_type',v)} />
        <TextInput label="Instrução PIX" value={c.pix_instructions} onChange={v => setField('pix_instructions',v)} multiline />
      </>}
      {c.methods.boleto && <>
        <D t="Boleto" />
        <SliderInput label="Dias para vencer" min={1} max={30} step={1} value={c.boleto_due_days} onChange={v => setField('boleto_due_days',v)} unit="d" />
        <TextInput label="Instruções" value={c.boleto_instructions} onChange={v => setField('boleto_instructions',v)} multiline />
      </>}
    </div>
  )
}
