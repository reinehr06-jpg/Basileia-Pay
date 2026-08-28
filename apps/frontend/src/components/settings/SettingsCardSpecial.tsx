'use client';

import { ShieldCheck } from 'lucide-react';

interface SettingsCardSpecialProps {
  onActionFeedback: (msg: string) => void;
}

export function SettingsCardSpecial({ onActionFeedback }: SettingsCardSpecialProps) {
  return (
    <div className="relative min-h-[154px] flex flex-col justify-between p-4 bg-gradient-to-br from-violet-50 via-purple-50/30 to-violet-100/50 border border-violet-200/60 rounded-[20px] shadow-sm select-none group text-left transition-all hover:scale-[1.01] duration-200">
      
      {/* Big Shield Icon on Top Right - Soft and integrated */}
      <ShieldCheck className="w-14 h-14 text-violet-600/20 absolute right-3 top-3 shrink-0 group-hover:scale-105 transition-transform" />

      <div className="max-w-[75%]">
        <h3 className="text-xs font-black text-slate-900 leading-tight">
          Status da plataforma
        </h3>
        <p className="mt-1 text-[10.5px] font-semibold text-slate-455 leading-snug">
          Saúde dos serviços e sistemas da Basileia Pay.
        </p>
      </div>

      <div className="flex items-end justify-between mt-auto">
        <button
          onClick={() => onActionFeedback('Direcionando para painel de status em tempo real...')}
          className="flex h-7 items-center justify-center px-3 bg-white border border-violet-600/30 hover:border-violet-600/60 text-violet-650 hover:bg-violet-50/50 rounded-lg text-[10px] font-black shadow-sm transition-all uppercase tracking-tight cursor-pointer"
        >
          Ver status
        </button>

        {/* Status indicators */}
        <div className="flex items-center gap-1.5 pb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-250" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-250" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-250" />
        </div>
      </div>
    </div>
  );
}
