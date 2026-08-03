"use client";

import React, { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  BrainCircuit,
  Settings2,
  Plus,
  Info,
  TrendingUp,
  ChevronRight,
  Zap,
  Flame,
  CheckCircle2,
  Trophy,
  RefreshCw,
  Layers,
  ClipboardList,
  Download,
  ChevronDown,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Activity,
  Filter,
  MoreHorizontal,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  ComposedChart
} from "recharts";

type BciTabValue = "friction" | "performance" | "activity";

// Mock Data for Charts
const frictionData = [
  { day: '01/08', score: 92, alerts: 1 },
  { day: '02/08', score: 88, alerts: 3 },
  { day: '03/08', score: 85, alerts: 4 },
  { day: '04/08', score: 82, alerts: 5 },
  { day: '05/08', score: 78, alerts: 7 },
  { day: '06/08', score: 84, alerts: 2 },
  { day: '07/08', score: 89, alerts: 1 },
];

const abTestData = [
  { day: 'Seg', vA: 3.2, vB: 3.8 },
  { day: 'Ter', vA: 3.1, vB: 4.1 },
  { day: 'Qua', vA: 3.4, vB: 4.5 },
  { day: 'Qui', vA: 3.3, vB: 4.2 },
  { day: 'Sex', vA: 3.5, vB: 4.8 },
  { day: 'Sáb', vA: 3.8, vB: 5.1 },
  { day: 'Dom', vA: 3.9, vB: 5.4 },
];

const sparklineData1 = [{ v: 4 }, { v: 7 }, { v: 5 }, { v: 8 }, { v: 9 }, { v: 12 }];
const sparklineData2 = [{ v: 12 }, { v: 10 }, { v: 8 }, { v: 6 }, { v: 4 }, { v: 3 }];

export default function BciPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<BciTabValue>("friction");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [resolvedFrictions, setResolvedFrictions] = useState<number[]>([]);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // Filters State
  const [filterPeriod, setFilterPeriod] = useState("7d");
  const [filterSystem, setFilterSystem] = useState("Todos");
  const [filterCheckout, setFilterCheckout] = useState("Todos");

  // Handle Tab Switch with simulated delay
  const handleTabChange = (tab: BciTabValue) => {
    setActiveTab(tab);
    setIsTabLoading(true);
    setTimeout(() => setIsTabLoading(false), 600);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleResolveFriction = (id: number) => {
    setResolvingId(id);
    setTimeout(() => {
      setResolvedFrictions((prev) => [...prev, id]);
      setResolvingId(null);
    }, 1500);
  };

  const ExportButton = (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="h-10 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm shadow-brand/20 transition-all disabled:opacity-70 disabled:cursor-wait"
    >
      {isExporting ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isExporting ? "Gerando PDF..." : "Exportar Relatório"}
    </button>
  );

  return (
    <PageLayout title="BCI & Análise Preditiva" action={ExportButton}>
      
      {/* Top Filter Bar */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 p-2 rounded-2xl flex flex-wrap lg:flex-nowrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 border-r border-slate-200/60">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros</span>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 cursor-pointer transition-all shadow-sm"
          >
            <option value="Hoje">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
          
          <select
            value={filterSystem}
            onChange={(e) => setFilterSystem(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 cursor-pointer transition-all shadow-sm"
          >
            <option value="Todos">Todos os Sistemas</option>
            <option value="E-commerce">E-commerce Central</option>
            <option value="ERP">ERP Conectado</option>
          </select>

          <select
            value={filterCheckout}
            onChange={(e) => setFilterCheckout(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 cursor-pointer transition-all shadow-sm"
          >
            <option value="Todos">Todos os Checkouts</option>
            <option value="Pro">Basileia Checkout Pro</option>
            <option value="Básico">Checkout Básico</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Score Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Score do Checkout
            </span>
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-end gap-3">
            <div className="text-4xl font-black text-slate-800 tracking-tight">84<span className="text-xl text-slate-400">/100</span></div>
            <div className="mb-1 flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs font-bold">
              <TrendingUp className="w-3 h-3" />
              +12 pts
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full w-[84%] transition-all duration-1000" />
          </div>
        </div>

        {/* Confidence Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Confiança da IA
            </span>
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-end gap-3">
            <div className="text-3xl font-black text-slate-800 tracking-tight">92%</div>
            <div className="mb-1 text-slate-500 text-xs font-bold">Estável</div>
          </div>
          
          <div className="mt-4 flex gap-2">
             <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 text-center">
               <span className="block text-[9px] font-black text-slate-400 uppercase">Sinais</span>
               <span className="text-sm font-bold text-slate-700">2,450</span>
             </div>
             <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 text-center">
               <span className="block text-[9px] font-black text-slate-400 uppercase">Alertas</span>
               <span className="text-sm font-bold text-amber-600">2</span>
             </div>
          </div>
        </div>

        {/* Impact Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Impacto Projetado
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-end gap-3 mb-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">+ R$ 45.230</div>
          </div>

          <div className="h-10 w-full opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData1}>
                <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Risco Operacional
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-end gap-3 mb-3">
            <div className="text-2xl font-black text-amber-600 tracking-tight">Baixo</div>
            <div className="mb-1 text-slate-500 text-xs font-bold">-3 Fricções</div>
          </div>

          <div className="h-10 w-full opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData2}>
                <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Area (Tabs + Content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom Tab Switcher */}
          <div className="bg-white rounded-2xl p-1.5 inline-flex border border-slate-200 shadow-sm w-full md:w-auto">
            <button
              onClick={() => handleTabChange('friction')}
              className={cn(
                "flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2",
                activeTab === 'friction' ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <Flame className="w-4 h-4" />
              Fricções
            </button>
            <button
              onClick={() => handleTabChange('performance')}
              className={cn(
                "flex-1 md:flex-none px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2",
                activeTab === 'performance' ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              <Layers className="w-4 h-4" />
              Testes A/B
            </button>
          </div>

          {/* Tab Content Wrapper */}
          <div className={cn("transition-opacity duration-300", isTabLoading ? "opacity-40 pointer-events-none" : "opacity-100")}>
            
            {activeTab === 'friction' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Chart Section */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Evolução de Fricções</h3>
                      <p className="text-xs text-slate-500 mt-1">Impacto negativo na conversão ao longo da semana.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand" /> Score
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 ml-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Alertas
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={frictionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6d28d9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} domain={[60, 100]} />
                        <YAxis yAxisId="right" orientation="right" hide />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                          labelStyle={{ fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}
                          itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                        />
                        <Area yAxisId="left" type="monotone" dataKey="score" stroke="#6d28d9" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        <Bar yAxisId="right" dataKey="alerts" barSize={10} fill="#fbbf24" radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Interactive Action List */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Alertas Ativos</h3>
                    <span className="bg-brand/10 text-brand text-xs font-black px-3 py-1 rounded-full">3 pendentes</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 1, title: "Taxa de rejeição no Cartão", stage: "Pagamento", impact: "-4,2%", color: "text-red-500", bg: "bg-red-50", type: "Crítico" },
                      { id: 2, title: "Formulário de endereço longo", stage: "Identificação", impact: "-2,1%", color: "text-amber-500", bg: "bg-amber-50", type: "Atenção" },
                      { id: 3, title: "Lentidão no cálculo de frete", stage: "Entrega", impact: "-1,5%", color: "text-amber-500", bg: "bg-amber-50", type: "Atenção" }
                    ].map((item) => {
                      const isResolved = resolvedFrictions.includes(item.id);
                      const isResolving = resolvingId === item.id;
                      
                      if (isResolved) return null;

                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${item.color} ${item.bg}`}>
                                  {item.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <span>Fase: <span className="text-slate-700">{item.stage}</span></span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-red-500">Impacto: {item.impact} conv.</span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleResolveFriction(item.id)}
                            disabled={isResolving}
                            className="shrink-0 sm:w-auto w-full h-10 px-6 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                          >
                            {isResolving ? (
                              <><RefreshCw className="w-4 h-4 animate-spin" /> Resolvendo...</>
                            ) : (
                              <>Resolver com IA <Sparkles className="w-3.5 h-3.5" /></>
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {resolvedFrictions.length === 3 && (
                      <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-emerald-800 mb-1">Tudo limpo!</h4>
                        <p className="text-sm text-emerald-600/80 font-bold">Nenhuma fricção detectada no seu checkout.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Testes A/B em Andamento</h3>
                      <p className="text-xs text-slate-500 mt-1">Comparativo de conversão das variantes ativas.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Controle (v2.4)
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 ml-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand" /> Variante (v2.5)
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={abTestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={(v) => `${v}%`} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => [`${value}%`, 'Conversão']}
                        />
                        <Line type="monotone" dataKey="vA" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="vB" stroke="#6d28d9" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Funnel & Confidence */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm sticky top-6">
            <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center justify-between">
              Funil de Conversão
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-emerald-100">Otimizado</span>
            </h3>

            <div className="relative">
              <div className="absolute left-4 top-4 bottom-8 w-0.5 bg-slate-100" />
              
              <div className="space-y-6">
                {[
                  { step: 'Visitas', val: '12.450', pct: 100, color: 'bg-slate-800' },
                  { step: 'Identificação', val: '9.820', pct: 78.8, color: 'bg-brand' },
                  { step: 'Entrega', val: '7.400', pct: 59.4, color: 'bg-brand' },
                  { step: 'Pagamento', val: '4.890', pct: 39.2, color: 'bg-brand' },
                  { step: 'Concluído', val: '4.500', pct: 36.1, color: 'bg-emerald-500' }
                ].map((item, i, arr) => (
                  <div key={i} className="relative pl-10">
                    <div className={`absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-4 border-white shadow-sm ${item.color} z-10`} />
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-600">{item.step}</span>
                      <span className="text-sm font-black text-slate-800">{item.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                    {i < arr.length - 1 && (
                      <div className="mt-2 text-right">
                        <span className="text-[10px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded">
                          -{((arr[i].pct - arr[i+1].pct) / arr[i].pct * 100).toFixed(1)}% drop
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Receita Perdida Estimada</span>
                <div className="text-xl font-black text-slate-800 mb-2">R$ 18.400<span className="text-sm text-slate-500">/mês</span></div>
                <p className="text-[10px] font-bold text-slate-500 leading-tight">
                  Se o drop-off no pagamento for reduzido em 5%, você recupera esse valor.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </PageLayout>
  );
}
