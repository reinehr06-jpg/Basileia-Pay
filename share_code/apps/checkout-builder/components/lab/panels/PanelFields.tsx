'use client'

import { useEditor } from '@/stores/EditorContext'
import { ToggleInput } from '../controls/ToggleInput'
import { DragList } from '../controls/DragList'

const LABELS: Record<string,string> = { name:'Nome completo', email:'E-mail', phone:'Telefone', document:'CPF / CNPJ', address:'Endereço' }

export function PanelFields() {
  const { state, setField } = useEditor()
  const c = state.config
  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-white">Campos do Formulário</h2>
      <div className="space-y-3">
        <ToggleInput label="Nome"     value={c.show_name}     onChange={v => setField('show_name',v)} />
        <ToggleInput label="E-mail"   value={c.show_email}    onChange={v => setField('show_email',v)} />
        <ToggleInput label="Telefone" value={c.show_phone}    onChange={v => setField('show_phone',v)} />
        <ToggleInput label="CPF/CNPJ" value={c.show_document} onChange={v => setField('show_document',v)} />
        <ToggleInput label="Endereço" value={c.show_address}  onChange={v => setField('show_address',v)} />
      </div>
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ordem (arraste)</h3>
        <DragList items={c.field_order.map(id => ({ id, label: LABELS[id]??id }))} onChange={v => setField('field_order',v)} />
      </div>
    </div>
  )
}
