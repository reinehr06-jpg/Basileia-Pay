'use client';

import { GitBranch, Landmark, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RoutingKpi } from '@/types/routing';
import { cn } from '@/lib/utils';

interface RoutingKpiCardsProps {
  kpis: RoutingKpi;
  onFilterConflict: () => void;
  onFilterActive: () => void;
}

export function RoutingKpiCards({ kpis, onFilterConflict, onFilterActive }: RoutingKpiCardsProps) {
  const hasConflicts = kpis.conflictsCount > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      
      {/* Regras Ativas */}
      <div 
        onClick={onFilterActive}
        className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-[18px] shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[120px] text-left cursor-pointer hover:border-brand/40 hover:shadow-brand/5 transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
            Regras ativas
          </span>
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-650 border border-violet-100 flex items-center justify-center shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[22px] font-black text-slate-900 leading-none block">
            {kpis.activeRulesCount}
          </span>
          <span className="text-[9.5px] font-black text-emerald-600 block mt-1 uppercase tracking-tight">
            +{kpis.activeRulesDelta} esta semana
          </span>
        </div>
      </div>

      {/* Gateways no Pool */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-[18px] shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[120px] text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
            Gateways no pool
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[22px] font-black text-slate-900 leading-none block">
            {kpis.gatewaysInPool}
          </span>
          <span className="text-[9.5px] font-bold text-slate-400 block mt-1 uppercase tracking-tight">
            Provedores ativos
          </span>
        </div>
      </div>

      {/* Decisões Hoje */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-[18px] shadow-sm shadow-slate-100/50 flex flex-col justify-between min-h-[120px] text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
            Decisões hoje
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-[22px] font-black text-slate-900 leading-none block">
            {kpis.decisionsToday.toLocaleString('pt-BR')}
          </span>
          <span className="text-[9.5px] font-black text-emerald-600 block mt-1 uppercase tracking-tight">
            +{kpis.decisionsTodayDelta}% vs ontem
          </span>
        </div>
      </div>

      {/* Conflitos Detectados */}
      <div 
        onClick={hasConflicts ? onFilterConflict : undefined}
        className={cn(
          "border rounded-[22px] p-[18px] shadow-sm flex flex-col justify-between min-h-[120px] text-left transition-all",
          hasConflicts 
            ? "bg-red-50/20 border-red-200/80 shadow-red-50/20 cursor-pointer hover:border-red-400/80 hover:shadow-red-50/40" 
            : "bg-white border-[#E8DDFD]/65 shadow-slate-100/50"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">
            Conflitos detectados
          </span>
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0",
            hasConflicts 
              ? "bg-red-50 text-red-600 border-red-100" 
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
            {hasConflicts ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-3">
          <span className={cn(
            "text-[22px] font-black leading-none block",
            hasConflicts ? "text-red-655" : "text-slate-900"
          )}>
            {kpis.conflictsCount}
          </span>
          {hasConflicts ? (
            <span className="text-[9.5px] font-black text-red-600 block mt-1 uppercase tracking-tight animate-pulse">
              🔴 requer atenção
            </span>
          ) : (
            <span className="text-[9.5px] font-black text-emerald-600 block mt-1 uppercase tracking-tight">
              🟢 sistema estável
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
