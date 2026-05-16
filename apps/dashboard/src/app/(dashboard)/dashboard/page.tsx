import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { FinancialCharts } from '@/components/dashboard/FinancialCharts';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { OperationalSidePanel } from '@/components/dashboard/OperationalSidePanel';
import { BarChart3, Sparkles, Activity, Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Page Header - Executive & Dense */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
        <div className="space-y-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[34px] font-black tracking-tighter text-ink leading-none">Visão Geral</h1>
            <div className="h-6 w-px bg-border/60 mx-1" />
            <BarChart3 className="w-5 h-5 text-brand opacity-40" />
          </div>
          <p className="text-slate/50 font-bold text-[14.5px] tracking-tight mt-1">
            Painel operacional de performance, pagamento e conversão em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-success/5 border border-success/10 rounded-xl h-[46px]">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
            <span className="text-[9.5px] font-black uppercase tracking-widest text-success/80">Sistemas operando</span>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand to-brand-accent text-white rounded-xl text-[11.5px] font-black shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight h-[46px]">
            <Plus className="w-3.5 h-3.5 text-white/80" />
            Nova análise
          </button>
        </div>
      </header>

      {/* Main Content Grid - Maximum Utility Area */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        
        {/* Left Column - Operations & Financials */}
        <div className="flex flex-col gap-6 min-w-0">
          
          {/* KPIs Section */}
          <KpiGrid />

          {/* Charts Section */}
          <FinancialCharts />

          {/* Critical Transactions Section */}
          <TransactionTable />
          
        </div>

        {/* Right Column - Intelligence & Health (Fixed 360px) */}
        <div className="min-w-0">
          <OperationalSidePanel />
        </div>
      </div>


      {/* Extra space for footer visibility */}
      <div className="h-4" />
    </div>
  );
}
