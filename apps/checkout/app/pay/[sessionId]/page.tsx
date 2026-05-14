"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`http://localhost:8000/api/v1/public/checkout-sessions/${sessionId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setSessionData(json.data);
        }
      })
      .catch((err) => setError("Erro ao conectar com a API de checkout."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handlePixPayment = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/public/checkout-sessions/${sessionId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "pix" }),
      });
      const json = await res.json();
      if (json.error) {
        alert("Erro: " + json.error);
      } else {
        setPaymentResult(json.data);
      }
    } catch (err) {
      alert("Falha no pagamento");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Carregando experiência segura...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-medium">{error}</div>;
  }

  // Se PIX foi gerado com sucesso
  if (paymentResult?.method === 'pix') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Criado!</h2>
          <p className="text-gray-500 mb-8 text-sm">Escaneie o QR Code abaixo no app do seu banco para pagar.</p>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex justify-center">
            {/* Simulacao de QR Code PIX */}
            <div className="w-48 h-48 bg-white p-2 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-gray-400 font-medium text-sm">QR Code Mock</span>
            </div>
          </div>

          <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600 font-mono break-all mb-6">
            {paymentResult.pix.qrcode}
          </div>

          <p className="text-xs text-gray-400">
            Aguardando pagamento... Você será redirecionado assim que for confirmado.
          </p>
        </div>
      </div>
    );
  }

  const { customer, items, amount, currency } = sessionData;
  const totalFormatado = (amount / 100).toLocaleString("pt-BR", { style: "currency", currency });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6">
      
      {/* Checkout Header */}
      <div className="w-full max-w-3xl mb-8 flex justify-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          <span className="font-bold text-lg text-gray-900">Checkout Seguro</span>
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Resumo do Pedido */}
        <div className="w-full md:w-5/12 bg-gray-50 p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Resumo da Compra</h3>
          
          <div className="flex-1">
            {items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                </div>
                <span className="font-medium text-gray-900">
                  {((item.unit_price * item.quantity) / 100).toLocaleString("pt-BR", { style: "currency", currency })}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{totalFormatado}</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-indigo-600">{totalFormatado}</span>
            </div>
          </div>
        </div>

        {/* Right: Pagamento */}
        <div className="w-full md:w-7/12 p-8">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pagamento</h3>
            <p className="text-sm text-gray-500">Escolha a forma de pagamento.</p>
          </div>

          <div className="mb-8">
            <div className="p-4 rounded-xl border-2 border-indigo-600 bg-indigo-50 flex justify-between items-center cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-4 border-indigo-600"></div>
                <span className="font-bold text-indigo-900">PIX</span>
              </div>
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Aprovação Imediata</span>
            </div>
            {/* Outros métodos entrariam aqui (Cartão, Boleto) */}
          </div>

          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-2">Dados do Comprador</p>
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p><strong>Nome:</strong> {customer.name}</p>
              <p><strong>Email:</strong> {customer.email}</p>
            </div>
          </div>

          <button 
            onClick={handlePixPayment}
            disabled={processing}
            className="w-full bg-indigo-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {processing ? "Processando Seguro..." : `Pagar ${totalFormatado}`}
            {!processing && <Lock className="w-4 h-4" />}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Pagamento 100% seguro e criptografado
          </p>
        </div>

      </div>
    </div>
  );
}
