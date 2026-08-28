'use client';

import { ShieldAlert, CheckCircle2, Eye, ShieldX, ShieldCheck } from 'lucide-react';
import { TrustKpi } from '@/types/trust';
import { cn } from '@/lib/utils';

interface TrustKpiCardsProps {
  kpis: TrustKpi;
  onFilterReview?: () => void;
  onFilterBlocked?: () => void;
}

export function TrustKpiCards({ kpis, onFilterReview, onFilterBlocked }: TrustKpiCardsProps) {
  const isHighAverageScore = kpis.averageScoreToday > 40;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full text-left">
      
      {/* Score Médio */}
      <div className={cn(
        "bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4 shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[110px]",
        isHighAverageScore && "border-red-200 bg-red-50/10"
      )}>
        <div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Score médio hoje</span>
          <span className={cn(
            "text-2xl font-black block mt-1",
            kpis.averageScoreToday < 40 ? "text-emerald-600" : kpis.averageScoreToday < 70 ? "text-amber-500" : "text-red-600"
          )}>
            {kpis.averageScoreToday}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400 mt-1">
          <span className={cn(
            "px-1 py-0.2 rounded text-[8.5px] font-black uppercase",
            kpis.averageScoreDelta < 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          )}>
            {kpis.averageScoreDelta < 0 ? '' : '+'}{kpis.averageScoreDelta}
          </span>
          <span>vs ontem</span>
        </div>
      </div>

      {/* Aprovados */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4 shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[110px]">
        <div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Aprovados</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {kpis.approvedCount.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400 mt-1">
          <span className="bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded text-[8.5px] font-black uppercase">
            +{kpis.approvedDelta}%
          </span>
          <span>aprovados</span>
        </div>
      </div>

      {/* Em revisão */}
      <div 
        onClick={onFilterReview}
        className={cn(
          "bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4 shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[110px] cursor-pointer transition-all hover:bg-slate-50/50",
          kpis.inReviewCount > 0 && "border-amber-250 bg-amber-50/20 animate-pulse-subtle"
        )}
      >
        <div>
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Em revisão</span>
            {kpis.inReviewCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
            )}
          </div>
          <span className={cn(
            "text-2xl font-black block mt-1",
            kpis.inReviewCount > 0 ? "text-amber-600" : "text-slate-900"
          )}>
            {kpis.inReviewCount}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400 mt-1">
          <span className="bg-amber-50 text-amber-700 px-1 py-0.2 rounded text-[8.5px] font-black uppercase">
            +{kpis.inReviewDelta} novos
          </span>
          <span>revisões humanas</span>
        </div>
      </div>

      {/* Bloqueados */}
      <div 
        onClick={onFilterBlocked}
        className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4 shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[110px] cursor-pointer transition-all hover:bg-slate-50/50"
      >
        <div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Bloqueados</span>
          <span className="text-2xl font-black text-red-655 block mt-1">
            {kpis.blockedCount}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400 mt-1">
          <span className="bg-red-50 text-red-750 px-1 py-0.2 rounded text-[8.5px] font-black uppercase">
            {kpis.blockedDelta} evitado
          </span>
          <span>vs ontem</span>
        </div>
      </div>

      {/* Chargebacks evitados */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4 shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[110px] border-violet-250 bg-violet-50/10">
        <div>
          <span className="text-[9px] font-black uppercase text-violet-750 tracking-wider block font-black">Chargebacks evitados</span>
          <span className="text-2xl font-black text-violet-755 block mt-1">
            {kpis.chargebacksAvoided}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400 mt-1">
          <span className="bg-violet-50 text-violet-750 px-1 py-0.2 rounded text-[8.5px] font-black uppercase">
            +{kpis.chargebacksAvoidedDelta} este mês
          </span>
          <span>salvos pelo motor</span>
        </div>
      </div>

    </div>
  );
}
