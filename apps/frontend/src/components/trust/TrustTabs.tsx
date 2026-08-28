'use client';

import { cn } from '@/lib/utils';

export type TrustTabValue = 'overview' | 'rules' | 'events' | 'score' | 'review';

interface TrustTabsProps {
  activeTab: TrustTabValue;
  onTabChange: (tab: TrustTabValue) => void;
  activeRulesCount: number;
  criticalEventsCount: number;
  pendingReviewCount: number;
}

export function TrustTabs({
  activeTab,
  onTabChange,
  activeRulesCount,
  criticalEventsCount,
  pendingReviewCount,
}: TrustTabsProps) {
  interface TabItem {
    id: TrustTabValue;
    label: string;
    badge?: number;
    badgeColor?: string;
  }

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'rules', label: 'Regras', badge: activeRulesCount, badgeColor: 'bg-violet-100 text-violet-700' },
    { id: 'events', label: 'Eventos', badge: criticalEventsCount, badgeColor: 'bg-red-50 text-red-600' },
    { id: 'score', label: 'Score' },
    { id: 'review', label: 'Revisão manual', badge: pendingReviewCount, badgeColor: pendingReviewCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500' },
  ];

  return (
    <div className="flex flex-wrap gap-1 md:gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TrustTabValue)}
            className={cn(
              "flex items-center gap-1.5 pb-2.5 px-3 text-[11px] font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] cursor-pointer",
              isActive 
                ? "border-brand text-brand font-black" 
                : "border-transparent text-slate-400 hover:text-slate-700 font-bold"
            )}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[8.5px] font-black leading-none",
                tab.badgeColor
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
