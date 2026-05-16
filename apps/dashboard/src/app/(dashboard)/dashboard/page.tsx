import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { FinancialCharts } from '@/components/dashboard/FinancialCharts';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { OperationalSidePanel } from '@/components/dashboard/OperationalSidePanel';
import { BarChart3, Sparkles, Activity, Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Page Header - Compact & Executive */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-black tracking-tight text-ink">Visão Geral</h1>
            <div className="h-6 w-px bg-border/60 mx-1" />
            <BarChart3 className="w-5 h-5 text-brand opacity-60" />
          </div>
          <p className="text-slate/60 font-bold text-[13px] tracking-tight">
            Monitore em tempo real o desempenho, pagamento, conversão e operação
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-success/5 border border-success/10 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-success/80">Sistemas operando</span>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand to-brand-accent text-white rounded-xl text-[12px] font-black shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight">
            <BarChart3 className="w-4 h-4 text-white/80" />
            Nova análise
          </button>
        </div>
      </header>

      {/* Main Content Grid - High Density Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 units) - Operations & Financials */}
        <div className="xl:col-span-8 flex flex-col gap-6 min-w-0">
          
          {/* KPIs Section - Horizontal Row */}
          <KpiGrid />

          {/* Charts Section - Two side-by-side cards */}
          <FinancialCharts />

          {/* Critical Transactions Section - Table View */}
          <TransactionTable />
          
        </div>

        {/* Right Column (4 units) - Intelligence & Health */}
        <div className="xl:col-span-4 min-w-0">
          <OperationalSidePanel />
        </div>
      </div>

      {/* Extra space for footer visibility */}
      <div className="h-4" />
    </div>
  );
}
