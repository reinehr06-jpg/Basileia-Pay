import { getCheckout } from '@/lib/api'
import Link from 'next/link'

interface Props { params: Promise<{ uuid: string }> }

export default async function SuccessPage({ params }: Props) {
  const { uuid } = await params
  let checkout: any
  try { checkout = await getCheckout(uuid) } catch { checkout = null }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg max-w-md w-full p-10 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Pagamento confirmado!</h1>
        <p className="text-slate-500 text-sm mb-6">
          {checkout?.description ?? 'Seu pagamento foi processado com sucesso.'}
        </p>

        {checkout && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Valor</span>
              <span className="font-bold text-violet-700">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(checkout.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Método</span>
              <span className="font-medium capitalize">{checkout.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ID</span>
              <span className="font-mono text-xs text-slate-500">{uuid.slice(0, 8)}...</span>
            </div>
          </div>
        )}

        <Link href={`/${uuid}/receipt`}
          className="block w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition mb-3">
          🧾 Ver comprovante
        </Link>
        <p className="text-xs text-slate-400">
          Um e-mail de confirmação foi enviado para você.
        </p>
      </div>
    </main>
  )
}
