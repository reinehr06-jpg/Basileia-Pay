'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { useMonitoring } from '@/hooks/api/useMonitoring';
import { Activity, Webhook, CreditCard, ShoppingBag, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

function HealthBadge({ rate, label }: { rate: number | null; label: string }) {
  if (rate === null) return <span className="text-xs text-ink-subtle">Sem dados</span>;
  const color = rate >= 90 ? 'text-success' : rate >= 70 ? 'text-warning' : 'text-danger';
  const bg = rate >= 90 ? 'bg-success-muted' : rate >= 70 ? 'bg-warning-muted' : 'bg-danger-muted';
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${color} ${bg}`}>
      {rate >= 90 ? <CheckCircle2 size={12} /> : rate >= 70 ? <AlertTriangle size={12} /> : <XCircle size={12} />}
      {rate.toFixed(1)}% {label}
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: any }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface">
      <div className="p-2 rounded-md bg-brand-muted text-brand"><Icon size={18} /></div>
      <div>
        <div className="text-lg font-bold text-ink">{value}</div>
        <div className="text-xs text-ink-muted">{label}</div>
        {sub && <div className="text-xs text-ink-subtle">{sub}</div>}
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const { webhooks, gateways, checkouts, loading } = useMonitoring();

  if (loading) {
    return <PageLayout title="Monitoramento"><div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={32} /></div></PageLayout>;
  }

  return (
    <PageLayout title="Monitoramento Operacional">
      {/* Gateway Health */}
      <Card title="Saúde dos Gateways">
        {gateways.length === 0 ? (
          <p className="text-ink-subtle text-sm py-6 text-center">Nenhum gateway configurado.</p>
        ) : (
          <div className="space-y-4">
            {gateways.map(gw => (
              <div key={gw.gateway_id} className="p-4 rounded-lg border border-border bg-background">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CreditCard size={20} className="text-brand" />
                    <div>
                      <h4 className="font-semibold text-ink">{gw.name}</h4>
                      <span className="text-xs text-ink-subtle">{gw.provider} · {gw.environment}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${gw.status === 'active' ? 'bg-success-muted text-success' : 'bg-danger-muted text-danger'}`}>
                    {gw.status === 'active' ? 'Ativo' : gw.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <HealthBadge rate={gw.health.approval_rate} label="aprovação" />
                  <HealthBadge rate={gw.health.failure_rate !== null ? (100 - gw.health.failure_rate) : null} label="sucesso" />
                  {gw.health.timeout_count > 0 && (
                    <span className="text-xs text-warning bg-warning-muted px-2 py-1 rounded-md font-medium">
                      {gw.health.timeout_count} timeouts
                    </span>
                  )}
                  <span className="text-xs text-ink-subtle px-2 py-1">{gw.health.total_transactions} transações</span>
                </div>
                {gw.health.methods && Object.keys(gw.health.methods).length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {Object.entries(gw.health.methods).map(([method, data]: [string, any]) => (
                      <div key={method} className="text-center p-2 rounded border border-border">
                        <div className="text-xs font-medium text-ink uppercase">{method}</div>
                        <div className="text-sm font-bold text-ink">{data.approval_rate?.toFixed(0) ?? '—'}%</div>
                        <div className="text-xs text-ink-subtle">{data.total} tx</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Webhook Health */}
      <Card title="Saúde dos Webhooks">
        {webhooks.length === 0 ? (
          <p className="text-ink-subtle text-sm py-6 text-center">Nenhum endpoint de webhook configurado.</p>
        ) : (
          <div className="space-y-3">
            {webhooks.map(wh => (
              <div key={wh.endpoint_id} className="p-4 rounded-lg border border-border bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Webhook size={18} className="text-brand" />
                    <div>
                      <p className="text-sm font-medium text-ink truncate max-w-xs">{wh.url}</p>
                      <span className={`text-xs ${wh.status === 'active' ? 'text-success' : 'text-danger'}`}>{wh.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <HealthBadge rate={wh.health.success_rate} label="sucesso" />
                    {wh.health.failure_streak > 0 && (
                      <span className="text-xs text-danger bg-danger-muted px-2 py-1 rounded-md font-medium">
                        {wh.health.failure_streak} falhas seguidas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Checkout Health */}
      <Card title="Saúde dos Checkouts">
        {checkouts.length === 0 ? (
          <p className="text-ink-subtle text-sm py-6 text-center">Nenhum checkout publicado.</p>
        ) : (
          <div className="space-y-3">
            {checkouts.map(ch => (
              <div key={ch.checkout_id} className="p-4 rounded-lg border border-border bg-background">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-brand" />
                    <div>
                      <h4 className="text-sm font-semibold text-ink">{ch.name}</h4>
                      <span className="text-xs text-ink-subtle">{ch.status}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  <div className="text-center p-2 rounded border border-border">
                    <div className="text-lg font-bold text-ink">{ch.health.total_sessions}</div>
                    <div className="text-xs text-ink-muted">Sessões</div>
                  </div>
                  <div className="text-center p-2 rounded border border-border">
                    <div className={`text-lg font-bold ${(ch.health.conversion_rate ?? 0) >= 5 ? 'text-success' : 'text-warning'}`}>
                      {ch.health.conversion_rate?.toFixed(1) ?? '—'}%
                    </div>
                    <div className="text-xs text-ink-muted">Conversão</div>
                  </div>
                  <div className="text-center p-2 rounded border border-border">
                    <div className="text-lg font-bold text-success">{ch.health.payment_approved}</div>
                    <div className="text-xs text-ink-muted">Aprovados</div>
                  </div>
                  <div className="text-center p-2 rounded border border-border">
                    <div className={`text-lg font-bold ${ch.health.payment_failed > 0 ? 'text-danger' : 'text-ink'}`}>{ch.health.payment_failed}</div>
                    <div className="text-xs text-ink-muted">Falhas</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageLayout>
  );
}
