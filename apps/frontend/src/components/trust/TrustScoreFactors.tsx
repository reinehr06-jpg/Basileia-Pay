'use client';

import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { TrustScoreFactor } from '@/types/trust';
import { cn } from '@/lib/utils';

interface TrustScoreFactorsProps {
  factors: TrustScoreFactor[];
}

export function TrustScoreFactors({ factors }: TrustScoreFactorsProps) {
  return (
    <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 space-y-4 text-left w-full">
      <div className="border-b border-[#E8DDFD]/40 pb-2">
        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
          Fatores Analisados pelo Motor
        </h4>
        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
          Pesos ponderados e contribuições diretas de cada parâmetro analisado.
        </span>
      </div>

      <div className="divide-y divide-[#E8DDFD]/30 space-y-3.5">
        {factors.map((f, i) => (
          <div key={i} className="pt-3.5 first:pt-0 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                {f.result === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {f.result === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                {f.result === 'fail' && <ShieldAlert className="w-4 h-4 text-red-655 shrink-0" />}
                <span className="text-slate-900">{f.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[10.5px] font-black uppercase">
                <span className="text-slate-400">Peso: {f.weight}%</span>
                <span className={cn(
                  "px-2 py-0.5 rounded border",
                  f.contribution > 0 
                    ? "bg-red-50 text-red-750 border-red-200" 
                    : f.contribution < 0 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-50 text-slate-500 border-slate-200"
                )}>
                  {f.contribution > 0 ? `+${f.contribution}` : f.contribution} pts
                </span>
              </div>
            </div>

            {/* Visual Progress Line */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all",
                  f.result === 'pass' ? 'bg-emerald-500' : f.result === 'warn' ? 'bg-amber-400' : 'bg-red-500'
                )}
                style={{ width: `${f.weight * 5}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed pl-6">
              {f.description} (Detecção: <span className="font-bold text-slate-700">{f.value}</span>)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
