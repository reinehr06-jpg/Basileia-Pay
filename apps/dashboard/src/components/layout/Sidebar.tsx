'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Monitor,
  ShoppingCart, 
  CreditCard, 
  Users,
  Repeat,
  BarChart3,
  Bell,
  Activity,
  Zap,
  ClipboardList,
  FileText,
  Settings,
  ChevronRight,
  ShieldCheck,
  Globe,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuGroups = [
  {
    title: 'HUB EXECUTIVO',
    items: [
      { name: 'Visão Geral', icon: LayoutDashboard, href: '/dashboard' },
      { name: 'Sistemas', icon: Monitor, href: '/dashboard/systems' },
      { name: 'Transações', icon: ShoppingCart, href: '/dashboard/orders' },
      { name: 'Checkouts', icon: CreditCard, href: '/dashboard/checkouts' },
      { name: 'Clientes', icon: Users, href: '/dashboard/clients' },
      { name: 'Assinaturas', icon: Repeat, href: '/dashboard/subscriptions' },
      { name: 'Relatórios', icon: BarChart3, href: '/dashboard/reports' },
      { name: 'Alertas', icon: Bell, href: '/dashboard/alerts' },
    ]
  },
  {
    title: 'OPERAÇÕES',
    items: [
      { name: 'Operações', icon: Activity, href: '/dashboard/operations' },
      { name: 'Webhooks', icon: Zap, href: '/dashboard/webhooks' },
    ]
  },
  {
    title: 'AUDITORIA',
    items: [
      { name: 'Auditoria', icon: ClipboardList, href: '/dashboard/audit' },
      { name: 'Logs', icon: FileText, href: '/dashboard/logs' },
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[228px] 2xl:w-[260px] h-screen p-2 2xl:p-3 flex flex-col z-20 shrink-0 transition-all duration-300">
      <div className="flex-1 bg-white/70 backdrop-blur-xl border border-border rounded-[24px] flex flex-col overflow-hidden shadow-2xl shadow-brand/5">
        {/* Brand */}
        <div className="p-5 pb-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
            <span className="text-white font-black text-lg">B</span>
          </div>
          <span className="text-ink font-black text-[17px] tracking-tight">Basileia Pay</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 no-scrollbar space-y-5">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[9px] font-black text-slate uppercase tracking-widest mb-2 opacity-30">
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
                        "group flex items-center gap-3 px-3 py-2 2xl:py-2.5 rounded-xl transition-all duration-300 relative h-[40px] 2xl:h-[44px]",
                        isActive 
                          ? "bg-gradient-to-r from-brand to-brand-accent text-white shadow-lg shadow-brand/20" 
                          : "text-slate hover:bg-brand-soft hover:text-brand"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-white" : "text-slate/40 group-hover:text-brand"
                      )} />
                      <span className={cn(
                        "font-bold text-[12.5px]",
                        isActive ? "text-white" : "text-slate"
                      )}>
                        {item.name}
                      </span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Configurações at bottom of nav */}
          <div className="pt-2">
            <Link
              href="/dashboard/settings"
              className={cn(
                "group flex items-center gap-3 px-3 py-2 2xl:py-2.5 rounded-xl transition-all duration-300 h-[40px] 2xl:h-[44px]",
                pathname.startsWith('/dashboard/settings')
                  ? "bg-gradient-to-r from-brand to-brand-accent text-white shadow-lg shadow-brand/20"
                  : "text-slate hover:bg-brand-soft hover:text-brand"
              )}
            >
              <Settings className={cn(
                "w-4 h-4 transition-colors",
                pathname.startsWith('/dashboard/settings') ? "text-white" : "text-slate/40 group-hover:text-brand"
              )} />
              <span className={cn(
                "font-bold text-[12.5px]",
                pathname.startsWith('/dashboard/settings') ? "text-white" : "text-slate"
              )}>
                Configurações
              </span>
              {pathname.startsWith('/dashboard/settings') && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/70" />}
            </Link>
          </div>
        </nav>

        {/* RESUMO Block */}
        <div className="p-4 bg-brand-soft/20 border-t border-border/50 space-y-3">
          <p className="px-1 text-[9px] font-black text-slate uppercase tracking-widest opacity-30">
            RESUMO
          </p>
          <div className="space-y-2">
            {[
              { label: 'Operacionais', count: 6, color: 'bg-success' },
              { label: 'Atenção', count: 1, color: 'bg-warning' },
              { label: 'Instáveis', count: 1, color: 'bg-danger' },
              { label: 'Desconectados', count: 1, color: 'bg-slate/30' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-1.5 h-1.5 rounded-full", s.color)} />
                  <span className="text-[11px] font-bold text-ink/70">{s.label}</span>
                </div>
                <span className="text-[11px] font-black text-ink">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Toggle */}
        <div className="p-3 border-t border-border/50">
           <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-slate/30 hover:text-brand hover:bg-brand-soft transition-all">
             <ChevronLeft className="w-4 h-4" />
           </button>
        </div>
      </div>
    </aside>
  );
}
