'use client';

import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { ChevronDown, BarChart3, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const volumeData = [
  { day: '12 mai', volume: 12.5, tx: 450 },
  { day: '13 mai', volume: 14.8, tx: 520 },
  { day: '14 mai', volume: 13.2, tx: 480 },
  { day: '15 mai', volume: 16.5, tx: 580 },
  { day: '16 mai', volume: 15.8, tx: 550 },
  { day: '17 mai', volume: 18.2, tx: 610 },
  { day: '18 mai', volume: 17.5, tx: 590 },
];

const funnelData = [
  { name: 'Visitas', value: 622541, percent: '100%', fill: '#7C3AED' },
  { name: 'Carrinho', value: 366791, percent: '58,58%', fill: '#8B5CF6' },
  { name: 'Iniciaram checkout', value: 91412, percent: '14,01%', fill: '#A78BFA' },
  { name: 'Pagamento aprovado', value: 62301, percent: '15,62%', fill: '#C4B5FD' },
  { name: 'Conversão final', value: 47077, percent: '75,46%', fill: '#DDD6FE' },
];

export function FinancialCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Volume Chart - Compact (280px) */}
      <div className="lg:col-span-7 bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
               <BarChart3 className="w-3.5 h-3.5 text-brand" />
            </div>
            <h3 className="text-[11px] font-black text-ink uppercase tracking-widest">Volume Financeiro</h3>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-3 mr-2">
               <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                 <span className="text-[9px] font-bold text-slate/50 uppercase tracking-tighter">Volume</span>
               </div>
               <div className="flex items-center gap-1">
                 <div className="w-1.5 h-0.5 rounded-full bg-brand-accent" />
                 <span className="text-[9px] font-bold text-slate/50 uppercase tracking-tighter">Transações</span>
               </div>
             </div>
             <button className="flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-lg text-[9px] font-black text-ink hover:bg-brand-soft transition-all uppercase tracking-tighter">
               7 dias <ChevronDown className="w-3 h-3 text-slate/30" />
             </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9DDFE" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 700 }}
                dy={5}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 700 }}
                tickFormatter={(val) => `${val} mi`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(124, 58, 237, 0.03)', radius: 4 }}
                contentStyle={{ 
                  borderRadius: '10px', 
                  border: '1px solid #E9DDFE', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="volume" 
                fill="#7C3AED" 
                radius={[3, 3, 0, 0]} 
                barSize={28} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="tx" 
                stroke="#A855F7" 
                strokeWidth={1.5} 
                dot={{ fill: '#fff', stroke: '#A855F7', strokeWidth: 1.5, r: 2.5 }}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#7C3AED' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel - Compact (280px) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
               <Filter className="w-3.5 h-3.5 text-brand" />
             </div>
             <h3 className="text-[11px] font-black text-ink uppercase tracking-widest">Conversão e Aprovações</h3>
          </div>
          <button className="flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-lg text-[9px] font-black text-ink hover:bg-brand-soft transition-all uppercase tracking-tighter">
            7 dias <ChevronDown className="w-3 h-3 text-slate/30" />
          </button>
        </div>

        <div className="flex-1 space-y-2.5 flex flex-col justify-center">
          {funnelData.map((item, idx) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-tighter text-slate/50">
                <span className="truncate pr-2">{item.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-ink">{item.value.toLocaleString()}</span>
                  <span className="text-brand w-9 text-right">{item.percent}</span>
                </div>
              </div>
              <div className="h-5 w-full bg-background rounded-lg overflow-hidden group">
                <div 
                  className="h-full rounded-lg transition-all duration-1000 ease-out shadow-sm relative group-hover:brightness-95"
                  style={{ 
                    width: `${100 - idx * 12}%`,
                    backgroundColor: item.fill
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
