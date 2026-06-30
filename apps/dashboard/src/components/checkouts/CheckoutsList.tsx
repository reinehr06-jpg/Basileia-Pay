'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { LayoutTemplate, Edit2, Globe, Archive } from 'lucide-react';

export function CheckoutsList() {
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const fetchCheckouts = async () => {
    try {
      const data = await apiFetch('/api/v1/checkouts');
      setCheckouts(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 animate-pulse text-ink-light">Carregando checkouts...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {checkouts.length === 0 ? (
        <div className="col-span-full text-center p-12 bg-white rounded-2xl border border-border">
          <LayoutTemplate className="w-12 h-12 text-border mx-auto mb-4" />
          <h3 className="font-bold text-ink">Nenhum checkout encontrado</h3>
          <p className="text-sm text-ink-light mt-2">Crie seu primeiro checkout para começar a vender.</p>
        </div>
      ) : checkouts.map(checkout => (
        <div key={checkout.id} className="bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition group flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-ink">{checkout.name}</h3>
              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-2 ${
                checkout.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {checkout.status}
              </span>
            </div>
            {checkout.trust_score !== null && (
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                checkout.trust_score > 70 ? 'border-green-500 text-green-600' : 'border-amber-500 text-amber-600'
              }`}>
                {checkout.trust_score}
              </div>
            )}
          </div>
          <div className="text-xs text-ink-light mb-6 flex-1">
            <p>Versão: {checkout.current_version}</p>
            <p>Atualizado em: {new Date(checkout.updated_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2 border-t border-border pt-4 mt-auto">
            <Link 
              href={`/checkouts/${checkout.id}/editor`}
              className="flex-1 text-center py-2 text-sm font-medium text-ink bg-brand-soft rounded-lg hover:bg-brand-soft/80"
            >
              <Edit2 className="w-4 h-4 inline-block mr-1" /> Editar
            </Link>
            {checkout.status === 'published' && checkout.system_id && (
              <a 
                href={`/c/${checkout.system_id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2 text-sm font-medium text-brand bg-brand-soft/30 rounded-lg hover:bg-brand-soft/50"
              >
                <Globe className="w-4 h-4 inline-block mr-1" /> Ver Ao Vivo
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
