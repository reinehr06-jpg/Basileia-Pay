'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Plus, Webhook, CheckCircle, XCircle, RefreshCcw, Loader2, AlertCircle } from 'lucide-react';
import { useWebhooks } from '@/hooks/api/useWebhooks';
import { useState } from 'react';

export default function WebhooksPage() {
  const { endpoints, deliveries, loading, error, refetch } = useWebhooks();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'deliveries'>('endpoints');

  return (
    <PageLayout 
      title="Webhooks"
      action={<button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"><Plus size={16} /> Novo Endpoint</button>}
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button 
            onClick={() => setActiveTab('endpoints')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'endpoints' ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'}`}
          >
            Endpoints
          </button>
          <button 
            onClick={() => setActiveTab('deliveries')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'deliveries' ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'}`}
          >
            Entregas Recentes
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand" size={32} />
            <p className="text-ink-subtle text-sm">Carregando dados de webhooks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
            <AlertCircle className="text-danger" size={32} />
            <div>
              <p className="text-ink font-medium">Erro ao carregar dados</p>
              <p className="text-ink-subtle text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : activeTab === 'endpoints' ? (
          <Card>
            <div className="overflow-x-auto">
              {endpoints.length === 0 ? (
                <div className="py-10 text-center">
                  <Webhook className="text-ink-subtle mx-auto mb-2" size={32} />
                  <p className="text-ink-subtle text-sm">Nenhum endpoint configurado.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-ink">
                  <thead className="border-b border-border bg-surface-raised text-ink-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">URL</th>
                      <th className="px-4 py-3 font-medium">Sistema</th>
                      <th className="px-4 py-3 font-medium">Eventos</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((endpoint) => (
                      <tr key={endpoint.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-ink truncate max-w-[300px]">{endpoint.url}</td>
                        <td className="px-4 py-3 font-medium">{endpoint.connected_system?.name || 'Todos'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {endpoint.events.map((ev, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-brand-muted text-brand text-[10px] font-bold uppercase">{ev}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            endpoint.status === 'active' ? 'bg-success-muted text-success' : 'bg-danger-muted text-danger'
                          }`}>
                            {endpoint.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-brand hover:underline font-medium">Configurar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            <h3 className="font-bold text-ink flex items-center gap-2 px-2">
              <RefreshCcw size={18} className="text-ink-subtle" /> Histórico de Envios
            </h3>
            <Card>
              <div className="divide-y divide-border">
                {deliveries.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-ink-subtle text-sm">Nenhuma entrega registrada ainda.</p>
                  </div>
                ) : (
                  deliveries.map((dlv) => (
                    <div key={dlv.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${dlv.success ? 'bg-success-muted text-success' : 'bg-danger-muted text-danger'}`}>
                          {dlv.success ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-ink">{dlv.event}</div>
                          <div className="text-xs text-ink-subtle font-mono truncate max-w-[250px]">{dlv.url}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className={`text-sm font-black ${dlv.success ? 'text-success' : 'text-danger'}`}>{dlv.status_code}</div>
                          <div className="text-[10px] text-ink-subtle uppercase font-bold tracking-tight">{new Date(dlv.created_at).toLocaleString('pt-BR')}</div>
                        </div>
                        <button className="px-3 py-1 text-[10px] uppercase font-bold border border-border rounded-md hover:bg-surface-raised transition-colors">Reenviar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
