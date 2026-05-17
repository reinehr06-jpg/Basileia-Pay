'use client';

import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CreditCard, HelpCircle, RefreshCcw } from 'lucide-react';

export default function FailurePage() {
  const params = useParams();
  const router = useRouter();
  const sessionToken = params.sessionToken as string;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-red-50">
        <div className="bg-red-500 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Pagamento Recusado</h1>
          <p className="text-red-100 text-sm">Não conseguimos processar sua transação.</p>
        </div>

        <div className="p-8">
          <div className="bg-red-50 rounded-2xl p-6 mb-8 border border-red-100">
             <h3 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                O que aconteceu?
             </h3>
             <p className="text-sm text-red-700 leading-relaxed">
                O emissor do seu cartão recusou a transação. Isso pode acontecer por saldo insuficiente, dados incorretos ou bloqueio preventivo de segurança.
             </p>
          </div>

          <div className="space-y-3 mb-8">
             <button 
                onClick={() => router.push(`/pay/${sessionToken}`)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
             >
                <RefreshCcw size={18} /> Tentar Novamente
             </button>
             <button 
                onClick={() => router.push(`/pay/${sessionToken}`)}
                className="w-full py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition"
             >
                <CreditCard size={18} /> Usar Outro Método
             </button>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                <HelpCircle size={14} />
                Precisa de ajuda? Entre em contato com o suporte.
             </div>
             <button 
                onClick={() => router.push(`/pay/${sessionToken}`)}
                className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
             >
                <ArrowLeft size={16} /> Voltar para o Checkout
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
