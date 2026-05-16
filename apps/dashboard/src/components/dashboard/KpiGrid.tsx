'use client';

import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Filter 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

const kpis = [
  {
    title: 'Volume Processado',
    value: 'R$ 28,71 mi',
    change: '+2,04%',
    trend: 'up',
    description: 'vs 7 dias atrás',
    icon: DollarSign,
    color: 'brand',
    chartData: [40, 45, 42, 48, 50, 48, 52]
  },
  {
    title: 'Receita Líquida',
    value: 'R$ 2,41 mi',
    change: '+10,71%',
    trend: 'up',
    description: 'vs 7 dias atrás',
    icon: TrendingUp,
    color: 'brand-deep',
    isPremium: true,
    chartData: [30, 35, 32, 40, 38, 45, 50]
  },
  {
    title: 'Taxa de Aprovação',
    value: '94,62%',
    change: '+2,49 p.p.',
    trend: 'up',
    description: 'vs 7 dias atrás',
    icon: ShieldCheck,
    color: 'success',
    chartData: [90, 92, 91, 94, 93, 94, 95]
  },
  {
    title: 'Falhas de Pagamento',
    value: '2,31%',
    change: '+0,47 p.p.',
    trend: 'down',
    description: 'vs 7 dias atrás',
    icon: AlertCircle,
    color: 'danger',
    chartData: [2.1, 2.3, 2.2, 2.5, 2.4, 2.3, 2.3]
  },
  {
    title: 'Conversão Final',
    value: '75,9%',
    change: '-3,52 p.p.',
    trend: 'down',
    description: 'vs 7 dias atrás',
    icon: Filter,
    color: 'warning',
    chartData: [80, 78, 79, 76, 77, 75, 76]
  }
];

export function KpiGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {kpis.map((kpi) => (
        <div 
          key={kpi.title}
          className={cn(
            "p-6 rounded-3xl border border-border bg-surface/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group relative overflow-hidden",
            kpi.isPremium && "bg-gradient-to-br from-brand via-brand to-brand-deep text-white border-transparent shadow-brand/30 shadow-xl"
          )}
        >
          {/* Decorative radial gradient for premium card */}
          {kpi.isPremium && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          )}

          {/* Background Trend Chart (Subtle) */}
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpi.chartData.map((v, i) => ({ v, i }))}>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke={kpi.isPremium ? 'rgba(255,255,255,0.4)' : 'var(--color-brand)'} 
                  strokeWidth={2} 
                  fill={kpi.isPremium ? 'rgba(255,255,255,0.1)' : 'var(--color-brand)'} 
                  fillOpacity={0.05}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                kpi.isPremium ? "bg-white/20" : `bg-${kpi.color}/10`
              )}>
                <kpi.icon className={cn(
                  "w-5 h-5",
                  kpi.isPremium ? "text-white" : `text-${kpi.color}`
                )} />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                kpi.isPremium 
                  ? "bg-white/20 text-white" 
                  : kpi.trend === 'up' 
                    ? "bg-success/10 text-success" 
                    : "bg-danger/10 text-danger"
              )}>
                {kpi.change}
              </div>
            </div>

            <h3 className={cn(
              "text-[13px] font-bold mb-1",
              kpi.isPremium ? "text-white/80" : "text-muted uppercase tracking-tight"
            )}>
              {kpi.title}
            </h3>
            
            <p className="text-2xl font-black mb-1 tabular-nums tracking-tight">
              {kpi.value}
            </p>
            
            <p className={cn(
              "text-[11px] font-medium",
              kpi.isPremium ? "text-white/60" : "text-muted"
            )}>
              {kpi.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
