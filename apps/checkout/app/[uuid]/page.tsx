import { getCheckout } from '@/lib/api'
import { notFound } from 'next/navigation'
import PaymentTabs from '@/components/PaymentTabs'

interface Props { params: Promise<{ uuid: string }> }

export default async function CheckoutPage({ params }: Props) {
  const { uuid } = await params
  let checkout: any

  try {
    checkout = await getCheckout(uuid)
  } catch {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Finalize seu pagamento</h1>
          <p className="text-slate-500 text-sm mt-1">{checkout.description}</p>
        </div>

        {/* Valor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex justify-between items-center shadow-sm">
          <span className="text-slate-500 text-sm font-medium">Total</span>
          <span className="text-2xl font-bold text-violet-700">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: checkout.currency ?? 'BRL' })
              .format(checkout.amount)}
          </span>
        </div>

        {/* Tabs PIX / Cartão / Boleto */}
        <PaymentTabs checkout={checkout} />

        {/* Rodapé segurança */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
          </svg>
          Pagamento 100% seguro e criptografado
        </div>
      </div>
    </main>
  )
}
