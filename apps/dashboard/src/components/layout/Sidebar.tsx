'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard, 
  Repeat, 
  Zap,
  Activity,
  ClipboardList,
  Settings,
  ChevronRight,
  ShieldCheck,
  Globe,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuGroups = [
  {
    title: 'HUB EXECUTIVO',
    items: [
      { name: 'Visão Geral', icon: LayoutDashboard, href: '/dashboard' },
      { name: 'Transações', icon: ShoppingCart, href: '/dashboard/orders' },
      { name: 'Checkouts', icon: CreditCard, href: '/dashboard/checkouts' },
      { name: 'Assinaturas', icon: Repeat, href: '/dashboard/subscriptions' },
      { name: 'Automações', icon: Zap, href: '/dashboard/automations' },
    ]
  },
  {
    title: 'OPERAÇÕES',
    items: [
      { name: 'Operações', icon: Activity, href: '/dashboard/operations' },
    ]
  },
  {
    title: 'AUDITORIA',
    items: [
      { name: 'Auditoria', icon: ClipboardList, href: '/dashboard/audit' },
      { name: 'Configurações', icon: Settings, href: '/dashboard/settings', isSpecial: true },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] h-screen p-4 flex flex-col z-20">
      <div className="flex-1 bg-white/70 backdrop-blur-xl border border-border rounded-[24px] flex flex-col overflow-hidden shadow-xl shadow-brand/5">
        {/* Brand */}
        <div className="p-6 pb-2 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-brand to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
            <span className="text-white font-black text-xl">B</span>
          </div>
          <span className="text-ink font-black text-lg tracking-tight">Basileia Pay</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 no-scrollbar space-y-6">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-4 text-[10px] font-black text-slate uppercase tracking-widest mb-2 opacity-50">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                        isActive 
                          ? "bg-gradient-to-r from-brand to-brand-accent text-white shadow-lg shadow-brand/30" 
                          : item.isSpecial && pathname.startsWith(item.href)
                            ? "bg-brand text-white shadow-lg shadow-brand/30"
                            : "text-slate hover:bg-brand-soft hover:text-brand"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors relative z-10",
                        isActive ? "text-white" : "text-slate/60 group-hover:text-brand"
                      )} />
                      <span className={cn(
                        "font-bold text-[13px] relative z-10",
                        isActive ? "text-white" : "text-slate"
                      )}>
                        {item.name}
                      </span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/70 relative z-10" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Ambiente / Status Block */}
        <div className="p-4 bg-brand-soft/30 border-t border-border/50">
          <p className="px-2 text-[10px] font-black text-slate uppercase tracking-widest mb-3 opacity-50">
            AMBIENTE
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-white/80 rounded-xl border border-border shadow-sm group cursor-pointer hover:border-brand/30 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
                <span className="text-[11px] font-bold text-ink">Produção</span>
              </div>
              <ChevronRight className="w-3 h-3 text-muted" />
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-white/80 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-brand opacity-60" />
                <span className="text-[11px] font-bold text-ink">São Paulo (BR)</span>
              </div>
            </div>

            <div className="px-3 py-2.5 bg-white/80 rounded-xl border border-border shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <ShieldCheck className="w-3.5 h-3.5 text-success opacity-80" />
                   <span className="text-[11px] font-bold text-ink">Saúde da Plataforma</span>
                 </div>
                 <span className="text-[10px] font-black text-success">99,95%</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                 <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">Última verificação: há 1 min</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Collapse Toggle */}
        <div className="p-4 flex justify-center border-t border-border/50">
           <button className="p-2 text-muted hover:text-brand hover:bg-brand-soft rounded-lg transition-all">
             <Monitor className="w-4 h-4" />
           </button>
        </div>
      </div>
    </aside>
  );
}
