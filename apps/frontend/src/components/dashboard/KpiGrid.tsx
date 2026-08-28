'use client';

import { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Filter,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { apiFetch } from '@/lib/api';

type KpiData = {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description: string;
  icon: typeof DollarSign;
  color: string;
  chartData: number[];
};

export function KpiGrid() {
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const result = await apiFetch('/api/v1/dashboard/stats');
        if (result.success && result.data) {
          const d = result.data as any;
          setKpis([
            {
              title: 'Volume Processado',
              value: d.volume_processed || 'R$ 0,00',
              change: d.volume_change || '+0%',
              trend: d.volume_trend === 'down' ? 'down' : 'up',
              description: 'vs 7 dias atras',
              icon: DollarSign,
              color: 'brand',
              chartData: d.volume_chart || [0,0,0,0,0,0,0]
            },
            {
              title: 'Receita Liquida',
              value: d.net_revenue || 'R$ 0,00',
              change: d.revenue_change || '+0%',
              trend: d.revenue_trend === 'down' ? 'down' : 'up',
              description: 'vs 7 dias atras',
              icon: TrendingUp,
              color: 'brand',
              chartData: d.revenue_chart || [0,0,0,0,0,0,0]
            },
            {
              title: 'Taxa de Aprovacao',
              value: d.approval_rate || '0%',
              change: d.approval_change || '+0%',
              trend: d.approval_trend === 'down' ? 'down' : 'up',
              description: 'vs 7 dias atras',
              icon: ShieldCheck,
              color: 'success',
              chartData: d.approval_chart || [0,0,0,0,0,0,0]
            },
            {
              title: 'Falhas de Pagamento',
              value: d.failure_rate || '0%',
              change: d.failure_change || '+0%',
              trend: d.failure_trend === 'up' ? 'down' : 'up',
              description: 'vs 7 dias atras',
              icon: AlertCircle,
              color: 'danger',
              chartData: d.failure_chart || [0,0,0,0,0,0,0]
            },
            {
              title: 'Conversao Final',
              value: d.conversion_rate || '0%',
              change: d.conversion_change || '+0%',
              trend: d.conversion_trend === 'down' ? 'down' : 'up',
              description: 'vs 7 dias atras',
              icon: Filter,
              color: 'brand',
              chartData: d.conversion_chart || [0,0,0,0,0,0,0]
            },
          ]);
        } else {
          setKpis([]);
        }
      } catch {
        setKpis([]);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 2xl:gap-6">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-white p-4 2xl:p-5 rounded-[20px] border border-border h-[130px] 2xl:h-[142px] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-slate/30 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  if (kpis.length === 0) {
    return (
      <div className="bg-white p-8 rounded-[20px] border border-border text-center">
        <p className="text-sm font-bold text-slate/50">Nenhum dado disponivel ainda.</p>
        <p className="text-xs font-bold text-slate/30 mt-1">Conecte um sistema e faca sua primeira venda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 2xl:gap-6">
      {kpis.map((kpi) => (
        <div 
          key={kpi.title} 
          className="group bg-white p-4 2xl:p-5 rounded-[20px] border border-border shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-500 h-[130px] 2xl:h-[142px] flex flex-col relative overflow-hidden"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className={cn(
              "w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
              kpi.color === 'brand' ? 'bg-brand/10' : kpi.color === 'success' ? 'bg-success/10' : 'bg-danger/10'
            )}>
              <kpi.icon className={cn("w-3.5 h-3.5 2xl:w-4 2xl:h-4", kpi.color === 'brand' ? 'text-brand' : kpi.color === 'success' ? 'text-success' : 'text-danger')} />
            </div>
            <p className="text-[8px] 2xl:text-[9px] font-black text-slate/40 uppercase tracking-[0.10em] text-right leading-tight ml-2">
              {kpi.title}
            </p>
          </div>

          <div className="relative z-10 mt-auto pb-2 2xl:pb-4">
            <p className="text-[22px] 2xl:text-[27px] font-black text-ink tracking-tighter leading-none mb-1 whitespace-nowrap">
              {kpi.value}
            </p>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8.5px] 2xl:text-[9px] font-black",
                kpi.trend === 'up' ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              )}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5 rotate-90" />}
                {kpi.change}
              </div>
              <span className="text-[8.5px] 2xl:text-[9px] font-bold text-slate/30">vs. ontem</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-9 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpi.chartData.map((v, i) => ({ v, i }))}>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke={`var(--color-${kpi.color})`} 
                  strokeWidth={1.5} 
                  fill="transparent"
                  strokeOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}

