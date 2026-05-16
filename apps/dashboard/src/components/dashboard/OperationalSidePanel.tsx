'use client';

import { 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Zap,
  Activity,
  RefreshCw,
  Layout,
  Globe,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OperationalSidePanel() {
  return (
    <div className="flex flex-col gap-8">
      {/* Operational Alerts */}
      <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-ink">Alertas Operacionais</h3>
          <button className="text-[11px] font-black uppercase tracking-widest text-brand hover:underline">Ver todos</button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-danger/5 border border-danger/10 flex gap-4 group cursor-pointer hover:bg-danger/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
               <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-tighter text-danger">Crítico</span>
                <span className="text-[10px] font-bold text-muted whitespace-nowrap">2m atrás</span>
              </div>
              <h4 className="text-[13px] font-bold text-ink leading-tight group-hover:text-danger transition-colors">Taxa de falha acima do esperado</h4>
              <p className="text-[11px] font-medium text-muted mt-1">Gateway: Santander (PIX)</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-warning/5 border border-warning/10 flex gap-4 group cursor-pointer hover:bg-warning/10 transition-all">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
               <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-tighter text-warning">Atenção</span>
                <span className="text-[10px] font-bold text-muted whitespace-nowrap">12m atrás</span>
              </div>
              <h4 className="text-[13px] font-bold text-ink leading-tight group-hover:text-warning transition-colors">Latência média elevada</h4>
              <p className="text-[11px] font-medium text-muted mt-1">Antifraude P95: 68s</p>
            </div>
          </div>
        </div>

        <button className="w-full mt-6 py-3 border border-border rounded-xl text-[11px] font-black uppercase tracking-widest text-muted hover:text-brand hover:border-brand/30 hover:bg-brand-soft transition-all flex items-center justify-center gap-2">
          Ver todos os alertas <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Events */}
      <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-ink">Eventos Recentes</h3>
          <button className="text-[11px] font-black uppercase tracking-widest text-brand hover:underline">Ver todos</button>
        </div>

        <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-border before:rounded-full">
          {[
            { time: '11:04:53', event: 'Pagamento aprovado', channel: 'Cartão', desc: 'tx_9f71e8ef', color: 'success' },
            { time: '11:03:18', event: 'Webhook enviado', channel: 'API', desc: 'endpoint_default', color: 'brand' },
            { time: '11:02:12', event: 'Retry falhou', channel: 'Pix', desc: 'tx_7a3b6d42', color: 'danger' },
          ].map((item, i) => (
            <div key={i} className="pl-6 relative">
              <div className={cn(
                "absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-surface shadow-sm",
                `bg-${item.color}`
              )} />
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted tabular-nums">{item.time}</span>
                <span className={cn("text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded", `bg-${item.color}/10 text-${item.color}`)}>
                  {item.channel}
                </span>
              </div>
              <h4 className="text-xs font-bold text-ink leading-tight">{item.event}</h4>
              <p className="text-[10px] font-medium text-muted mt-0.5">Ref: {item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Status */}
      <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-ink">Status da Plataforma</h3>
            <p className="text-[10px] font-bold text-muted mt-0.5 tracking-tight uppercase">Últimas 24h</p>
          </div>
          <button className="p-2 rounded-xl bg-background border border-border text-muted hover:text-brand hover:rotate-180 transition-all">
             <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Uptime (API)', value: '99,95%', color: 'success' },
            { label: 'Latência (P95)', value: '198 ms', color: 'brand' },
            { label: 'Erro (P95)', value: '0,02%', color: 'success' },
            { label: 'Transações', value: '1.842 rpm', color: 'brand' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-background border border-border/50">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">{stat.label}</p>
              <p className={cn("text-lg font-black tracking-tight", `text-${stat.color}`)}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
           {[
             { name: 'Checkout', icon: Layout },
             { name: 'API', icon: Globe },
             { name: 'Webhook', icon: Zap },
             { name: 'Antifraude', icon: Lock },
             { name: 'Pagamentos', icon: Activity },
             { name: 'Relatórios', icon: Info },
           ].map((m) => (
             <div key={m.name} className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/30">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center">
                   <m.icon className="w-4 h-4 text-muted" />
                 </div>
                 <span className="text-xs font-bold text-ink">{m.name}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-success" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-success">Operacional</span>
               </div>
             </div>
           ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-success" />
             <p className="text-[10px] font-bold text-muted">Última verificação há 1 min</p>
           </div>
           <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>
    </div>
  );
}
