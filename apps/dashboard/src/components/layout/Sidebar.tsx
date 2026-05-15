'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Cpu, CreditCard, ShoppingBag, 
  Package, Banknote, Webhook, Shield, Settings 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { href: '/',           icon: LayoutDashboard, label: 'Visão Geral' },
  { href: '/systems',    icon: Cpu,             label: 'Sistemas'    },
  { href: '/gateways',   icon: CreditCard,      label: 'Gateways'    },
  { href: '/checkouts',  icon: ShoppingBag,     label: 'Checkouts'   },
  { href: '/orders',     icon: Package,         label: 'Vendas'      },
  { href: '/payments',   icon: Banknote,        label: 'Pagamentos'  },
  { href: '/webhooks',   icon: Webhook,         label: 'Webhooks'    },
  { href: '/audit',      icon: Shield,          label: 'Auditoria'   },
  { href: '/settings',   icon: Settings,        label: 'Configurações'},
];

function SidebarItem({ href, icon: Icon, label, active }: any) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active 
          ? "bg-brand/10 text-brand font-medium" 
          : "text-ink-muted hover:text-ink hover:bg-surface-raised"
      )}
    >
      <Icon size={20} className={active ? "text-brand" : "text-ink-subtle"} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-full flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="font-bold text-xl text-ink flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-brand flex items-center justify-center text-white">
            B
          </div>
          Basileia <span className="text-brand">Pay</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <SidebarItem
              key={item.href}
              {...item}
              active={active}
            />
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        {/* Company Badge, ThemeToggle, UserMenu */}
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center border border-border">
            <span className="text-sm font-medium">VR</span>
          </div>
          <div>
            <div className="text-sm font-medium text-ink">Minha Empresa</div>
            <div className="text-xs text-ink-subtle">Plano Pro</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
