'use client';

import { CheckCircle2, AlertCircle, Eye, ShieldX, UserCheck, UserX, Zap, ScanEye } from 'lucide-react';
import { TrustEvent, TrustAction } from '@/types/trust';
import { cn } from '@/lib/utils';

interface TrustEventFeedProps {
  events: TrustEvent[];
  onSelectEvent: (event: TrustEvent) => void;
  selectedEventId?: string;
}

export function TrustEventFeed({ events, onSelectEvent, selectedEventId }: TrustEventFeedProps) {
  const getEventIcon = (action: TrustAction) => {
    switch (action) {
      case 'approved_auto':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'blocked_auto':
        return <ShieldX className="w-4 h-4 text-red-655" />;
      case 'manual_review':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'review_approved':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'review_rejected':
        return <UserX className="w-4 h-4 text-red-655" />;
      case 'rule_triggered':
        return <Zap className="w-4 h-4 text-violet-750" />;
      case 'suspicious_behavior':
        return <ScanEye className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActionLabel = (action: TrustAction) => {
    switch (action) {
      case 'approved_auto':
        return { text: 'Aprovado auto', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' };
      case 'blocked_auto':
        return { text: 'Bloqueado auto', bg: 'bg-red-50 text-red-700 border-red-200/50' };
      case 'manual_review':
        return { text: 'Em revisão', bg: 'bg-blue-50 text-blue-700 border-blue-200/50' };
      case 'review_approved':
        return { text: 'Revisão aprovada', bg: 'bg-emerald-50 text-emerald-800 border-emerald-250/30' };
      case 'review_rejected':
        return { text: 'Revisão rejeitada', bg: 'bg-red-50 text-red-800 border-red-250/30' };
      case 'rule_triggered':
        return { text: 'Regra ativada', bg: 'bg-violet-50 text-violet-750 border-violet-200/50' };
      case 'suspicious_behavior':
        return { text: 'Comportamento suspeito', bg: 'bg-orange-50 text-orange-700 border-orange-200/50' };
      default:
        return { text: action, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] shadow-sm shadow-slate-100/50 overflow-hidden text-left w-full">
      <div className="px-5 py-4 border-b border-[#E8DDFD]/40">
        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
          Eventos de Risco Recentes
        </h4>
        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
          Últimas avaliações executadas em tempo real pela camada de segurança.
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#E8DDFD]/50 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4 text-left">Hora</th>
              <th className="py-3 px-3 text-left">Evento</th>
              <th className="py-3 px-3 text-left">Pagamento</th>
              <th className="py-3 px-3 text-center">Score</th>
              <th className="py-3 px-3 text-left">Fatores de risco</th>
              <th className="py-3 px-3 text-left">Ação tomada</th>
              <th className="py-3 px-4 text-right">Origem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DDFD]/40">
            {events.map((evt) => {
              const isSelected = selectedEventId === evt.id;
              const actionStyle = getActionLabel(evt.action);

              return (
                <tr
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className={cn(
                    "hover:bg-slate-50/30 cursor-pointer transition-colors",
                    isSelected && "bg-violet-50/30"
                  )}
                >
                  {/* Timestamp */}
                  <td className="py-3 px-4 text-slate-400 font-semibold">
                    {new Date(evt.createdAt).toLocaleTimeString('pt-BR')}
                  </td>

                  {/* Event with Icon */}
                  <td className="py-3 px-3 font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      {getEventIcon(evt.action)}
                      <span>
                        {evt.action === 'approved_auto' ? 'Aprovado' : evt.action === 'blocked_auto' ? 'Bloqueado' : 'Revisão'}
                      </span>
                    </div>
                  </td>

                  {/* Payment ID */}
                  <td className="py-3 px-3 font-black text-brand hover:underline">
                    {evt.paymentId}
                  </td>

                  {/* Score */}
                  <td className="py-3 px-3 text-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black border",
                      evt.score < 40 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-250/30" 
                        : evt.score < 70 
                          ? "bg-amber-50 text-amber-700 border-amber-250/50" 
                          : "bg-red-50 text-red-750 border-red-250/40"
                    )}>
                      {evt.score}
                    </span>
                  </td>

                  {/* Risk Factors Summary */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {evt.factorsSummary.map((f, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-550 border border-slate-200/50 rounded-md text-[8.5px] font-semibold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Action Taken Badge */}
                  <td className="py-3 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-wider",
                      actionStyle.bg
                    )}>
                      {actionStyle.text}
                    </span>
                  </td>

                  {/* System/Origin */}
                  <td className="py-3 px-4 text-right">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-650 border border-slate-200 rounded font-black text-[9px]">
                      {evt.systemName}
                    </span>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
