'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Globe, DollarSign, ArrowRightLeft, ShieldCheck, TrendingUp } from 'lucide-react';

export default function FxSettingsPage() {
  const rates = [
    { pair: 'BRL / USD', rate: '0.1842', change: '+0.2%', status: 'success' },
    { pair: 'BRL / EUR', rate: '0.1695', change: '-0.1%', status: 'danger' },
    { pair: 'BRL / ARS', rate: '145.42', change: '+2.4%', status: 'success' },
    { pair: 'BRL / GBP', rate: '0.1421', change: '0.0%', status: 'muted' },
  ];

  return (
    <PageLayout title="FX & Multimoeda">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card title="Câmbio ao Vivo (AwesomeAPI)">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2">
                    {rates.map(r => (
                        <div key={r.pair} className="p-4 bg-surface-raised rounded-xl border border-border">
                            <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">{r.pair}</div>
                            <div className="text-lg font-black text-ink">{r.rate}</div>
                            <div className={`text-[10px] font-bold ${r.status === 'success' ? 'text-success' : r.status === 'danger' ? 'text-danger' : 'text-ink-subtle'}`}>
                                {r.change}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Configuração por Checkout">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface-raised border-b border-border text-ink-muted">
                        <tr>
                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Checkout</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Moedas Ativas</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Markup</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {[
                            { name: 'Mentoria Premium', currencies: ['USD', 'EUR'], markup: '2.5%', status: 'Ativo' },
                            { name: 'SaaS Anual', currencies: ['USD'], markup: '1.0%', status: 'Ativo' },
                            { name: 'Evento Presencial', currencies: ['-'], markup: '0.0%', status: 'Inativo' },
                        ].map(c => (
                            <tr key={c.name} className="hover:bg-surface-raised/50 transition-colors">
                                <td className="px-4 py-4 font-bold">{c.name}</td>
                                <td className="px-4 py-4">
                                    <div className="flex gap-1">
                                        {c.currencies.map(curr => (
                                            <span key={curr} className="px-1.5 py-0.5 bg-surface-raised rounded text-[10px] font-bold border border-border">{curr}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-brand font-bold">{c.markup}</td>
                                <td className="px-4 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === 'Ativo' ? 'bg-success/10 text-success' : 'bg-surface-raised text-ink-subtle'}`}>
                                        {c.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>

        <div className="space-y-6">
            <Card title="Segurança cambial">
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <ShieldCheck size={20} className="text-brand shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-ink uppercase">Rate Locking</h4>
                            <p className="text-[11px] text-ink-muted leading-relaxed">A taxa é travada no momento do checkout e garantida pela Basileia por até 30 minutos.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <ArrowRightLeft size={20} className="text-brand shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-ink uppercase">Liquidação em BRL</h4>
                            <p className="text-[11px] text-ink-muted leading-relaxed">Você recebe sempre em Real (BRL), independente da moeda de pagamento do cliente.</p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="p-6 bg-gradient-to-br from-brand to-brand-deep rounded-xl text-white">
                <Globe size={32} className="mb-4 opacity-50" />
                <h3 className="text-lg font-bold mb-2">Venda Global</h3>
                <p className="text-sm opacity-80 mb-6">Habilite multimoedas para aumentar sua conversão em até 25% com clientes internacionais.</p>
                <button className="w-full py-2 bg-white text-brand font-bold rounded text-sm hover:bg-opacity-90 transition-all">Ver Documentação</button>
            </div>
        </div>
      </div>
    </PageLayout>
  );
}
