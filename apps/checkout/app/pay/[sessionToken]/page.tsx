'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  QrCode, 
  CreditCard, 
  FileText, 
  ChevronRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { fetchCheckoutSession, processPayment } from '@/lib/api/checkout';
import { useCheckoutStatus } from '@/hooks/useCheckoutStatus';
import { GuaranteeBadge } from '@/components/experience/GuaranteeBadge';
import { SocialProofBlock } from '@/components/experience/SocialProofBlock';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionToken = params.sessionToken as string;
  
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [copied, setCopied] = useState(false);
  
  // Idempotency key per session attempt
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  // Polling hook
  const { status: currentStatus } = useCheckoutStatus(sessionToken, !!paymentResult || sessionData?.status === 'processing');

  useEffect(() => {
    if (!sessionToken) return;
    fetchCheckoutSession(sessionToken)
      .then(res => setSessionData(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionToken]);

  // Handle Redirections based on status
  useEffect(() => {
    if (currentStatus?.next_action === 'show_success') {
      router.push(`/receipt/${sessionToken}`);
    } else if (currentStatus?.next_action === 'show_failure') {
      router.push(`/failure/${sessionToken}`);
    }
  }, [currentStatus, sessionToken, router]);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const payload = {
        method: selectedMethod,
        customer: sessionData.customer,
        // For 'card', we would normally have a form state here.
        // For this Phase 2 implementation, we simulate the structure.
        card: selectedMethod === 'card' ? {
          holder_name: sessionData.customer.name,
          number: '4111111111111111', // Dummy for testing
          expiration_month: '12',
          expiration_year: '2030',
          cvv: '123',
          installments: 1
        } : null
      };

      const result = await processPayment(sessionToken, payload, idempotencyKey);
      setPaymentResult(result.data);
      
      if (result.data.status === 'approved') {
        router.push(`/receipt/${sessionToken}`);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Iniciando checkout seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const { customer, items, amount, currency, experience } = sessionData;
  const totalFormatado = (amount / 100).toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" });

  // Payment UI for pending results (Pix/Boleto)
  if (paymentResult && (paymentResult.method === 'pix' || paymentResult.method === 'boleto')) {
     return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {paymentResult.method === 'pix' ? 'PIX Gerado!' : 'Boleto Gerado!'}
            </h2>
            <p className="text-gray-500 mb-6 text-sm">Aguardando confirmação do pagamento.</p>

            {paymentResult.method === 'pix' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-center">
                   <div className="bg-gray-100 w-48 h-48 flex items-center justify-center rounded">
                     <QrCode className="w-32 h-32 text-gray-400" />
                   </div>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(paymentResult.pix.qrcode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado!" : "Copiar Código PIX"}
                </button>
              </div>
            )}

            {paymentResult.method === 'boleto' && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-2">Linha Digitável</p>
                  <p className="text-sm font-mono text-gray-700 break-all">{paymentResult.boleto.barcode}</p>
                </div>
                <a 
                  href={paymentResult.boleto.url} 
                  target="_blank" 
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Abrir Boleto
                </a>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-100">
               <p className="text-xs text-gray-400 flex items-center justify-center gap-2 animate-pulse">
                 <Loader2 className="w-3 h-3 animate-spin" />
                 Detectando pagamento em tempo real...
               </p>
            </div>
          </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        
        {/* Lado Esquerdo: Pagamento */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Como deseja pagar?</h1>
            
            <div className="space-y-4">
              {/* PIX Option */}
              <div 
                onClick={() => setSelectedMethod('pix')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedMethod === 'pix' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'pix' ? 'border-indigo-600' : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'pix' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-gray-900">PIX</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-green-100 text-green-700 rounded">
                  Recomendado
                </span>
              </div>

              {/* Card Option */}
              <div 
                onClick={() => setSelectedMethod('card')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'card' ? 'border-indigo-600' : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-900">Cartão de Crédito</span>
                  </div>
                </div>
              </div>

              {/* Boleto Option */}
              <div 
                onClick={() => setSelectedMethod('boleto')}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  selectedMethod === 'boleto' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === 'boleto' ? 'border-indigo-600' : 'border-gray-300'
                  }`}>
                    {selectedMethod === 'boleto' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-bold text-gray-900">Boleto Bancário</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button 
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-indigo-600 text-white font-black text-xl py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 flex items-center justify-center gap-3"
              >
                {processing ? <Loader2 className="animate-spin" /> : <Lock size={20} />}
                {processing ? 'Processando...' : `Finalizar por ${totalFormatado}`}
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-4 uppercase font-bold tracking-widest">
                Pagamento 100% seguro • Basileia Pay
              </p>
            </div>
          </div>

          {/* Social Proof & Guarantee */}
          <SocialProofBlock sessionToken={sessionToken} />
          <GuaranteeBadge config={experience?.guarantee} />
        </div>

        {/* Lado Direito: Resumo */}
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Seu Pedido</h3>
            <div className="space-y-4">
              {items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}x {item.name}</span>
                  <span className="font-bold text-gray-900">
                    {((item.unit_price * item.quantity) / 100).toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-black text-indigo-600">{totalFormatado}</span>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-6 text-white text-center">
             <ShieldCheck className="mx-auto mb-3 text-indigo-300" size={32} />
             <h4 className="font-bold mb-1">Compra Protegida</h4>
             <p className="text-[10px] text-indigo-200 leading-relaxed">
               Seus dados financeiros são processados em ambiente criptografado e nunca são salvos em nossos servidores.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
