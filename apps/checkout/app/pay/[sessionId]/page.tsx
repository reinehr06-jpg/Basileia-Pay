"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Lock, ShieldCheck, CheckCircle2, Copy, QrCode } from "lucide-react";

export default function CheckoutPage() {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [pollLoading, setPollLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/public/checkout-sessions/${sessionId}`)
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

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!paymentResult?.pix || paymentResult.status === 'approved') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/public/checkout-sessions/${sessionId}/status`);
        const json = await res.json();
        
        if (json.data?.payment_status === 'approved') {
          window.location.href = `/${sessionId}/success`;
          return;
        }
        
        // Atualizar tempo restante
        if (json.data?.pix?.expires_at) {
          const expires = new Date(json.data.pix.expires_at).getTime();
          const now = Date.now();
          setTimeLeft(Math.max(0, Math.floor((expires - now) / 1000)));
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentResult, sessionId]);

  // Timer countdown
  useEffect(() => {
    if (!paymentResult?.pix?.expires_at) return;
    
    const expires = new Date(paymentResult.pix.expires_at).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePixPayment = async () => {
    setProcessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/v1/public/checkout-sessions/${sessionId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "pix" }),
      });
      const json = await res.json();
      if (json.error) {
        alert("Erro: " + (json.error.message || json.error));
      } else {
        setPaymentResult(json.data);
      }
    } catch (err) {
      alert("Falha no pagamento");
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (paymentResult?.pix?.payload) {
      navigator.clipboard.writeText(paymentResult.pix.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    const isExpiring = timeLeft < 60;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PIX Gerado!</h2>
          <p className="text-gray-500 mb-4 text-sm">Escaneie o QR Code ou copie o código para pagar.</p>
          
          {/* Timer */}
          <div className={`text-3xl font-mono font-bold mb-6 ${isExpiring ? 'text-red-600' : 'text-gray-700'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
          
          {/* QR Code */}
          {paymentResult.pix.qrcode && (
            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex justify-center">
              <img 
                src={paymentResult.pix.qrcode} 
                alt="QR Code PIX" 
                className="w-48 h-48"
              />
            </div>
          )}

          {/* Copiar código */}
          {paymentResult.pix.payload && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-2">Ou copie o código:</p>
              <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600 font-mono break-all mb-2 flex items-center justify-between">
                <span className="truncate max-w-[280px]">{paymentResult.pix.payload}</span>
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado!" : "Copiar código"}
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Aguardando pagamento... Você será redirecionado automaticamente assim que for confirmado.
          </p>
        </div>
      </div>
    );
  }

  const { customer, items, amount, currency } = sessionData;
  const totalFormatado = (amount / 100).toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" });

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
            {items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                </div>
                <span className="font-medium text-gray-900">
                  {((item.unit_price * item.quantity) / 100).toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" })}
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
          </div>

          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-2">Dados do Comprador</p>
            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p><strong>Nome:</strong> {customer?.name}</p>
              <p><strong>Email:</strong> {customer?.email}</p>
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