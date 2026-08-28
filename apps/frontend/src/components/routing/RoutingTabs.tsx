'use client';

import { cn } from '@/lib/utils';

export type RoutingTabValue = 'rules' | 'fallbacks' | 'retries' | 'history';

interface RoutingTabsProps {
  activeTab: RoutingTabValue;
  onTabChange: (tab: RoutingTabValue) => void;
  activeRulesCount: number;
  fallbacksCount: number;
  retriesCount?: number;
}

export function RoutingTabs({ activeTab, onTabChange, activeRulesCount, fallbacksCount, retriesCount = 6 }: RoutingTabsProps) {
  return (
    <div className="flex overflow-x-auto no-scrollbar shrink-0">
      <div className="flex gap-1">
        
        {/* Regras */}
        <button
          onClick={() => onTabChange('rules')}
          className={cn(
            "relative pb-3 pt-1 px-3 text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer -mb-[1px] flex items-center gap-1.5",
            activeTab === 'rules'
              ? "text-brand border-b-2 border-brand font-black"
              : "text-slate-400 hover:text-slate-700 font-semibold"
          )}
        >
          <span>Regras</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-normal leading-none shrink-0",
            activeTab === 'rules' ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-400"
          )}>
            {activeRulesCount}
          </span>
        </button>

        {/* Fallbacks */}
        <button
          onClick={() => onTabChange('fallbacks')}
          className={cn(
            "relative pb-3 pt-1 px-3 text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer -mb-[1px] flex items-center gap-1.5",
            activeTab === 'fallbacks'
              ? "text-brand border-b-2 border-brand font-black"
              : "text-slate-400 hover:text-slate-700 font-semibold"
          )}
        >
          <span>Fallbacks</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-normal leading-none shrink-0",
            activeTab === 'fallbacks' ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-400"
          )}>
            {fallbacksCount}
          </span>
        </button>

        {/* Smart Retries */}
        <button
          onClick={() => onTabChange('retries')}
          className={cn(
            "relative pb-3 pt-1 px-3 text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer -mb-[1px] flex items-center gap-1.5",
            activeTab === 'retries'
              ? "text-brand border-b-2 border-brand font-black"
              : "text-slate-400 hover:text-slate-700 font-semibold"
          )}
        >
          <span>Smart Retries</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-normal leading-none shrink-0",
            activeTab === 'retries' ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-400"
          )}>
            {retriesCount} ativas
          </span>
        </button>

        {/* Histórico */}
        <button
          onClick={() => onTabChange('history')}
          className={cn(
            "relative pb-3 pt-1 px-3 text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer -mb-[1px] flex items-center gap-1.5",
            activeTab === 'history'
              ? "text-brand border-b-2 border-brand font-black"
              : "text-slate-400 hover:text-slate-700 font-semibold"
          )}
        >
          <span>Histórico</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-normal leading-none shrink-0",
            activeTab === 'history' ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-400"
          )}>
            Últimas 24h
          </span>
        </button>

      </div>
    </div>
  );
}

