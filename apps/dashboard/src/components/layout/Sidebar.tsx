'use client';

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Monitor,
  ShoppingCart, 
  CreditCard, 
  Repeat, 
  Activity,
  Zap,
  ChevronRight,
  Globe,
  Terminal,
  Settings2,
  GitBranch,
  Code2,
  Bell,
  Users,
  BarChart3,
  Shield,
  ChevronLeft,
  HelpCircle,
  Wallet,
  Landmark,
  ShieldAlert,
  Link as LinkIcon,
  Network,
  PieChart,
  ArrowRightLeft,
  ChevronDown,
  LogOut
} from "lucide-react";
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api';

type NavSubItem = {
  label: string;
  href: string;
  exact?: boolean;
};

type NavItem = {
  label: string;
  icon: React.ElementType;
  href?: string;
  isAccordion?: boolean;
  subItems?: NavSubItem[];
};

const navSections = [
  {
    title: 'GESTÃO COMERCIAL',
    items: [
      { label: 'Transações', icon: ArrowRightLeft, href: '/dashboard/orders' },
      { label: 'Clientes', icon: Users, href: '/dashboard/customers' },
      { 
        label: 'Assinaturas', 
        icon: Repeat, 
        isAccordion: true,
        subItems: [
          { label: 'Métricas de Assinatura', href: '/dashboard/subscriptions', exact: true },
          { label: 'Lista de Assinaturas', href: '/dashboard/subscriptions/list' },
        ]
      },
      { 
        label: 'Ferramentas de Venda', 
        icon: ShoppingCart, 
        isAccordion: true,
        subItems: [
          { label: 'Checkouts (Studio)', href: '/dashboard/checkouts' },
          { label: 'Links de Pagamento', href: '/dashboard/payment-links' },
          { label: 'Gestão de Afiliados', href: '/dashboard/affiliates' },
        ]
      },
      { label: 'Relatórios & BI', icon: PieChart, href: '/dashboard/bci' },
    ] as NavItem[]
  },
  {
    title: 'FINANCEIRO',
    items: [
      {
        label: 'Saldo & Extratos',
        icon: Wallet,
        isAccordion: true,
        subItems: [
          { label: 'Meu Saldo', href: '/dashboard/statement' },
          { label: 'Saques', href: '/dashboard/withdrawals' },
          { label: 'Antecipações', href: '/dashboard/anticipations' }
        ]
      },
      { label: 'Conciliação Bancária', icon: Landmark, href: '/dashboard/conciliation' },
      {
        label: 'Risco & Fraude',
        icon: ShieldAlert,
        isAccordion: true,
        subItems: [
          { label: 'Chargebacks', href: '/dashboard/disputes' },
          { label: 'Regras de Prevenção', href: '/dashboard/antifraud' },
          { label: 'Lista Restrita', href: '/dashboard/blocklist' }
        ]
      },
      { label: 'Recuperação (Recovery)', icon: Activity, href: '/recovery' },
    ] as NavItem[]
  },
  {
    title: 'SISTEMA',
    items: [
      {
        label: 'Motor & Integração',
        icon: Terminal,
        isAccordion: true,
        subItems: [
          { label: 'Gateways & Roteamento', href: '/dashboard/gateways' },
          { label: 'Aplicações (Sistemas)', href: '/dashboard/systems' },
          { label: 'Webhooks & API', href: '/dashboard/developers' },
          { label: 'Auditoria de Logs', href: '/dashboard/audit' }
        ]
      },
      { label: 'Configurações', icon: Settings2, href: '/dashboard/settings' },
    ] as NavItem[]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isMaster, logout, activeCompanyId } = useAuth();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Derive active state directly from pathname — no state, no sync bugs
  const isItemActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Auto-open accordion if any sub-item matches current pathname
  useEffect(() => {
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.isAccordion && item.subItems) {
          for (const sub of item.subItems) {
            if (isItemActive(sub.href, sub.exact)) {
              if (!openSubmenus.includes(item.label)) {
                setOpenSubmenus(prev => [...prev, item.label]);
              }
              return;
            }
          }
        }
      }
    }
  }, [pathname]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleSubmenu = (item: string) => {
    setOpenSubmenus(prev => prev.includes(item) ? [] : [item]);
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'owner': return 'Owner';
      case 'admin': return 'Admin';
      default: return role || 'Usuário';
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'BP';

  const sidebarGradient = "linear-gradient(180deg, #14043E 0%, #0F0538 45%, #180B47 100%)";
  const activeGradient = "var(--color-active-item)";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col custom-scrollbar transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[60] ${
        isCollapsed ? "w-[72px]" : "w-[240px]"
      }`}
      style={{
        background: sidebarGradient,
        fontFamily: "var(--font-inter)",
      }}
    >
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col w-full">
        {/* TOPO */}
        <div className="flex items-center justify-between px-3 pt-6 pb-4 relative h-20">
          <Link href="/dashboard" className="flex flex-col overflow-hidden hover:opacity-80 transition-opacity">
            <img 
              src="https://dash.basileia.global/images/logo-basileia.png?0b669f9a5d54a07b37941d0c8db9ac64" 
              alt="Basileia" 
              className={`flex-shrink-0 ml-1 transition-all duration-300 ${
                isCollapsed ? "w-8" : "w-[130px]"
              }`}
              style={{ height: 'auto', filter: 'brightness(0) invert(1)' }}
            />
            <span
              className={`ml-[38px] mt-[-2px] font-[500] text-[12px] tracking-[0.02em] text-text-muted leading-tight transition-all duration-300 ${
                isCollapsed ? "opacity-0 h-0" : "opacity-100"
              }`}
            >
              Payment OS
            </span>
          </Link>
          
          <button
            onClick={toggleSidebar}
            className="absolute right-3 flex items-center justify-center w-7 h-7 rounded-full border border-purple-border text-text-secondary hover:bg-item-hover transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight size={16} strokeWidth={2.4} />
            ) : (
              <ChevronLeft size={16} strokeWidth={2.4} />
            )}
          </button>
        </div>

        {/* Seções de navegação */}
        <div className="flex flex-col px-3 gap-4 mt-2 pb-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-1 w-full">
              <div
                className={`flex items-center gap-2 mb-1 whitespace-nowrap transition-all duration-300 overflow-hidden ${
                  isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto px-2"
                }`}
              >
                <span className="text-[10px] font-[700] text-text-section uppercase tracking-[0.12em]">
                  {section.title}
                </span>
                <div className="flex-grow h-px bg-divider flex items-center justify-end">
                  <div className="w-1 h-1 rounded-full bg-divider-dot"></div>
                </div>
              </div>

              {section.items.map((item, itemIdx) => {
                const isActive = !item.isAccordion && item.href ? isItemActive(item.href) : false;
                const isAccordionOpen = item.isAccordion ? openSubmenus.includes(item.label) : false;

                return (
                  <div key={itemIdx} className="flex flex-col w-full">
                    {item.isAccordion ? (
                      <button
                        type="button"
                        onClick={() => toggleSubmenu(item.label)}
                        title={isCollapsed ? item.label : ""}
                        className="group flex items-center w-full px-[10px] py-[8px] rounded-[8px] cursor-pointer transition-all duration-200 hover:bg-item-hover"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                          <item.icon
                            size={20}
                            strokeWidth={2}
                            className="text-[#F8F7FF]"
                          />
                        </div>
                        
                        <div
                          className={`flex items-center justify-between flex-grow whitespace-nowrap transition-all duration-300 overflow-hidden ${
                            isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"
                          }`}
                        >
                          <span className="font-[600] text-[13px] text-text-primary">
                            {item.label}
                          </span>
                          
                          <ChevronRight
                            size={16}
                            strokeWidth={2.4}
                            className={`text-text-secondary transition-transform duration-300 ${
                              isAccordionOpen ? "rotate-90" : "rotate-0"
                            }`}
                          />
                        </div>
                      </button>
                    ) : (
                      <Link
                        href={item.href!}

                        title={isCollapsed ? item.label : ""}
                        className="group flex items-center w-full px-[10px] py-[8px] rounded-[8px] cursor-pointer transition-all duration-200"
                        style={{
                          background: isActive ? activeGradient : "transparent",
                        }}
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                          <item.icon
                            size={20}
                            strokeWidth={2}
                            className={isActive ? "text-white" : "text-text-secondary group-hover:text-white transition-colors"}
                          />
                        </div>
                        
                        <div
                          className={`flex items-center justify-between flex-grow whitespace-nowrap transition-all duration-300 overflow-hidden ${
                            isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"
                          }`}
                        >
                          <span className={`font-[600] text-[13px] ${isActive ? "text-white" : "text-text-primary"}`}>
                            {item.label}
                          </span>
                        </div>
                      </Link>
                    )}

                    {/* Submenus do accordion */}
                    {item.isAccordion && item.subItems && (
                      <div
                        className={`flex flex-col w-full overflow-hidden transition-all duration-300 ${
                          isAccordionOpen && !isCollapsed ? "max-h-[500px] mt-1" : "max-h-0"
                        }`}
                      >
                        <div className="relative pl-[26px] pr-2 flex flex-col gap-1 w-full">
                          <div className="absolute left-[26px] top-0 bottom-4 w-px bg-divider"></div>
                          
                          {item.subItems.map((subItem, subIdx) => {
                            const isActiveSubItem = isItemActive(subItem.href, subItem.exact);
                            
                            return (
                              <Link
                                key={subIdx}
                                href={subItem.href}
                                className={`relative flex items-center px-3 py-1.5 w-full rounded-[8px] cursor-pointer transition-all duration-200 ml-4 ${
                                  isActiveSubItem ? "" : "hover:bg-item-hover"
                                }`}
                                style={{
                                  background: isActiveSubItem ? activeGradient : "transparent",
                                }}
                              >
                                <div
                                  className={`absolute left-0 w-[4px] h-[4px] rounded-full -ml-[18px] top-1/2 -translate-y-1/2 ${
                                    isActiveSubItem ? "bg-white" : "bg-text-muted"
                                  }`}
                                ></div>
                                <span
                                  className={`font-[500] text-[12px] ${
                                    isActiveSubItem ? "text-text-primary" : "text-text-secondary"
                                  }`}
                                >
                                  {subItem.label}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {isMaster && (
            <div className="flex flex-col gap-1 w-full mt-2">
               <div
                  className={`flex items-center gap-2 mb-1 whitespace-nowrap transition-all duration-300 overflow-hidden ${
                    isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto px-2"
                  }`}
                >
                  <span className="text-[10px] font-[700] text-amber-500 uppercase tracking-[0.12em]">
                    ADMINISTRAÇÃO
                  </span>
                  <div className="flex-grow h-px bg-amber-500/30 flex items-center justify-end">
                    <div className="w-1 h-1 rounded-full bg-amber-500/50"></div>
                  </div>
                </div>
                <Link
                  href="/dashboard/super-admin"
                  title={isCollapsed ? "Super Admin" : ""}
                  className="group flex items-center w-full px-[10px] py-[8px] rounded-[8px] cursor-pointer transition-all duration-200"
                  style={{
                    background: isItemActive('/dashboard/super-admin') ? 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)' : "transparent",
                  }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                    <Shield
                      size={20}
                      strokeWidth={2}
                      className={isItemActive('/dashboard/super-admin') ? "text-white" : "text-amber-500/70 group-hover:text-amber-500 transition-colors"}
                    />
                  </div>
                  <div
                    className={`flex items-center justify-between flex-grow whitespace-nowrap transition-all duration-300 overflow-hidden ${
                      isCollapsed ? "opacity-0 w-0 ml-0" : "opacity-100 w-auto ml-2"
                    }`}
                  >
                    <span className={`font-[600] text-[13px] ${isItemActive('/dashboard/super-admin') ? "text-white" : "text-amber-500"}`}>
                      Super Admin
                    </span>
                  </div>
                </Link>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Footer — card do usuário logado */}
      <div className="px-2 pb-2 relative">
        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`flex items-center justify-between p-2.5 rounded-[12px] border border-user-card-border bg-user-card-bg cursor-pointer hover:bg-white/10 transition-colors w-full overflow-hidden ${
            userMenuOpen ? "bg-white/10" : ""
          }`}
        >
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-accent overflow-hidden flex items-center justify-center">
              <span className="text-white font-bold text-xs">{initials}</span>
              <div className="absolute bottom-0 right-0 w-[8px] h-[8px] bg-online-green rounded-full border-[1px] border-[#0F0538]"></div>
            </div>
            
            <div
              className={`flex flex-col items-start whitespace-nowrap transition-all duration-300 overflow-hidden flex-grow ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              <span className="font-[600] text-[13px] text-text-primary leading-tight mb-[2px] truncate max-w-[120px]">
                {user?.name || 'Usuário'}
              </span>
              <span className="font-[500] text-[11px] text-text-muted leading-tight">
                {roleLabel(user?.role || '')}
              </span>
            </div>
            
            <div
              className={`flex-shrink-0 transition-transform duration-300 ${
                isCollapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              <ChevronDown
                size={16}
                strokeWidth={2.4}
                className={`text-text-secondary transition-transform duration-300 ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </button>

        {userMenuOpen && !isCollapsed && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setUserMenuOpen(false)}
          />
        )}

        {userMenuOpen && !isCollapsed && (
          <div
            ref={userMenuRef}
            className="fixed bottom-[76px] left-2 z-50 w-[224px]"
            style={{ pointerEvents: "auto" }}
          >
            <div className="rounded-[12px] border border-user-card-border bg-[#1a0d3e] backdrop-blur-sm overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
              <Link
                href="/dashboard/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-text-primary text-[13px] font-[500]"
              >
                <Settings2 size={18} strokeWidth={1.8} className="text-text-muted shrink-0" />
                Configurações
              </Link>
              <a
                href="https://basileia.global"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-text-primary text-[13px] font-[500]"
              >
                <HelpCircle size={18} strokeWidth={1.8} className="text-text-muted shrink-0" />
                Ajuda
              </a>
              <div className="h-px bg-divider mx-3" />
              <button
                type="button"
                onClick={async () => {
                  setUserMenuOpen(false);
                  if(logout) await logout();
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-red-500/20 transition-colors text-red-400 text-[13px] font-[500]"
              >
                <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        
        aside .group:hover {
          background: var(--color-item-hover) !important;
        }
      `}} />
    </aside>
  );
}
