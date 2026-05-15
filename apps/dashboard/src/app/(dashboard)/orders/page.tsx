import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Search, Filter, Download } from 'lucide-react';

export default function OrdersPage() {
  return (
    <PageLayout 
      title="Vendas"
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-ink rounded-md text-sm font-medium hover:bg-surface-raised transition-colors">
          <Download size={16} /> Exportar CSV
        </button>
      }
    >
      <div className="flex gap-4 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID, cliente ou email..." 
            className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-ink rounded-md text-sm font-medium hover:bg-surface-raised transition-colors">
          <Filter size={16} /> Filtros
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="border-b border-border bg-surface-raised text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'ORD_92b1c8', date: '15/05/2026 09:12', client: 'Vinicius Reinehr', amount: 'R$ 197,00', status: 'paid', statusLabel: 'Pago' },
                { id: 'ORD_5f3e1a', date: '15/05/2026 08:45', client: 'João Silva', amount: 'R$ 450,00', status: 'pending', statusLabel: 'Pendente' },
                { id: 'ORD_2a7d4c', date: '14/05/2026 23:30', client: 'Maria Oliveira', amount: 'R$ 97,00', status: 'failed', statusLabel: 'Falhou' },
              ].map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-ink-subtle">{order.id}</td>
                  <td className="px-4 py-3">{order.date}</td>
                  <td className="px-4 py-3 font-medium">{order.client}</td>
                  <td className="px-4 py-3">{order.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'paid' ? 'bg-success-muted text-success' :
                      order.status === 'pending' ? 'bg-warning-muted text-warning' :
                      'bg-danger-muted text-danger'
                    }`}>
                      {order.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-brand hover:underline">Ver detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageLayout>
  );
}
