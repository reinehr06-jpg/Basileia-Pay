import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Plus, RefreshCcw, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SubscriptionsPage() {
  const subscriptions = [
    { id: 'SUB_8a9b2c', name: 'Plano Church Pro', customer: 'João Silva', amount: 'R$ 299,00', interval: 'Mensal', status: 'active', statusLabel: 'Ativa' },
    { id: 'SUB_4f5g6h', name: 'Mentoria Ministerial', customer: 'Maria Oliveira', amount: 'R$ 150,00', interval: 'Mensal', status: 'pending_mandate', statusLabel: 'Aguardando' },
    { id: 'SUB_1j2k3l', name: 'Doação Recorrente', customer: 'Pedro Santos', amount: 'R$ 50,00', interval: 'Mensal', status: 'failed', statusLabel: 'Falhou' },
  ];

  return (
    <PageLayout
      title="Pix Automático"
      action={<button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"><Plus size={16} /> Nova Assinatura</button>}
    >
      <div className="flex gap-4 border-b border-border mb-6">
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-brand text-brand">Ativas</button>
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-ink-muted hover:text-ink">Inadimplentes</button>
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-ink-muted hover:text-ink">Aguardando Mandato</button>
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-ink-muted hover:text-ink">Canceladas</button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="bg-surface-raised border-b border-border text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Nome / Plano</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Recorrência</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <tr key={sub.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{sub.id}</td>
                  <td className="px-4 py-3 font-medium">{sub.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{sub.customer}</td>
                  <td className="px-4 py-3 font-bold">{sub.amount}</td>
                  <td className="px-4 py-3 text-ink-subtle">{sub.interval}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === 'active' ? 'bg-success-muted text-success' :
                        sub.status === 'pending_mandate' ? 'bg-warning-muted text-warning' :
                        'bg-danger-muted text-danger'
                    }`}>
                        {sub.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/subscriptions/${sub.id}`} className="text-brand hover:underline">Ver detalhes</a>
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
