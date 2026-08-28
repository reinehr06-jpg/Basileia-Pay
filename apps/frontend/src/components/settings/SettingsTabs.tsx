'use client';

import { cn } from '@/lib/utils';

export type SettingsTabValue = 'all' | 'company' | 'security' | 'integrations' | 'operation' | 'financial' | 'system';

interface SettingsTabsProps {
  activeTab: SettingsTabValue;
  onTabChange: (tab: SettingsTabValue) => void;
}

const tabsList: { value: SettingsTabValue; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'company', label: 'Empresa' },
  { value: 'security', label: 'Segurança' },
  { value: 'integrations', label: 'Integrações' },
  { value: 'operation', label: 'Operação' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'system', label: 'Sistema' },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex overflow-x-auto no-scrollbar shrink-0">
      <div className="flex gap-1">
        {tabsList.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "relative pb-3 pt-1 px-3 text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer -mb-[1px]",
                isActive
                  ? "text-brand border-b-2 border-brand font-black"
                  : "text-slate-400 hover:text-slate-700 font-semibold"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
