"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRightLeft,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2
} from "lucide-react";

const MOCK_TRANSACTIONS = [
  { id: "TR-9823", cliente: "Maria Oliveira", produto: "Mentoria Elite", data: "02/08/2026 14:30", metodo: "PIX", valor: 997.00, status: "Aprovado" },
  { id: "TR-9822", cliente: "João Pedro Santos", produto: "E-book Vendas", data: "02/08/2026 13:15", metodo: "Cartão de Crédito", valor: 47.90, status: "Aprovado" },
  { id: "TR-9821", cliente: "Ana Clara", produto: "Assinatura Pro (Mensal)", data: "02/08/2026 11:45", metodo: "PIX", valor: 149.90, status: "Pendente" },
  { id: "TR-9820", cliente: "Carlos Mendes", produto: "Mentoria Elite", data: "01/08/2026 18:20", metodo: "Boleto", valor: 997.00, status: "Aguardando Pagamento" },
  { id: "TR-9819", cliente: "Fernanda Costa", produto: "Curso Ads Completo", data: "01/08/2026 15:10", metodo: "Cartão de Crédito", valor: 497.00, status: "Recusado" },
  { id: "TR-9818", cliente: "Lucas Silva", produto: "E-book Vendas", data: "01/08/2026 09:30", metodo: "PIX", valor: 47.90, status: "Aprovado" },
  { id: "TR-9817", cliente: "Beatriz Souza", produto: "Assinatura Pro (Anual)", data: "31/07/2026 21:05", metodo: "Cartão de Crédito", valor: 1499.00, status: "Chargeback" },
  { id: "TR-9816", cliente: "Rafael Lima", produto: "Mentoria Elite", data: "31/07/2026 16:40", metodo: "PIX", valor: 997.00, status: "Aprovado" },
  { id: "TR-9815", cliente: "Camila Ribeiro", produto: "Consultoria 1h", data: "31/07/2026 14:15", metodo: "PIX", valor: 250.00, status: "Estornado" },
  { id: "TR-9814", cliente: "Felipe Gomes", produto: "Curso Ads Completo", data: "30/07/2026 10:20", metodo: "Cartão de Crédito", valor: 497.00, status: "Aprovado" },
];

export default function OrdersPage() {
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaId, setBuscaId] = useState("");
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

  const filteredList = [...MOCK_TRANSACTIONS].filter(t => 
    t.cliente.toLowerCase().includes(buscaCliente.toLowerCase()) && 
    (t.id.toLowerCase().includes(buscaId.toLowerCase()) || t.produto.toLowerCase().includes(buscaId.toLowerCase()))
  );

  if (sortConfig.direction !== null) {
    filteredList.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key as keyof typeof a];
      let valB: any = b[key as keyof typeof b];

      if (key === 'valor') {
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
            <ArrowRightLeft className="w-[20px] h-[20px] text-[#7C3AED]" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[20px] font-[700] text-[#1A1A2E] leading-tight">
              Transações
            </h1>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              Acompanhe e gerencie todas as vendas e movimentações.
            </p>
          </div>
        </div>

        {/* Toolbar: Botão e Buscas */}
        <div className="p-[24px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[16px] shrink-0">
          <div className="flex items-center gap-[12px]">
            <button className="flex items-center gap-[6px] px-[16px] py-[10px] bg-[#6D28D9] text-white text-[13px] font-[600] rounded-[8px] hover:bg-[#5B21B6] transition-colors shadow-sm uppercase tracking-wide shrink-0">
              <Plus className="w-[16px] h-[16px]" strokeWidth={2.4} />
              NOVA TRANSAÇÃO
            </button>
          </div>
          
          <div className="flex items-center gap-[10px] w-full xl:w-auto">
            <div className="relative flex items-center w-full xl:w-[220px] h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-[12px] transition-all">
              <Search className="text-[#9CA3AF] w-[16px] h-[16px] mr-[8px] shrink-0" strokeWidth={2.4} />
              <input
                type="text"
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                placeholder="Buscar por Cliente"
                className="bg-transparent border-none outline-none text-[12px] text-[#1A1A2E] placeholder-[#9CA3AF] w-full"
              />
            </div>
            <div className="relative flex items-center w-full xl:w-[220px] h-[36px] bg-white border border-[#E5E7EB] rounded-[8px] px-[12px] transition-all">
              <Search className="text-[#9CA3AF] w-[16px] h-[16px] mr-[8px] shrink-0" strokeWidth={2.4} />
              <input
                type="text"
                value={buscaId}
                onChange={(e) => setBuscaId(e.target.value)}
                placeholder="Buscar por ID ou Produto"
                className="bg-transparent border-none outline-none text-[12px] text-[#1A1A2E] placeholder-[#9CA3AF] w-full"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">

          {/* Cabeçalho */}
          <div 
            className="grid items-center px-[24px] h-[40px] bg-[#FCFCFD] border-t border-b border-[#F1F1F4] min-w-[1150px] sticky top-0 z-10 shrink-0"
            style={{ gridTemplateColumns: "100px 2fr 1.5fr 1.2fr 130px 140px 160px 80px" }}
          >
            <button onClick={() => requestSort('id')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">ID {getSortIcon('id')}</button>
            <button onClick={() => requestSort('cliente')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Cliente {getSortIcon('cliente')}</button>
            <button onClick={() => requestSort('produto')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Produto {getSortIcon('produto')}</button>
            <button onClick={() => requestSort('data')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Data {getSortIcon('data')}</button>
            <button onClick={() => requestSort('metodo')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Método {getSortIcon('metodo')}</button>
            <button onClick={() => requestSort('valor')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Valor {getSortIcon('valor')}</button>
            <button onClick={() => requestSort('status')} className="flex items-center gap-1 text-[12px] font-[700] text-[#6B7280] hover:text-[#1A1A2E] transition-colors">Status {getSortIcon('status')}</button>
            <span className="text-[12px] font-[700] text-[#6B7280] text-center">Ações</span>
          </div>

          {/* Linhas */}
          <div className="flex flex-col min-h-0">
            {filteredList.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                   <Search className="w-6 h-6 text-gray-400" />
                 </div>
                 <h3 className="text-[15px] font-[600] text-gray-900 mb-1">Nenhuma transação encontrada</h3>
                 <p className="text-[13px] text-gray-500">Tente ajustar os termos da sua busca.</p>
               </div>
            ) : (
              filteredList.map((t) => (
                <div 
                  key={t.id} 
                  className="grid items-center px-[24px] h-[42px] bg-white border-b border-[#F1F1F4] hover:bg-[#FAFAFC] transition-colors last:border-b-0 min-w-[1150px]"
                  style={{ gridTemplateColumns: "100px 2fr 1.5fr 1.2fr 130px 140px 160px 80px" }}
                >
                  <span className="text-[12px] font-[600] text-[#4B5563] truncate pr-4">{t.id}</span>
                  
                  <span className="text-[12px] font-[600] text-[#6D28D9] truncate pr-4 cursor-pointer hover:underline">{t.cliente}</span>
                  <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">{t.produto}</span>
                  
                  <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">{t.data}</span>
                  <span className="text-[12px] font-[500] text-[#4B5563] truncate pr-4">{t.metodo}</span>
                  
                  <span className="text-[12px] font-[700] text-[#1A1A2E] truncate pr-4">{formatCurrency(t.valor)}</span>
                  
                  <div className="pr-6">
                    <div className={`inline-flex items-center gap-[4px] px-[8px] py-[2px] border rounded-full ${
                      t.status === "Aprovado" 
                        ? "bg-[#10B981]/[0.08] border-[#10B981]/[0.12] text-[#10B981]" 
                        : t.status === "Recusado" || t.status === "Chargeback" || t.status === "Estornado"
                        ? "bg-[#EF4444]/[0.08] border-[#EF4444]/[0.12] text-[#EF4444]"
                        : "bg-[#F59E0B]/[0.08] border-[#F59E0B]/[0.12] text-[#F59E0B]"
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        t.status === "Aprovado" ? "bg-[#10B981]" : t.status === "Recusado" || t.status === "Chargeback" || t.status === "Estornado" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                      }`}></div>
                      <span className="text-[11px] font-[600] leading-none whitespace-nowrap">{t.status}</span>
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
            1-{filteredList.length} de {MOCK_TRANSACTIONS.length}
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
