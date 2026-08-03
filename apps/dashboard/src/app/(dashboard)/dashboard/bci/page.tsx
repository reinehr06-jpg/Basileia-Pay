"use client";

import React, { useState } from "react";
import {
  PieChart,
  Download,
  ChevronDown,
  Info,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Flame,
  Layers,
  ClipboardList,
  RefreshCw,
  Zap
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type BciTabValue = "friction" | "performance" | "activity";

export default function BciPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<BciTabValue>("friction");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State
  const [filterPeriod, setFilterPeriod] = useState("7d");
  const [filterSystem, setFilterSystem] = useState("Todos");
  const [filterCheckout, setFilterCheckout] = useState("Todos");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmExport = async () => {
    triggerToast("Preparando exportação em formato PDF...");
    setLoading(true);
    setTimeout(() => {
      triggerToast("Download do PDF concluído com sucesso!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1A1A2E] border border-slate-800 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full shrink-0 animate-ping" />
          <span className="text-[12px] font-[600]">{toastMessage}</span>
        </div>
      )}

      {/* CARD PRINCIPAL (Wrapper) */}
      <div className="bg-transparent flex-1 overflow-hidden flex flex-col min-h-0">
        
        {/* CABEÇALHO (Igual às outras telas) */}
        <div className="bg-white rounded-t-[18px] border border-[#E5E7EB] border-b-0 p-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-[12px]">
            <div className="w-[40px] h-[40px] rounded-[10px] bg-[#F4EEFF] flex items-center justify-center shrink-0">
              <PieChart className="w-[20px] h-[20px] text-[#7C3AED]" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[20px] font-[700] text-[#1A1A2E] leading-tight">
                Relatórios & BI
              </h1>
              <p className="text-[12px] text-[#6B7280] mt-0.5">
                Centro de inteligência preditiva e análise de conversões assistido por IA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleConfirmExport}
              disabled={loading}
              className="flex items-center gap-[6px] px-[16px] py-[10px] bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#1A1A2E] hover:border-[#D1D5DB] transition-all text-[12px] font-[600] rounded-[8px] shadow-sm tracking-wide disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-[#7C3AED]" /> : <Download className="w-4 h-4 text-[#9CA3AF]" />}
              EXPORTAR PDF
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#FCFCFD] border-x border-b border-[#E5E7EB] p-[16px_24px] grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-[700] text-[#6B7280] uppercase tracking-wider mb-1.5 ml-1">Período</span>
            <div className="relative">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="appearance-none w-full bg-white border border-[#E5E7EB] rounded-[8px] px-3 py-2 text-[12px] font-[600] text-[#1A1A2E] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all cursor-pointer h-[38px]"
              >
                <option value="Hoje">Hoje</option>
                <option value="Ontem">Ontem</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-[700] text-[#6B7280] uppercase tracking-wider mb-1.5 ml-1">Sistema</span>
            <div className="relative">
              <select
                value={filterSystem}
                onChange={(e) => setFilterSystem(e.target.value)}
                className="appearance-none w-full bg-white border border-[#E5E7EB] rounded-[8px] px-3 py-2 text-[12px] font-[600] text-[#1A1A2E] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all cursor-pointer h-[38px]"
              >
                <option value="Todos">Todos os Sistemas</option>
                <option value="E-commerce">E-commerce Central</option>
                <option value="ERP">ERP Conectado</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-[700] text-[#6B7280] uppercase tracking-wider mb-1.5 ml-1">Checkout</span>
            <div className="relative">
              <select
                value={filterCheckout}
                onChange={(e) => setFilterCheckout(e.target.value)}
                className="appearance-none w-full bg-white border border-[#E5E7EB] rounded-[8px] px-3 py-2 text-[12px] font-[600] text-[#1A1A2E] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all cursor-pointer h-[38px]"
              >
                <option value="Todos">Todos os Checkouts</option>
                <option value="Basileia Checkout Pro">Basileia Checkout Pro</option>
                <option value="Mercado Pago Checkout">Mercado Pago Checkout</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F9FAFB] p-[24px]">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            
            {/* Score Card */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-[150px]">
              <span className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wider">Score do Checkout</span>
              <div className="flex items-center justify-between mt-2">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" className="stroke-[#F3F4F6]" strokeWidth="6" fill="transparent" />
                    <circle cx="40" cy="40" r="34" className="stroke-[#10B981]" strokeWidth="6" fill="transparent" strokeDasharray="213" strokeDashoffset="34" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[22px] font-[800] text-[#1A1A2E] leading-none">84</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <h4 className="text-[13px] font-[700] text-[#10B981] leading-none">Saudável</h4>
                  <div className="inline-flex items-center text-[10px] font-[700] text-[#059669] bg-[#ECFDF5] px-2 py-1 rounded">
                    +12 pts vs mês ant.
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Card */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[150px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wider">Confiança da IA</span>
                <span className="text-[10px] font-[700] text-[#7C3AED] bg-[#F4EEFF] px-2 py-1 rounded">Alta (92%)</span>
              </div>
              <h4 className="text-[14px] font-[800] text-[#1A1A2E] mt-3">Análise Preditiva Estável</h4>
              <div className="w-full bg-[#F3F4F6] h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-[#7C3AED] h-full rounded-full w-[92%]" />
              </div>
              <div className="flex justify-between mt-3 text-[11px] font-[600] text-[#6B7280]">
                <span>Sinais fortes: <span className="text-[#1A1A2E]">24</span></span>
                <span>Falsos positivos: <span className="text-[#1A1A2E]">2</span></span>
              </div>
            </div>

            {/* Impact Card */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[150px]">
              <span className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wider">Impacto de Conversão</span>
              <div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  <h4 className="text-[20px] font-[800] text-[#1A1A2E]">+12,5%</h4>
                </div>
                <p className="text-[11px] text-[#6B7280] font-[500] mt-1">Ganho potencial em receita estimado</p>
              </div>
              <div className="mt-3 text-[11px] font-[700] text-[#4B5563] bg-[#F9FAFB] border border-[#E5E7EB] p-2 rounded-[8px] flex items-center justify-between">
                <span className="uppercase tracking-wider">Projeção Mensal</span>
                <span className="text-[#10B981]">R$ 45.230,00</span>
              </div>
            </div>

            {/* Operational Risk Card */}
            <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[150px]">
              <span className="text-[11px] font-[700] text-[#6B7280] uppercase tracking-wider">Risco Operacional</span>
              <div>
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                  <h4 className="text-[20px] font-[800] text-[#1A1A2E]">Moderado</h4>
                </div>
                <p className="text-[11px] text-[#6B7280] font-[500] mt-1">Algumas fricções no gateway principal</p>
              </div>
              <div className="mt-3 text-[11px] font-[700] text-[#4B5563] bg-[#FEF3C7] border border-[#FDE68A] p-2 rounded-[8px] flex items-center justify-between">
                <span className="uppercase text-[#B45309]">Fricções Críticas</span>
                <span className="bg-[#FFFBEB] text-[#D97706] px-2 py-0.5 rounded">3</span>
              </div>
            </div>

          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#E5E7EB] mb-6">
            <button
              onClick={() => setActiveTab('friction')}
              className={`pb-3 px-5 text-[12px] font-[700] uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'friction' ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"
              }`}
            >
              <Flame className="w-4 h-4" />
              Fricções & Otimização
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`pb-3 px-5 text-[12px] font-[700] uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'performance' ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"
              }`}
            >
              <Layers className="w-4 h-4" />
              Desempenho A/B
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 px-5 text-[12px] font-[700] uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'activity' ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-[#6B7280] hover:text-[#1A1A2E]"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Benchmarks Internos
            </button>
          </div>

          {/* TAB CONTENTS */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
            
            {/* Left Content (Fills 3 columns) */}
            <div className="xl:col-span-3">
              
              {activeTab === 'friction' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                  <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4 mb-4">
                      <h3 className="text-[14px] font-[800] text-[#1A1A2E] uppercase tracking-wide">
                        Pontos de Fricção (Top 3)
                      </h3>
                      <span className="text-[10px] font-[700] text-[#EF4444] bg-[#FEF2F2] px-2.5 py-1 rounded border border-[#FECACA]">ALERTA ATIVO</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Taxa de rejeição no Cartão", stage: "Pagamento", impact: "-4,2% conversão", color: "text-[#EF4444]", bg: "bg-[#FEF2F2]" },
                        { title: "Formulário de endereço longo", stage: "Identificação", impact: "-2,1% conversão", color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" },
                        { title: "Lentidão no cálculo de frete", stage: "Entrega", impact: "-1,5% conversão", color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-[12px] border border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                          <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-[13px] font-[700] text-[#1A1A2E]">{item.title}</h4>
                            <p className="text-[11px] text-[#6B7280] font-[500] mt-0.5">Fase: {item.stage}</p>
                            <span className={`inline-block mt-1.5 text-[10px] font-[800] ${item.color}`}>{item.impact}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4 mb-4">
                      <h3 className="text-[14px] font-[800] text-[#1A1A2E] uppercase tracking-wide">
                        Recomendações da IA
                      </h3>
                      <span className="text-[10px] font-[700] text-[#10B981] bg-[#ECFDF5] px-2.5 py-1 rounded border border-[#A7F3D0]">AÇÕES SUGERIDAS</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Habilitar retentativa automática", desc: "Recupera falhas de cartão em D+1.", gain: "+R$ 12k/mês" },
                        { title: "Autocompletar CEP nativo", desc: "Reduz tempo de preenchimento em 4s.", gain: "+R$ 5k/mês" },
                        { title: "Ativar Pix Copy & Paste 1-Click", desc: "Aumenta conversão mobile.", gain: "+R$ 8k/mês" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-[12px] border border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                          <div className="w-8 h-8 rounded-full bg-[#F4EEFF] text-[#7C3AED] flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-[13px] font-[700] text-[#1A1A2E]">{item.title}</h4>
                            <p className="text-[11px] text-[#6B7280] font-[500] mt-0.5">{item.desc}</p>
                            <span className="inline-block mt-1.5 text-[10px] font-[800] text-[#10B981]">{item.gain}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4 mb-4">
                    <h3 className="text-[14px] font-[800] text-[#1A1A2E] uppercase tracking-wide">
                      Histórico de Testes A/B
                    </h3>
                  </div>
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-[12px] font-[500] text-[#4B5563]">
                      <thead className="bg-[#F9FAFB] text-[10px] font-[800] uppercase text-[#6B7280] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 text-left rounded-l-[8px]">Versão</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-center">Conversão</th>
                          <th className="px-4 py-3 text-center">Tempo Pag.</th>
                          <th className="px-4 py-3 text-right rounded-r-[8px]">Receita/mês</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        <tr>
                          <td className="px-4 py-4 font-[700] text-[#1A1A2E]">v2.4.1 (Atual)</td>
                          <td className="px-4 py-4"><span className="text-[10px] font-[700] text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded">Vencedora</span></td>
                          <td className="px-4 py-4 text-center font-[700] text-[#1A1A2E]">84,5%</td>
                          <td className="px-4 py-4 text-center">1m 12s</td>
                          <td className="px-4 py-4 text-right font-[700] text-[#10B981]">R$ 145k</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-4 font-[700] text-[#6B7280]">v2.4.0 (A)</td>
                          <td className="px-4 py-4"><span className="text-[10px] font-[700] text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded">Arquivada</span></td>
                          <td className="px-4 py-4 text-center font-[700]">78,2%</td>
                          <td className="px-4 py-4 text-center">1m 45s</td>
                          <td className="px-4 py-4 text-right font-[700]">R$ 112k</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4 mb-4">
                    <h3 className="text-[14px] font-[800] text-[#1A1A2E] uppercase tracking-wide">
                      Benchmarks do Setor
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-[12px] bg-[#F4EEFF] border border-[#E8DDFD] flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-[800] text-[#7C3AED]">Sua Conversão (84,5%)</h4>
                        <p className="text-[12px] text-[#6D28D9] font-[500] mt-1">Você está no Top 5% dos nossos lojistas de E-commerce.</p>
                      </div>
                      <Trophy className="w-10 h-10 text-[#7C3AED] opacity-50" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Content (Fills 1 column) - Mapa de Confiança */}
            <div className="xl:col-span-1">
              <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-sm sticky top-4">
                <h3 className="text-[13px] font-[800] text-[#1A1A2E] uppercase tracking-wide border-b border-[#F3F4F6] pb-3 mb-4">
                  Mapa de Confiança do Funil
                </h3>
                
                <div className="space-y-4">
                  {[
                    { name: "Identificação", val: "94/100", pct: 94, color: "bg-[#10B981]" },
                    { name: "Entrega", val: "88/100", pct: 88, color: "bg-[#10B981]" },
                    { name: "Pagamento", val: "72/100", pct: 72, color: "bg-[#F59E0B]" },
                    { name: "Revisão", val: "98/100", pct: 98, color: "bg-[#7C3AED]" }
                  ].map((map, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-[700] text-[#4B5563]">
                        <span>{map.name}</span>
                        <span className="text-[#1A1A2E]">{map.val}</span>
                      </div>
                      <div className="w-full bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${map.color}`} style={{ width: `${map.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-[#F3F4F6]">
                  <div className="flex items-center justify-between text-[13px] font-[800] text-[#1A1A2E]">
                    <span>Score BCI Geral</span>
                    <span className="text-[#7C3AED] bg-[#F4EEFF] px-3 py-1 rounded-[8px]">84/100</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
