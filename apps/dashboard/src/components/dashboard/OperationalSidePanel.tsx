'use client';

import { useEffect, useState } from 'react';
import { 
  ChevronRight, 
  RefreshCw,
  ArrowUpRight,
  Info,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

type AlertItem = { severity: string; text: string; time: string; color: 'danger' | 'warning' | 'info' };
type EventItem = { time: string; status: string; event: string; method: string; ref: string; color: 'success' | 'brand' | 'danger' | 'warning' | 'info' };

const COLOR_BG: Record<string, string> = {
  danger: 'bg-danger', warning: 'bg-warning', info: 'bg-info',
  success: 'bg-success', brand: 'bg-brand',
};
const COLOR_TEXT: Record<string, string> = {
  danger: 'text-danger', warning: 'text-warning', info: 'text-info',
  success: 'text-success', brand: 'text-brand',
};

export function OperationalSidePanel() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [alertRes, payRes] = await Promise.all([
          apiFetch('/api/v1/dashboard/alerts'),
          apiFetch('/api/v1/dashboard/payments?per_page=5'),
        ]);
        if (alertRes.success && Array.isArray(alertRes.data)) {
          const alertColor: Record<string, AlertItem['color']> = { critical: 'danger', high: 'danger', medium: 'warning', low: 'info' };
          setAlerts(alertRes.data.map((a: any) => ({
            severity: a.severity === 'critical' ? 'Crítico' : a.severity === 'high' ? 'Alto' : a.severity === 'medium' ? 'Médio' : a.severity === 'low' ? 'Baixo' : a.severity || 'Info',
            text: a.title || a.message || '',
            time: a.created_at ? Math.floor((Date.now() - new Date(a.created_at).getTime()) / 60000) + 'm' : '—',
            color: alertColor[a.severity] || 'warning',
          })));
        }
        if (payRes.success && Array.isArray(payRes.data)) {
          const eventColors: Record<string, EventItem['color']> = { approved: 'success', paid: 'success', pending: 'warning', failed: 'danger', refunded: 'brand' };
          setEvents(payRes.data.slice(0, 5).map((p: any) => ({
            time: p.created_at ? new Date(p.created_at).toLocaleTimeString('pt-BR') : '—',
            status: p.status,
            event: p.status === 'paid' ? 'Pagamento aprovado' : p.status === 'failed' ? 'Pagamento recusado' : p.status === 'pending' ? 'Pagamento pendente' : 'Transação',
            method: p.method || '—',
            ref: p.value || '—',
            color: eventColors[p.status] || 'info',
          })));
        }
      } catch (err) { 
        console.error('Failed to fetch alerts:', err); 
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Alertas Operacionais */}
      <div className="bg-surface p-5 rounded-[20px] border border-border shadow-sm h-[260px] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-ink">Alertas Operacionais</h3>
          <button className="text-[9px] font-black uppercase tracking-widest text-brand hover:underline">Ver todos</button>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Info className="w-5 h-5 text-slate/40 mb-1" />
            <p className="text-[10px] font-bold text-slate/50">Nenhum alerta operacional</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-hidden">
            {alerts.slice(0, 3).map((alert, i) => (
              <div key={i} className="flex gap-2.5 group cursor-pointer">
                <div className={cn("w-1 h-1 rounded-full mt-1.5 shrink-0", COLOR_BG[alert.color])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={cn("text-[8px] font-black uppercase tracking-tighter", COLOR_TEXT[alert.color])}>{alert.severity}</span>
                    <span className="text-[8px] font-bold text-slate/30">{alert.time} atrás</span>
                  </div>
                  <h4 className="text-[10.5px] font-bold text-ink leading-tight truncate group-hover:text-brand transition-colors">{alert.text}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="w-full mt-4 py-2 border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-slate/40 hover:text-brand hover:border-brand/30 hover:bg-brand-soft transition-all flex items-center justify-center gap-2 shrink-0">
          Ver todos os alertas <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* 2. Eventos Recentes */}
      <div className="bg-surface p-5 rounded-[20px] border border-border shadow-sm h-[320px] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-ink">Eventos Recentes</h3>
          <button className="text-[9px] font-black uppercase tracking-widest text-brand hover:underline">Ver todos</button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Info className="w-5 h-5 text-slate/40 mb-1" />
            <p className="text-[10px] font-bold text-slate/50">Nenhum evento recente</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-hidden">
            {events.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-[8px] font-bold text-slate/30 tabular-nums mt-0.5 shrink-0">{item.time}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-[10.5px] font-bold text-ink truncate leading-tight">{item.event}</h4>
                    <span className={cn("text-[7px] font-black uppercase px-1 rounded-sm shrink-0", `${COLOR_BG[item.color]}/10 ${COLOR_TEXT[item.color]}`)}>{item.method}</span>
                  </div>
                  <p className="text-[8.5px] font-bold text-slate/40 truncate leading-none">{item.ref}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button className="w-full mt-4 py-2 border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-slate/40 hover:text-brand hover:border-brand/30 hover:bg-brand-soft transition-all flex items-center justify-center gap-2 shrink-0">
          Ver todos os eventos <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* 3. Status da Plataforma - Denser */}
      <div className="bg-surface p-5 rounded-[20px] border border-border shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-ink">Status Plataforma</h3>
          <button className="p-1.5 rounded-lg bg-surface border border-border text-slate/30 hover:text-brand transition-all">
             <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Uptime API', value: '100%', color: 'success' },
            { label: 'Latência', value: '0ms', color: 'brand' },
            { label: 'Erro P99', value: '0,00%', color: 'success' },
            { label: 'Transações', value: '0 rpm', color: 'brand' },
          ].map((stat) => (
            <div key={stat.label} className="p-2.5 rounded-xl bg-surface border border-border/50">
              <p className="text-[7.5px] font-black uppercase tracking-widest text-slate/40 mb-0.5">{stat.label}</p>
              <p className={cn("text-[12px] font-black tracking-tight leading-none", COLOR_TEXT[stat.color])}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
           {[
             { name: 'Checkout' },
             { name: 'API' },
             { name: 'Webhook' },
             { name: 'Antifraude' },
             { name: 'Pagamentos' },
             { name: 'Relatórios' },
           ].map((m) => (
             <div key={m.name} className="flex items-center justify-between p-1.5 rounded-lg bg-surface border border-border/20">
               <span className="text-[9.5px] font-bold text-ink opacity-80">{m.name}</span>
               <div className="w-1 h-1 rounded-full bg-slate-300" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
