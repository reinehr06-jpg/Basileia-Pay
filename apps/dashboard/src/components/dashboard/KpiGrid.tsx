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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 2xl:gap-6">
      {kpis.map((kpi) => (
        <div 
          key={kpi.title} 
          className="group bg-white p-4 2xl:p-5 rounded-[20px] border border-border shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1 transition-all duration-500 h-[130px] 2xl:h-[142px] flex flex-col relative overflow-hidden"
        >
          {/* Header: Icon + Title */}
          <div className="flex items-center justify-between relative z-10">
            <div className={cn(
              "w-7 h-7 2xl:w-8 2xl:h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
              `bg-${kpi.color}/10`
            )}>
              <kpi.icon className={cn("w-3.5 h-3.5 2xl:w-4 2xl:h-4", `text-${kpi.color}`)} />
            </div>
            <p className="text-[8px] 2xl:text-[9px] font-black text-slate/40 uppercase tracking-[0.10em] text-right leading-tight ml-2">
              {kpi.title}
            </p>
          </div>

          {/* Body: Value + Change */}
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


          {/* Sparkline: Refined & Transparent (No Fill/Overlay) */}
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

