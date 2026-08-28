'use client';

import { Shield, BookOpen, Settings, Plus } from 'lucide-react';

interface TrustHeaderProps {
  onOpenDoc: () => void;
  onConfigureMotor: () => void;
  onNewRule: () => void;
  isAdmin: boolean;
}

export function TrustHeader({ onOpenDoc, onConfigureMotor, onNewRule, isAdmin }: TrustHeaderProps) {
  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
      <div className="space-y-1">
        <h1 className="text-[20px] font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand" />
          Trust Layer
        </h1>
        <p className="text-[11px] font-semibold text-slate-400 leading-normal max-w-2xl">
          Camada de inteligência, risco e confiança. Cada decisão é explicável, rastreável e baseada em análise comportamental profunda.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenDoc}
          className="flex h-9 items-center justify-center gap-1.5 px-3.5 bg-white border border-[#E8DDFD] hover:bg-violet-50/50 text-violet-750 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          Documentação
        </button>

        {isAdmin && (
          <>
            <button
              onClick={onConfigureMotor}
              className="flex h-9 items-center justify-center gap-1.5 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              Configurar motor
            </button>

            <button
              onClick={onNewRule}
              className="flex h-9 items-center justify-center gap-1.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer shadow-md shadow-brand/10"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              Nova regra
            </button>
          </>
        )}
      </div>
    </div>
  );
}
