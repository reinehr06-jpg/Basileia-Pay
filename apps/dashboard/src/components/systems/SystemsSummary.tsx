'use client';

import { 
  Info, 
  ArrowRight, 
  ServerOff, 
  Workflow, 
  ShieldAlert 
} from 'lucide-react';

export function SystemsSummary() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3 w-full">
      <StatusSummaryCard />
      <TechnicalAlertsFeed />
      <AttentionPointsCard />
    </div>
  );
}

function StatusSummaryCard() {
  const items = [
    { label: "Operacionais", value: 0, percent: "0%", color: "bg-green-500" },
    { label: "Atenção", value: 0, percent: "0%", color: "bg-amber-500" },
    { label: "Instáveis", value: 0, percent: "0%", color: "bg-red-500" },
    { label: "Desconectados", value: 0, percent: "0%", color: "bg-slate-400" },
  ];

  return (
    <div className="rounded-[22px] border border-[#E8DDFD] bg-white/80 p-4 shadow-[0_10px_30px_rgba(76,29,149,0.08)] flex flex-col justify-between h-[195px] xl:h-[200px]">
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.12em] text-slate-950">
            Resumo de Status
          </h3>
          <Info className="h-4 w-4 text-violet-500" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#E8DDFD] bg-[#FAF8FF] p-2 text-center flex flex-col items-center justify-center"
            >
              <div className={`mb-1.5 h-2 w-2 rounded-full shrink-0 ${item.color}`} />
              <p className="text-lg font-black text-slate-950 leading-none">{item.value}</p>
              <p className="mt-1 text-[9px] font-bold text-slate-600 leading-tight">
                {item.label}
              </p>
              <p className="text-[9px] font-semibold text-slate-400 leading-tight">
                {item.percent}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex h-3 overflow-hidden rounded-full bg-slate-100 shrink-0">
        <div className="w-[100%] bg-slate-200" />
      </div>
    </div>
  );
}

function TechnicalAlertsFeed() {
  const alerts: any[] = [];

  return (
    <div className="rounded-[22px] border border-[#E8DDFD] bg-white/80 p-4 shadow-[0_10px_30px_rgba(76,29,149,0.08)] flex flex-col justify-between h-[195px] xl:h-[200px]">
      <div>
        <h3 className="mb-2.5 text-sm font-black uppercase tracking-[0.12em] text-slate-950 shrink-0">
          Alertas Técnicos Recentes
        </h3>

        <div className="space-y-2 flex-1 flex flex-col items-center justify-center min-h-[100px] text-center">
          <p className="text-[10px] font-bold text-slate-400">Nenhum alerta registrado no momento.</p>
        </div>
      </div>

      <button className="mt-2 flex items-center gap-1.5 text-xs font-black text-violet-600 uppercase tracking-wider hover:gap-2 transition-all shrink-0 opacity-50 cursor-not-allowed">
        Ver todos os alertas
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AttentionPointsCard() {
  const points: any[] = [];

  return (
    <div className="rounded-[22px] border border-[#E8DDFD] bg-white/80 p-4 shadow-[0_10px_30px_rgba(76,29,149,0.08)] flex flex-col justify-between h-[195px] xl:h-[200px]">
      <div>
        <h3 className="mb-2.5 text-sm font-black uppercase tracking-[0.12em] text-slate-950 shrink-0">
          Pontos de Atenção
        </h3>

        <div className="space-y-2 flex-1 flex flex-col items-center justify-center min-h-[100px] text-center">
           <p className="text-[10px] font-bold text-slate-400">Todos os sistemas operando normalmente.</p>
        </div>
      </div>
    </div>
  );
}


