'use client';

import { ShieldCheck, BookOpen, Key, Plus } from 'lucide-react';

interface SecurityHeaderProps {
  onOpenPolicy: () => void;
  onOpen2FA: () => void;
  onInviteUser: () => void;
  isAdmin: boolean;
}

export function SecurityHeader({ onOpenPolicy, onOpen2FA, onInviteUser, isAdmin }: SecurityHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E8DDFD]/60 pb-5 text-left">
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center text-brand shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Segurança & Governança
          </h1>
        </div>
        <p className="text-[11px] font-bold text-slate-400 mt-1 leading-relaxed max-w-2xl">
          Centralize o controle de acessos, privilégios de cargos, sessões em tempo real, allowlist de IPs, políticas de 2FA e monitoramento de eventos críticos da conta.
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenPolicy}
          className="flex h-7.5 items-center gap-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Política</span>
        </button>

        <button
          onClick={onOpen2FA}
          className="flex h-7.5 items-center gap-1.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>2FA Setup</span>
        </button>

        {isAdmin && (
          <button
            onClick={onInviteUser}
            className="flex h-7.5 items-center gap-1.5 px-3 bg-brand hover:bg-brand-dark text-white rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-brand/10"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Convidar</span>
          </button>
        )}
      </div>
    </div>
  );
}
