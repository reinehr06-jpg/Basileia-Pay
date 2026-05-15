import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Package, Clock, AlertTriangle } from 'lucide-react';

function StatCard({ label, value, icon, color }: any) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md bg-${color}/10 text-${color}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-ink-muted">{label}</span>
      </div>
      <div className="text-2xl font-bold text-ink mt-2">
        {value}
      </div>
    </Card>
  );
}

export default async function DashboardHome() {
  return (
    <PageLayout title="Visão Geral">
      
      {/* Métricas do dia */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Aprovado hoje"
          value="R$ 14.520,00"
          icon={<TrendingUp size={20} className="text-success" />}
          color="success"
        />
        <StatCard
          label="Vendas hoje"
          value="34"
          icon={<Package size={20} className="text-brand" />}
          color="brand"
        />
        <StatCard
          label="Pendentes"
          value="12"
          icon={<Clock size={20} className="text-warning" />}
          color="warning"
        />
        <StatCard
          label="Falhas gateway (24h)"
          value="0"
          icon={<AlertTriangle size={20} className="text-danger" />}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2">
          <Card title="Vendas (Últimos 7 dias)">
            <div className="h-64 flex items-center justify-center text-ink-subtle border border-dashed border-border rounded-md bg-background">
              Gráfico de Vendas
            </div>
          </Card>
        </div>
        
        <div className="col-span-1">
          <Card title="Últimos eventos">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink">Pagamento aprovado</span>
                <span className="text-ink-subtle">Há 5 min</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink">Checkout publicado</span>
                <span className="text-ink-subtle">Há 1h</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink">Gateway configurado</span>
                <span className="text-ink-subtle">Há 3h</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
