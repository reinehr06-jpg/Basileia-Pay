'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { useTrustLayer } from '@/hooks/api/useTrustLayer';
import { Loader2, Shield, ShieldCheck, ShieldAlert, ShieldX, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

function ScoreGauge({ score, size = 'lg' }: { score: number; size?: 'sm' | 'lg' }) {
  const color = score >= 90 ? '#16A34A' : score >= 70 ? '#F59E0B' : score >= 40 ? '#EA580C' : '#DC2626';
  const radius = size === 'lg' ? 80 : 40;
  const stroke = size === 'lg' ? 10 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dim = (radius + stroke) * 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-border" />
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${size === 'lg' ? 'text-4xl' : 'text-xl'} font-bold`} style={{ color }}>{score}</span>
        <span className={`${size === 'lg' ? 'text-sm' : 'text-xs'} text-ink-muted`}>Trust Score</span>
      </div>
    </div>
  );
}

function StatusLabel({ status }: { status: string }) {
  const cfg: Record<string, { icon: any; color: string; label: string }> = {
    excellent: { icon: ShieldCheck, color: 'text-success', label: 'Excelente' },
    healthy:   { icon: Shield, color: 'text-blue-500', label: 'Saudável' },
    at_risk:   { icon: ShieldAlert, color: 'text-warning', label: 'Em risco' },
    critical:  { icon: ShieldX, color: 'text-danger', label: 'Crítico' },
  };
  const c = cfg[status] || cfg.healthy;
  const Icon = c.icon;
  return (
    <div className={`flex items-center gap-2 ${c.color}`}>
      <Icon size={20} />
      <span className="font-semibold">{c.label}</span>
    </div>
  );
}

function SignalCard({ signal }: { signal: { type: string; severity: string; message: string; value: string } }) {
  const sevColors: Record<string, string> = {
    critical: 'border-l-danger bg-danger-muted/20',
    high: 'border-l-warning bg-warning-muted/20',
    medium: 'border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/10',
    low: 'border-l-blue-400 bg-blue-50 dark:bg-blue-900/10',
  };
  const sevIcons: Record<string, any> = { critical: ShieldX, high: AlertTriangle, medium: Info, low: CheckCircle2 };
  const Icon = sevIcons[signal.severity] || Info;

  return (
    <div className={`border-l-4 rounded-r-lg p-3 ${sevColors[signal.severity] || 'border-l-gray-300 bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        <Icon size={16} className="mt-0.5 shrink-0 text-ink-muted" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink">{signal.message}</p>
          <p className="text-xs text-ink-subtle mt-0.5">{signal.value}</p>
        </div>
      </div>
    </div>
  );
}

export default function TrustLayerPage() {
  const { data, loading } = useTrustLayer();

  if (loading) {
    return <PageLayout title="Trust Layer"><div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={32} /></div></PageLayout>;
  }

  if (!data) {
    return <PageLayout title="Trust Layer"><Card><p className="text-ink-subtle text-center py-10">Não foi possível carregar os dados do Trust Layer.</p></Card></PageLayout>;
  }

  return (
    <PageLayout title="Trust Layer — Inteligência Operacional">
      {/* Main Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center py-4">
            <ScoreGauge score={data.score} />
            <div className="mt-4"><StatusLabel status={data.status} /></div>
            <p className="text-sm text-ink-muted text-center mt-3 max-w-xs">{data.recommended_action}</p>
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Sinais Detectados">
          {data.signals.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <ShieldCheck size={48} className="text-success/30 mb-3" />
              <p className="text-ink-muted">Nenhum sinal de risco detectado.</p>
              <p className="text-xs text-ink-subtle mt-1">A operação está saudável.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.signals.map((signal, i) => (
                <SignalCard key={i} signal={signal} />
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Explanation */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-brand-muted shrink-0"><Shield size={24} className="text-brand" /></div>
          <div>
            <h3 className="font-semibold text-ink mb-1">O que o Trust Layer avalia?</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              O Trust Layer analisa continuamente a saúde da sua operação: gateways ativos, taxa de aprovação, 
              webhooks funcionando, alertas de segurança e configuração dos checkouts. Cada sinal impacta o score 
              operacional e pode influenciar decisões de roteamento e publicação de checkouts.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { range: '90–100', label: 'Excelente', color: 'text-success' },
                { range: '70–89', label: 'Saudável', color: 'text-blue-500' },
                { range: '40–69', label: 'Em risco', color: 'text-warning' },
                { range: '0–39', label: 'Crítico', color: 'text-danger' },
              ].map(item => (
                <div key={item.range} className="text-center p-2 rounded border border-border">
                  <div className={`text-lg font-bold ${item.color}`}>{item.range}</div>
                  <div className="text-xs text-ink-muted">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Alerts */}
      {data.alerts && data.alerts.length > 0 && (
        <Card title="Alertas Ativos que Impactam o Score">
          <div className="space-y-3">
            {data.alerts.map((alert: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
                <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-danger' : 'text-warning'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-ink">{alert.title}</h4>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${alert.severity === 'critical' ? 'bg-danger-muted text-danger' : 'bg-warning-muted text-warning'}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{alert.message}</p>
                  {alert.recommended_action && (
                    <p className="text-xs text-brand mt-1 flex items-center gap-1"><ArrowRight size={10} /> {alert.recommended_action}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Decisions */}
      {data.recent_decisions && data.recent_decisions.length > 0 && (
        <Card title="Últimas Decisões do Trust Layer">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left py-2 text-ink-muted font-medium">Entidade</th>
                <th className="text-left py-2 text-ink-muted font-medium">Decisão</th>
                <th className="text-left py-2 text-ink-muted font-medium">Score</th>
                <th className="text-left py-2 text-ink-muted font-medium">Motivo</th>
                <th className="text-left py-2 text-ink-muted font-medium">Data</th>
              </tr></thead>
              <tbody>
                {data.recent_decisions.map((d: any, i: number) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 text-ink">{d.entity_type}</td>
                    <td className="py-2"><span className={`text-xs px-2 py-0.5 rounded font-medium ${d.decision === 'allow' ? 'bg-success-muted text-success' : d.decision === 'warn' ? 'bg-warning-muted text-warning' : 'bg-danger-muted text-danger'}`}>{d.decision}</span></td>
                    <td className="py-2 font-bold text-ink">{d.score}</td>
                    <td className="py-2 text-ink-muted text-xs max-w-xs truncate">{d.reason}</td>
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
