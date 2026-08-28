'use client';

import { useState } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoutingFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  systemFilter: string;
  setSystemFilter: (sys: string) => void;
  methodFilter: string;
  setMethodFilter: (method: string) => void;
  gatewayFilter: string;
  setGatewayFilter: (gw: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
}

export function RoutingFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  systemFilter,
  setSystemFilter,
  methodFilter,
  setMethodFilter,
  gatewayFilter,
  setGatewayFilter,
  typeFilter,
  setTypeFilter,
}: RoutingFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-3.5 w-full text-left">
      
      {/* Search and Tabs line alignment */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
        
        {/* Search Input block */}
        <div className="relative w-full lg:max-w-md shrink-0">
          <input
            type="text"
            placeholder="Buscar regras por nome, gateway ou condições..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[42px] pl-3.5 pr-9 bg-white border border-[#E8DDFD]/90 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand placeholder:text-slate-350 shadow-sm shadow-slate-50/10"
          />
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-[14px] text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-350 absolute right-3.5 top-[14px]" />
          )}
        </div>

        {/* Dropdowns line */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <div className="flex flex-col">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[42px] px-3 bg-white border border-[#E8DDFD]/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-brand cursor-pointer shadow-sm shadow-slate-50/5 min-w-[110px]"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
              <option value="conflict">Com Conflito</option>
            </select>
          </div>

          {/* Método Dropdown */}
          <div className="flex flex-col">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-[42px] px-3 bg-white border border-[#E8DDFD]/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-brand cursor-pointer shadow-sm shadow-slate-50/5 min-w-[110px]"
            >
              <option value="all">Todos os Métodos</option>
              <option value="pix">PIX</option>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>

          {/* Sistema Dropdown */}
          <div className="flex flex-col">
            <select
              value={systemFilter}
              onChange={(e) => setSystemFilter(e.target.value)}
              className="h-[42px] px-3 bg-white border border-[#E8DDFD]/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-brand cursor-pointer shadow-sm shadow-slate-50/5 min-w-[120px]"
            >
              <option value="all">Todos os Sistemas</option>
              <option value="sys_church">Church Integration</option>
              <option value="sys_vendor">Vendor Platform</option>
              <option value="sys_saas">SaaS Engine</option>
            </select>
          </div>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              "h-[42px] px-3 border rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition-all shadow-sm",
              showAdvanced 
                ? "bg-violet-50/50 border-brand text-brand"
                : "bg-white border-[#E8DDFD]/90 text-slate-700 hover:bg-slate-50"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span>Filtros</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform shrink-0", showAdvanced && "rotate-180")} />
          </button>
        </div>

      </div>

      {/* Expanded Advanced Filters Panel */}
      {showAdvanced && (
        <div className="p-4 bg-white border border-[#E8DDFD]/70 rounded-[20px] shadow-sm shadow-slate-100/50 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
          {/* Gateway Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Gateway Destino</label>
            <select
              value={gatewayFilter}
              onChange={(e) => setGatewayFilter(e.target.value)}
              className="w-full h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">Todos os Gateways</option>
              <option value="gw_asaas">Asaas</option>
              <option value="gw_cielo">Cielo</option>
              <option value="gw_mercadopago">Mercado Pago</option>
              <option value="gw_itau">Itaú</option>
              <option value="gw_asaas_church">Asaas Church</option>
            </select>
          </div>

          {/* Tipo de Regra Filter */}
          <div className="space-y-1 text-left">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tipo de Regra</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-[38px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="all">Todos os Tipos</option>
              <option value="by_system">Por Sistema</option>
              <option value="by_method">Por Método</option>
              <option value="by_value">Por Valor</option>
              <option value="by_installments">Por Parcelamento</option>
              <option value="by_risk">Por Risco</option>
              <option value="by_availability">Por Disponibilidade</option>
            </select>
          </div>
        </div>
      )}

    </div>
  );
}
