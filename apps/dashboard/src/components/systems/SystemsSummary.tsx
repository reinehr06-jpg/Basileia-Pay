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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      {/* 1. Resumo de Status */}
      <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[24px] border border-border/50 shadow-sm flex flex-col h-[220px]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-[12px] font-black text-ink uppercase tracking-widest">Resumo de Status</h3>
            <div className="w-4 h-4 rounded-full border border-slate/20 flex items-center justify-center text-[10px] text-slate/30 font-bold">i</div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Operacionais', count: 6, percent: '75%', color: 'text-success', bg: 'bg-success/5' },
              { label: 'Atenção', count: 1, percent: '12,5%', color: 'text-warning', bg: 'bg-warning/5' },
              { label: 'Instáveis', count: 1, percent: '12,5%', color: 'text-danger', bg: 'bg-danger/5' },
              { label: 'Desconectados', count: 1, percent: '12,5%', color: 'text-slate/40', bg: 'bg-slate/5' },
            ].map((s) => (
              <div key={s.label} className={cn("p-3 rounded-2xl border border-border/40 flex flex-col items-center text-center", s.bg)}>
                <p className="text-[18px] font-black text-ink leading-none mb-2">{s.count}</p>
                <p className="text-[9px] font-black text-slate/40 uppercase tracking-tighter leading-tight mb-1">{s.label}</p>
                <p className={cn("text-[9px] font-black", s.color)}>{s.percent}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="h-2 w-full bg-slate/5 rounded-full overflow-hidden flex">
               <div className="h-full bg-success" style={{ width: '75%' }} />
               <div className="h-full bg-warning" style={{ width: '12.5%' }} />
               <div className="h-full bg-danger" style={{ width: '12.5%' }} />
               <div className="h-full bg-slate/20" style={{ width: '12.5%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Alertas Técnicos Recentes */}
      <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[24px] border border-border/50 shadow-sm flex flex-col h-[220px]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12px] font-black text-ink uppercase tracking-widest">Alertas Técnicos Recentes</h3>
        </div>

        <div className="flex-1 space-y-4">
          {[
            { sys: 'Latência elevada no Banco do Brasil PIX', msg: 'Aumento de tempo de resposta detectado', time: 'há 30 min', severity: 'danger', status: 'Instável' },
            { sys: 'Erros intermitentes no Stripe', msg: 'Taxa de erro acima do normal (0,8%)', time: 'há 15 min', severity: 'warning', status: 'Atenção' },
            { sys: 'Webhooks atrasados - Mercado Pago', msg: 'Fila com atraso médio de 8 min', time: 'há 12 min', severity: 'warning', status: 'Atenção' },
          ].map((a, idx) => (
            <div key={idx} className="flex items-start justify-between group cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={cn("w-2 h-2 rounded-full mt-1.5", a.severity === 'danger' ? 'bg-danger' : 'bg-warning')} />
                <div className="min-w-0">
                  <h4 className="text-[11.5px] font-black text-ink truncate leading-tight">{a.sys}</h4>
                  <p className="text-[10px] font-bold text-slate/40 truncate">{a.msg}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                 <p className={cn("text-[9px] font-black uppercase tracking-tight mb-0.5", a.severity === 'danger' ? 'text-danger' : 'text-warning')}>{a.status}</p>
                 <p className="text-[9px] font-bold text-slate/30">{a.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black text-brand uppercase tracking-widest hover:gap-3 transition-all pt-3 border-t border-border/10">
          Ver todos os alertas <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. Pontos de Atenção */}
      <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[24px] border border-border/50 shadow-sm flex flex-col h-[220px]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12px] font-black text-ink uppercase tracking-widest">Pontos de Atenção</h3>
        </div>

        <div className="flex-1 space-y-4">
          {[
            { icon: Clock, title: '1 sistema sem atividade', desc: 'Adyen Sandbox não possui atividade nas últimas 24h', action: 'Ver sistemas' },
            { icon: Zap, title: '3 webhooks com atenção', desc: 'Filas com atraso superior a 5 minutos', action: 'Ver webhooks' },
            { icon: Lock, title: '1 certificado expira em breve', desc: 'Certificado do Cielo expira em 12 dias', action: 'Ver certificados' },
          ].map((p, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand/5 flex items-center justify-center shrink-0 border border-brand/5">
                  <p.icon className="w-4 h-4 text-brand/60" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11.5px] font-black text-ink truncate leading-tight">{p.title}</h4>
                  <p className="text-[10px] font-bold text-slate/40 truncate">{p.desc}</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-brand hover:underline shrink-0 ml-4">
                {p.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
