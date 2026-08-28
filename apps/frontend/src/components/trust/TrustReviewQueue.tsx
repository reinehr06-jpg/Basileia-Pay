'use client';

import { useState } from 'react';
import { Clock, Eye, AlertCircle, Check, X, ShieldAlert, ArrowUpRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { TrustEvent } from '@/types/trust';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TrustReviewQueueProps {
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
}

export function TrustReviewQueue({ onActionFeedback, isAdmin }: TrustReviewQueueProps) {
  // Mocking 3 pending manual reviews
  const [pendingQueue, setPendingQueue] = useState<any[]>([
    {
      id: "evt_risk_003",
      paymentId: "pay_1c2d3e4f5a6b",
      customerName: "Lucas Mendes",
      historyBadge: "Novo",
      amount: 98000, // R$ 980,00
      score: 67,
      ruleTriggered: "Valor 3× acima da média",
      factors: ["Valor desproporcional"],
      minutesInQueue: 32, // Urgente (> 30 min)
    },
    {
      id: "evt_risk_008",
      paymentId: "pay_2d3e4f5a6b7c",
      customerName: "Mariana Costa",
      historyBadge: "Recorrente",
      amount: 15000, // R$ 150,00
      score: 62,
      ruleTriggered: "Dispositivo não reconhecido",
      factors: ["Fingerprint Novo"],
      minutesInQueue: 8,
    },
    {
      id: "evt_risk_009",
      paymentId: "pay_3e4f5a6b7c8d",
      customerName: "Ricardo Silva",
      historyBadge: "Chargeback anterior",
      amount: 450000, // R$ 4.500,00
      score: 74,
      ruleTriggered: "País de alto risco",
      factors: ["Geografia suspeita"],
      minutesInQueue: 18, // Alerta (> 15 min)
    }
  ]);

  const [decisionModal, setDecisionModal] = useState<{ item: any; action: 'approve' | 'reject' } | null>(null);
  const [comment, setComment] = useState('');

  const hasUrgency = pendingQueue.some(item => item.minutesInQueue > 30);

  const handleDecisionTrigger = (item: any, action: 'approve' | 'reject') => {
    if (!isAdmin) {
      onActionFeedback("Permissão insuficiente: apenas Owners ou Admins podem liberar revisões.");
      return;
    }
    setDecisionModal({ item, action });
  };

  const handleConfirmDecision = () => {
    if (!decisionModal) return;
    const { item, action } = decisionModal;
    
    // Remove from local list
    setPendingQueue(pendingQueue.filter(i => i.id !== item.id));
    setDecisionModal(null);
    setComment('');

    const outcome = action === 'approve' ? 'Aprovada' : 'Rejeitada';
    onActionFeedback(`Revisão ${outcome} para o pagamento ${item.paymentId}. Decisão salva.`);
  };

  return (
    <div className="space-y-4 text-left w-full">
      
      {/* Urgency SLA Banner */}
      {hasUrgency && pendingQueue.length > 0 && (
        <div className="w-full bg-amber-50/70 border border-amber-250/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left animate-pulse-subtle">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 border border-amber-200 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-800 leading-tight">
                Tempo Limite Excedido na Fila
              </h4>
              <p className="text-[10.5px] font-semibold text-amber-600 mt-0.5 leading-snug">
                Existem pagamentos retidos aguardando revisão humana há mais de 30 minutos. Portadores podem abandonar as compras.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onActionFeedback("Filtro aplicado para transações com SLA estourado.")}
            className="flex items-center gap-1 text-[10px] font-black text-amber-850 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg border border-amber-200 uppercase tracking-tight shrink-0 transition-all cursor-pointer w-fit self-end sm:self-center"
          >
            Revisar Agora
          </button>
        </div>
      )}

      {/* Empty State */}
      {pendingQueue.length === 0 ? (
        <div className="py-12 bg-white border border-[#E8DDFD]/60 rounded-[22px] text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Fila de Revisão Limpa</h4>
          <p className="text-[11px] font-semibold text-slate-400">Nenhum pagamento retido no momento. Todas as decisões foram processadas.</p>
        </div>
      ) : (
        /* Table Queue */
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] shadow-sm shadow-slate-100/50 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#E8DDFD]/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Tempo na fila</th>
                <th className="py-3 px-3 text-left">Pagamento</th>
                <th className="py-3 px-3 text-left">Cliente</th>
                <th className="py-3 px-3 text-left">Valor</th>
                <th className="py-3 px-3 text-center">Score</th>
                <th className="py-3 px-3 text-left">Regra de Risco</th>
                <th className="py-3 px-3 text-left">Fatores</th>
                <th className="py-3 pr-4 text-right w-36">Decisão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDFD]/40">
              {pendingQueue.map((item) => {
                const isOverSLA = item.minutesInQueue > 15;
                const isOverLimit = item.minutesInQueue > 30;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/20 transition-colors">
                    
                    {/* Time in Queue */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Clock className={cn("w-3.5 h-3.5", isOverLimit ? 'text-red-500 animate-bounce' : isOverSLA ? 'text-amber-500' : 'text-slate-400')} />
                        <span className={cn(
                          "font-bold text-[10.5px]",
                          isOverLimit ? 'text-red-600 font-black' : isOverSLA ? 'text-amber-600' : 'text-slate-650'
                        )}>
                          há {item.minutesInQueue} min
                        </span>
                      </div>
                    </td>

                    {/* Payment ID Link */}
                    <td className="py-3 px-3">
                      <Link 
                        href={`/dashboard/trust/score/${item.paymentId}`}
                        className="font-black text-brand hover:underline flex items-center gap-0.5"
                      >
                        {item.paymentId}
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 block">{item.customerName}</span>
                        <span className={cn(
                          "px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase tracking-tight",
                          item.historyBadge === 'Recorrente' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : item.historyBadge === 'Novo'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-red-50 text-red-750'
                        )}>
                          {item.historyBadge}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 font-bold text-slate-800">
                      R$ {(item.amount / 100).toLocaleString('pt-BR')}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black border",
                        item.score < 40 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-250/30" 
                          : item.score < 70 
                            ? "bg-amber-50 text-amber-700 border-amber-250/50" 
                            : "bg-red-50 text-red-750 border-red-250/40"
                      )}>
                        {item.score}
                      </span>
                    </td>

                    {/* Triggering rule */}
                    <td className="py-3 px-3 font-bold text-slate-500">
                      {item.ruleTriggered}
                    </td>

                    {/* Factors */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {item.factors.map((f: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Operations */}
                    <td className="py-3 pr-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleDecisionTrigger(item, 'approve')}
                          className="flex h-7 px-2.5 items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9.5px] font-black uppercase tracking-tight transition-all cursor-pointer shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleDecisionTrigger(item, 'reject')}
                          className="flex h-7 px-2.5 items-center justify-center gap-1 bg-slate-100 hover:bg-red-50 text-slate-650 hover:text-red-700 rounded-lg text-[9.5px] font-black uppercase tracking-tight transition-all cursor-pointer border border-slate-200/50 hover:border-red-200"
                        >
                          <X className="w-3 h-3" />
                          Recusar
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Review Comment Dialog */}
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left select-none">
          <div className="bg-white w-full max-w-sm rounded-[22px] border border-[#E8DDFD] shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 bg-brand-soft border border-brand/20 rounded-lg flex items-center justify-center text-brand shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-tight">
                  Confirmar parecer da revisão?
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-snug">
                  Você está {decisionModal.action === 'approve' ? 'APROVANDO' : 'REJEITANDO'} o pagamento {decisionModal.item.paymentId}.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Justificativa operacional (Opcional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                maxLength={200}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                placeholder="Insira as observações de suporte..."
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDecisionModal(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDecision}
                className={cn(
                  "px-3.5 py-1.5 text-white text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer shadow-sm",
                  decisionModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                )}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
