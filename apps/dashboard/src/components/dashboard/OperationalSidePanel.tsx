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
    <div className="flex flex-col gap-6">
      {/* 1. Alertas Operacionais */}
      <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12px] font-black uppercase tracking-widest text-ink">Alertas Operacionais</h3>
          <button className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">Ver todos</button>
        </div>
        
        <div className="space-y-4">
          {[
            { severity: 'Crítico', text: 'Taxa de falha acima do esperado no gateway Santander', time: '2m', color: 'danger' },
            { severity: 'Atenção', text: 'Atraso médio entre antifraude acima de 60s', time: '12m', color: 'warning' },
            { severity: 'Atenção', text: 'Instabilidade no método stripe-card-wallet - BRL', time: '18m', color: 'warning' },
          ].map((alert, i) => (
            <div key={i} className="flex gap-3 group cursor-pointer">
              <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", `bg-${alert.color}`)} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn("text-[9px] font-black uppercase tracking-tighter", `text-${alert.color}`)}>{alert.severity}</span>
                  <span className="text-[9px] font-bold text-slate/40">{alert.time} atrás</span>
                </div>
                <h4 className="text-[11px] font-bold text-ink leading-snug group-hover:text-brand transition-colors">{alert.text}</h4>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 py-2.5 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-slate/60 hover:text-brand hover:border-brand/30 hover:bg-brand-soft transition-all flex items-center justify-center gap-2">
          Ver todos os alertas <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Eventos Recentes */}
      <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12px] font-black uppercase tracking-widest text-ink">Eventos Recentes</h3>
          <button className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">Ver todos</button>
        </div>

        <div className="space-y-4">
          {[
            { time: '11:04:53', status: 'Aprovado', event: 'Pagamento aprovado', method: 'Cartão', ref: 'R$ 1.568,88', color: 'success' },
            { time: '11:03:18', status: 'Info', event: 'Webhook enviado', method: 'API', ref: 'Assinatura', color: 'brand' },
            { time: '11:02:12', status: 'Falha', event: 'Retry falhou', method: 'Pix', ref: 'Timeout', color: 'danger' },
            { time: '11:01:45', status: 'Info', event: 'Antifraude revisou', method: 'Cartão', ref: 'tx_0c58b79', color: 'brand' },
            { time: '11:00:25', status: 'Risco', event: 'Chargeback recebido', method: 'Cartão', ref: 'R$ 1.984,00', color: 'danger' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[9px] font-bold text-slate/40 tabular-nums mt-0.5">{item.time}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-[11px] font-bold text-ink truncate">{item.event}</h4>
                  <span className={cn("text-[8px] font-black uppercase px-1 rounded-sm", `bg-${item.color}/10 text-${item.color}`)}>{item.method}</span>
                </div>
                <p className="text-[9px] font-bold text-slate/50 truncate">{item.ref}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 py-2.5 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-slate/60 hover:text-brand hover:border-brand/30 hover:bg-brand-soft transition-all flex items-center justify-center gap-2">
          Ver todos os eventos <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. Status da Plataforma */}
      <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12px] font-black uppercase tracking-widest text-ink">Status da Plataforma</h3>
          <button className="p-1.5 rounded-lg bg-background border border-border text-slate/40 hover:text-brand hover:rotate-180 transition-all">
             <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Uptime API', value: '99,95%', color: 'success' },
            { label: 'Latência P95', value: '198ms', color: 'brand' },
            { label: 'Erro P99', value: '0,02%', color: 'success' },
            { label: 'Transações', value: '1.842 rpm', color: 'brand' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-2xl bg-background border border-border/50">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate/50 mb-0.5">{stat.label}</p>
              <p className={cn("text-[13px] font-black tracking-tight", `text-${stat.color}`)}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
           {[
             { name: 'Checkout', icon: Layout },
             { name: 'API', icon: Globe },
             { name: 'Webhook', icon: Zap },
             { name: 'Antifraude', icon: Lock },
             { name: 'Pagamentos', icon: Activity },
             { name: 'Relatórios', icon: Info },
           ].map((m) => (
             <div key={m.name} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-border/30">
               <span className="text-[10px] font-bold text-ink">{m.name}</span>
               <div className="w-1.5 h-1.5 rounded-full bg-success" />
             </div>
           ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
           <p className="text-[9px] font-bold text-slate/40 uppercase tracking-tighter">Última verificação: há 1 min</p>
           <button className="text-[9px] font-black uppercase tracking-widest text-brand hover:underline">Atualizar</button>
        </div>
      </div>
    </div>
  );
}
