'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Activity, Webhook, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';

export function WebhooksList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Assuming a generic endpoint exists or will be added soon.
      // We will mock if it fails, or leave it empty for now.
      const data = await apiFetch('/api/v1/dashboard/webhook-events');
      setEvents(data.data || []);
    } catch (err) {
      console.error('Error fetching webhooks', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-ink-light animate-pulse">Carregando eventos...</div>;
  }

  return (
    <div className="space-y-6">
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <Webhook className="w-12 h-12 text-border mx-auto mb-4" />
          <h3 className="text-lg font-bold text-ink mb-2">Nenhum evento recebido</h3>
          <p className="text-sm text-ink-light">Aguardando notificações dos seus provedores de pagamento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-soft border-b border-border">
                <tr>
                  <th className="p-4 font-bold text-ink">Gateway</th>
                  <th className="p-4 font-bold text-ink">Evento</th>
                  <th className="p-4 font-bold text-ink">ID Externo</th>
                  <th className="p-4 font-bold text-ink">Status</th>
                  <th className="p-4 font-bold text-ink">Tentativas</th>
                  <th className="p-4 font-bold text-ink">Recebido em</th>
                  <th className="p-4 font-bold text-ink">Processado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-brand-soft/50 transition">
                    <td className="p-4 font-medium text-ink uppercase">{evt.gateway}</td>
                    <td className="p-4 text-ink-light"><code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{evt.event_type}</code></td>
                    <td className="p-4 text-ink-light truncate max-w-[150px]">{evt.gateway_event_id}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        evt.status === 'processed' ? 'bg-green-50 text-green-700' :
                        evt.status === 'received' ? 'bg-blue-50 text-blue-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {evt.status === 'processed' ? <CheckCircle2 className="w-3 h-3"/> : 
                         evt.status === 'received' ? <RefreshCcw className="w-3 h-3 animate-spin"/> : <XCircle className="w-3 h-3"/>}
                        {evt.status}
                      </span>
                    </td>
                    <td className="p-4 text-ink-light">{evt.retry_count}</td>
                    <td className="p-4 text-ink-light">{new Date(evt.created_at).toLocaleString()}</td>
                    <td className="p-4 text-ink-light">{evt.processed_at ? new Date(evt.processed_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
