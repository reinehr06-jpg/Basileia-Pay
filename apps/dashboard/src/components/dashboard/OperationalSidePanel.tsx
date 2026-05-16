'use client';

import { 
  AlertTriangle, 
  ChevronRight, 
  RefreshCw,
  Layout,
  Globe,
  Lock,
  ArrowUpRight,
  Zap,
  Activity,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OperationalSidePanel() {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. Alertas Operacionais - Compact (300px) */}
      <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm h-[260px] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-ink">Alertas Operacionais</h3>
          <button className="text-[9px] font-black uppercase tracking-widest text-brand hover:underline">Ver todos</button>
        </div>
        
        <div className="space-y-3 flex-1 overflow-hidden">
          {[
            { severity: 'Crítico', text: 'Taxa de falha acima do esperado: Santander', time: '2m', color: 'danger' },
            { severity: 'Atenção', text: 'Atraso médio antifraude acima de 60s', time: '12m', color: 'warning' },
            { severity: 'Atenção', text: 'Instabilidade stripe-card-wallet - BRL', time: '18m', color: 'warning' },
          ].map((alert, i) => (
            <div key={i} className="flex gap-2.5 group cursor-pointer">
              <div className={cn("w-1 h-1 rounded-full mt-1.5 shrink-0", `bg-${alert.color}`)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn("text-[8px] font-black uppercase tracking-tighter", `text-${alert.color}`)}>{alert.severity}</span>
                  <span className="text-[8px] font-bold text-slate/30">{alert.time} atrás</span>
                </div>
                <h4 className="text-[10.5px] font-bold text-ink leading-tight truncate group-hover:text-brand transition-colors">{alert.text}</h4>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-slate/40 hover:text-brand hover:border-brand/30 hover:bg-brand-soft transition-all flex items-center justify-center gap-2 shrink-0">
          Ver todos os alertas <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* 2. Eventos Recentes - Compact (340px) */}
      <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm h-[320px] flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-ink">Eventos Recentes</h3>
          <button className="text-[9px] font-black uppercase tracking-widest text-brand hover:underline">Ver todos</button>
        </div>

        <div className="space-y-3 flex-1 overflow-hidden">
          {[
            { time: '11:04:53', status: 'Aprovado', event: 'Pagamento aprovado', method: 'Cartão', ref: 'R$ 1.568,88', color: 'success' },
            { time: '11:03:18', status: 'Info', event: 'Webhook enviado', method: 'API', ref: 'Assinatura', color: 'brand' },
            { time: '11:02:12', status: 'Falha', event: 'Retry falhou', method: 'Pix', ref: 'Timeout', color: 'danger' },
            { time: '11:01:45', status: 'Info', event: 'Antifraude revisou', method: 'Cartão', ref: 'tx_0c58b79', color: 'brand' },
            { time: '11:00:25', status: 'Risco', event: 'Chargeback recebido', method: 'Cartão', ref: 'R$ 1.984,00', color: 'danger' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-[8px] font-bold text-slate/30 tabular-nums mt-0.5 shrink-0">{item.time}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-[10.5px] font-bold text-ink truncate leading-tight">{item.event}</h4>
                  <span className={cn("text-[7px] font-black uppercase px-1 rounded-sm shrink-0", `bg-${item.color}/10 text-${item.color}`)}>{item.method}</span>
                </div>
                <p className="text-[8.5px] font-bold text-slate/40 truncate leading-none">{item.ref}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 py-2 border border-border rounded-lg text-[9px] font-black uppercase tracking-widest text-slate/40 hover:text-brand hover:border-brand/30 hover:bg-brand-soft transition-all flex items-center justify-center gap-2 shrink-0">
          Ver todos os eventos <ArrowUpRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* 3. Status da Plataforma - Denser */}
      <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-ink">Status Plataforma</h3>
          <button className="p-1.5 rounded-lg bg-background border border-border text-slate/30 hover:text-brand transition-all">
             <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Uptime API', value: '99,95%', color: 'success' },
            { label: 'Latência', value: '198ms', color: 'brand' },
            { label: 'Erro P99', value: '0,02%', color: 'success' },
            { label: 'Transações', value: '1.8k rpm', color: 'brand' },
          ].map((stat) => (
            <div key={stat.label} className="p-2.5 rounded-xl bg-background border border-border/50">
              <p className="text-[7.5px] font-black uppercase tracking-widest text-slate/40 mb-0.5">{stat.label}</p>
              <p className={cn("text-[12px] font-black tracking-tight leading-none", `text-${stat.color}`)}>{stat.value}</p>
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
             <div key={m.name} className="flex items-center justify-between p-1.5 rounded-lg bg-background/50 border border-border/20">
               <span className="text-[9.5px] font-bold text-ink opacity-80">{m.name}</span>
               <div className="w-1 h-1 rounded-full bg-success shadow-[0_0_4px_rgba(22,163,74,0.3)]" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
