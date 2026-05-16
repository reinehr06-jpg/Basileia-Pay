'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Plus, Users, Scissors, Info, ArrowRight } from 'lucide-react';

export default function SplitPage() {
  const recipients = [
    { name: 'Produtor Principal', type: 'Percentual', value: '70%', color: 'bg-brand' },
    { name: 'Coprodutor (Marketing)', type: 'Percentual', value: '20%', color: 'bg-success' },
    { name: 'Taxa Basileia Pay', type: 'Percentual', value: '10%', color: 'bg-ink-subtle' },
  ];

  return (
    <PageLayout 
        title="Split de Receita"
        action={<button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium"><Plus size={16} /> Nova Regra</button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
            <Card title="Distribuição Visual (Exemplo)">
                <div className="p-4">
                    <div className="h-8 w-full flex rounded-lg overflow-hidden mb-6 shadow-inner border border-border">
                        {recipients.map(r => (
                            <div key={r.name} className={`${r.color} h-full flex items-center justify-center text-[10px] font-bold text-white`} style={{ width: r.value }}>
                                {r.value}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {recipients.map(r => (
                            <div key={r.name} className="flex justify-between items-center p-3 bg-surface-raised rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${r.color}`}></div>
                                    <span className="text-sm font-bold text-ink">{r.name}</span>
                                </div>
                                <div className="text-sm font-black text-ink">{r.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <Card title="Regras Ativas">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface-raised border-b border-border text-ink-muted">
                        <tr>
                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Nome da Regra</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Gatilho</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Recebedores</th>
                            <th className="px-4 py-3 font-bold uppercase text-[10px]">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {[
                            { name: 'Split Lançamento Jan', trigger: 'Sessão: Lançamento', count: 3 },
                            { name: 'Parceria Fixa', trigger: 'Geral', count: 2 },
                        ].map(rule => (
                            <tr key={rule.name} className="hover:bg-surface-raised/50 transition-colors">
                                <td className="px-4 py-4 font-bold">{rule.name}</td>
                                <td className="px-4 py-4 text-ink-muted">{rule.trigger}</td>
                                <td className="px-4 py-4">{rule.count} destinatários</td>
                                <td className="px-4 py-4 text-brand font-medium hover:underline cursor-pointer">Configurar</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <Card className="bg-ink text-white border-none shadow-xl">
                <div className="p-2">
                    <Users size={24} className="mb-4 text-brand" />
                    <h3 className="text-lg font-bold mb-2">Split Inteligente</h3>
                    <p className="text-xs text-white/70 leading-relaxed mb-6">
                        Divida sua receita automaticamente entre sócios, parceiros e afiliados no momento da venda. Sem necessidade de saques manuais.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/90">
                            <Scissors size={14} className="text-brand" />
                            LIQUIDAÇÃO IMEDIATA
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/90">
                            <Info size={14} className="text-brand" />
                            AUDITORIA COMPLETA
                        </div>
                    </div>
                </div>
            </Card>

            <div className="p-6 border border-border rounded-xl bg-surface">
                <h4 className="text-sm font-bold text-ink mb-4">Simulação de Venda</h4>
                <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                        <span className="text-ink-muted">Valor da Venda</span>
                        <span className="font-bold">R$ 1.000,00</span>
                    </div>
                    <div className="border-t border-border pt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-ink-muted">Produtor (70%)</span>
                            <span className="font-bold text-success">R$ 700,00</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-ink-muted">Coprodutor (20%)</span>
                            <span className="font-bold text-success">R$ 200,00</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-ink-muted">Taxa Basileia (10%)</span>
                            <span className="font-bold text-danger">R$ 100,00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </PageLayout>
  );
}
