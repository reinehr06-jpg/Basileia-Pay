'use client';

import { X, ArrowRight, Activity } from 'lucide-react';
import { TrustEvent } from '@/types/trust';
import { cn } from '@/lib/utils';

interface TrustEventDetailPanelProps {
  event: TrustEvent | null;
  onClose: () => void;
  isAdmin: boolean;
  onActionFeedback: (msg: string) => void;
  onViewFullAnalysis?: (paymentId: string) => void;
}

export function TrustEventDetailPanel({ event, onClose, onViewFullAnalysis }: TrustEventDetailPanelProps) {
  if (!event) return null;

  const getRiskLabel = (score: number) => {
    if (score < 40) return { text: 'Baixo Risco', color: 'text-emerald-600', fill: '#10B981' };
    if (score < 70) return { text: 'Risco Moderado', color: 'text-amber-500', fill: '#F59E0B' };
    return { text: 'Alto Risco', color: 'text-red-655', fill: '#EF4444' };
  };

  const riskLabel = getRiskLabel(event.score);

  const radius = 50;
  const strokeWidth = 8;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (event.score / 100) * circumference;

  return (
    <div className="w-full lg:w-[320px] bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shrink-0 flex flex-col justify-between overflow-y-auto no-scrollbar text-left shadow-sm shadow-slate-100/50">
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DDFD]/40 pb-3">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Resumo do Score</span>
            <h3 className="text-xs font-black text-slate-900 truncate max-w-[200px] mt-0.5" title={event.paymentId}>
              {event.paymentId}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Bloco 1 - SVG Semicircular Gauge */}
        <div className="flex flex-col items-center justify-center py-2 bg-slate-50/50 border border-slate-100 rounded-xl p-3">
          <div className="relative w-36 h-20 flex items-center justify-center overflow-hidden">
            <svg className="w-36 h-36 absolute top-0" viewBox="0 0 120 120">
              <path
                d="M 10,70 A 50,50 0 0,1 110,70"
                fill="none"
                stroke="#E7E5EF"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <path
                d="M 10,70 A 50,50 0 0,1 110,70"
                fill="none"
                stroke={riskLabel.fill}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-8 flex flex-col items-center">
              <span className="text-2xl font-black text-slate-800 leading-none">{event.score}</span>
              <span className={cn("text-[9px] font-black uppercase tracking-wider mt-1.5", riskLabel.color)}>
                {riskLabel.text}
              </span>
            </div>
          </div>
        </div>

        {/* Action Forense Link button (Direct full breakdown redirect) */}
        {onViewFullAnalysis && (
          <button
            onClick={() => onViewFullAnalysis(event.paymentId)}
            className="w-full h-9 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand/10 transition-all hover:scale-[1.02]"
          >
            <Activity className="w-4 h-4" />
            Análise Forense Completa
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

      </div>
    </div>
  );
}
