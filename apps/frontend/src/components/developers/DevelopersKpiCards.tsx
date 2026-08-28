'use client';

import { Key, Activity, Percent, Webhook, FlaskConical, TrendingUp, Sparkles } from 'lucide-react';
import { DeveloperSummary } from '@/types/developers';
import { cn } from '@/lib/utils';

interface DevelopersKpiCardsProps {
  summary: DeveloperSummary;
  onFilterTab?: (tab: any) => void;
}

export function DevelopersKpiCards({ summary, onFilterTab }: DevelopersKpiCardsProps) {
  // Check success rate color
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99) return { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', ring: 'bg-emerald-500' };
    if (rate >= 95) return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-500', ring: 'bg-amber-400' };
    return { bg: 'bg-red-50 border-red-100', text: 'text-red-655', ring: 'bg-red-500' };
  };

  const rateColors = getSuccessRateColor(summary.successRate24h);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 text-left">
      
      {/* 1. API Keys */}
      <div 
        onClick={() => onFilterTab?.('api-keys')}
        className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 hover:shadow-md hover:border-brand/40 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            API Keys Ativas
          </span>
          <div className="w-7 h-7 bg-slate-50 text-slate-450 border border-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors shrink-0">
            <Key className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-slate-800 leading-none">
            {summary.apiKeysActive}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9.5px] font-bold text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 font-extrabold">+2 chaves</span> este mês
          </div>
        </div>
      </div>

      {/* 2. Chamadas API 24h */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Chamadas API (24h)
          </span>
          <div className="w-7 h-7 bg-slate-50 text-slate-450 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-slate-800 leading-none">
            {summary.apiCalls24h.toLocaleString('pt-BR')}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9.5px] font-bold text-slate-400">
            <span className="text-emerald-600 font-extrabold">+8.2%</span> vs ontem
            
            {/* Tiny modern sparkline */}
            <div className="ml-auto flex items-end gap-[1px] h-3">
              {[3, 6, 4, 8, 5, 9, 7].map((h, i) => (
                <span 
                  key={i} 
                  className="w-[2px] bg-brand/30 group-hover:bg-brand/50 transition-colors rounded-full" 
                  style={{ height: `${h * 10}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Taxa de Sucesso */}
      <div className={cn("border rounded-[22px] p-4.5 transition-all flex flex-col justify-between", rateColors.bg)}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Taxa de Sucesso
          </span>
          <div className={cn("w-7 h-7 border rounded-lg flex items-center justify-center shrink-0 bg-white/80", rateColors.text)}>
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-slate-800 leading-none">
            {summary.successRate24h}%
          </h4>
          <div className="flex items-center gap-1.5 mt-1.5 text-[9.5px] font-bold text-slate-400">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", rateColors.ring)} />
              <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", rateColors.ring)} />
            </span>
            <span className={cn("font-extrabold", rateColors.text)}>Respostas saudáveis 2xx</span>
          </div>
        </div>
      </div>

      {/* 4. Webhooks Ativos */}
      <div 
        onClick={() => onFilterTab?.('webhooks')}
        className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 hover:shadow-md hover:border-brand/40 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Webhooks Ativos
          </span>
          <div className="w-7 h-7 bg-slate-50 text-slate-450 border border-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors shrink-0">
            <Webhook className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-slate-800 leading-none">
            {summary.activeWebhooks}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9.5px] font-bold text-slate-400">
            <span className="text-violet-600 font-extrabold">+3 novos</span> esta semana
          </div>
        </div>
      </div>

      {/* 5. Sandbox Requests */}
      <div 
        onClick={() => onFilterTab?.('sandbox')}
        className="bg-violet-50/30 border border-violet-100/50 rounded-[22px] p-4.5 hover:shadow-md hover:border-violet-300/40 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-violet-750/80 tracking-wider">
            Sandbox Requests
          </span>
          <div className="w-7 h-7 bg-white text-violet-650 border border-violet-150 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-violet-100/50">
            <FlaskConical className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-violet-850 leading-none">
            {summary.sandboxRequests24h.toLocaleString('pt-BR')}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9.5px] font-bold text-violet-500">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="font-extrabold">+21.4%</span> vs semana anterior
          </div>
        </div>
      </div>

    </div>
  );
}
