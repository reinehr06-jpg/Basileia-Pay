'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Search, Filter, Download, CreditCard, Banknote, QrCode, Loader2, AlertCircle } from 'lucide-react';
import { usePayments } from '@/hooks/api/usePayments';

export default function PaymentsPage() {
  const { payments, loading, error, requestId, refetch } = usePayments();

  return (
    <PageLayout 
      title="Pagamentos"
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
            placeholder="Buscar por ID, gateway ou cliente..." 
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
              <p className="text-ink-subtle text-sm">Carregando pagamentos...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <AlertCircle className="text-danger" size={32} />
              <div>
                <p className="text-ink font-medium">Não foi possível carregar os pagamentos</p>
                <p className="text-ink-subtle text-sm mt-1">{error}</p>
                {requestId && (
                  <p className="text-xs text-ink-muted mt-4 font-mono">Request ID: {requestId}</p>
                )}
              </div>
              <button 
                onClick={refetch}
                className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-raised transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mb-2">
                <CreditCard className="text-ink-subtle" size={24} />
              </div>
              <div>
                <p className="text-ink font-medium">Nenhum pagamento encontrado</p>
                <p className="text-ink-subtle text-sm mt-1">
                  Quando suas vendas começarem, elas aparecerão aqui.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-ink">
              <thead className="border-b border-border bg-surface-raised text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Payment ID</th>
                  <th className="px-4 py-3 font-medium">Método</th>
                  <th className="px-4 py-3 font-medium">Gateway</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-ink-subtle">{payment.uuid.split('-')[0]}...</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-ink-subtle">
                          {payment.method === 'pix' ? <QrCode size={14} /> : 
                           payment.method === 'boleto' ? <Banknote size={14} /> : 
                           <CreditCard size={14} />}
                        </span>
                        <span className="capitalize">{payment.method}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{payment.gateway}</td>
                    <td className="px-4 py-3 font-medium">
                      {(payment.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'approved' || payment.status === 'paid' ? 'bg-success-muted text-success' :
                        payment.status === 'pending' ? 'bg-warning-muted text-warning' :
                        'bg-danger-muted text-danger'
                      }`}>
                        {payment.status_label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-subtle">{payment.created_at}</td>
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
