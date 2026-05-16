'use client';

import { 
  Plus, 
  Download, 
  Monitor,
  Activity,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import { SystemsTable } from '@/components/systems/SystemsTable';
import { SystemsSummary } from '@/components/systems/SystemsSummary';
import { cn } from '@/lib/utils';

export default function SystemsPage() {
  return (
    <div className="flex flex-col gap-4 2xl:gap-5 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full">
      {/* 1. Header - Technical & Executive */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1 w-full">
        <div className="space-y-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] 2xl:text-[34px] font-black tracking-tighter text-ink leading-none">Sistemas</h1>
            <div className="h-6 w-px bg-border/60 mx-1" />
            <Monitor className="w-4 h-4 2xl:w-5 h-5 text-brand opacity-40" />
          </div>
          <p className="text-slate/50 font-bold text-[13px] 2xl:text-[14.5px] tracking-tight mt-1">
            Gerencie sistemas conectados, ambientes, gateways, checkouts e integrações técnicas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-[10.5px] 2xl:text-[11.5px] font-black text-ink shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-[40px] 2xl:h-[46px]">
            <Download className="w-3.5 h-3.5 text-slate/40" />
            Exportar
          </button>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand to-brand-accent text-white rounded-xl text-[10.5px] 2xl:text-[11.5px] font-black shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight h-[40px] 2xl:h-[46px]">
            <Plus className="w-3.5 h-3.5 text-white/80" />
            Novo sistema
          </button>
        </div>
      </header>

      {/* 2. Operational Table Section */}
      <div className="w-full">
        <SystemsTable />
      </div>

      {/* 3. Footer Summary Section */}
      <div className="w-full mt-2">
        <SystemsSummary />
      </div>

      {/* 4. States Preview (Hidden in production, useful for UI hardening) */}
      <div className="hidden mt-12 grid grid-cols-4 gap-4 pb-12 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <div className="p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
           <Activity className="w-12 h-12 text-slate/20 mb-4" />
           <p className="text-[14px] font-black text-ink">Carregando...</p>
        </div>
        <div className="p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
           <Search className="w-12 h-12 text-slate/20 mb-4" />
           <p className="text-[14px] font-black text-ink">Nenhum sistema encontrado</p>
        </div>
        <div className="p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
           <ArrowUpRight className="w-12 h-12 text-success mb-4" />
           <p className="text-[14px] font-black text-ink">Sistema criado com sucesso!</p>
        </div>
        <div className="p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
           <Filter className="w-12 h-12 text-danger mb-4" />
           <p className="text-[14px] font-black text-ink">Erro ao processar integração</p>
        </div>
      </div>
    </div>
  );
}
