'use client';

import { 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Filter,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
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
    color: 'brand',
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
    change: '+3,52 p.p.',
    trend: 'up',
    description: 'vs 7 dias atrás',
    icon: Filter,
    color: 'brand',
    chartData: [80, 78, 79, 76, 77, 75, 76]
  }
];

export function KpiGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div 
          key={kpi.title}
          className="p-5 rounded-[24px] border border-border bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden h-[160px] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shadow-sm",
              `bg-${kpi.color}/10`
            )}>
              <kpi.icon className={cn("w-4.5 h-4.5", `text-${kpi.color}`)} />
            </div>
            <p className="text-[10px] font-black text-slate/50 uppercase tracking-widest text-right max-w-[80px]">
              {kpi.title}
            </p>
          </div>

          {/* Body */}
          <div className="mt-2 relative z-10">
            <p className="text-xl font-black text-ink tracking-tight">
              {kpi.value}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={cn(
                "flex items-center text-[10px] font-black",
                kpi.trend === 'up' ? "text-success" : "text-danger"
              )}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </div>
              <span className="text-[10px] font-bold text-slate/40 uppercase tracking-tighter">vs 7 dias</span>
            </div>
          </div>

          {/* Sparkline integrated at the bottom */}
          <div className="absolute bottom-2 left-0 right-0 h-10 opacity-60 px-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpi.chartData.map((v, i) => ({ v, i }))}>
                <defs>
                  <linearGradient id={`gradient-${kpi.title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={`var(--color-${kpi.color})`} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={`var(--color-${kpi.color})`} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke={`var(--color-${kpi.color})`} 
                  strokeWidth={2} 
                  fill={`url(#gradient-${kpi.title})`}
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
