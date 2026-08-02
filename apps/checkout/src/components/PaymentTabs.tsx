'use client';

import { useState } from 'react';

interface PaymentTabsProps {
  checkoutId: string;
  amount: number;
}

export function PaymentTabs({ checkoutId, amount }: PaymentTabsProps) {
  const [activeTab, setActiveTab] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const amountBRL = (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleProcessPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const payload: any = {
        method: activeTab === 'card' ? 'creditcard' : activeTab,
        name,
        email,
        document,
      };

      if (activeTab === 'card') {
        payload.card_number = cardNumber.replace(/\s/g, '');
        payload.card_holder = cardHolder;
        payload.card_expiry = cardExpiry;
        payload.card_cvv = cardCvv;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v2/checkout/${checkoutId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro ao processar pagamento');
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pedido Processado!</h2>
        
        {activeTab === 'pix' && successData.pix && (
          <div className="mt-6 p-4 bg-white rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/jpeg;base64,${successData.pix.qr_code}`} alt="QR Code PIX" className="mx-auto w-48 h-48" />
            <p className="mt-4 text-gray-800 text-sm font-bold truncate">{successData.pix.copy_paste}</p>
          </div>
        )}

        {activeTab === 'boleto' && successData.boleto && (
          <div className="mt-6 space-y-4">
            <a href={successData.boleto.url} target="_blank" rel="noreferrer" className="block w-full py-3 bg-purple-600 rounded-xl font-bold">Imprimir Boleto</a>
            <p className="text-gray-300 text-sm break-all">{successData.boleto.barcode}</p>
          </div>
        )}

        {activeTab === 'card' && (
          <p className="text-purple-300 mt-4">Pagamento aprovado com sucesso! Verifique seu e-mail.</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400"></div>
      
      {/* Customer Info */}
      <div className="mb-8 space-y-4">
        <h3 className="font-bold text-white mb-4">Seus Dados</h3>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all" placeholder="Nome Completo" />
        <div className="flex gap-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all" placeholder="E-mail" />
          <input type="text" value={document} onChange={e => setDocument(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all" placeholder="CPF/CNPJ" />
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex space-x-2 bg-black/20 p-1 rounded-2xl mb-8">
        <button 
          onClick={() => setActiveTab('pix')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'pix' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          PIX (5% OFF)
        </button>
        <button 
          onClick={() => setActiveTab('card')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'card' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          CARTÃO
        </button>
        <button 
          onClick={() => setActiveTab('boleto')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'boleto' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          BOLETO
        </button>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">{error}</div>}

      {/* Tabs Content */}
      <div className="min-h-[250px]">
        {activeTab === 'pix' && (
          <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
            <h3 className="text-xl font-bold text-white mb-2">Pague com PIX</h3>
            <p className="text-purple-300 text-sm mb-6">Aprovação imediata. Clique no botão abaixo para gerar o código PIX.</p>
          </div>
        )}

        {activeTab === 'card' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Número do Cartão</label>
                <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="0000 0000 0000 0000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome Impresso</label>
                <input type="text" value={cardHolder} onChange={e => setCardHolder(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="NOME DO TITULAR" />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Validade</label>
                  <input type="text" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="MM/AAAA" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CVV</label>
                  <input type="text" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="123" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'boleto' && (
          <div className="flex flex-col items-center justify-center text-center py-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Boleto Bancário</h3>
            <p className="text-purple-300 text-sm mb-4">A aprovação do boleto pode levar até 3 dias úteis após o pagamento.</p>
          </div>
        )}
      </div>

      <button 
        onClick={handleProcessPayment} 
        disabled={loading}
        className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-1 flex justify-center items-center"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          `Pagar ${amountBRL}`
        )}
      </button>

    </div>
  );
}
