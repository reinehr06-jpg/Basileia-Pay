import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Plus, Webhook, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';

export default function WebhooksPage() {
  return (
    <PageLayout 
      title="Webhooks"
      action={<button className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep">Novo Endpoint</button>}
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-brand text-brand">Endpoints</button>
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-ink-muted hover:text-ink">Entregas</button>
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-ink-muted hover:text-ink">Recebidos (Gateways)</button>
        </div>

        {/* Endpoints Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink">
              <thead className="border-b border-border bg-surface-raised text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium">Sistema</th>
                  <th className="px-4 py-3 font-medium">Eventos</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Última Entrega</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border hover:bg-surface-raised/50">
                  <td className="px-4 py-3 font-mono text-xs text-ink">https://api.meusite.com/webhooks/basileia</td>
                  <td className="px-4 py-3">Site Principal</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border text-[10px]">payment.*</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-raised border border-border text-[10px] ml-1">order.*</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success">Ativo</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle size={14} /> <span className="text-xs">Há 2 min (200 OK)</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-brand hover:underline">Configurar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Deliveries */}
        <div className="space-y-3">
          <h3 className="font-bold text-ink flex items-center gap-2">
            <RefreshCcw size={18} className="text-ink-subtle" /> Últimas Entregas
          </h3>
          <Card>
            <div className="space-y-4">
              {[
                { id: 'dlv_9b2c', event: 'payment.approved', url: 'https://api.meusite.com/...', status: 200, time: 'Há 5 min', color: 'success' },
                { id: 'dlv_4f5g', event: 'order.created', url: 'https://api.meusite.com/...', status: 200, time: 'Há 12 min', color: 'success' },
                { id: 'dlv_1h2j', event: 'payment.failed', url: 'https://api.meusite.com/...', status: 500, time: 'Há 1h', color: 'danger' },
              ].map((dlv) => (
                <div key={dlv.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-1.5 rounded bg-${dlv.color}-muted/20 text-${dlv.color}`}>
                      {dlv.status === 200 ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink">{dlv.event}</div>
                      <div className="text-xs text-ink-subtle font-mono truncate max-w-[200px]">{dlv.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-sm font-bold text-${dlv.color}`}>{dlv.status}</div>
                      <div className="text-xs text-ink-subtle">{dlv.time}</div>
                    </div>
                    <button className="px-2 py-1 text-[10px] uppercase font-bold border border-border rounded hover:bg-surface-raised">Reenviar</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
