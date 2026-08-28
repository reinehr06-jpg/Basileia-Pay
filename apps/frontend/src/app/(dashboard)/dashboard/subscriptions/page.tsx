"use client";

import React, { useState } from "react";
import {
  Repeat,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  XCircle,
  Pause,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from "recharts";

export default function SubscriptionsMetricsPage() {
  const [data, setData] = useState<{
    mrrData: any[];
    statusData: any[];
    churnData: any[];
    planData: any[];
    paymentMethodData: any[];
    renewalData: any[];
    kpis: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Integração real com o endpoint (que será desenvolvido no backend)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/dashboard/subscriptions/metrics`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('basileia_access_token') || ''}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setData(result.data);
        } else {
          // Fallback vazio em caso de erro
          setData({
            mrrData: [], statusData: [], churnData: [], planData: [], paymentMethodData: [], renewalData: [], kpis: [
              {
                label: "MRR (Receita Recorrente)", value: "R$ 0", change: "0%", positive: true, icon: "DollarSign", iconBg: "bg-[#F4EEFF]", iconColor: "text-[#7C3AED]"
              },
              {
                label: "Assinaturas Ativas", value: "0", change: "0%", positive: true, icon: "Users", iconBg: "bg-green-50", iconColor: "text-green-600"
              },
              {
                label: "Taxa de Renovação", value: "0%", change: "0%", positive: true, icon: "CheckCircle2", iconBg: "bg-blue-50", iconColor: "text-blue-600"
              },
              {
                label: "Churn Rate", value: "0%", change: "0%", positive: true, icon: "TrendingDown", iconBg: "bg-emerald-50", iconColor: "text-emerald-600"
              }
            ]
          });
        }
      } catch (err) {
        console.error('Erro ao buscar métricas de assinatura', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { mrrData, statusData, churnData, planData, paymentMethodData, renewalData, kpis } = data;


  const kpisWithIcons = kpis.map(kpi => {
    let iconComp = DollarSign;
    if (kpi.icon === 'Users') iconComp = Users;
    if (kpi.icon === 'CheckCircle2') iconComp = CheckCircle2;
    if (kpi.icon === 'TrendingDown') iconComp = TrendingDown;
    return { ...kpi, icon: iconComp };
  });

  return (
    <div className="flex flex-col gap-[16px] animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* HEADER */}
      <div className="flex items-center gap-[12px] shrink-0">
        <div className="w-[40px] h-[40px] rounded-[10px] bg-[#F4EEFF] flex items-center justify-center shrink-0">
          <Repeat
            className="w-[20px] h-[20px] text-[#7C3AED]"
            strokeWidth={2.2}
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-[20px] font-[700] text-[#1A1A2E] leading-tight">
            Métricas de Assinatura
          </h1>
          <p className="text-[12px] text-[#6B7280] mt-0.5">
            Visão geral de performance, receita recorrente e saúde das
            assinaturas.
          </p>
        </div>
      </div>

      {/* KPI CARDS — 4 cards em grid */}
      <div className="grid grid-cols-4 gap-[16px] shrink-0">
        {kpisWithIcons.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-[12px] border border-[#E5E7EB] p-[14px_16px] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] min-h-[90px]"
          >
            <div className="flex items-center justify-between mb-[8px]">
              <span className="text-[10px] font-[700] text-[#6B7280] uppercase tracking-wide truncate pr-2">
                {kpi.label}
              </span>
              <div
                className={`w-[28px] h-[28px] rounded-[8px] ${kpi.iconBg} flex items-center justify-center shrink-0`}
              >
                <kpi.icon
                  className={`w-[14px] h-[14px] ${kpi.iconColor}`}
                  strokeWidth={2.4}
                />
              </div>
            </div>
            <span className="text-[20px] font-[800] text-[#1A1A2E] leading-none">
              {kpi.value}
            </span>
            <span
              className={`text-[11px] font-[600] mt-[4px] flex items-center gap-1 ${kpi.positive ? "text-[#10B981]" : "text-[#EF4444]"}`}
            >
              {kpi.positive ? (
                <ArrowUpRight className="w-[12px] h-[12px]" strokeWidth={3} />
              ) : (
                <ArrowDownRight
                  className="w-[12px] h-[12px]"
                  strokeWidth={3}
                />
              )}
              {kpi.change} vs. mês anterior
            </span>
          </div>
        ))}
      </div>

      {/* ROW 2: MRR Evolution + Status Distribution */}
      <div className="flex gap-[12px] h-[280px] shrink-0">
        {/* MRR Evolution Chart */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] flex-1 flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-[12px] shrink-0">
            <span className="text-[14px] font-[700] text-[#1A1A2E]">
              Evolução do MRR
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#7C3AED]"></div>
                <span className="text-[11px] font-[500] text-[#6B7280]">
                  MRR
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                <span className="text-[11px] font-[500] text-[#6B7280]">
                  Churn
                </span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0 ml-[-24px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={mrrData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  dy={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "11px",
                    fontWeight: 500,
                  }}
                  formatter={(value: any) => [
                    formatCurrency(value as number),
                    undefined,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  name="MRR"
                  stroke="#7C3AED"
                  fill="#F4EEFF"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="churn"
                  name="Churn"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] w-[300px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <span className="text-[14px] font-[700] text-[#1A1A2E] mb-[8px] shrink-0">
            Distribuição por Status
          </span>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-0">
            <div className="w-[130px] h-[130px] mx-auto relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[22px] font-[800] text-[#1A1A2E] leading-none">
                  {statusData
                    .reduce((a, b) => a + b.value, 0)
                    .toLocaleString("pt-BR")}
                </span>
                <span className="text-[10px] font-[500] text-[#9CA3AF] mt-1">
                  Total
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-3">
              {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 w-[110px]">
                  <div
                    className="w-[6px] h-[6px] rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-[10px] font-[500] text-[#6B7280] truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-[700] text-[#1A1A2E] ml-auto">
                    {item.value.toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Churn Rate + Payment Methods + Renewals */}
      <div className="grid grid-cols-3 gap-[12px] shrink-0">
        {/* Churn Rate Trend */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-[220px]">
          <span className="text-[14px] font-[700] text-[#1A1A2E] mb-[12px] shrink-0">
            Taxa de Churn (%)
          </span>
          <div className="flex-1 w-full min-h-0 ml-[-20px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={churnData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  dy={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 5]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "11px",
                  }}
                  formatter={(v: any) => [`${v as number}%`, "Churn"]}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Churn"
                  stroke="#EF4444"
                  fill="#FEF2F2"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#EF4444" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-[220px]">
          <span className="text-[14px] font-[700] text-[#1A1A2E] mb-[12px] shrink-0">
            Métodos de Pagamento
          </span>
          <div className="flex-1 w-full min-h-0 ml-[-20px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentMethodData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  dy={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  cursor={{ fill: "#F4EEFF" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "11px",
                  }}
                  formatter={(v: any) => [`${v as number}%`, "Volume"]}
                />
                <Bar
                  dataKey="value"
                  name="Volume"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Renewals vs Cancellations */}
        <div className="bg-white rounded-[14px] border border-[#E5E7EB] p-[16px_20px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)] h-[220px]">
          <div className="flex justify-between items-center mb-[12px] shrink-0">
            <span className="text-[14px] font-[700] text-[#1A1A2E]">
              Renovações vs Cancelamentos
            </span>
          </div>
          <div className="flex-1 w-full min-h-0 ml-[-20px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={renewalData}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  dy={5}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "11px",
                  }}
                />
                <Bar
                  dataKey="renovacoes"
                  name="Renovações"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="cancelamentos"
                  name="Cancelamentos"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 4: Plan Distribution Table */}
      <div className="bg-white rounded-[14px] border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-[16px_24px] border-b border-[#F1F1F4]">
          <span className="text-[14px] font-[700] text-[#1A1A2E]">
            Receita por Plano
          </span>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_120px] items-center px-[24px] h-[40px] bg-[#FCFCFD] border-b border-[#F1F1F4]">
          <span className="text-[12px] font-[700] text-[#6B7280]">Plano</span>
          <span className="text-[12px] font-[700] text-[#6B7280]">
            Assinaturas
          </span>
          <span className="text-[12px] font-[700] text-[#6B7280]">
            Receita Mensal
          </span>
          <span className="text-[12px] font-[700] text-[#6B7280] text-center">
            % do Total
          </span>
        </div>
        {planData.map((plan) => {
          const totalReceita = planData.reduce((a, b) => a + b.receita, 0);
          const pct = ((plan.receita / totalReceita) * 100).toFixed(1);
          return (
            <div
              key={plan.name}
              className="grid grid-cols-[2fr_1fr_1fr_120px] items-center px-[24px] h-[42px] border-b border-[#F1F1F4] hover:bg-[#FAFAFC] transition-colors last:border-b-0"
            >
              <span className="text-[12px] font-[600] text-[#1A1A2E]">
                {plan.name}
              </span>
              <span className="text-[12px] font-[500] text-[#4B5563]">
                {plan.assinaturas.toLocaleString("pt-BR")}
              </span>
              <span className="text-[12px] font-[700] text-[#1A1A2E]">
                {formatCurrency(plan.receita)}
              </span>
              <div className="flex items-center justify-center">
                <div className="w-[60px] h-[6px] bg-[#F1F1F4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7C3AED] rounded-full"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-[600] text-[#6B7280] ml-[8px]">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
