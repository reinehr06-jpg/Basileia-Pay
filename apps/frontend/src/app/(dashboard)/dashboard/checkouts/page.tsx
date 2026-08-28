"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  MoreVertical,
  Activity,
  Archive,
  Copy,
  Play
} from "lucide-react";
import { CheckoutStatusBadge } from "@/components/checkouts/CheckoutStatusBadge";
import { CheckoutsSummary } from "@/components/checkouts/CheckoutsSummary";

const MOCK_CHECKOUTS = [
  { id: "chk_10421", name: "Checkout Black Friday 2026", system: "Shopify", slug: "black-friday-26", status: "Publicado", version: "v2.1.0", canal: "Instagram", conversion: "84,50%", lastUpdate: "Há 2 horas", type: "Padrão" },
  { id: "chk_10420", name: "Checkout VIP Influenciadores", system: "WooCommerce", slug: "vip-influencers", status: "Publicado", version: "v1.0.5", canal: "TikTok", conversion: "62,30%", lastUpdate: "Há 1 dia", type: "Upsell 1-Click" },
  { id: "chk_10419", name: "Lançamento Outono/Inverno", system: "Vtex", slug: "outono-inverno", status: "Rascunho", version: "v1.0.0", canal: "Facebook Ads", conversion: "—", lastUpdate: "Há 3 dias", type: "Padrão" },
  { id: "chk_10418", name: "Assinatura Box Mensal", system: "Pagar.me", slug: "box-mensal", status: "Pausado", version: "v3.0.1", canal: "E-mail", conversion: "45,20%", lastUpdate: "Há 1 semana", type: "Recorrência" },
  { id: "chk_10417", name: "Promoção Dia das Mães", system: "Shopify", slug: "dia-das-maes", status: "Arquivado", version: "v1.5.0", canal: "Google Ads", conversion: "78,90%", lastUpdate: "Há 3 meses", type: "Padrão" },
  { id: "chk_10416", name: "Checkout Venda Agregada", system: "Nuvemshop", slug: "venda-agregada", status: "Publicado", version: "v1.2.0", canal: "Direto", conversion: "91,10%", lastUpdate: "Há 4 horas", type: "Order Bump" },
];

export default function CheckoutsPage() {
  const router = useRouter();
  const [buscaNome, setBuscaNome] = useState("");
  const [buscaSlug, setBuscaSlug] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "", direction: null });

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

  const filteredList = [...MOCK_CHECKOUTS].filter(
    (c) =>
      (c.name.toLowerCase().includes(buscaNome.toLowerCase()) ||
        c.system.toLowerCase().includes(buscaNome.toLowerCase())) &&
      (c.slug.toLowerCase().includes(buscaSlug.toLowerCase()) ||
        c.id.toLowerCase().includes(buscaSlug.toLowerCase()))
  );

  if (sortConfig.direction !== null) {
    filteredList.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof typeof a];
      let valB: any = b[key as keyof typeof b];

      if (key === "conversion" && valA !== "—" && valB !== "—") {
        valA = parseFloat(valA.replace(",", "."));
        valB = parseFloat(valB.replace(",", "."));
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
            <Layers
              className="w-[20px] h-[20px] text-[#7C3AED]"
              strokeWidth={2.2}
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[20px] font-[700] text-[#1A1A2E] leading-tight">
              Lista de Checkouts
            </h1>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              Gerencie seus checkouts criados, versões, conversões e status.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px] shrink-0">
          <div className="flex items-center gap-[12px]">
            <button 
              onClick={() => router.push("/dashboard/checkouts/new/studio")}
              className="flex items-center gap-[6px] px-[16px] py-[10px] bg-[#6D28D9] text-white text-[13px] font-[600] rounded-[8px] hover:bg-[#5B21B6] transition-colors shadow-sm uppercase tracking-wide shrink-0"
            >
              <Plus className="w-[16px] h-[16px]" strokeWidth={2.4} />
              NOVO CHECKOUT
            </button>
          </div>

          <div className="flex items-center gap-[10px] w-full xl:w-auto">
            <div className="relative flex items-center w-full xl:w-[220px] h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-[12px] transition-all">
              <Search
                className="text-[#9CA3AF] w-[16px] h-[16px] mr-[8px] shrink-0"
                strokeWidth={2.4}
              />
              <input
                type="text"
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Buscar por Nome ou Sistema"
                className="bg-transparent border-none outline-none text-[12px] text-[#1A1A2E] placeholder-[#9CA3AF] w-full"
              />
            </div>
            <div className="relative flex items-center w-full xl:w-[220px] h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-[12px] transition-all">
              <Search
                className="text-[#9CA3AF] w-[16px] h-[16px] mr-[8px] shrink-0"
                strokeWidth={2.4}
              />
              <input
                type="text"
                value={buscaSlug}
                onChange={(e) => setBuscaSlug(e.target.value)}
                placeholder="Buscar por ID ou Slug"
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
            style={{ gridTemplateColumns: "100px 2fr 160px 100px 120px 120px 140px 140px" }}
          >
            <button onClick={() => requestSort("id")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              ID {getSortIcon("id")}
            </button>
            <button onClick={() => requestSort("name")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Checkout / Sistema {getSortIcon("name")}
            </button>
            <button onClick={() => requestSort("status")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Status {getSortIcon("status")}
            </button>
            <button onClick={() => requestSort("version")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Versão {getSortIcon("version")}
            </button>
            <button onClick={() => requestSort("conversion")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Conversão {getSortIcon("conversion")}
            </button>
            <button onClick={() => requestSort("canal")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Canal {getSortIcon("canal")}
            </button>
            <button onClick={() => requestSort("lastUpdate")} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">
              Último Update {getSortIcon("lastUpdate")}
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
                  Nenhum checkout encontrado
                </h3>
                <p className="text-[13px] text-gray-500">
                  Tente ajustar os termos da sua busca.
                </p>
              </div>
            ) : (
              filteredList.map((c) => {
                const isHighConversion = c.conversion !== '—' && parseFloat(c.conversion.replace(',', '.')) >= 80;
                const isMediumConversion = c.conversion !== '—' && parseFloat(c.conversion.replace(',', '.')) >= 60 && parseFloat(c.conversion.replace(',', '.')) < 80;
                const isLowConversion = c.conversion !== '—' && parseFloat(c.conversion.replace(',', '.')) < 60;

                return (
                  <div
                    key={c.id}
                    className="grid items-center px-[24px] h-[52px] bg-white border-b border-[#F1F1F4] hover:bg-[#FAFAFC] transition-colors last:border-b-0 min-w-[1050px]"
                    style={{ gridTemplateColumns: "100px 2fr 160px 100px 120px 120px 140px 140px" }}
                  >
                    <span className="text-[12px] font-[600] text-[#4B5563] truncate pr-4">
                      {c.id.replace("chk_", "CHK-")}
                    </span>

                    <div className="flex flex-col truncate pr-4">
                      <span className="text-[12px] font-[600] text-[#6D28D9] truncate cursor-pointer hover:underline">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-[400] text-[#9CA3AF] truncate">
                        {c.system} • {c.slug}
                      </span>
                    </div>

                    <div className="pr-6">
                      <CheckoutStatusBadge status={c.status} />
                    </div>

                    <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">
                      {c.version}
                    </span>

                    <span className={`text-[12px] font-[700] truncate pr-4 ${isHighConversion ? "text-[#10B981]" : isMediumConversion ? "text-[#F59E0B]" : isLowConversion ? "text-[#EF4444]" : "text-[#9CA3AF]"}`}>
                      {c.conversion}
                    </span>

                    <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">
                      {c.canal}
                    </span>

                    <div className="flex flex-col truncate pr-4">
                      <span className="text-[12px] font-[500] text-[#4B5563] truncate">
                        {c.lastUpdate}
                      </span>
                      <span className="text-[10px] font-[400] text-[#9CA3AF] truncate">
                        {c.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-[6px] relative">
                      <button 
                        onClick={() => router.push(`/dashboard/checkouts/${c.id}/studio`)}
                        className="h-[28px] px-[10px] rounded-[6px] border border-[#6D28D9] text-[#6D28D9] hover:bg-[#6D28D9] hover:text-white text-[11px] font-[600] transition-all"
                      >
                        STUDIO
                      </button>
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                        className="w-[28px] h-[28px] rounded-[6px] border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:text-[#6D28D9] hover:border-[#6D28D9] transition-all"
                      >
                        <MoreVertical className="w-[14px] h-[14px]" strokeWidth={2.2} />
                      </button>
                      
                      {activeMenuId === c.id && (
                        <div className="absolute right-0 top-[32px] w-[140px] bg-white rounded-[8px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.08)] py-1 z-50">
                          <button onClick={() => setActiveMenuId(null)} className="w-full text-left px-3 py-1.5 text-[12px] font-[500] text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#6D28D9] flex items-center gap-2">
                            <Copy className="w-3.5 h-3.5" /> Copiar Link
                          </button>
                          <button onClick={() => setActiveMenuId(null)} className="w-full text-left px-3 py-1.5 text-[12px] font-[500] text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#6D28D9] flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" /> Duplicar
                          </button>
                          <div className="h-[1px] bg-[#E5E7EB] my-1"></div>
                          <button onClick={() => setActiveMenuId(null)} className="w-full text-left px-3 py-1.5 text-[12px] font-[500] text-[#EF4444] hover:bg-[#FEF2F2] flex items-center gap-2">
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
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
            1-{filteredList.length} de {MOCK_CHECKOUTS.length}
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
