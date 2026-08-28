'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { ShieldAlert, CheckCircle2, XCircle, Activity, CreditCard, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function GatewaysList() {
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const data = await apiFetch('/api/v1/dashboard/gateways');
      setGateways(data.data || []);
    } catch (err) {
      console.error('Error fetching gateways', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-ink-light animate-pulse">Carregando gateways...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link 
          href="/gateways/new" 
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-brand/90 transition"
        >
          Novo Gateway
        </Link>
      </div>

      {gateways.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <CreditCard className="w-12 h-12 text-border mx-auto mb-4" />
          <h3 className="text-lg font-bold text-ink mb-2">Nenhum gateway configurado</h3>
          <p className="text-sm text-ink-light mb-6">Conecte Asaas, PagBank ou Stripe para começar a processar pagamentos.</p>
          <Link 
            href="/gateways/new" 
            className="inline-flex items-center justify-center bg-brand text-white px-6 py-2.5 rounded-lg font-semibold shadow hover:bg-brand/90 transition-all"
          >
            Adicionar Gateway
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl border border-border p-6 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink">{g.name}</h3>
                    <p className="text-xs text-ink-light uppercase font-medium">{g.provider} • {g.environment}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                  g.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {g.status}
                </div>
              </div>
              
              <div className="space-y-3 mt-6 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-light flex items-center gap-1.5"><Activity className="w-4 h-4"/> Saúde da Conexão</span>
                  {g.last_test_status === 'success' ? (
                    <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> OK</span>
                  ) : (
                    <span className="text-red-600 font-medium flex items-center gap-1"><XCircle className="w-4 h-4"/> Falha</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
