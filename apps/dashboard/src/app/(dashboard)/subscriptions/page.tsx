'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Plus, Repeat, Users, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';

export default function SubscriptionsPage() {
  const stats = [
    { label: 'Assinantes Ativos', value: '1,240', change: '+12%', color: 'text-success' },
    { label: 'MRR (Mensal)', value: 'R$ 84.500', change: '+8%', color: 'text-success' },
    { label: 'Churn Rate', value: '2.4%', change: '-0.5%', color: 'text-success' },
    { label: 'Inadimplência', value: '4.1%', change: '+1.2%', color: 'text-danger' },
  ];

  const subscriptions = [
    { id: '1', customer: 'João Silva', plan: 'Plano Pro Mensal', status: 'Ativo', next_billing: '15/06/2026', amount: 'R$ 99,00' },
    { id: '2', customer: 'Maria Oliveira', plan: 'Mentoria Gold', status: 'Past Due', next_billing: '12/06/2026', amount: 'R$ 497,00' },
    { id: '3', customer: 'Pedro Santos', plan: 'Plano Pro Mensal', status: 'Cancelado', next_billing: '-', amount: 'R$ 99,00' },
  ];

  return (
    <PageLayout 
        title="Pix Automático — Assinaturas"
        action={<button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium"><Plus size={16} /> Nova Assinatura</button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(s => (
            <Card key={s.label} className="p-4">
                <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">{s.label}</div>
                <div className="text-2xl font-black text-ink">{s.value}</div>
                <div className={`text-[10px] font-bold ${s.color}`}>{s.change} vs mês ant.</div>
            </Card>
        ))}
      </div>

      <Card title="Gestão de Assinantes">
        <table className="w-full text-left text-sm">
            <thead className="bg-surface-raised border-b border-border text-ink-muted">
                <tr>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Cliente</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Plano</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Próx. Cobrança</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Valor</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Status</th>
                    <th className="px-4 py-3 font-bold uppercase text-[10px]">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-surface-raised/50 transition-colors">
                        <td className="px-4 py-4 font-bold">{sub.customer}</td>
                        <td className="px-4 py-4 text-ink-muted">{sub.plan}</td>
                        <td className="px-4 py-4">{sub.next_billing}</td>
                        <td className="px-4 py-4 font-bold">{sub.amount}</td>
                        <td className="px-4 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                sub.status === 'Ativo' ? 'bg-success/10 text-success' : 
                                sub.status === 'Past Due' ? 'bg-danger/10 text-danger' : 
                                'bg-surface-raised text-ink-subtle'
                            }`}>
                                {sub.status}
                            </span>
                        </td>
                        <td className="px-4 py-4 text-brand font-medium hover:underline cursor-pointer">Gerenciar</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>
    </PageLayout>
  );
}
