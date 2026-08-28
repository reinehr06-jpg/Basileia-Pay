'use client';

import { ShieldAlert } from 'lucide-react';

interface TrustMotorUnavailableBannerProps {
  onDismiss?: () => void;
}

export function TrustMotorUnavailableBanner({ onDismiss }: TrustMotorUnavailableBannerProps) {
  return (
    <div className="w-full bg-red-50/70 border border-red-250/70 rounded-2xl p-4 flex items-start gap-2.5 text-left animate-pulse-subtle">
      <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-red-700 border border-red-200 shrink-0">
        <ShieldAlert className="w-4 h-4" />
      </div>
      <div>
        <h4 className="text-xs font-black text-red-800 uppercase tracking-wide leading-tight">
          Motor de Risco Temporariamente Indisponível
        </h4>
        <p className="text-[10.5px] font-semibold text-red-650 mt-0.5 leading-snug">
          O serviço de score está indisponível. Conforme a política de contingência ativa, os pagamentos estão sendo aprovados automaticamente sem análise prévia de risco.
        </p>
      </div>
    </div>
  );
}
