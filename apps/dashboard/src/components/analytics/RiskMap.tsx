'use client';

import { Card } from '@/components/ui/Card';
import { MapPin, AlertOctagon, TrendingUp, ShieldAlert } from 'lucide-react';

export function RiskMap() {
  const states = [
    { name: 'São Paulo', risk: 'Baixo', sessions: 5240, conv: '35.2%', refusal: '4.2%', color: 'bg-success' },
    { name: 'Rio de Janeiro', risk: 'Médio', sessions: 2150, conv: '24.1%', refusal: '12.5%', color: 'bg-warning' },
    { name: 'Paraná', risk: 'Crítico', sessions: 840, conv: '12.8%', refusal: '42.1%', color: 'bg-danger' },
    { name: 'Minas Gerais', risk: 'Baixo', sessions: 1920, conv: '31.5%', refusal: '6.8%', color: 'bg-success' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <MapPin size={48} className="text-brand mx-auto mb-4 opacity-20" />
                <p className="text-ink-muted font-medium italic">Mapa Geográfico Interativo em desenvolvimento...</p>
                <div className="mt-8 flex gap-4 justify-center">
                    <div className="flex items-center gap-2 text-xs font-bold text-ink-subtle uppercase"><span className="w-3 h-3 bg-success rounded-full"></span> Baixo</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-ink-subtle uppercase"><span className="w-3 h-3 bg-warning rounded-full"></span> Médio</div>
                    <div className="flex items-center gap-2 text-xs font-bold text-ink-subtle uppercase"><span className="w-3 h-3 bg-danger rounded-full"></span> Alto</div>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <h3 className="text-sm font-bold text-ink uppercase tracking-widest">Alertas de Risco</h3>
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4">
                <div className="flex gap-3 mb-2">
                    <AlertOctagon size={18} className="text-danger shrink-0" />
                    <h4 className="text-sm font-bold text-danger uppercase">Anomalia Crítica: PR</h4>
                </div>
                <p className="text-xs text-danger/80 leading-relaxed mb-3">
                    Taxa de recusa 3x maior que a média nacional no estado do Paraná nas últimas 2 horas. Possível ataque de força bruta ou instabilidade no gateway local.
                </p>
                <button className="text-[10px] font-bold text-danger underline uppercase">Ativar Filtro de Risco</button>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex gap-3 mb-2">
                    <ShieldAlert size={18} className="text-warning shrink-0" />
                    <h4 className="text-sm font-bold text-warning uppercase">Atenção: RJ</h4>
                </div>
                <p className="text-xs text-warning/80 leading-relaxed">
                    Aumento de 15% em tentativas suspeitas originadas no Rio de Janeiro. Monitoramento reforçado ativado.
                </p>
            </div>
        </div>
      </div>

      <Card title="Desempenho por Estado">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-surface-raised border-b border-border text-ink-muted">
                    <tr>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Estado</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Risco</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Sessões</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Conversão</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Taxa Recusa</th>
                        <th className="px-4 py-3 font-bold uppercase text-[10px]">Indicador</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {states.map(state => (
                        <tr key={state.name} className="hover:bg-surface-raised/50 transition-colors">
                            <td className="px-4 py-4 font-bold">{state.name}</td>
                            <td className="px-4 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    state.risk === 'Baixo' ? 'bg-success/10 text-success' : 
                                    state.risk === 'Médio' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                                }`}>{state.risk}</span>
                            </td>
                            <td className="px-4 py-4 text-ink-muted">{state.sessions}</td>
                            <td className="px-4 py-4 text-ink font-medium">{state.conv}</td>
                            <td className="px-4 py-4 text-danger font-medium">{state.refusal}</td>
                            <td className="px-4 py-4">
                                <div className="h-1.5 w-24 bg-border rounded-full overflow-hidden">
                                    <div className={`h-full ${state.color}`} style={{ width: state.conv }}></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
}
