'use client';

import { useEffect, useState } from 'react';
import { 
  Bar, 
  BarChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ChevronDown, BarChart3, Filter, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

type ChartItem = { day: string; volume: number; tx: number };
type FunnelItem = { name: string; value: string | number; percent: string; fill: string };

export function FinancialCharts() {
  const [volumeData, setVolumeData] = useState<ChartItem[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiFetch('/api/v1/dashboard/stats');
        if (res.success && res.data) {
          const d = res.data as any;
          
          // Generate last 7 days labels
          const days: string[] = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }));
          }

          const volumeVals = d.volume_chart || [0,0,0,0,0,0,0];
          const mappedCharts = days.map((day, idx) => {
            const vol = volumeVals[idx] || 0;
            return {
              day,
              volume: vol,
              tx: Math.round(vol / 85) || (vol > 0 ? 1 : 0) // Estimate tx count based on volume
            };
          });
          setVolumeData(mappedCharts);

          const activeSystems = d.active_systems || 0;
          const ordersToday = d.orders_today || 0;
          const failed = d.failed_payments || 0;
          const approvalRate = d.approval_rate || '0%';
          const conversionRate = d.conversion_rate || '0%';

          setFunnelData([
            { name: 'Sistemas Conectados', value: activeSystems, percent: '100%', fill: '#7C3AED' },
            { name: 'Pedidos Hoje', value: ordersToday, percent: ordersToday > 0 ? '100%' : '0%', fill: '#8B5CF6' },
            { name: 'Falhas de Pagamento', value: failed, percent: failed > 0 ? '100%' : '0%', fill: '#A78BFA' },
            { name: 'Taxa de Aprovação', value: approvalRate, percent: approvalRate, fill: '#C4B5FD' },
            { name: 'Conversão Final', value: conversionRate, percent: conversionRate, fill: '#DDD6FE' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load financial charts stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] 2xl:grid-cols-[1.35fr_1fr] gap-4 2xl:gap-6 min-h-[280px]">
        <div className="bg-surface p-5 rounded-[20px] border border-border shadow-sm flex items-center justify-center h-[280px] w-full">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
        <div className="bg-surface p-5 rounded-[20px] border border-border shadow-sm flex items-center justify-center h-[280px] w-full">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] 2xl:grid-cols-[1.35fr_1fr] gap-4 2xl:gap-6">
      {/* Volume Chart - Compact (300px) */}
      <div className="bg-surface p-4 2xl:p-5 rounded-[20px] border border-border shadow-sm flex flex-col h-[280px] 2xl:h-[300px] min-w-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 2xl:w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
               <BarChart3 className="w-3 2xl:w-3.5 h-3 2xl:h-3.5 text-brand" />
            </div>
            <h3 className="text-[10px] 2xl:text-[11px] font-black text-ink uppercase tracking-widest">Volume Financeiro</h3>
          </div>
          <div className="flex items-center gap-2 2xl:gap-3">
             <div className="hidden sm:flex items-center gap-2 2xl:gap-3 mr-1 2xl:mr-2">
               <div className="flex items-center gap-1">
                 <div className="w-1 2xl:w-1.5 h-1 2xl:h-1.5 rounded-full bg-brand" />
                 <span className="text-[8px] 2xl:text-[9px] font-bold text-slate/50 uppercase tracking-tighter">Volume</span>
               </div>
               <div className="flex items-center gap-1">
                 <div className="w-1 2xl:w-1.5 h-0.5 rounded-full bg-brand-accent" />
                 <span className="text-[8px] 2xl:text-[9px] font-bold text-slate/50 uppercase tracking-tighter">Transações</span>
               </div>
             </div>
             <button className="flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded-lg text-[8px] 2xl:text-[9px] font-black text-ink hover:bg-brand-soft transition-all uppercase tracking-tighter">
               7 dias <ChevronDown className="w-2.5 h-2.5 2xl:w-3 h-3 text-slate/30" />
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
                tick={{ fill: '#9CA3AF', fontSize: 8, fontWeight: 700 }}
                dy={5}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 8, fontWeight: 700 }}
                tickFormatter={(val) => `R$ ${val}`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 8, fontWeight: 700 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(124, 58, 237, 0.03)', radius: 4 }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: '10px', 
                  border: '1px solid var(--color-border)', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: 'var(--color-ink)'
                }}
              />
              <Bar 
                yAxisId="left" 
                dataKey="volume" 
                fill="#7C3AED" 
                radius={[3, 3, 0, 0]} 
                barSize={24} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="tx" 
                stroke="#A855F7" 
                strokeWidth={1.5} 
                dot={{ fill: '#fff', stroke: '#A855F7', strokeWidth: 1.5, r: 2 }}
                activeDot={{ r: 3, strokeWidth: 0, fill: '#7C3AED' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Funnel - Compact (300px) */}
      <div className="bg-surface p-4 2xl:p-5 rounded-[20px] border border-border shadow-sm flex flex-col h-[280px] 2xl:h-[300px] min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 2xl:w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
               <Filter className="w-3 2xl:w-3.5 h-3 2xl:h-3.5 text-brand" />
             </div>
             <h3 className="text-[10px] 2xl:text-[11px] font-black text-ink uppercase tracking-widest">Conversão e Aprovações</h3>
          </div>
          <button className="flex items-center gap-1 px-2 py-1 bg-surface border border-border rounded-lg text-[8px] 2xl:text-[9px] font-black text-ink hover:bg-brand-soft transition-all uppercase tracking-tighter">
            7 dias <ChevronDown className="w-2.5 h-2.5 2xl:w-3 h-3 text-slate/30" />
          </button>
        </div>

        <div className="flex-1 space-y-1.5 flex flex-col justify-center py-0.5">
          {funnelData.map((item, idx) => (
            <div key={item.name} className="space-y-0.5">
              <div className="flex items-center justify-between text-[8px] 2xl:text-[9px] font-black uppercase tracking-tighter text-slate/50">
                <span className="truncate pr-2">{item.name}</span>
                <div className="flex items-center gap-2 2xl:gap-3 shrink-0">
                  <span className="text-ink">{item.value.toLocaleString()}</span>
                  <span className="text-brand w-8 2xl:w-9 text-right">{item.percent}</span>
                </div>
              </div>
              <div className="h-3.5 2xl:h-4 w-full bg-background rounded-lg overflow-hidden group">
                <div 
                  className="h-full rounded-lg transition-all duration-1000 ease-out shadow-sm relative group-hover:brightness-95"
                  style={{ 
                    width: funnelData.length > 0 ? `${100 - idx * 12}%` : '0%',
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
