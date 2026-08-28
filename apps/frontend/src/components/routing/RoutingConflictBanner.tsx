'use client';

import { AlertTriangle, ArrowRight } from 'lucide-react';

interface RoutingConflictBannerProps {
  conflictsCount: number;
  onResolveClick: () => void;
}

export function RoutingConflictBanner({ conflictsCount, onResolveClick }: RoutingConflictBannerProps) {
  if (conflictsCount <= 0) return null;

  return (
    <div className="w-full bg-red-50/70 border border-red-250/70 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-red-600 border border-red-200 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-black text-red-800 leading-tight">
            Conflitos de prioridade detectados
          </h4>
          <p className="text-[10.5px] font-semibold text-red-600 mt-0.5 leading-snug">
            {conflictsCount} regra{conflictsCount > 1 ? 's têm' : ' tem'} a mesma prioridade com condições sobrepostas. Regras com o mesmo peso podem gerar comportamentos imprevisíveis de decisão.
          </p>
        </div>
      </div>

      <button
        onClick={onResolveClick}
        className="flex items-center gap-1 text-[10px] font-black text-red-750 hover:text-red-900 bg-red-100 hover:bg-red-200/80 px-3 py-1.5 rounded-lg border border-red-250/40 uppercase tracking-tight shrink-0 transition-all cursor-pointer w-fit self-end sm:self-center"
      >
        Resolver conflitos
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
