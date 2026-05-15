import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Search, Filter, Download, CreditCard, Banknote, QrCode } from 'lucide-react';

export default function PaymentsPage() {
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
              {[
                { id: 'PAY_1a2b3c', method: 'PIX', icon: <QrCode size={14} />, gateway: 'Asaas', amount: 'R$ 197,00', status: 'approved', statusLabel: 'Aprovado', date: '15/05/2026 09:12' },
                { id: 'PAY_4d5e6f', method: 'Cartão', icon: <CreditCard size={14} />, gateway: 'Stripe', amount: 'R$ 450,00', status: 'pending', statusLabel: 'Pendente', date: '15/05/2026 08:45' },
                { id: 'PAY_7g8h9i', method: 'Boleto', icon: <Banknote size={14} />, gateway: 'Asaas', amount: 'R$ 97,00', status: 'failed', statusLabel: 'Falhou', date: '14/05/2026 23:30' },
              ].map((payment) => (
                <tr key={payment.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-ink-subtle">{payment.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-ink-subtle">{payment.icon}</span>
                      <span>{payment.method}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{payment.gateway}</td>
                  <td className="px-4 py-3 font-medium">{payment.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'approved' ? 'bg-success-muted text-success' :
                      payment.status === 'pending' ? 'bg-warning-muted text-warning' :
                      'bg-danger-muted text-danger'
                    }`}>
                      {payment.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-subtle">{payment.date}</td>
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
