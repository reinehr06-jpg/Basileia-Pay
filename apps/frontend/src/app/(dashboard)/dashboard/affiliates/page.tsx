"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Mail,
  UserCheck,
  Ban,
  Trash2,
  TrendingUp
} from "lucide-react";
import { CheckoutStatusBadge } from "@/components/checkouts/CheckoutStatusBadge";

const MOCK_AFFILIATES = [
  { id: "AFI-10421", name: "Felipe Rodrigues", email: "felipe.rod@email.com", status: "Ativo", level: "VIP (50%)", sales: 342, revenue: 35400.00, createdAt: "15/03/2026" },
  { id: "AFI-10420", name: "Amanda Silva", email: "amanda.s@email.com", status: "Ativo", level: "Padrão (30%)", sales: 89, revenue: 8900.50, createdAt: "21/04/2026" },
  { id: "AFI-10419", name: "Marcos Viana", email: "marcos.viana@email.com", status: "Pendente", level: "Iniciante (20%)", sales: 0, revenue: 0, createdAt: "Há 2 horas" },
  { id: "AFI-10418", name: "Camila Borges", email: "camila.b@email.com", status: "Suspenso", level: "Padrão (30%)", sales: 12, revenue: 1200.00, createdAt: "05/01/2026" },
  { id: "AFI-10417", name: "Lucas Fernandes", email: "lucas.f@email.com", status: "Ativo", level: "Super (60%)", sales: 890, revenue: 95000.00, createdAt: "12/11/2025" },
];

export default function AffiliatesPage() {
  const [buscaNome, setBuscaNome] = useState("");
  const [buscaId, setBuscaId] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "", direction: null });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" | null = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key)
      return <ChevronDown className="w-3.5 h-3.5 opacity-20" />;
    if (sortConfig.direction === "asc")
      return <ChevronUp className="w-3.5 h-3.5 text-[#7C3AED]" />;
    if (sortConfig.direction === "desc")
      return <ChevronDown className="w-3.5 h-3.5 text-[#7C3AED]" />;
    return <ChevronDown className="w-3.5 h-3.5 opacity-20" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo":
        return <CheckoutStatusBadge status="Publicado" />;
      case "Pendente":
        return <CheckoutStatusBadge status="Rascunho" />;
      case "Suspenso":
        return <CheckoutStatusBadge status="Arquivado" />;
      default:
        return <CheckoutStatusBadge status="Rascunho" />;
    }
  };

  const filteredList = [...MOCK_AFFILIATES].filter(
    (a) =>
      (a.name.toLowerCase().includes(buscaNome.toLowerCase()) ||
       a.email.toLowerCase().includes(buscaNome.toLowerCase())) &&
      a.id.toLowerCase().includes(buscaId.toLowerCase())
  );

  if (sortConfig.direction !== null) {
    filteredList.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof typeof a];
      let valB: any = b[key as keyof typeof b];

      if (key === "revenue" || key === "sales") {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* CARD PRINCIPAL */}
      <div className="bg-white rounded-[18px] flex-1 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-0">
        {/* CABEÇALHO */}
        <div className="p-[16px_24px_0_24px] flex items-center gap-[12px] shrink-0">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-[#F4EEFF] flex items-center justify-center shrink-0">
            <Users className="w-[20px] h-[20px] text-[#7C3AED]" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[20px] font-[700] text-[#1A1A2E] leading-tight">
              Gestão de Afiliados
            </h1>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              Gerencie seus parceiros, comissões e acompanhe os resultados de vendas.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px] shrink-0">
          <div className="flex items-center gap-[12px]">
            <button className="flex items-center gap-[6px] px-[16px] py-[10px] bg-[#6D28D9] text-white text-[13px] font-[600] rounded-[8px] hover:bg-[#5B21B6] transition-colors shadow-sm uppercase tracking-wide shrink-0">
              <Plus className="w-[16px] h-[16px]" strokeWidth={2.4} />
              NOVO AFILIADO
            </button>
          </div>

          <div className="flex items-center gap-[10px] w-full xl:w-auto">
            <div className="relative flex items-center w-full xl:w-[220px] h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-[12px] transition-all">
              <Search className="text-[#9CA3AF] w-[16px] h-[16px] mr-[8px] shrink-0" strokeWidth={2.4} />
              <input
                type="text"
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Buscar por Nome ou E-mail"
                className="bg-transparent border-none outline-none text-[12px] text-[#1A1A2E] placeholder-[#9CA3AF] w-full"
              />
            </div>
            <div className="relative flex items-center w-full xl:w-[220px] h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-[12px] transition-all">
              <Search className="text-[#9CA3AF] w-[16px] h-[16px] mr-[8px] shrink-0" strokeWidth={2.4} />
              <input
                type="text"
                value={buscaId}
                onChange={(e) => setBuscaId(e.target.value)}
                placeholder="Buscar por ID"
                className="bg-transparent border-none outline-none text-[12px] text-[#1A1A2E] placeholder-[#9CA3AF] w-full"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
          {/* Cabeçalho */}
          <div 
            className="grid items-center px-[24px] h-[40px] bg-[#FCFCFD] border-t border-b border-[#F1F1F4] min-w-[1050px] sticky top-0 z-10 shrink-0"
            style={{ gridTemplateColumns: "100px 2.5fr 120px 140px 100px 150px 120px 80px" }}
          >
            <button onClick={() => requestSort("id")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              ID {getSortIcon("id")}
            </button>
            <button onClick={() => requestSort("name")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Afiliado {getSortIcon("name")}
            </button>
            <button onClick={() => requestSort("status")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Status {getSortIcon("status")}
            </button>
            <button onClick={() => requestSort("level")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Comissão {getSortIcon("level")}
            </button>
            <button onClick={() => requestSort("sales")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Vendas {getSortIcon("sales")}
            </button>
            <button onClick={() => requestSort("revenue")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Faturamento {getSortIcon("revenue")}
            </button>
            <button onClick={() => requestSort("createdAt")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Criado em {getSortIcon("createdAt")}
            </button>
            <span className="text-[12px] font-[700] text-[#6B7280] text-center">
              Ações
            </span>
          </div>

          {/* Linhas */}
          <div className="flex flex-col min-h-0">
            {filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-[15px] font-[600] text-gray-900 mb-1">
                  Nenhum afiliado encontrado
                </h3>
                <p className="text-[13px] text-gray-500">
                  Tente ajustar os termos da sua busca.
                </p>
              </div>
            ) : (
              filteredList.map((a) => {
                return (
                  <div
                    key={a.id}
                    className="grid items-center px-[24px] h-[52px] bg-white border-b border-[#F1F1F4] hover:bg-[#FAFAFC] transition-colors last:border-b-0 min-w-[1050px]"
                    style={{ gridTemplateColumns: "100px 2.5fr 120px 140px 100px 150px 120px 80px" }}
                  >
                    <span className="text-[12px] font-[600] text-[#4B5563] truncate pr-4">
                      {a.id}
                    </span>

                    <div className="flex flex-col truncate pr-4">
                      <span className="text-[12px] font-[600] text-[#6D28D9] truncate cursor-pointer hover:underline">
                        {a.name}
                      </span>
                      <span className="text-[10px] font-[400] text-[#9CA3AF] truncate">
                        {a.email}
                      </span>
                    </div>

                    <div className="pr-6">
                      {getStatusBadge(a.status)}
                    </div>

                    <span className="text-[12px] font-[600] text-[#4B5563] truncate pr-4">
                      {a.level}
                    </span>

                    <span className="text-[12px] font-[600] text-[#1A1A2E] truncate pr-4">
                      {a.sales}
                    </span>

                    <span className="text-[12px] font-[700] text-[#10B981] truncate pr-4">
                      {formatCurrency(a.revenue)}
                    </span>

                    <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">
                      {a.createdAt}
                    </span>

                    <div className="flex items-center justify-center gap-[6px] relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === a.id ? null : a.id)}
                        className="w-[28px] h-[28px] rounded-[6px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:text-[#6D28D9] hover:border-[#6D28D9] transition-all"
                      >
                        <MoreVertical className="w-[14px] h-[14px]" strokeWidth={2.2} />
                      </button>
                      
                      {activeMenuId === a.id && (
                        <div className="absolute right-0 top-[32px] w-[140px] bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.08)] py-1 z-50">
                          <button onClick={() => setActiveMenuId(null)} className="w-full text-left px-3 py-1.5 text-[12px] font-[500] text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#6D28D9] flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5" /> Ver Vendas
                          </button>
                          <button onClick={() => setActiveMenuId(null)} className="w-full text-left px-3 py-1.5 text-[12px] font-[500] text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#6D28D9] flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Enviar E-mail
                          </button>
                          <div className="h-[1px] bg-[#E5E7EB] my-1"></div>
                          {a.status === 'Pendente' && (
                            <button onClick={() => setActiveMenuId(null)} className="w-full text-left px-3 py-1.5 text-[12px] font-[500] text-[#10B981] hover:bg-[#ECFDF5] flex items-center gap-2">
                              <UserCheck className="w-3.5 h-3.5" /> Aprovar
                            </button>
                          )}
                          <button onClick={() => setActiveMenuId(null)} className="w-full text-left px-3 py-1.5 text-[12px] font-[500] text-[#EF4444] hover:bg-[#FEF2F2] flex items-center gap-2">
                            <Ban className="w-3.5 h-3.5" /> Suspender
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer / Pagination */}
        <div className="p-[18px_24px_20px_24px] border-t border-[#F1F1F4] bg-white flex flex-wrap items-center justify-between text-[13px] text-[#6B7280] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280]">Linhas por página</span>
            <select className="border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#1A1A2E] px-2 py-1 outline-none bg-white min-h-[32px]">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>

          <span className="font-[500] text-[#374151]">
            1-{filteredList.length} de {MOCK_AFFILIATES.length}
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#6B7280]">Página</span>
              <select className="border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#1A1A2E] px-2 py-1 outline-none bg-white min-h-[32px]">
                <option>1</option>
              </select>
            </div>
            <div className="flex items-center gap-[2px]">
              <button className="w-[28px] h-[28px] flex items-center justify-center text-[#C4C4C4] cursor-not-allowed">&laquo;</button>
              <button className="w-[28px] h-[28px] flex items-center justify-center text-[#C4C4C4] cursor-not-allowed">&lsaquo;</button>
              <button className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border border-[#7C3AED] text-[#6D28D9] text-[13px] font-[600]">1</button>
              <button className="w-[28px] h-[28px] flex items-center justify-center text-[#C4C4C4] cursor-not-allowed">&rsaquo;</button>
              <button className="w-[28px] h-[28px] flex items-center justify-center text-[#C4C4C4] cursor-not-allowed">&raquo;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
