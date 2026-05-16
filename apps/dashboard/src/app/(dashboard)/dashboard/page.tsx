import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { FinancialCharts } from '@/components/dashboard/FinancialCharts';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { OperationalSidePanel } from '@/components/dashboard/OperationalSidePanel';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10 pb-12 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-brand">
            <h1 className="text-3xl font-black tracking-tight text-ink">Visão Geral</h1>
            <BarChart3 className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-muted font-medium text-[15px] max-w-2xl leading-relaxed">
            Monitore em tempo real o desempenho financeiro, conversões, transações e saúde operacional dos sistemas conectados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 bg-success/10 border border-success/20 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-success">Sistemas operando</span>
          </div>
          
          <button className="flex items-center gap-2.5 px-6 py-3 bg-brand text-white rounded-2xl font-bold shadow-lg shadow-brand/25 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all active:translate-y-0">
            <Sparkles className="w-4 h-4 text-white/80" />
            Nova análise
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Central Operations Area */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          {/* KPIs Section */}
          <section className="space-y-4">
             <KpiGrid />
          </section>

          {/* Charts Section */}
          <section className="space-y-4">
             <FinancialCharts />
          </section>

          {/* Critical Transactions Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-3 mb-2 px-2">
               <TrendingUp className="w-5 h-5 text-brand" />
               <h2 className="text-lg font-black uppercase tracking-widest text-ink">Transações Críticas</h2>
             </div>
             <TransactionTable />
          </section>
        </div>

        {/* Intelligence & Status Area */}
        <div className="xl:col-span-4">
          <section className="sticky top-[100px] space-y-4">
             <OperationalSidePanel />
          </section>
        </div>
      </div>
    </div>
  );
}
