'use client';

import { Settings2, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface SettingsHeaderProps {
  environment: 'production' | 'sandbox';
  lastUpdatedAt: string;
  onToggleEnvironment: () => void;
}

export function SettingsHeader({ environment, lastUpdatedAt, onToggleEnvironment }: SettingsHeaderProps) {
  const formattedDate = new Date(lastUpdatedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DDFD]/60 pb-5 w-full text-left">
      <div className="flex items-center gap-4">
        {/* Ícone roxo maior e mais refinado */}
        <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/15 border border-violet-500/10 shrink-0">
          <Settings2 className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-1">
          <h1 className="text-[22px] 2xl:text-[24px] font-black tracking-tight text-slate-950 leading-none">
            Configurações
          </h1>
          <p className="text-[11.5px] font-medium text-slate-400 leading-normal">
            Centralize e gerencie todas as configurações da plataforma Basileia Pay.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mini-card Ambiente - Compacto e elegante */}
        <button
          onClick={onToggleEnvironment}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8DDFD]/80 hover:bg-slate-50 rounded-xl shadow-sm text-left transition-all cursor-pointer min-h-[42px]"
        >
          {environment === 'production' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
          )}
          <div>
            <span className="text-[8.5px] font-black uppercase text-slate-400 block leading-none">
              Ambiente atual
            </span>
            <span className={`text-[10px] font-black block mt-0.5 leading-none ${environment === 'production' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {environment === 'production' ? 'Produção' : 'Sandbox'}
            </span>
          </div>
        </button>

        {/* Mini-card Atualização - Compacto e elegante */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8DDFD]/80 rounded-xl shadow-sm text-left min-h-[42px]">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div>
            <span className="text-[8.5px] font-black uppercase text-slate-400 block leading-none">
              Última atualização
            </span>
            <span className="text-[10px] font-black text-slate-700 block mt-0.5 leading-none">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
