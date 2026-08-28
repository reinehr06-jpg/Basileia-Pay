'use client';

import { cn } from '@/lib/utils';

export type DeveloperTabValue = 'overview' | 'api-keys' | 'docs' | 'sandbox' | 'webhooks' | 'logs';

interface DevelopersTabsProps {
  activeTab: DeveloperTabValue;
  onTabChange: (tab: DeveloperTabValue) => void;
  activeKeysCount: number;
  activeWebhooksCount: number;
}

export function DevelopersTabs({
  activeTab,
  onTabChange,
  activeKeysCount,
  activeWebhooksCount,
}: DevelopersTabsProps) {
  interface TabItem {
    id: DeveloperTabValue;
    label: string;
    badge?: string | number;
    badgeColor?: string;
  }

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'api-keys', label: 'API Keys', badge: activeKeysCount, badgeColor: 'bg-violet-100 text-violet-700 font-extrabold' },
    { id: 'docs', label: 'Docs API' },
    { id: 'sandbox', label: 'Sandbox', badge: 'Testes', badgeColor: 'bg-blue-500 text-white font-black animate-pulse' },
    { id: 'webhooks', label: 'Webhooks', badge: activeWebhooksCount, badgeColor: 'bg-slate-100 text-slate-650 font-bold' },
    { id: 'logs', label: 'Logs Técnicos', badge: 'Erros: 0.02%', badgeColor: 'bg-emerald-50 text-emerald-600 font-extrabold' },
  ];

  return (
    <div className="flex flex-wrap gap-1 md:gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
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
                "px-1.5 py-0.5 rounded-full text-[8.5px] leading-none uppercase tracking-wide",
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
