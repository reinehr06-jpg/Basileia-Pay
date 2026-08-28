'use client';

import { cn } from '@/lib/utils';

export type SecurityTabValue = 'users' | 'roles' | 'sessions' | '2fa' | 'password' | 'ips' | 'activity' | 'lgpd';

interface SecurityTabsProps {
  activeTab: SecurityTabValue;
  onTabChange: (tab: SecurityTabValue) => void;
  usersCount: number;
  sessionsCount: number;
  allowlistCount: number;
  criticalEventsCount: number;
}

export function SecurityTabs({
  activeTab,
  onTabChange,
  usersCount,
  sessionsCount,
  allowlistCount,
  criticalEventsCount,
}: SecurityTabsProps) {
  interface TabItem {
    id: SecurityTabValue;
    label: string;
    badge?: string | number;
    badgeColor?: string;
  }

  const tabs: TabItem[] = [
    { id: 'users', label: 'Usuários', badge: usersCount, badgeColor: 'bg-violet-100 text-violet-750 font-extrabold' },
    { id: 'roles', label: 'Papéis & Escopos' },
    { id: 'sessions', label: 'Sessões Ativas', badge: sessionsCount, badgeColor: sessionsCount > 10 ? 'bg-amber-100 text-amber-700 animate-pulse font-black' : 'bg-slate-100 text-slate-600 font-bold' },
    { id: '2fa', label: 'Políticas 2FA', badge: 'Ativo', badgeColor: 'bg-emerald-50 text-emerald-600 font-black' },
    { id: 'password', label: 'Política de Senha' },
    { id: 'ips', label: 'Allowlist IP', badge: allowlistCount, badgeColor: 'bg-slate-100 text-slate-650' },
    { id: 'activity', label: 'Eventos Segurança', badge: `${criticalEventsCount} logs`, badgeColor: criticalEventsCount > 50 ? 'bg-red-50 text-red-600 font-black' : 'bg-slate-150 text-slate-500 font-bold' },
    { id: 'lgpd', label: 'Privacidade LGPD', badge: 'Strict', badgeColor: 'bg-indigo-50 text-indigo-650 font-black' }
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

