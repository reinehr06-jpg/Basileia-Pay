"use client";

import React, { useState } from "react";
import {
  Repeat,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
} from "lucide-react";

const MOCK_SUBSCRIPTIONS = [
  { id: "ASS-10421", cliente: "Maria Oliveira", email: "maria@email.com", plano: "PRO Mensal", status: "Ativa", ciclo: "Mensal 8/12", proximaCobranca: "15/08/2026", valor: 129.90, metodo: "Cartão" },
  { id: "ASS-10420", cliente: "João Pedro Santos", email: "joao.ps@email.com", plano: "PREMIUM Anual", status: "Ativa", ciclo: "Anual 1/1", proximaCobranca: "02/08/2027", valor: 2499.00, metodo: "Cartão" },
  { id: "ASS-10419", cliente: "Ana Clara", email: "ana.clara@email.com", plano: "PRO Mensal", status: "Em atraso", ciclo: "Mensal 5/12", proximaCobranca: "01/08/2026", valor: 129.90, metodo: "PIX" },
  { id: "ASS-10418", cliente: "Carlos Mendes", email: "carlos.m@email.com", plano: "BASIC Mensal", status: "Ativa", ciclo: "Mensal 12/12", proximaCobranca: "10/08/2026", valor: 49.90, metodo: "PIX" },
  { id: "ASS-10417", cliente: "Fernanda Costa", email: "fecosta@email.com", plano: "PRO Anual", status: "Pausada", ciclo: "Anual 1/1", proximaCobranca: "Pausada", valor: 1299.00, metodo: "Cartão" },
  { id: "ASS-10416", cliente: "Lucas Silva", email: "lucas.silva@email.com", plano: "PRO Mensal", status: "Ativa", ciclo: "Mensal 3/12", proximaCobranca: "20/08/2026", valor: 129.90, metodo: "Cartão" },
  { id: "ASS-10415", cliente: "Beatriz Souza", email: "bia.souza@email.com", plano: "PREMIUM Anual", status: "Cancelada", ciclo: "Anual —", proximaCobranca: "Cancelada", valor: 2499.00, metodo: "Cartão" },
  { id: "ASS-10414", cliente: "Rafael Lima", email: "rafa.lima@email.com", plano: "BASIC Mensal", status: "Ativa", ciclo: "Mensal 7/12", proximaCobranca: "05/08/2026", valor: 49.90, metodo: "Boleto" },
  { id: "ASS-10413", cliente: "Camila Ribeiro", email: "camila.r@email.com", plano: "PRO Mensal", status: "Falha no pagamento", ciclo: "Mensal 4/12", proximaCobranca: "03/08/2026", valor: 129.90, metodo: "Cartão" },
  { id: "ASS-10412", cliente: "Felipe Gomes", email: "felipe.g@email.com", plano: "PRO Anual", status: "Ativa", ciclo: "Anual 1/1", proximaCobranca: "12/03/2027", valor: 1299.00, metodo: "PIX" },
];

export default function SubscriptionsListPage() {
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaPlano, setBuscaPlano] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc" | null;
  }>({ key: "", direction: null });

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

  const statusColors = (status: string) => {
    switch (status) {
      case "Ativa":
        return "bg-[#10B981]/[0.08] border-[#10B981]/[0.12] text-[#10B981]";
      case "Pausada":
        return "bg-[#3B82F6]/[0.08] border-[#3B82F6]/[0.12] text-[#3B82F6]";
      case "Em atraso":
      case "Falha no pagamento":
        return "bg-[#EF4444]/[0.08] border-[#EF4444]/[0.12] text-[#EF4444]";
      case "Cancelada":
        return "bg-[#9CA3AF]/[0.08] border-[#9CA3AF]/[0.12] text-[#9CA3AF]";
      default:
        return "bg-[#F59E0B]/[0.08] border-[#F59E0B]/[0.12] text-[#F59E0B]";
    }
  };

  const statusDotColor = (status: string) => {
    switch (status) {
      case "Ativa":
        return "bg-[#10B981]";
      case "Pausada":
        return "bg-[#3B82F6]";
      case "Em atraso":
      case "Falha no pagamento":
        return "bg-[#EF4444]";
      case "Cancelada":
        return "bg-[#9CA3AF]";
      default:
        return "bg-[#F59E0B]";
    }
  };

  let filteredList = [...MOCK_SUBSCRIPTIONS].filter(
    (s) =>
      (s.cliente.toLowerCase().includes(buscaCliente.toLowerCase()) ||
        s.email.toLowerCase().includes(buscaCliente.toLowerCase())) &&
      (s.plano.toLowerCase().includes(buscaPlano.toLowerCase()) ||
        s.id.toLowerCase().includes(buscaPlano.toLowerCase()))
  );

  if (sortConfig.direction !== null) {
    filteredList.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof typeof a];
      let valB: any = b[key as keyof typeof b];

      if (key === "valor") {
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
            <Repeat
              className="w-[20px] h-[20px] text-[#7C3AED]"
              strokeWidth={2.2}
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[20px] font-[700] text-[#1A1A2E] leading-tight">
              Lista de Assinaturas
            </h1>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              Gerencie todas as assinaturas recorrentes dos seus clientes.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px] shrink-0">
          <div className="flex items-center gap-[12px]">
            <button className="flex items-center gap-[6px] px-[16px] py-[10px] bg-[#6D28D9] text-white text-[13px] font-[600] rounded-[8px] hover:bg-[#5B21B6] transition-colors shadow-sm uppercase tracking-wide shrink-0">
              <Plus className="w-[16px] h-[16px]" strokeWidth={2.4} />
              NOVA ASSINATURA
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
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                placeholder="Buscar por Cliente"
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
                value={buscaPlano}
                onChange={(e) => setBuscaPlano(e.target.value)}
                placeholder="Buscar por ID ou Plano"
                className="bg-transparent border-none outline-none text-[12px] text-[#1A1A2E] placeholder-[#9CA3AF] w-full"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
          {/* Cabeçalho */}
          <div 
            className="grid items-center px-[24px] h-[40px] bg-[#FCFCFD] border-t border-b border-[#F1F1F4] min-w-[1200px] sticky top-0 z-10 shrink-0"
            style={{ gridTemplateColumns: "90px 1.5fr 1.2fr 180px 110px 1fr 120px 1fr 80px" }}
          >
            <button
              onClick={() => requestSort("id")}
              className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
            >
              ID {getSortIcon("id")}
            </button>
            <button
              onClick={() => requestSort("cliente")}
              className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
            >
              Cliente {getSortIcon("cliente")}
            </button>
            <button
              onClick={() => requestSort("plano")}
              className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
            >
              Plano {getSortIcon("plano")}
            </button>
            <button
              onClick={() => requestSort("status")}
              className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
            >
              Status {getSortIcon("status")}
            </button>
            <button
              onClick={() => requestSort("ciclo")}
              className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
            >
              Ciclo {getSortIcon("ciclo")}
            </button>
            <button
              onClick={() => requestSort("proximaCobranca")}
              className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
            >
              Próx. Cobrança {getSortIcon("proximaCobranca")}
            </button>
            <button
              onClick={() => requestSort("valor")}
              className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
            >
              Valor {getSortIcon("valor")}
            </button>
            <button
              onClick={() => requestSort("metodo")}
              className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
            >
              Método {getSortIcon("metodo")}
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
                  Nenhuma assinatura encontrada
                </h3>
                <p className="text-[13px] text-gray-500">
                  Tente ajustar os termos da sua busca.
                </p>
              </div>
            ) : (
              filteredList.map((s) => (
                <div
                  key={s.id}
                  className="grid items-center px-[24px] h-[42px] bg-white border-b border-[#F1F1F4] hover:bg-[#FAFAFC] transition-colors last:border-b-0 min-w-[1200px]"
                  style={{ gridTemplateColumns: "90px 1.5fr 1.2fr 180px 110px 1fr 120px 1fr 80px" }}
                >
                  <span className="text-[12px] font-[600] text-[#4B5563] truncate pr-4">
                    {s.id}
                  </span>

                  <div className="flex flex-col truncate pr-4">
                    <span className="text-[12px] font-[600] text-[#6D28D9] truncate cursor-pointer hover:underline">
                      {s.cliente}
                    </span>
                    <span className="text-[10px] font-[400] text-[#9CA3AF] truncate">
                      {s.email}
                    </span>
                  </div>

                  <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">
                    {s.plano}
                  </span>

                  <div className="pr-6">
                    <div
                      className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] border rounded-full ${statusColors(s.status)}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${statusDotColor(s.status)}`}
                      ></div>
                      <span className="text-[11px] font-[600] leading-none whitespace-nowrap">
                        {s.status}
                      </span>
                    </div>
                  </div>

                  <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">
                    {s.ciclo}
                  </span>
                  <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">
                    {s.proximaCobranca}
                  </span>

                  <span className="text-[12px] font-[700] text-[#1A1A2E] truncate pr-4">
                    {formatCurrency(s.valor)}
                  </span>

                  <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">
                    {s.metodo}
                  </span>

                  <div className="flex items-center justify-center gap-[6px]">
                    <button
                      className="w-[30px] h-[30px] rounded-[8px] border border-transparent bg-transparent flex items-center justify-center text-[#9CA3AF] hover:text-[#6D28D9] hover:border-[#6D28D9] hover:bg-[#F4EEFF] transition-all"
                      title="Visualizar"
                    >
                      <Eye
                        className="w-[14px] h-[14px]"
                        strokeWidth={2.2}
                      />
                    </button>
                    <button
                      className="w-[30px] h-[30px] rounded-[8px] border border-transparent bg-transparent flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] hover:border-[#EF4444] hover:bg-[#FEF2F2] transition-all"
                      title="Excluir"
                    >
                      <Trash2
                        className="w-[14px] h-[14px]"
                        strokeWidth={2.2}
                      />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer / Pagination */}
        <div className="p-[18px_24px_20px_24px] border-t border-[#F1F1F4] bg-white flex flex-wrap items-center justify-between text-[13px] text-[#6B7280] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#6B7280]">
              Linhas por página
            </span>
            <select className="border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#1A1A2E] px-2 py-1 outline-none bg-white min-h-[32px]">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>

          <span className="font-[500] text-[#374151]">
            1-{filteredList.length} de {MOCK_SUBSCRIPTIONS.length}
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#6B7280]">Página</span>
              <select className="border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#1A1A2E] px-2 py-1 outline-none bg-white min-h-[32px]">
                <option>1</option>
              </select>
            </div>
            <div className="flex items-center gap-[2px]">
              <button className="w-[28px] h-[28px] flex items-center justify-center text-[#C4C4C4] cursor-not-allowed">
                &laquo;
              </button>
              <button className="w-[28px] h-[28px] flex items-center justify-center text-[#C4C4C4] cursor-not-allowed">
                &lsaquo;
              </button>
              <button className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] border border-[#7C3AED] text-[#6D28D9] text-[13px] font-[600]">
                1
              </button>
              <button className="w-[28px] h-[28px] flex items-center justify-center text-[#C4C4C4] cursor-not-allowed">
                &rsaquo;
              </button>
              <button className="w-[28px] h-[28px] flex items-center justify-center text-[#C4C4C4] cursor-not-allowed">
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
