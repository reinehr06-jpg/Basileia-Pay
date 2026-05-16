'use client';

import { 
  AlertTriangle, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Zap,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Lock,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemsSummary() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 2xl:gap-8 mb-8 w-full">
      {/* Card 1: Resumo de Status */}
      <div className="bg-white/70 backdrop-blur-md p-6 2xl:p-8 rounded-[24px] border border-border/50 shadow-sm flex flex-col h-[260px] 2xl:h-[280px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] 2xl:text-[14px] font-black text-ink uppercase tracking-widest">Resumo de Status</h3>
            <div className="w-4 h-4 rounded-full border border-slate/20 flex items-center justify-center text-[10px] text-slate/30 font-bold">i</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-4 gap-3 2xl:gap-4">
            {[
              { label: 'Operacionais', count: 6, percent: '75%', color: 'text-success', bg: 'bg-success/5' },
              { label: 'Atenção', count: 1, percent: '12,5%', color: 'text-warning', bg: 'bg-warning/5' },
              { label: 'Instáveis', count: 1, percent: '12,5%', color: 'text-danger', bg: 'bg-danger/5' },
              { label: 'Desconectados', count: 1, percent: '12,5%', color: 'text-slate/40', bg: 'bg-slate/5' },
            ].map((s) => (
              <div key={s.label} className={cn("p-4 rounded-2xl border border-border/40 flex flex-col items-center text-center transition-all hover:scale-105", s.bg)}>
                <p className="text-[22px] 2xl:text-[24px] font-black text-ink leading-none mb-2">{s.count}</p>
                <p className="text-[10px] font-black text-slate/40 uppercase tracking-tighter leading-tight mb-1">{s.label}</p>
                <p className={cn("text-[10px] font-black", s.color)}>{s.percent}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="h-2.5 w-full bg-slate/5 rounded-full overflow-hidden flex shadow-inner">
               <div className="h-full bg-success shadow-[0_0_8px_rgba(22,163,74,0.3)]" style={{ width: '75%' }} />
               <div className="h-full bg-warning" style={{ width: '12.5%' }} />
               <div className="h-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.3)]" style={{ width: '12.5%' }} />
               <div className="h-full bg-slate/20" style={{ width: '12.5%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Alertas Técnicos Recentes */}
      <div className="bg-white/70 backdrop-blur-md p-6 2xl:p-8 rounded-[24px] border border-border/50 shadow-sm flex flex-col h-[260px] 2xl:h-[280px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[13px] 2xl:text-[14px] font-black text-ink uppercase tracking-widest">Alertas Técnicos Recentes</h3>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto no-scrollbar pr-1">
          {[
            { sys: 'Latência elevada no Banco do Brasil PIX', msg: 'Aumento de tempo de resposta detectado', time: 'há 30 min', severity: 'danger', status: 'Instável' },
            { sys: 'Erros intermitentes no Stripe', msg: 'Taxa de erro acima do normal (0,8%)', time: 'há 15 min', severity: 'warning', status: 'Atenção' },
            { sys: 'Webhooks atrasados - Mercado Pago', msg: 'Fila com atraso médio de 8 min', time: 'há 12 min', severity: 'warning', status: 'Atenção' },
          ].map((a, idx) => (
            <div key={idx} className="flex items-start justify-between group cursor-pointer hover:bg-brand-soft/10 p-1 -mx-1 rounded-lg transition-all">
              <div className="flex items-start gap-4">
                <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", a.severity === 'danger' ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.4)]')} />
                <div className="min-w-0">
                  <h4 className="text-[12.5px] font-black text-ink truncate leading-tight mb-1">{a.sys}</h4>
                  <p className="text-[11px] font-bold text-slate/40 truncate tracking-tight">{a.msg}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                 <p className={cn("text-[10px] font-black uppercase tracking-tight mb-0.5", a.severity === 'danger' ? 'text-danger' : 'text-warning')}>{a.status}</p>
                 <p className="text-[10px] font-bold text-slate/30">{a.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-5 flex items-center justify-center gap-2 text-[11px] font-black text-brand uppercase tracking-widest hover:gap-3 transition-all pt-4 border-t border-border/10 group">
          Ver todos os alertas <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Card 3: Pontos de Atenção */}
      <div className="bg-white/70 backdrop-blur-md p-6 2xl:p-8 rounded-[24px] border border-border/50 shadow-sm flex flex-col h-[260px] 2xl:h-[280px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[13px] 2xl:text-[14px] font-black text-ink uppercase tracking-widest">Pontos de Atenção</h3>
        </div>

        <div className="flex-1 space-y-5">
          {[
            { icon: Clock, title: '1 sistema sem atividade', desc: 'Adyen Sandbox não possui atividade nas últimas 24h', action: 'Ver sistemas' },
            { icon: Zap, title: '3 webhooks com atenção', desc: 'Filas com atraso superior a 5 minutos', action: 'Ver webhooks' },
            { icon: Lock, title: '1 certificado expira em breve', desc: 'Certificado do Cielo expira em 12 dias', action: 'Ver certificados' },
          ].map((p, idx) => (
            <div key={idx} className="flex items-center justify-between group hover:bg-brand-soft/10 p-1 -mx-1 rounded-xl transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 2xl:w-11 2xl:h-11 rounded-xl bg-brand/5 flex items-center justify-center shrink-0 border border-brand/10 shadow-sm group-hover:scale-110 transition-transform">
                  <p.icon className="w-5 h-5 text-brand/60" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12.5px] font-black text-ink truncate leading-tight mb-1">{p.title}</h4>
                  <p className="text-[11px] font-bold text-slate/40 truncate tracking-tight">{p.desc}</p>
                </div>
              </div>
              <button className="text-[11px] font-black text-brand hover:underline shrink-0 ml-4 whitespace-nowrap">
                {p.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
