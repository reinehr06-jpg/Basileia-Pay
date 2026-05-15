'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Package, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/api/useDashboardStats';

function StatCard({ label, value, icon, color, loading }: any) {
  return (
    <Card className="flex flex-col gap-2 relative overflow-hidden">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md bg-brand-muted text-brand`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-ink-muted">{label}</span>
      </div>
      <div className="text-2xl font-bold text-ink mt-2">
        {loading ? (
          <div className="h-8 w-24 bg-surface-raised animate-pulse rounded" />
        ) : (
          value
        )}
      </div>
    </Card>
  );
}

export default function DashboardHome() {
  const { stats, loading, error } = useDashboardStats();

  const formatCurrency = (val: number) => {
    return (val / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <PageLayout title="Visão Geral">
      
      {/* Métricas do dia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Aprovado hoje"
          value={stats ? formatCurrency(stats.approved_today) : 'R$ 0,00'}
          icon={<TrendingUp size={20} />}
          loading={loading}
        />
        <StatCard
          label="Vendas hoje"
          value={stats ? stats.orders_today : '0'}
          icon={<Package size={20} />}
          loading={loading}
        />
        <StatCard
          label="Pendentes"
          value={stats ? stats.pending_payments : '0'}
          icon={<Clock size={20} />}
          loading={loading}
        />
        <StatCard
          label="Falhas gateway (24h)"
          value={stats ? stats.failed_payments : '0'}
          icon={<AlertTriangle size={20} />}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2">
          <Card title="Vendas (Últimos 7 dias)">
            <div className="h-64 flex flex-col items-center justify-center text-ink-subtle border border-dashed border-border rounded-md bg-background">
              <TrendingUp size={48} className="text-ink-muted/20 mb-4" />
              <p>Os dados de volume aparecerão aqui conforme as vendas ocorrerem.</p>
            </div>
          </Card>
        </div>
        
        <div className="col-span-1">
          <Card title="Últimos eventos">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-brand" size={24} />
              </div>
            ) : stats?.latest_events.length === 0 ? (
              <p className="text-sm text-ink-subtle py-10 text-center">Nenhum evento recente.</p>
            ) : (
              <div className="space-y-4">
                {stats?.latest_events.map((ev, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                    <span className="text-ink font-medium">{ev.event}</span>
                    <span className="text-ink-subtle">{ev.time_ago}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
