'use client';

import { ShieldCheck, Monitor, Globe, ShieldX, Clock, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { TrustScoreBreakdown } from '@/types/trust';
import { TrustScoreGauge } from './TrustScoreGauge';
import { TrustScoreFactors } from './TrustScoreFactors';
import { TrustScoreDecisionTimeline } from './TrustScoreDecisionTimeline';
import { cn } from '@/lib/utils';

interface TrustScoreDetailPageProps {
  breakdown: TrustScoreBreakdown;
  onBack: () => void;
}

export function TrustScoreDetailPage({ breakdown, onBack }: TrustScoreDetailPageProps) {
  const isApproved = breakdown.action === 'approved';
  const isBlocked = breakdown.action === 'blocked';

  return (
    <div className="space-y-6 text-left w-full animate-in fade-in duration-300">
      
      {/* Header back line */}
      <div className="border-b border-[#E8DDFD]/60 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-500 hover:text-slate-800 tracking-wider transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Busca
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Summary Gauge & Context info */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Section 1: Summary gauge */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Resumo do Score
            </h4>
            
            <div className="py-2">
              <TrustScoreGauge score={breakdown.finalScore} size={180} />
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-[10.5px] font-semibold text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Decisão do Motor:</span>
                <span className={cn(
                  "font-black uppercase tracking-wider",
                  isApproved ? 'text-emerald-700' : isBlocked ? 'text-red-750' : 'text-amber-600'
                )}>
                  {isApproved ? 'Aprovado' : isBlocked ? 'Bloqueado' : 'Revisão'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Regra de Gatilho:</span>
                <span className="font-bold text-slate-700 truncate max-w-[60%]">
                  {breakdown.rulesTriggered[0]?.name || 'Nenhuma regra violada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sessão Calculada:</span>
                <span className="font-bold text-slate-700">{new Date(breakdown.evaluatedAt).toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Context details */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Contexto Técnico Completo
            </h4>

            <div className="space-y-3 text-[10.5px] font-semibold text-slate-600">
              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Endereço IP & Provedor (ASN)</span>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-850 font-bold block">{breakdown.context.ip}</span>
                    <span className="text-[9px] text-slate-400 font-medium block truncate max-w-[180px]">{breakdown.context.ipAsn}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">Device Fingerprint Hash</span>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-850 font-bold block truncate max-w-[180px]">{breakdown.context.deviceFingerprint}</span>
                    <span className="text-[9px] text-emerald-650 font-black block uppercase">Dispositivo Confiável (Visto {breakdown.context.deviceSeenCount}x)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-medium">User Agent do Navegador</span>
                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-[9px] text-slate-450 leading-snug max-w-[200px] font-semibold block truncate" title={breakdown.context.userAgent}>
                    {breakdown.context.userAgent}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Factors breakdown and Decision timeline */}
        <div className="lg:col-span-2 space-y-6">
          <TrustScoreFactors factors={breakdown.factors} />
          <TrustScoreDecisionTimeline breakdown={breakdown} />
        </div>

      </div>

    </div>
  );
}
