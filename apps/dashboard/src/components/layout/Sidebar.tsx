"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Server, 
  LayoutTemplate, 
  CreditCard, 
  ShoppingCart, 
  Wallet, 
  Webhook, 
  GitBranch, 
  ShieldCheck, 
  History, 
  Settings,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { clsx } from "clsx";

const menuItems = [
  { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sistemas", href: "/dashboard/systems", icon: Server },
  { name: "Checkouts", href: "/dashboard/checkouts", icon: LayoutTemplate },
  { name: "Gateways", href: "/dashboard/gateways", icon: CreditCard },
  { name: "Vendas", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Pagamentos", href: "/dashboard/payments", icon: Wallet },
  { name: "Webhooks", href: "/dashboard/webhooks", icon: Webhook },
  { name: "Roteamento", href: "/dashboard/routing", icon: GitBranch },
  { name: "Trust Layer", href: "/dashboard/trust", icon: ShieldCheck },
  { name: "Auditoria", href: "/dashboard/audit", icon: History },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-line flex flex-col z-20 transition-colors">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-line">
        <div className="flex items-center gap-2 text-brand-primary">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-lg">
            B
          </div>
          <span className="font-bold text-xl tracking-tight text-ink">Basileia Pay</span>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-brand-soft text-brand-primary" 
                    : "text-muted hover:bg-background hover:text-ink"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-brand-primary" : "text-muted group-hover:text-ink")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-line">
        <button className="flex items-center gap-2 text-sm text-muted hover:text-ink w-full px-2 py-2 transition-colors">
          <HelpCircle className="w-4 h-4 text-muted" />
          Central de Ajuda
        </button>
        <div className="mt-4 px-2 py-3 bg-background border border-line rounded-lg flex items-center gap-3 cursor-pointer hover:border-brand-primary/30 transition-all group">
          <div className="w-8 h-8 rounded bg-brand-deep text-white flex items-center justify-center text-xs font-bold">
            AC
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate text-ink">Acme Corp</span>
            <span className="text-[10px] text-muted uppercase tracking-wider font-bold">Produção</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted group-hover:text-brand-primary transition-colors" />
        </div>
      </div>
    </aside>
  );
}
