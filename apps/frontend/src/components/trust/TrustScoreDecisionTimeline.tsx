'use client';

import { Play, ShieldAlert, CheckCircle2, Eye, ShieldX, UserCheck } from 'lucide-react';
import { TrustScoreBreakdown } from '@/types/trust';
import { cn } from '@/lib/utils';

interface TrustScoreDecisionTimelineProps {
  breakdown: TrustScoreBreakdown;
}

export function TrustScoreDecisionTimeline({ breakdown }: TrustScoreDecisionTimelineProps) {
  const isBlocked = breakdown.action === 'blocked';
  const isReview = breakdown.action === 'manual_review';

  return (
    <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 space-y-4 text-left w-full">
      <div className="border-b border-[#E8DDFD]/40 pb-2">
        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
          Linha do Tempo da Decisão
        </h4>
        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
          Etapas em milissegundos sequenciadas pelo motor de decisão.
        </span>
      </div>

      <div className="relative border-l border-[#E8DDFD] pl-6 ml-3 space-y-5 text-xs font-semibold py-1">
        
        {/* Step 1: Checkout Started */}
        <div className="relative">
          <div className="absolute -left-[30px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center shrink-0" />
          <span className="text-slate-400 text-[9.5px] block font-bold">
            {new Date(breakdown.context.checkoutStartedAt).toLocaleTimeString('pt-BR')}
          </span>
          <span className="text-slate-750 font-black block mt-0.5">Checkout Iniciado pelo Portador</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            Sessão registrada com ID: {breakdown.context.sessionId}
          </span>
        </div>

        {/* Step 2: Risk Engine Activated */}
        <div className="relative">
          <div className="absolute -left-[30px] top-0.5 w-3.5 h-3.5 rounded-full bg-brand-soft border-2 border-brand flex items-center justify-center shrink-0" />
          <span className="text-slate-400 text-[9.5px] block font-bold">
            +{breakdown.context.formFillTimeMs - 200}ms
          </span>
          <span className="text-slate-750 font-black block mt-0.5">Motor Antifraude Ativado</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            Formulário preenchido em {breakdown.context.formFillTimeMs / 1000}s. Analisando geolocalização e fingerprint.
          </span>
        </div>

        {/* Step 3: Rules Evaluated */}
        <div className="relative">
          <div className="absolute -left-[30px] top-0.5 w-3.5 h-3.5 rounded-full bg-violet-100 border-2 border-violet-500 flex items-center justify-center shrink-0" />
          <span className="text-slate-400 text-[9.5px] block font-bold">
            +{breakdown.context.formFillTimeMs}ms
          </span>
          <span className="text-slate-750 font-black block mt-0.5">Avaliação em Paralelo de Regras</span>
          <div className="space-y-1.5 mt-1.5">
            {breakdown.rulesTriggered.length > 0 ? (
              breakdown.rulesTriggered.map((rule, idx) => (
                <div key={idx} className="bg-red-50/30 border border-red-200/50 rounded-lg p-2 text-[10px] font-semibold text-red-800">
                  ⚡ Regra Satisfeita: <span className="font-black">{rule.name}</span> (+{rule.scoreImpact} pts)
                </div>
              ))
            ) : (
              <div className="bg-emerald-50/30 border border-emerald-250/30 rounded-lg p-2 text-[10px] font-semibold text-emerald-800">
                ✓ Nenhuma regra de risco de alta prioridade foi violada.
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Decision made */}
        <div className="relative">
          <div className={cn(
            "absolute -left-[30px] top-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0",
            isBlocked ? 'bg-red-100 border-red-500' : isReview ? 'bg-amber-100 border-amber-500' : 'bg-emerald-100 border-emerald-500'
          )} />
          <span className="text-slate-400 text-[9.5px] block font-bold">
            +{breakdown.context.formFillTimeMs + 120}ms
          </span>
          <span className="text-slate-750 font-black block mt-0.5">
            Decisão Automatizada: {isBlocked ? 'Transação Bloqueada' : isReview ? 'Revisão Necessária' : 'Transação Aprovada'}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
            Score final calculado: <span className="font-bold text-slate-700">{breakdown.finalScore} / 100</span> (Threshold de bloqueio: {breakdown.threshold})
          </span>
        </div>

        {/* Step 5: Manual review if applicable */}
        {isReview && (
          <div className="relative animate-in fade-in duration-300">
            <div className="absolute -left-[30px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center shrink-0" />
            <span className="text-slate-400 text-[9.5px] block font-bold">Aguardando</span>
            <span className="text-slate-750 font-black block mt-0.5">Aguardando Liberação da Fila de Revisão Manual</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              O pagamento ficará retido até que um operador com permissões revise os fatores técnicos e emita o parecer.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
