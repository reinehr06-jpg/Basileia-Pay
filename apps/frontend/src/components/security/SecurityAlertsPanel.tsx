'use client';

import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityAlertsPanelProps {
  onActionFeedback: (msg: string) => void;
  onForceLogoutAll: () => void;
  onNavigateToAudit: () => void;
  is2faActive: boolean;
  isIpAllowlistActive: boolean;
}

export function SecurityAlertsPanel({
  onActionFeedback,
  onForceLogoutAll,
  onNavigateToAudit,
  is2faActive,
  isIpAllowlistActive
}: SecurityAlertsPanelProps) {
  return (
    <div className="w-full bg-white border border-[#E8DDFD]/65 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-left shadow-sm shadow-slate-100/40 mt-3 shrink-0">
      
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-4 h-4 text-brand animate-pulse" />
          </div>
          <div>
            <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider block leading-none">
              Score de Proteção
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-black text-slate-800 leading-none">92 / 100</span>
              <span className="text-[8px] font-black text-emerald-650 bg-emerald-50 border border-emerald-100/50 px-1 py-0.2 rounded-md uppercase tracking-wider leading-none">
                Fortificado
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:block w-[1px] h-6 bg-slate-200" />

        <p className="text-[9.5px] font-bold text-slate-450 leading-none">
          Políticas ativas de 2FA obrigatório para cargos administrativos e restrição estrita de CIDR em allowlist.
        </p>
      </div>

      <button
        onClick={onNavigateToAudit}
        className="h-7.5 px-4.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center shrink-0 transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-brand/10"
      >
        Ver Auditoria Completa
      </button>

    </div>
  );
}
