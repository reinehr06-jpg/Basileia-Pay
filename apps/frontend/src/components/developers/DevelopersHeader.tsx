'use client';

import { Code2, BookOpen, FlaskConical, Plus } from 'lucide-react';

interface DevelopersHeaderProps {
  onOpenDoc: () => void;
  onOpenSandboxTest: () => void;
  onNewKey: () => void;
  isAdmin: boolean;
}

export function DevelopersHeader({ onOpenDoc, onOpenSandboxTest, onNewKey, isAdmin }: DevelopersHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8DDFD]/60 pb-5 text-left">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center text-brand shrink-0">
            <Code2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Desenvolvedores
          </h1>
        </div>
        <p className="text-[11px] font-bold text-slate-400 mt-1 leading-relaxed max-w-2xl">
          Integre seus sistemas com a Basileia Pay de forma ágil, segura e independente através de nossas APIs, webhooks em tempo real e ambiente sandbox de testes.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onOpenDoc}
          className="flex h-9 items-center gap-2 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-slate-400" />
          Documentação
        </button>

        <button
          onClick={onOpenSandboxTest}
          className="flex h-9 items-center gap-2 px-4 bg-violet-50 hover:bg-violet-100 text-violet-750 border border-violet-200/50 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          <FlaskConical className="w-4 h-4 text-violet-500" />
          Testar Checkout
        </button>

        {isAdmin && (
          <button
            onClick={onNewKey}
            className="flex h-9 items-center gap-2 px-4.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-brand/15 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Nova API Key
          </button>
        )}
      </div>
    </div>
  );
}
