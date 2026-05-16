'use client';

import { 
  Plus, 
  Download, 
  Monitor,
  Activity,
  ChevronDown,
  Search,
  LayoutGrid
} from 'lucide-react';
import { SystemsTable } from '@/components/systems/SystemsTable';
import { SystemsSummary } from '@/components/systems/SystemsSummary';
import { Topbar } from '@/components/layout/Topbar';

export default function SystemsPage() {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col gap-6 2xl:gap-8">
      {/* 1. Page Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 w-full">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] 2xl:text-[32px] font-black tracking-tighter text-ink leading-none">Sistemas</h1>
            <div className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center">
               <Activity className="w-3.5 h-3.5 text-brand" />
            </div>
          </div>
          <p className="text-slate/50 font-bold text-[13px] 2xl:text-[14px] tracking-tight">
            Gerencie provedores conectados, gateways e integrações técnicas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-[11px] 2xl:text-[12px] font-black text-ink shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-[42px] 2xl:h-[48px]">
            <Download className="w-4 h-4 text-slate/40" />
            Exportar
            <ChevronDown className="w-4 h-4 text-slate/30" />
          </button>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-[11px] 2xl:text-[12px] font-black shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight h-[42px] 2xl:h-[48px]">
            <Plus className="w-4 h-4 text-white/80" />
            Novo sistema
          </button>
        </div>
      </header>

      {/* 2. Systems Management Table (Protagonist) */}
      <section className="w-full">
        <SystemsTable />
      </section>

      {/* 3. Operational Footer Intelligence */}
      <section className="w-full">
        <SystemsSummary />
      </section>
    </div>
  );
}
