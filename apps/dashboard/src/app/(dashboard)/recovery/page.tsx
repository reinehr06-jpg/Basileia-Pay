'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Plus, RefreshCw, TrendingUp, Mail, MessageCircle, BarChart2 } from 'lucide-react';

export default function RecoveryPage() {
  const [tab, setTab] = useState('campaigns');

  const campaigns = [
    { id: 'REC_8a9b', name: 'Abandono Geral', trigger: 'Abandono', channel: 'E-mail', status: 'active' },
    { id: 'REC_4f5g', name: 'Pix Expirado High Ticket', trigger: 'Pix Expirado', channel: 'WhatsApp', status: 'active' },
    { id: 'REC_1j2k', name: 'Falha no Cartão', trigger: 'Pagamento Falhou', channel: 'E-mail', status: 'inactive' },
  ];

  return (
    <PageLayout 
        title="Recovery Engine"
        action={<button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"><Plus size={16} /> Nova Campanha</button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-l-success">
            <div className="text-xs font-bold text-ink-subtle uppercase mb-1">Recuperados (30d)</div>
            <div className="text-2xl font-bold text-ink">124</div>
            <div className="text-[10px] text-success font-bold flex items-center gap-1"><RefreshCw size={10} /> +15% vs mês anterior</div>
        </Card>
        <Card className="p-6 border-l-4 border-l-success">
            <div className="text-xs font-bold text-ink-subtle uppercase mb-1">Receita Recuperada</div>
            <div className="text-2xl font-bold text-ink text-success">R$ 35.000</div>
            <div className="text-[10px] text-success font-bold flex items-center gap-1"><TrendingUp size={10} /> ROI: 12x</div>
        </Card>
        <Card className="p-6">
            <div className="text-xs font-bold text-ink-subtle uppercase mb-1">Taxa de Recuperação</div>
            <div className="text-2xl font-bold text-ink">18.5%</div>
            <div className="text-[10px] text-ink-muted">Média do setor: 12%</div>
        </Card>
        <Card className="p-6">
            <div className="text-xs font-bold text-ink-subtle uppercase mb-1">Abertura (E-mail)</div>
            <div className="text-2xl font-bold text-ink">42.1%</div>
            <div className="text-[10px] text-brand font-bold">Acima da média</div>
        </Card>
      </div>

      <div className="flex gap-4 border-b border-border mb-6">
        <button onClick={() => setTab('campaigns')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${tab === 'campaigns' ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'}`}>Campanhas</button>
        <button onClick={() => setTab('attempts')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${tab === 'attempts' ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'}`}>Tentativas</button>
      </div>

      {tab === 'campaigns' ? (
        <Card>
            <table className="w-full text-left text-sm">
                <thead className="bg-surface-raised border-b border-border text-ink-muted">
                    <tr>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Nome</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Gatilho</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Canal</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Status</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {campaigns.map(camp => (
                        <tr key={camp.id} className="hover:bg-surface-raised/50 transition-colors">
                            <td className="px-4 py-4 font-bold">{camp.name}</td>
                            <td className="px-4 py-4 text-ink-muted">{camp.trigger}</td>
                            <td className="px-4 py-4 flex items-center gap-2">
                                {camp.channel === 'E-mail' ? <Mail size={14} className="text-brand" /> : <MessageCircle size={14} className="text-success" />}
                                {camp.channel}
                            </td>
                            <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${camp.status === 'active' ? 'bg-success/10 text-success' : 'bg-surface-raised text-ink-subtle'}`}>
                                    {camp.status === 'active' ? 'Ativa' : 'Inativa'}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-brand font-medium hover:underline cursor-pointer">Editar</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
      ) : (
        <div className="p-12 text-center bg-surface border border-border rounded-xl border-dashed">
            <BarChart2 size={48} className="mx-auto mb-4 text-ink-subtle opacity-20" />
            <p className="text-ink-muted italic">Lista de tentativas detalhada em processamento...</p>
        </div>
      )}
    </PageLayout>
  );
}
