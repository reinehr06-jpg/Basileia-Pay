'use client';

import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Zap,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemsSummary() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.1fr_1fr] gap-6">
      {/* 1. Resumo de Status */}
      <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col h-[200px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
               <Activity className="w-3.5 h-3.5 text-brand" />
            </div>
            <h3 className="text-[11px] font-black text-ink uppercase tracking-widest">Resumo de Status</h3>
          </div>
          <span className="text-[9px] font-black text-slate/30 uppercase tracking-tighter">Saúde Geral: 98.4%</span>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Ativos', count: 6, percent: '75%', color: 'success' },
              { label: 'Atenção', count: 1, percent: '12.5%', color: 'warning' },
              { label: 'Instáveis', count: 1, percent: '12.5%', color: 'danger' },
              { label: 'Off', count: 1, percent: '12.5%', color: 'slate/30' },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <p className="text-[14px] font-black text-ink">{s.count}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[7.5px] font-black text-slate/40 uppercase tracking-tighter">{s.label}</span>
                  <span className={cn("text-[7.5px] font-black", `text-${s.color}`)}>{s.percent}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-4 w-full bg-background rounded-full overflow-hidden flex shadow-inner">
             <div className="h-full bg-success" style={{ width: '75%' }} />
             <div className="h-full bg-warning" style={{ width: '12.5%' }} />
             <div className="h-full bg-danger" style={{ width: '12.5%' }} />
             <div className="h-full bg-slate/10" style={{ width: '12.5%' }} />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/10">
             <div className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
               <span className="text-[8.5px] font-black text-slate/40 uppercase tracking-tighter">Atualizado agora</span>
             </div>
             <button className="text-[8.5px] font-black text-brand hover:underline uppercase tracking-tighter">Analisar logs</button>
          </div>
        </div>
      </div>

      {/* 2. Alertas Técnicos Recentes */}
      <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col h-[200px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center">
               <AlertTriangle className="w-3.5 h-3.5 text-danger" />
            </div>
            <h3 className="text-[11px] font-black text-ink uppercase tracking-widest">Alertas Técnicos</h3>
          </div>
          <div className="px-1.5 py-0.5 rounded-full bg-danger/10 text-danger text-[8px] font-black uppercase tracking-tighter">3 Ativos</div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pr-1">
          {[
            { sys: 'Banco do Brasil PIX', msg: 'Latência elevada - p95: 1.2s', time: 'há 30 min', severity: 'danger' },
            { sys: 'Stripe', msg: 'Erros intermitentes detectados (0.8%)', time: 'há 15 min', severity: 'warning' },
            { sys: 'Mercado Pago', msg: 'Webhooks atrasados - Fila: 8 min', time: 'há 12 min', severity: 'warning' },
          ].map((a, idx) => (
            <div key={idx} className="flex items-start gap-3 group cursor-pointer">
              <div className={cn("w-1 h-8 rounded-full shrink-0", a.severity === 'danger' ? 'bg-danger' : 'bg-warning')} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[9.5px] font-black text-ink uppercase truncate">{a.sys}</h4>
                  <span className="text-[8px] font-bold text-slate/30">{a.time}</span>
                </div>
                <p className="text-[9px] font-bold text-slate/50 truncate leading-snug">{a.msg}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-3 flex items-center justify-center gap-1.5 text-[8.5px] font-black text-brand uppercase tracking-widest hover:gap-2 transition-all group pt-3 border-t border-border/10">
          Ver todos os alertas <ChevronRight className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* 3. Pontos de Atenção */}
      <div className="bg-white p-5 rounded-[20px] border border-border shadow-sm flex flex-col h-[200px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
               <ShieldCheck className="w-3.5 h-3.5 text-warning" />
            </div>
            <h3 className="text-[11px] font-black text-ink uppercase tracking-widest">Pontos de Atenção</h3>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {[
            { icon: Clock, title: '1 sistema sem atividade', desc: 'Adyen Sandbox (24h)', action: 'Ver sistemas' },
            { icon: Zap, title: '3 webhooks com atenção', desc: 'Atrasos superiores a 5 min', action: 'Ver webhooks' },
            { icon: CreditCard, title: 'Certificado expira em breve', desc: 'Cielo (12 dias restantes)', action: 'Renovar' },
          ].map((p, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-background border border-border/50 flex items-center justify-center shrink-0">
                <p.icon className="w-3.5 h-3.5 text-slate/40" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[9.5px] font-black text-ink uppercase truncate">{p.title}</h4>
                <div className="flex items-center justify-between">
                  <p className="text-[8px] font-bold text-slate/40 truncate">{p.desc}</p>
                  <button className="text-[8px] font-black text-brand hover:underline">{p.action}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
