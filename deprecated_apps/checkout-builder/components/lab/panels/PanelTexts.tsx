'use client'

import { useEditor } from '@/stores/EditorContext'
import { TextInput } from '../controls/TextInput'

export function PanelTexts() {
  const { state, setField } = useEditor()
  const c = state.config
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white">Textos</h2>
      <TextInput label="Título principal"    value={c.title}             onChange={v => setField('title',v)}             placeholder="Finalize seu pagamento" />
      <TextInput label="Descrição"           value={c.description}       onChange={v => setField('description',v)}       multiline placeholder="Texto opcional abaixo do título" />
      <TextInput label="Texto do botão"      value={c.button_text}       onChange={v => setField('button_text',v)}       placeholder="Pagar agora" />
      <TextInput label="Título pós-pagamento" value={c.success_title}    onChange={v => setField('success_title',v)}     placeholder="Pagamento confirmado!" />
      <TextInput label="Mensagem de sucesso" value={c.success_message}   onChange={v => setField('success_message',v)}   multiline />
      <TextInput label="Instrução PIX"       value={c.pix_instructions}  onChange={v => setField('pix_instructions',v)}  multiline />
      <TextInput label="Instrução Boleto"    value={c.boleto_instructions} onChange={v => setField('boleto_instructions',v)} multiline />
    </div>
  )
}
