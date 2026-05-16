'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Search, Filter, Download, Package, Loader2, AlertCircle } from 'lucide-react';
import { useOrders } from '@/hooks/api/useOrders';

export default function OrdersPage() {
  const { orders, loading, error, refetch } = useOrders();

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
            placeholder="Buscar por ID externo ou sistema..." 
            className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-ink rounded-md text-sm font-medium hover:bg-surface-raised transition-colors">
          <Filter size={16} /> Filtros
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand" size={32} />
              <p className="text-ink-subtle text-sm">Carregando vendas...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <AlertCircle className="text-danger" size={32} />
              <div>
                <p className="text-ink font-medium">Erro ao carregar vendas</p>
                <p className="text-ink-subtle text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={() => refetch()}
                className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mb-2">
                <Package className="text-ink-subtle" size={24} />
              </div>
              <div>
                <p className="text-ink font-medium">Nenhuma venda encontrada</p>
                <p className="text-ink-subtle text-sm mt-1">
                  As ordens de venda criadas pelos seus sistemas aparecerão aqui.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-ink">
              <thead className="border-b border-border bg-surface-raised text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Order UUID / ID Externo</th>
                  <th className="px-4 py-3 font-medium">Sistema</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-ink-subtle text-xs">{order.uuid}</div>
                      {order.external_order_id && (
                        <div className="text-xs text-brand font-medium mt-0.5">Ref: {order.external_order_id}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{order.system_name}</td>
                    <td className="px-4 py-3">
                      {(order.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: order.currency })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'paid' ? 'bg-success-muted text-success' :
                        order.status === 'pending' ? 'bg-warning-muted text-warning' :
                        'bg-surface-raised text-ink-muted'
                      }`}>
                        {order.status_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-subtle">{order.created_at}</td>
                    <td className="px-4 py-3">
                      <button className="text-brand hover:underline">Ver detalhes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </PageLayout>
  );
}
