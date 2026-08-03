"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2
} from "lucide-react";

const MOCK_CUSTOMERS = [
  { id: "CUS-1029", nome: "Maria Oliveira", email: "maria.oliveira@email.com", cadastro: "02/08/2026", ltv: 2450.00, ticket: 150.00, status: "Ativo" },
  { id: "CUS-1028", nome: "João Pedro Santos", email: "joaops@email.com", cadastro: "01/08/2026", ltv: 450.00, ticket: 450.00, status: "Ativo" },
  { id: "CUS-1027", nome: "Ana Clara", email: "anaclara.dev@email.com", cadastro: "30/07/2026", ltv: 0.00, ticket: 0.00, status: "Inativo" },
  { id: "CUS-1026", nome: "Carlos Mendes", email: "cmendes.adv@email.com", cadastro: "28/07/2026", ltv: 997.00, ticket: 997.00, status: "Ativo" },
  { id: "CUS-1025", nome: "Fernanda Costa", email: "fernandacosta1992@email.com", cadastro: "25/07/2026", ltv: 3250.00, ticket: 149.90, status: "Ativo" },
  { id: "CUS-1024", nome: "Lucas Silva", email: "lucassilva.br@email.com", cadastro: "22/07/2026", ltv: 120.00, ticket: 120.00, status: "Inativo" },
  { id: "CUS-1023", nome: "Beatriz Souza", email: "bia_souza@email.com", cadastro: "15/07/2026", ltv: 8400.00, ticket: 450.00, status: "VIP" },
  { id: "CUS-1022", nome: "Rafael Lima", email: "rafaellima.arq@email.com", cadastro: "10/07/2026", ltv: 497.00, ticket: 497.00, status: "Ativo" },
  { id: "CUS-1021", nome: "Camila Ribeiro", email: "camila.ribeiro.99@email.com", cadastro: "05/07/2026", ltv: 0.00, ticket: 0.00, status: "Bloqueado" },
  { id: "CUS-1020", nome: "Felipe Gomes", email: "felipegomes_oficial@email.com", cadastro: "01/07/2026", ltv: 15400.00, ticket: 997.00, status: "VIP" },
];

export default function CustomersPage() {
  const [buscaNome, setBuscaNome] = useState("");
  const [buscaEmail, setBuscaEmail] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronDown className="w-3.5 h-3.5 opacity-20" />;
    if (sortConfig.direction === 'asc') return <ChevronUp className="w-3.5 h-3.5 text-[#7C3AED]" />;
    if (sortConfig.direction === 'desc') return <ChevronDown className="w-3.5 h-3.5 text-[#7C3AED]" />;
    return <ChevronDown className="w-3.5 h-3.5 opacity-20" />;
  };

  let filteredList = [...MOCK_CUSTOMERS].filter(c => 
    c.nome.toLowerCase().includes(buscaNome.toLowerCase()) && 
    (c.email.toLowerCase().includes(buscaEmail.toLowerCase()) || c.id.toLowerCase().includes(buscaEmail.toLowerCase()))
  );

  if (sortConfig.direction !== null) {
    filteredList.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof typeof a];
      let valB: any = b[key as keyof typeof b];

      if (key === 'ltv' || key === 'ticket') {
        valA = Number(valA);
        valB = Number(valB);
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* CARD PRINCIPAL */}
      <div className="bg-white rounded-[18px] flex-1 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-0">

        {/* CABEÇALHO DENTRO DO CARD */}
        <div className="p-[16px_24px_0_24px] flex items-center gap-[12px] shrink-0">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-[#F4EEFF] flex items-center justify-center shrink-0">
            <Users className="w-[20px] h-[20px] text-[#7C3AED]" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[20px] font-[700] text-[#1A1A2E] leading-tight">
              Base de Clientes
            </h1>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              Gerencie todos os compradores, leads e assinantes da sua operação.
            </p>
          </div>
        </div>

        {/* Toolbar: Botão e Buscas */}
        <div className="p-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px] shrink-0">
          <div className="flex items-center gap-[12px]">
            <button className="flex items-center gap-[6px] px-[16px] py-[10px] bg-[#6D28D9] text-white text-[13px] font-[600] rounded-[8px] hover:bg-[#5B21B6] transition-colors shadow-sm uppercase tracking-wide shrink-0">
              <Plus className="w-[16px] h-[16px]" strokeWidth={2.4} />
              NOVO CLIENTE
            </button>
          </div>
          
          <div className="flex items-center gap-[10px] w-full xl:w-auto">
            <div className="relative flex items-center w-full xl:w-[220px] h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-[12px] transition-all">
              <Search className="text-[#9CA3AF] w-[16px] h-[16px] mr-[8px] shrink-0" strokeWidth={2.4} />
              <input
                type="text"
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                placeholder="Buscar por Nome"
                className="bg-transparent border-none outline-none text-[12px] text-[#1A1A2E] placeholder-[#9CA3AF] w-full"
              />
            </div>
            <div className="relative flex items-center w-full xl:w-[220px] h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-[12px] transition-all">
              <Search className="text-[#9CA3AF] w-[16px] h-[16px] mr-[8px] shrink-0" strokeWidth={2.4} />
              <input
                type="text"
                value={buscaEmail}
                onChange={(e) => setBuscaEmail(e.target.value)}
                placeholder="Buscar por Email ou ID"
                className="bg-transparent border-none outline-none text-[12px] text-[#1A1A2E] placeholder-[#9CA3AF] w-full"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">

          {/* Cabeçalho */}
          <div className="grid grid-cols-[100px_2fr_2fr_1.2fr_1fr_1fr_0.8fr_80px] items-center px-[24px] h-[40px] bg-[#FCFCFD] border-t border-b border-[#F1F1F4] min-w-[1000px] sticky top-0 z-10 shrink-0">
            <button onClick={() => requestSort('id')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">ID {getSortIcon('id')}</button>
            <button onClick={() => requestSort('nome')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Cliente {getSortIcon('nome')}</button>
            <button onClick={() => requestSort('email')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">E-mail {getSortIcon('email')}</button>
            <button onClick={() => requestSort('cadastro')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Cadastro {getSortIcon('cadastro')}</button>
            <button onClick={() => requestSort('ltv')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">LTV {getSortIcon('ltv')}</button>
            <button onClick={() => requestSort('ticket')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Ticket Médio {getSortIcon('ticket')}</button>
            <button onClick={() => requestSort('status')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Status {getSortIcon('status')}</button>
            <span className="text-[12px] font-[700] text-[#6B7280] text-center">Ações</span>
          </div>

          {/* Linhas */}
          <div className="flex flex-col min-h-0">
            {filteredList.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                   <Users className="w-6 h-6 text-gray-400" />
                 </div>
                 <h3 className="text-[15px] font-[600] text-gray-900 mb-1">Nenhum cliente encontrado</h3>
                 <p className="text-[13px] text-gray-500">Tente ajustar os termos da sua busca.</p>
               </div>
            ) : (
              filteredList.map((c) => (
                <div key={c.id} className="grid grid-cols-[100px_2fr_2fr_1.2fr_1fr_1fr_0.8fr_80px] items-center px-[24px] h-[42px] bg-white border-b border-[#F1F1F4] hover:bg-[#FAFAFC] transition-colors last:border-b-0 min-w-[1000px]">
                  <span className="text-[12px] font-[600] text-[#4B5563] truncate pr-4">{c.id}</span>
                  <span className="text-[12px] font-[600] text-[#6D28D9] truncate pr-4 cursor-pointer hover:underline">{c.nome}</span>
                  <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">{c.email}</span>
                  <span className="text-[12px] font-[500] text-[#4B5563]">{c.cadastro}</span>
                  <span className="text-[12px] font-[700] text-[#1A1A2E]">{formatCurrency(c.ltv)}</span>
                  <span className="text-[12px] font-[500] text-[#4B5563]">{formatCurrency(c.ticket)}</span>
                  
                  <div>
                    <div className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] border rounded-full ${
                      c.status === "Ativo"
                        ? "bg-[#10B981]/[0.08] border-[#10B981]/[0.12] text-[#10B981]"
                        : c.status === "VIP"
                        ? "bg-[#7C3AED]/[0.08] border-[#7C3AED]/[0.12] text-[#7C3AED]"
                        : c.status === "Inativo"
                        ? "bg-gray-100 border-gray-200 text-gray-500"
                        : "bg-[#EF4444]/[0.08] border-[#EF4444]/[0.12] text-[#EF4444]"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        c.status === "Ativo" ? "bg-[#10B981]" : c.status === "VIP" ? "bg-[#7C3AED]" : c.status === "Inativo" ? "bg-gray-400" : "bg-[#EF4444]"
                      }`}></div>
                      <span className="text-[11px] font-[600] leading-none">{c.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-[6px]">
                    <button className="w-[30px] h-[30px] rounded-[8px] border border-transparent bg-transparent flex items-center justify-center text-[#9CA3AF] hover:text-[#6D28D9] hover:border-[#6D28D9] hover:bg-[#F4EEFF] transition-all" title="Visualizar">
                      <Eye className="w-[14px] h-[14px]" strokeWidth={2.2} />
                    </button>
                    <button className="w-[30px] h-[30px] rounded-[8px] border border-transparent bg-transparent flex items-center justify-center text-[#9CA3AF] hover:text-[#EF4444] hover:border-[#EF4444] hover:bg-[#FEF2F2] transition-all" title="Excluir">
                      <Trash2 className="w-[14px] h-[14px]" strokeWidth={2.2} />
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
            <span className="text-[13px] text-[#6B7280]">Linhas por página</span>
            <select className="border border-[#E5E7EB] rounded-[6px] text-[13px] text-[#1A1A2E] px-2 py-1 outline-none bg-white min-h-[32px]">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>

          <span className="font-[500] text-[#374151]">
            1-{filteredList.length} de {MOCK_CUSTOMERS.length}
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
