'use client';

import { Plus } from 'lucide-react';
import { SystemsTable } from '@/components/systems/SystemsTable';
import { useRouter } from 'next/navigation';

export default function SystemsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] 2xl:text-[34px] font-black tracking-tighter text-ink leading-none">Sistemas</h1>
          </div>
          <p className="text-slate/50 font-bold text-[13px] 2xl:text-[14.5px] tracking-tight mt-1">
            Gerencie os sistemas conectados a Basileia
          </p>
        </div>
        <button onClick={() => router.push('/dashboard/systems/new')} className="flex items-center gap-2 px-4 2xl:px-5 py-2 2xl:py-2.5 bg-gradient-to-r from-brand to-brand-accent text-white rounded-xl text-[10.5px] 2xl:text-[11.5px] font-black shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight h-[40px] 2xl:h-[46px]">
          <Plus className="w-3 2xl:w-3.5 h-3 2xl:h-3.5 text-white/80" /> Novo Sistema
        </button>
      </header>

      <SystemsTable />
    </div>
  );
}

