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
    <aside className="w-[280px] h-screen p-3 flex flex-col z-20 shrink-0">
      <div className="flex-1 bg-white/70 backdrop-blur-xl border border-border rounded-[20px] flex flex-col overflow-hidden shadow-xl shadow-brand/5">
        {/* Brand - More compact */}
        <div className="p-5 pb-1 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-accent rounded-lg flex items-center justify-center shadow-lg shadow-brand/20">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <span className="text-ink font-black text-[16px] tracking-tight">Basileia Pay</span>
        </div>

        {/* Nav - Denser */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar space-y-5">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              <p className="px-3 text-[9px] font-black text-slate uppercase tracking-widest mb-1.5 opacity-40">
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
                        "group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-300 relative overflow-hidden",
                        isActive 
                          ? "bg-gradient-to-r from-brand to-brand-accent text-white shadow-md shadow-brand/20 h-[44px]" 
                          : item.isSpecial && pathname.startsWith(item.href)
                            ? "bg-brand text-white shadow-md shadow-brand/20 h-[44px]"
                            : "text-slate hover:bg-brand-soft hover:text-brand h-[42px]"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors relative z-10",
                        isActive ? "text-white" : "text-slate/50 group-hover:text-brand"
                      )} />
                      <span className={cn(
                        "font-bold text-[12.5px] relative z-10",
                        isActive ? "text-white" : "text-slate"
                      )}>
                        {item.name}
                      </span>
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto text-white/70 relative z-10" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Ambiente / Status Block - Very compact */}
        <div className="p-3 bg-brand-soft/20 border-t border-border/50">
          <p className="px-1 text-[9px] font-black text-slate uppercase tracking-widest mb-2 opacity-40">
            AMBIENTE
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/80 rounded-lg border border-border shadow-sm group cursor-pointer hover:border-brand/30 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_6px_rgba(22,163,74,0.5)]" />
                <span className="text-[10px] font-bold text-ink">Produção</span>
              </div>
              <ChevronRight className="w-2.5 h-2.5 text-muted/50" />
            </div>

            <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/80 rounded-lg border border-border shadow-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-brand opacity-50" />
                <span className="text-[10px] font-bold text-ink">São Paulo (BR)</span>
              </div>
            </div>

            <div className="px-2.5 py-2 bg-white/80 rounded-lg border border-border shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1.5">
                   <ShieldCheck className="w-3 h-3 text-success opacity-70" />
                   <span className="text-[10px] font-bold text-ink">Saúde</span>
                 </div>
                 <span className="text-[9px] font-black text-success">99,95%</span>
              </div>
              <div className="flex items-center justify-between pt-0.5 border-t border-border/20">
                 <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">1 min atrás</span>
                 <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 flex justify-center border-t border-border/50 shrink-0">
           <button className="p-2 text-muted/40 hover:text-brand hover:bg-brand-soft rounded-lg transition-all">
             <Monitor className="w-4 h-4" />
           </button>
        </div>
      </div>
    </aside>
  );
}
