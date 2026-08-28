"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, ChevronRight, UserRound, Sun, SunDim, Moon, Calendar, Clock, ShoppingCart, BarChart3, Repeat, Shield } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ComposedChart } from "recharts";

// Data adaptada para Basileia Pay
const lineData = [
  { name: '03/06', pix: 45200, cartao: 32100, boleto: 8700, total: 86000 },
  { name: '10/06', pix: 52300, cartao: 38400, boleto: 9200, total: 99900 },
  { name: '17/06', pix: 48100, cartao: 41200, boleto: 7800, total: 97100 },
  { name: '24/06', pix: 61400, cartao: 44500, boleto: 10300, total: 116200 },
  { name: '01/07', pix: 58900, cartao: 47800, boleto: 11200, total: 117900 },
  { name: '08/07', pix: 67200, cartao: 52100, boleto: 12400, total: 131700 },
  { name: '15/07', pix: 71500, cartao: 55300, boleto: 13100, total: 139900 },
  { name: '22/07', pix: 74800, cartao: 58200, boleto: 14500, total: 147500 },
  { name: '29/07', pix: 82100, cartao: 61400, boleto: 15200, total: 158700 },
  { name: '05/08', pix: 78400, cartao: 59800, boleto: 14800, total: 153000 },
  { name: '12/08', pix: 85300, cartao: 63200, boleto: 16100, total: 164600 },
  { name: '19/08', pix: 91200, cartao: 67500, boleto: 17300, total: 176000 },
];

const pieData = [
  { name: 'Aprovado', value: 1247, color: '#10B981' },
  { name: 'Pendente', value: 89, color: '#F59E0B' },
  { name: 'Recusado', value: 34, color: '#EF4444' },
  { name: 'Estornado', value: 18, color: '#9CA3AF' },
];

const barData = [
  { name: 'PIX', pv: 52 },
  { name: 'Crédito', pv: 28 },
  { name: 'Débito', pv: 11 },
  { name: 'Boleto', pv: 7 },
  { name: 'Outros', pv: 2 },
];

const actionList = [
  { cliente: 'Maria Santos', motivo: 'Chargeback em análise', gateway: 'Stripe', prazo: 'Hoje', status: 'Urgente', color: 'text-red-500 bg-red-50' },
  { cliente: 'João Oliveira', motivo: 'Pagamento recorrente falhou', gateway: 'PagSeguro', prazo: 'Hoje', status: 'Em análise', color: 'text-purple-600 bg-purple-50' },
  { cliente: 'TechCorp Ltda', motivo: 'Limite de transação atingido', gateway: 'Cielo', prazo: 'Amanhã', status: 'Atenção', color: 'text-yellow-600 bg-yellow-50' },
  { cliente: 'Ana Ferreira', motivo: 'Novo checkout criado', gateway: 'Mercado Pago', prazo: 'Hoje', status: 'Info', color: 'text-blue-500 bg-blue-50' },
];

export default function DashboardPage() {
  const [dashboardData] = useState({
    lineData,
    pieData,
    barData,
    actionList,
    stats: {
      volumeHoje: 176000,
      volumeVariacao: 8.4,
      transacoesHoje: 1388,
      ticketMedio: 126.80,
      taxaAprovacao: 97.2
    }
  });

  const [greeting, setGreeting] = useState("Bom dia");
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Bom dia");
    else if (hour >= 12 && hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  const getGreetingConfig = () => {
    if (greeting === "Bom dia") {
      return {
        icon: <Sun className="w-[32px] h-[32px] text-white drop-shadow-sm" strokeWidth={2} />,
        bg: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_4px_14px_rgba(245,158,11,0.3)]"
      }
    }
    if (greeting === "Boa tarde") {
      return {
        icon: <SunDim className="w-[32px] h-[32px] text-white drop-shadow-sm" strokeWidth={2} />,
        bg: "bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_4px_14px_rgba(56,187,248,0.3)]"
      }
    }
    return {
      icon: <Moon className="w-[28px] h-[28px] text-white drop-shadow-sm" strokeWidth={2.2} />,
      bg: "bg-gradient-to-br from-[#3B0764] to-[#0F172A] shadow-[0_4px_14px_rgba(59,7,100,0.3)]"
    }
  };
  const greetingConfig = getGreetingConfig();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="flex flex-col gap-0 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full">
      
      {/* HEADER */}
      <div className="bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] rounded-[16px] p-[16px_24px] flex items-center justify-between shadow-[0_4px_16px_rgba(124,58,237,0.3)] shrink-0 mb-[16px]">
        <div className="flex items-center gap-[16px]">
          <div className={`w-[56px] h-[56px] rounded-[14px] flex items-center justify-center shrink-0 [&>svg]:!w-[28px] [&>svg]:!h-[28px] ${greetingConfig.bg}`}>
            {greetingConfig.icon}
          </div>
          <div className="flex flex-col">
            <h1 className="text-[28px] font-[800] text-white leading-tight drop-shadow-sm tracking-tight">
              {greeting}, Admin
            </h1>
            <p className="text-[14px] text-purple-200 mt-1">Aqui estão os indicadores financeiros mais importantes do seu negócio hoje.</p>
          </div>
        </div>
        
        {/* RIGHT - Card Próximo Vencimento */}
        <div className="bg-white/10 backdrop-blur-md rounded-[12px] p-[12px_16px] flex items-center gap-[12px] border border-white/20 text-white w-[280px] shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] hover:bg-white/15 transition-colors cursor-default">
          <div className="w-[40px] h-[40px] rounded-[10px] bg-white/20 flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-[20px] h-[20px] text-white drop-shadow-sm" strokeWidth={2.2} />
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-[10px] font-[700] text-[#E9D5FF] uppercase tracking-[0.06em]">Próximo Repasse</span>
            <span className="text-[14px] font-[800] text-white leading-snug mt-0.5 truncate drop-shadow-sm">R$ 84.320,00</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[#E9D5FF]">
              <Clock className="w-[11px] h-[11px] opacity-80" />
              <span className="text-[11px] font-[500] opacity-90 truncate">Sexta-feira, 08/08</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col gap-[12px] min-h-0 pb-4">
        
        {/* ROW 1: 4 KPI Cards */}
        <div className="grid grid-cols-4 gap-[16px] min-h-[85px] shrink-0">
          {/* Card 1: Volume Hoje */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[16px_18px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.location.href = "/dashboard/payments"}>
            <div className="flex flex-col overflow-hidden w-full">
              <span className="text-[12px] font-[600] text-[#6B7280] truncate">Volume processado hoje</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[24px] font-[800] text-[#1A1A2E]">{formatCurrency(dashboardData.stats.volumeHoje)}</span>
              </div>
              <span className="text-[11px] font-[600] text-[#10B981] mt-0.5 flex items-center gap-1 truncate">
                <TrendingUp className="w-[12px] h-[12px] shrink-0" strokeWidth={3} /> +{dashboardData.stats.volumeVariacao}% vs. ontem
              </span>
            </div>
            <div className="w-[42px] h-[42px] rounded-[10px] bg-[#F4EEFF] flex items-center justify-center shrink-0 ml-2">
              <DollarSign className="w-[20px] h-[20px] text-[#7C3AED]" strokeWidth={2.4} />
            </div>
          </div>

          {/* Card 2: Transações Hoje */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[16px_18px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.location.href = "/dashboard/orders"}>
            <div className="flex flex-col overflow-hidden w-full">
              <span className="text-[12px] font-[600] text-[#6B7280] truncate">Transações hoje</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[24px] font-[800] text-[#1A1A2E]">{dashboardData.stats.transacoesHoje.toLocaleString('pt-BR')}</span>
              </div>
              <span className="text-[11px] font-[600] text-[#6B7280] mt-0.5 truncate">
                342 na última hora
              </span>
            </div>
            <div className="w-[42px] h-[42px] rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0 ml-2">
              <ShoppingCart className="w-[20px] h-[20px] text-blue-600" strokeWidth={2.4} />
            </div>
          </div>

          {/* Card 3: Ticket Médio */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[16px_18px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.location.href = "/dashboard/bci"}>
            <div className="flex flex-col overflow-hidden w-full">
              <span className="text-[12px] font-[600] text-[#6B7280] truncate">Ticket médio</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[24px] font-[800] text-[#1A1A2E]">{formatCurrency(dashboardData.stats.ticketMedio)}</span>
              </div>
              <span className="text-[11px] font-[600] text-yellow-600 mt-0.5 flex items-center gap-1 truncate">
                <AlertTriangle className="w-[12px] h-[12px] shrink-0" strokeWidth={3} /> -2.3% vs. semana passada
              </span>
            </div>
            <div className="w-[42px] h-[42px] rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0 ml-2">
              <CreditCard className="w-[20px] h-[20px] text-blue-600" strokeWidth={2.4} />
            </div>
          </div>

          {/* Card 4: Taxa de Aprovação */}
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[16px_18px] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => window.location.href = "/dashboard/trust"}>
            <div className="flex flex-col overflow-hidden w-full">
              <span className="text-[12px] font-[600] text-[#6B7280] truncate">Taxa de aprovação</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[24px] font-[800] text-[#1A1A2E]">{dashboardData.stats.taxaAprovacao}%</span>
              </div>
              <span className="text-[11px] font-[600] text-[#10B981] mt-0.5 flex items-center gap-1 truncate">
                <Shield className="w-[12px] h-[12px] shrink-0" strokeWidth={3} /> Acima da meta (95%)
              </span>
            </div>
            <div className="w-[42px] h-[42px] rounded-[10px] bg-green-50 flex items-center justify-center shrink-0 ml-2">
              <BarChart3 className="w-[20px] h-[20px] text-green-600" strokeWidth={2.4} />
            </div>
          </div>
        </div>

        {/* ROW 2: Volume por Método + Status das Transações */}
        <div className="flex gap-[12px] h-[250px] shrink-0">
          {/* Line Chart: Volume por Método de Pagamento */}
          <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] flex-1 flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center mb-[12px] shrink-0">
              <span className="text-[14px] font-[700] text-[#1A1A2E]">Volume por método de pagamento</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#8B5CF6]"></div><span className="text-[11px] font-[500] text-[#6B7280]">PIX</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div><span className="text-[11px] font-[500] text-[#6B7280]">Cartão</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-[2px] bg-[#D1D5DB] border-dashed border-t"></div><span className="text-[11px] font-[500] text-[#6B7280]">Total</span></div>
                </div>
                <select className="text-[11px] border border-[#E5E7EB] px-2 py-1 rounded-[6px] text-[#4B5563] outline-none">
                  <option>Últimas 12 semanas</option>
                </select>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0 ml-[-24px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dashboardData.lineData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 500 }} 
                    formatter={(value: any) => [formatCurrency(value as number), undefined]}
                  />
                  <Line type="monotone" dataKey="pix" name="PIX" stroke="#8B5CF6" strokeWidth={2} dot={{r:2}} activeDot={{r:4}} />
                  <Line type="monotone" dataKey="cartao" name="Cartão" stroke="#3B82F6" strokeWidth={2} dot={{r:2}} activeDot={{r:4}} />
                  <Line type="monotone" dataKey="total" name="Total" strokeDasharray="4 4" stroke="#D1D5DB" strokeWidth={2} dot={false} activeDot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Donut Chart: Status das Transações */}
          <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] w-[340px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <span className="text-[14px] font-[700] text-[#1A1A2E] mb-[8px] shrink-0">Status das transações</span>
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
              <div className="w-[110px] h-[110px] mx-auto relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.pieData}
                      innerRadius={38}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {dashboardData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                  <span className="text-[20px] font-[800] text-[#1A1A2E] leading-none">{dashboardData.pieData.reduce((a, b) => a + b.value, 0).toLocaleString('pt-BR')}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                {dashboardData.pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 w-[110px]">
                    <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-[500] text-[#6B7280] truncate">{item.name}</span>
                    <span className="text-[10px] font-[700] text-[#1A1A2E] ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Table + Chart */}
        <div className="flex gap-[12px] shrink-0 h-[220px]">
          
          {/* Ações Prioritárias (Table) */}
          <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] flex-1 flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-0 overflow-hidden">
            <div className="flex justify-between items-center mb-[8px] shrink-0">
              <span className="text-[14px] font-[700] text-[#1A1A2E]">Alertas e ações prioritárias</span>
              <a href="/dashboard/trust" className="text-[11px] font-[600] text-[#7C3AED] hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="w-3 h-3" />
              </a>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F1F1F4]">
                    <th className="pb-2 text-[10px] font-[700] text-[#9CA3AF] uppercase sticky top-0 bg-white">Cliente</th>
                    <th className="pb-2 text-[10px] font-[700] text-[#9CA3AF] uppercase sticky top-0 bg-white">Motivo</th>
                    <th className="pb-2 text-[10px] font-[700] text-[#9CA3AF] uppercase sticky top-0 bg-white">Gateway</th>
                    <th className="pb-2 text-[10px] font-[700] text-[#9CA3AF] uppercase sticky top-0 bg-white">Prazo</th>
                    <th className="pb-2 text-[10px] font-[700] text-[#9CA3AF] uppercase text-right sticky top-0 bg-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.actionList.map((item, idx) => (
                    <tr key={idx} className="border-b border-[#F1F1F4] last:border-0 hover:bg-[#F9FAFB] cursor-pointer" onClick={() => window.location.href = `/dashboard/orders?search=${encodeURIComponent(item.cliente)}`}>
                      <td className="py-2.5 text-[12px] font-[600] text-[#1A1A2E] flex items-center gap-2">
                        <div className="w-[20px] h-[20px] rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                            <UserRound className="w-2.5 h-2.5 text-gray-400" />
                        </div>
                        {item.cliente}
                      </td>
                      <td className="py-2.5 text-[11px] font-[500] text-[#4B5563] truncate max-w-[150px]">{item.motivo}</td>
                      <td className="py-2.5 text-[11px] font-[500] text-[#6D28D9]">{item.gateway}</td>
                      <td className="py-2.5 text-[11px] font-[500] text-[#4B5563]">{item.prazo}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[10px] font-[700] tracking-wide ${item.color}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribuição por Método (Bar Chart) */}
          <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] w-[340px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-0">
            <div className="flex justify-between items-center mb-[12px] shrink-0">
              <span className="text-[14px] font-[700] text-[#1A1A2E]">Distribuição por método</span>
              <select className="text-[11px] text-[#6B7280] outline-none bg-transparent">
                <option>% do volume</option>
              </select>
            </div>
            <div className="flex-1 w-full min-h-0 ml-[-20px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.barData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(v)=>`${v}%`} />
                  <Tooltip cursor={{fill: '#F4EEFF'}} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                  <Bar dataKey="pv" name="Volume" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={32} className="cursor-pointer" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    
      {/* RODAPÉ COPYRIGHT */}
      <div className="mt-[22px] pb-[12px]">
        <p className="text-[14px] text-[#6B7280]">
          COPYRIGHT © 2026 <span className="font-[700] text-[#6D28D9]">Basileia Pay</span>, Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
