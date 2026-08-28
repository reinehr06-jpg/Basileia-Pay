'use client';

import { AlertTriangle, ArrowRight } from 'lucide-react';

interface SettingsSandboxBannerProps {
  isVisible: boolean;
  onGoToProduction: () => void;
}

export function SettingsSandboxBanner({ isVisible, onGoToProduction }: SettingsSandboxBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-amber-50/70 border border-amber-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2.5 text-amber-800 text-xs font-semibold leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span>
          Você está em modo <strong>Sandbox</strong>. As configurações aqui não afetam o ambiente de Produção.
        </span>
      </div>

      <button
        onClick={onGoToProduction}
        className="flex items-center gap-1 text-[11px] font-black text-amber-850 hover:underline shrink-0"
      >
        Ir para Produção
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
