'use client';

import { useState } from 'react';
import { X, Shield, Settings2, ShieldCheck, AlertCircle } from 'lucide-react';
import { TrustMotorConfig } from '@/types/trust';
import { cn } from '@/lib/utils';

interface TrustMotorConfigDialogProps {
  config: TrustMotorConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: Partial<TrustMotorConfig>) => void;
}

export function TrustMotorConfigDialog({ config, isOpen, onClose, onSave }: TrustMotorConfigDialogProps) {
  const [blockThreshold, setBlockThreshold] = useState(config.blockThreshold);
  const [reviewThreshold, setReviewThreshold] = useState(config.reviewThreshold);
  const [fallback, setFallback] = useState<any>(config.fallbackOnUnavailable);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      blockThreshold,
      reviewThreshold,
      fallbackOnUnavailable: fallback,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Gabriel Silva',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left select-none" role="dialog" aria-modal="true" aria-label="Configurar thresholds do motor">
      <div className="bg-white w-full max-w-md rounded-[22px] border border-[#E8DDFD] shadow-2xl p-6 space-y-5 animate-in scale-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DDFD]/40 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-50 text-violet-755 border border-violet-100 rounded-xl flex items-center justify-center shrink-0">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                Configurar thresholds do motor
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 leading-none">Ajustes globais e regras de contingenciamento.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Fechar">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Threshold sliders config */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 tracking-wider">
              <span>Threshold de Bloqueio Automático</span>
              <span className="text-red-655 font-black">{blockThreshold} pts</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={blockThreshold}
              onChange={(e) => setBlockThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-red-500"
            />
            <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
              Pagamentos com score igual ou superior a este valor serão bloqueados automaticamente.
            </p>
          </div>

          <div className="space-y-2 border-t border-[#E8DDFD]/40 pt-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 tracking-wider">
              <span>Threshold de Revisão Manual</span>
              <span className="text-amber-500 font-black">{reviewThreshold} pts</span>
            </div>
            <input
              type="range"
              min="30"
              max="75"
              step="5"
              value={reviewThreshold}
              onChange={(e) => setReviewThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-amber-550"
            />
            <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
              Transações com score entre {reviewThreshold} e {blockThreshold - 1} serão retidas na fila para liberação humana.
            </p>
          </div>

          {/* Contingency behavior fallback */}
          <div className="space-y-2 border-t border-[#E8DDFD]/40 pt-4">
            <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">Contingenciamento em Indisponibilidade</label>
            <select
              value={fallback}
              onChange={(e) => setFallback(e.target.value as any)}
              className="w-full h-9.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="approve_all">Aprovar tudo (Alta conversão, risco maior)</option>
              <option value="block_all">Bloquear tudo (Segurança máxima, sem conversão)</option>
              <option value="review_all">Reter tudo em revisão (Moderado)</option>
            </select>
          </div>
        </div>

        {/* Alert box info */}
        <div className="bg-slate-50 border border-slate-250/30 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-450 font-semibold leading-snug">
            Qualquer modificação nesses patamares altera a tomada de decisões imediatas das transações em tempo de execução.
          </p>
        </div>

        {/* Action button footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex px-4 py-1.5 bg-brand hover:bg-brand-dark text-white text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer shadow-sm items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Aplicar Ajustes
          </button>
        </div>

      </div>
    </div>
  );
}
