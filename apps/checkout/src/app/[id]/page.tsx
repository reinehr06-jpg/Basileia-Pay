import { PaymentTabs } from '@/components/PaymentTabs';
import { notFound } from 'next/navigation';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const uuid = resolvedParams.id;

  // Fetch session data from backend API
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v2/checkout/session/${uuid}`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    return notFound();
  }

  const session = await res.json();
  
  // Format price (amount is in cents)
  const amountBRL = (session.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-[#0f0a1e] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] font-sans text-white flex items-center justify-center p-4">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0f0a1e] via-[#1a103c] to-[#2d1b69] opacity-90"></div>
      
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-start">
          
          {/* Left Panel: Summary Card */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="font-bold text-xl">{session.experience?.name?.[0] || 'B'}</span>
                </div>
                <span className="text-2xl font-black tracking-tight text-white">{session.experience?.name || 'Basiléia Pay'}</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Ambiente Seguro</span>
              </div>
              
              <div className="space-y-1 mb-8">
                <h3 className="text-sm text-purple-300/80 font-semibold uppercase tracking-widest">Você está adquirindo</h3>
                <h1 className="text-4xl font-black text-white leading-tight">{session.description || 'Produto Premium'}</h1>
              </div>
              
              <div className="pt-6 border-t border-white/10 flex items-end justify-between">
                <div>
                  <div className="text-sm text-purple-300 mb-1">Total a pagar</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {amountBRL}
                  </div>
                </div>
              </div>
            </div>

            {/* Support info */}
            <div className="text-center text-sm text-purple-300/60 font-medium">
              Ambiente criptografado de ponta a ponta.
            </div>
          </div>

          {/* Right Panel: Payment Tabs */}
          <div className="w-full">
            <PaymentTabs checkoutId={uuid} amount={session.amount} />
          </div>

        </div>
      </div>
    </div>
  );
}
