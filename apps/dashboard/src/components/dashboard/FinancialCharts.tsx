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
  CartesianGrid
} from 'recharts';
import { ChevronDown } from 'lucide-react';

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
  { name: 'Visitas', value: 622541, percent: '100%', fill: '#7B16D9' },
  { name: 'Carrinho', value: 366791, percent: '58,58%', fill: '#8B5CF6' },
  { name: 'Iniciaram checkout', value: 91412, percent: '14,01%', fill: '#A78BFA' },
  { name: 'Pagamento aprovado', value: 62301, percent: '15,62%', fill: '#C4B5FD' },
  { name: 'Conversão final', value: 47077, percent: '75,46%', fill: '#DDD6FE' },
];

export function FinancialCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Volume Chart */}
      <div className="lg:col-span-7 bg-surface p-8 rounded-3xl border border-border shadow-sm flex flex-col h-[480px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-ink">Volume Financeiro</h3>
            <div className="flex items-center gap-4 mt-2">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm bg-brand" />
                 <span className="text-xs font-semibold text-muted tracking-tight">Volume (R$)</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-1 rounded-full bg-brand-accent" />
                 <span className="text-xs font-semibold text-muted tracking-tight">Transações</span>
               </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold text-ink hover:bg-brand-soft transition-all">
            7 dias <ChevronDown className="w-4 h-4 text-muted" />
          </button>
        </div>

        <div className="flex-1 mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5EF" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8B8A95', fontSize: 11, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8B8A95', fontSize: 11, fontWeight: 600 }}
                tickFormatter={(val) => `${val} mi`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8B8A95', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(123, 22, 217, 0.05)' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="volume" 
                fill="#7B16D9" 
                radius={[4, 4, 0, 0]} 
                barSize={40} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="tx" 
                stroke="#A855F7" 
                strokeWidth={3} 
                dot={{ fill: '#fff', stroke: '#A855F7', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0, fill: '#7B16D9' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="lg:col-span-5 bg-surface p-8 rounded-3xl border border-border shadow-sm flex flex-col h-[480px]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-ink">Conversão e Aprovações</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold text-ink hover:bg-brand-soft transition-all">
            7 dias <ChevronDown className="w-4 h-4 text-muted" />
          </button>
        </div>

        <div className="flex-1 space-y-4 flex flex-col justify-center">
          {funnelData.map((item, idx) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted">
                <span>{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-ink">{item.value.toLocaleString()}</span>
                  <span className="text-brand w-12 text-right">{item.percent}</span>
                </div>
              </div>
              <div className="h-8 w-full bg-background rounded-lg overflow-hidden group">
                <div 
                  className="h-full rounded-lg transition-all duration-1000 ease-out shadow-sm relative group-hover:brightness-95"
                  style={{ 
                    width: `calc(${100 - idx * 15}% + ${idx === 0 ? 0 : 5}%)`,
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
