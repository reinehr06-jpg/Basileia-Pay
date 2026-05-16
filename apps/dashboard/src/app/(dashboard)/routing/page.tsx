'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { useRouting, SimulationResult } from '@/hooks/api/useRouting';
import { Shuffle, Loader2, Play, ArrowRight, Shield, Zap, Clock } from 'lucide-react';

function MethodBadge({ method }: { method: string }) {
  const cfg: Record<string, { bg: string; label: string }> = {
    pix: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'PIX' },
    card: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Cartão' },
    boleto: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Boleto' },
  };
  const c = cfg[method] || { bg: 'bg-gray-100 text-gray-700', label: method };
  return <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${c.bg}`}>{c.label}</span>;
}

function DecisionBadge({ decision }: { decision: string }) {
  const colors: Record<string, string> = {
    primary: 'bg-success-muted text-success',
    fallback_activated: 'bg-warning-muted text-warning',
    blocked: 'bg-danger-muted text-danger',
  };
  const labels: Record<string, string> = {
    primary: 'Principal',
    fallback_activated: 'Fallback ativado',
    blocked: 'Bloqueado',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[decision] || 'bg-gray-100 text-gray-600'}`}>
      {labels[decision] || decision}
    </span>
  );
}

export default function RoutingPage() {
  const { data, loading, simulate } = useRouting();
  const [simMethod, setSimMethod] = useState('pix');
  const [simAmount, setSimAmount] = useState('4970');
  const [simEnv, setSimEnv] = useState('production');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const runSimulation = async () => {
    setSimLoading(true);
    const result = await simulate({ method: simMethod, amount: parseInt(simAmount), environment: simEnv });
    setSimResult(result);
    setSimLoading(false);
  };

  if (loading) {
    return <PageLayout title="Roteamento"><div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={32} /></div></PageLayout>;
  }

  return (
    <PageLayout title="Roteamento Inteligente">
      {/* Routing Map */}
      <Card title="Configuração de Roteamento por Método">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.routing && Object.entries(data.routing).map(([method, r]: [string, any]) => (
            <div key={method} className="p-4 rounded-lg border border-border bg-background">
              <div className="flex items-center justify-between mb-3">
                <MethodBadge method={method} />
                <DecisionBadge decision={r.decision} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Principal</span>
                  <span className="font-medium text-ink">{r.primary || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Fallback</span>
                  <span className="font-medium text-ink">{r.fallback || '—'}</span>
                </div>
                {r.approval_rate !== null && (
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Aprovação</span>
                    <span className={`font-bold ${r.approval_rate >= 70 ? 'text-success' : r.approval_rate >= 50 ? 'text-warning' : 'text-danger'}`}>
                      {r.approval_rate}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink-muted">Estratégia</span>
                  <span className="text-xs text-ink-subtle capitalize">{r.strategy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Method */}
      {data?.recommended && (
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-brand-muted"><Zap size={24} className="text-brand" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-ink">Método Recomendado: <span className="text-brand uppercase">{data.recommended.recommended_payment_method}</span></h3>
              <p className="text-sm text-ink-muted mt-1">{data.recommended.reason}</p>
              <span className="text-xs text-ink-subtle">Fonte: {data.recommended.source}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Simulator */}
      <Card title="Simulador de Roteamento">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-ink-muted block mb-1">Método</label>
            <select value={simMethod} onChange={e => setSimMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-ink text-sm">
              <option value="pix">PIX</option>
              <option value="card">Cartão</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Valor (centavos)</label>
            <input type="number" value={simAmount} onChange={e => setSimAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-ink text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink-muted block mb-1">Ambiente</label>
            <select value={simEnv} onChange={e => setSimEnv(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-ink text-sm">
              <option value="production">Produção</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={runSimulation} disabled={simLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-brand text-white font-medium text-sm hover:bg-brand/90 transition-colors disabled:opacity-50">
              {simLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Simular
            </button>
          </div>
        </div>

        {simResult && (
          <div className="p-4 rounded-lg border border-brand/20 bg-brand-muted/20 mt-4">
            <h4 className="font-semibold text-ink mb-3 flex items-center gap-2">
              <ArrowRight size={16} className="text-brand" /> Resultado da Simulação
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-muted">Método</span><span className="font-medium">{simResult.simulation.method}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Valor</span><span className="font-medium">{simResult.simulation.amount_formatted}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Gateway escolhido</span><span className="font-bold text-brand">{simResult.routing.chosen_gateway || '—'}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Fallback</span><span className="font-medium">{simResult.routing.fallback || '—'}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Decisão</span><DecisionBadge decision={simResult.routing.decision} /></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-muted">Trust Score</span>
                  <span className={`font-bold ${simResult.trust.score >= 70 ? 'text-success' : simResult.trust.score >= 40 ? 'text-warning' : 'text-danger'}`}>{simResult.trust.score}</span>
                </div>
                <div className="flex justify-between"><span className="text-ink-muted">Status</span><span className="capitalize">{simResult.trust.status}</span></div>
                {simResult.routing.approval_rate !== null && (
                  <div className="flex justify-between"><span className="text-ink-muted">Aprovação</span><span className="font-medium">{simResult.routing.approval_rate}%</span></div>
                )}
              </div>
            </div>
            <div className="mt-3 p-3 rounded-md bg-surface border border-border">
              <p className="text-sm text-ink-muted"><strong>Motivo:</strong> {simResult.routing.reason}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Decisions */}
      {data?.recent_decisions && data.recent_decisions.length > 0 && (
        <Card title="Últimas Decisões de Roteamento">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-ink-muted font-medium">Método</th>
                  <th className="text-left py-2 text-ink-muted font-medium">Gateway</th>
                  <th className="text-left py-2 text-ink-muted font-medium">Decisão</th>
                  <th className="text-left py-2 text-ink-muted font-medium">Aprovação</th>
                  <th className="text-left py-2 text-ink-muted font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_decisions.slice(0, 10).map((d: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2"><MethodBadge method={d.method} /></td>
                    <td className="py-2 text-ink">{d.chosen_gateway_id || '—'}</td>
                    <td className="py-2"><DecisionBadge decision={d.decision} /></td>
                    <td className="py-2 text-ink">{d.approval_rate !== null ? `${d.approval_rate}%` : '—'}</td>
                    <td className="py-2 text-ink-subtle text-xs">{new Date(d.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
