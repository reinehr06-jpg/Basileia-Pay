'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  ShieldCheck, 
  ShoppingCart, 
  Receipt, 
  Webhook, 
  Shuffle, 
  Lock, 
  ClipboardList, 
  Code2, 
  Settings,
  HelpCircle,
  Building2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Visão Geral', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Sistemas', icon: Layers, href: '/dashboard/systems' },
  { name: 'Checkouts', icon: CreditCard, href: '/dashboard/checkouts' },
  { name: 'Gateways', icon: ShieldCheck, href: '/dashboard/gateways' },
  { name: 'Vendas', icon: ShoppingCart, href: '/dashboard/orders' },
  { name: 'Pagamentos', icon: Receipt, href: '/dashboard/payments' },
  { name: 'Webhooks', icon: Webhook, href: '/dashboard/webhooks' },
  { name: 'Roteamento', icon: Shuffle, href: '/dashboard/routing' },
  { name: 'Trust Layer', icon: Lock, href: '/dashboard/trust' },
  { name: 'Auditoria', icon: ClipboardList, href: '/dashboard/audit' },
  { name: 'Desenvolvedores', icon: Code2, href: '/dashboard/developers' },
  { name: 'Segurança', icon: ShieldCheck, href: '/dashboard/security' },
  { name: 'Configurações', icon: Settings, href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] h-screen bg-surface border-r border-border flex flex-col z-20">
      {/* Brand */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
          <span className="text-white font-bold text-2xl">B</span>
        </div>
        <div>
          <h1 className="text-ink font-bold text-xl leading-tight">Basileia</h1>
          <p className="text-muted text-xs font-medium tracking-wide">PAY</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive 
                    ? "bg-gradient-to-br from-brand to-brand-accent text-white shadow-lg shadow-brand/30 scale-[1.02]" 
                    : "text-slate hover:bg-brand-soft hover:text-brand"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
                )}
                <item.icon className={cn(
                  "w-5 h-5 transition-colors relative z-10",
                  isActive ? "text-white" : "text-muted group-hover:text-brand"
                )} />
                <span className="font-semibold text-[15px] relative z-10">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/70 relative z-10" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background/50">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center">
              <Building2 className="w-5 h-5 text-brand" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-ink truncate">Basileia Church</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <p className="text-[10px] font-bold text-success uppercase tracking-wider">Produção</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted" />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 text-muted hover:text-brand transition-colors text-sm font-medium">
            <HelpCircle className="w-4 h-4" />
            Suporte & Documentação
          </button>
        </div>
      </div>
    </aside>
  );
}
