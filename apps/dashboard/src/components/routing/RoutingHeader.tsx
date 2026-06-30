'use client';

import { GitBranch, BookOpen, Play, Plus } from 'lucide-react';
import Link from 'next/link';

interface RoutingHeaderProps {
  onOpenDoc: () => void;
  onOpenSimulator: () => void;
  onNewRule: () => void;
  isAdmin: boolean;
}

export function RoutingHeader({ onOpenDoc, onOpenSimulator, onNewRule, isAdmin }: RoutingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DDFD]/60 pb-5 w-full text-left">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/15 border border-violet-500/10 shrink-0">
          <GitBranch className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-[22px] 2xl:text-[24px] font-black tracking-tight text-slate-950 leading-none">
            Roteamento
          </h1>
          <p className="text-[11.5px] font-medium text-slate-400 leading-normal">
            Defina como cada pagamento é direcionado automaticamente ao gateway correto.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Documentação */}
        <button
          onClick={onOpenDoc}
          className="flex h-9 items-center justify-center gap-1.5 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          Documentação
        </button>

        {/* Simular */}
        <button
          onClick={onOpenSimulator}
          className="flex h-9 items-center justify-center gap-1.5 px-3.5 bg-white border border-[#E8DDFD] hover:bg-violet-50/50 text-violet-750 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 shrink-0" />
          Simular
        </button>

        {/* Nova regra - Visible only to admin roles */}
        {isAdmin && (
          <button
            onClick={onNewRule}
            className="flex h-9 items-center justify-center gap-1.5 px-4 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-md shadow-violet-650/15 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            Nova regra
          </button>
        )}
      </div>
    </div>
  );
}
