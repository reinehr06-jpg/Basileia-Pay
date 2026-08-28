'use client';

import { CheckCircle2, AlertCircle, Eye, ShieldX, UserCheck, UserX, Zap, ScanEye, ArrowUpRight } from 'lucide-react';
import { TrustEvent, TrustAction } from '@/types/trust';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TrustEventsTableProps {
  events: TrustEvent[];
  onSelectEvent: (event: TrustEvent) => void;
  selectedEventId?: string;
}

export function TrustEventsTable({ events, onSelectEvent, selectedEventId }: TrustEventsTableProps) {
  const getActionLabel = (action: TrustAction) => {
    switch (action) {
      case 'approved_auto':
        return { text: 'Aprovado auto', bg: 'bg-emerald-50 text-emerald-700 border-emerald-250/30' };
      case 'blocked_auto':
        return { text: 'Bloqueado auto', bg: 'bg-red-50 text-red-750 border-red-250/30' };
      case 'manual_review':
        return { text: 'Em revisão', bg: 'bg-blue-50 text-blue-700 border-blue-200/50' };
      case 'review_approved':
        return { text: 'Revisão aprovada', bg: 'bg-emerald-50 text-emerald-800 border-emerald-250/50 font-black' };
      case 'review_rejected':
        return { text: 'Revisão rejeitada', bg: 'bg-red-50 text-red-800 border-red-250/50 font-black' };
      default:
        return { text: action, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="w-full bg-white border border-[#E8DDFD]/65 rounded-[22px] shadow-sm shadow-slate-100/50 overflow-hidden text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#E8DDFD]/50 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4 text-left">Data/Hora</th>
              <th className="py-3 px-3 text-left">Pagamento</th>
              <th className="py-3 px-3 text-left">Cliente</th>
              <th className="py-3 px-3 text-left">Sistema</th>
              <th className="py-3 px-3 text-center">Score</th>
              <th className="py-3 px-3 text-left">Fatores</th>
              <th className="py-3 px-3 text-left">Ação tomada</th>
              <th className="py-3 px-3 text-center">Regras</th>
              <th className="py-3 px-4 text-right">Revisado por</th>
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
                  <td className="py-3.5 px-4 text-slate-400 font-semibold" title={new Date(evt.createdAt).toLocaleString('pt-BR')}>
                    {new Date(evt.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>

                  {/* Payment ID Link */}
                  <td className="py-3.5 px-3">
                    <Link 
                      href={`/dashboard/trust/score/${evt.paymentId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-black text-brand hover:underline flex items-center gap-0.5"
                    >
                      {evt.paymentId}
                      <ArrowUpRight className="w-3 h-3 shrink-0" />
                    </Link>
                  </td>

                  {/* Customer Name */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5.5 h-5.5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9.5px] text-slate-600">
                        {evt.customerName?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{evt.customerName || 'Portador'}</span>
                    </div>
                  </td>

                  {/* System */}
                  <td className="py-3.5 px-3">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-650 border border-slate-200 rounded font-black text-[9px]">
                      {evt.systemName}
                    </span>
                  </td>

                  {/* Score */}
                  <td className="py-3.5 px-3 text-center">
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

                  {/* Factors */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {evt.factorsSummary.slice(0, 2).map((f, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold">
                          {f}
                        </span>
                      ))}
                      {evt.factorsSummary.length > 2 && (
                        <span className="px-1 py-0.5 bg-slate-200 text-slate-600 rounded text-[8px] font-bold">
                          +{evt.factorsSummary.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action Taken */}
                  <td className="py-3.5 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-wider",
                      actionStyle.bg
                    )}>
                      {actionStyle.text}
                    </span>
                  </td>

                  {/* Rules Triggered Count */}
                  <td className="py-3.5 px-3 text-center font-bold text-slate-600">
                    {evt.rulesTriggered}
                  </td>

                  {/* Reviewer Details */}
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-500">
                    {evt.reviewedBy ? (
                      <span title={`Comentário: ${evt.reviewComment}`}>
                        {evt.reviewedBy}
                      </span>
                    ) : (
                      <span className="text-slate-300 italic">—</span>
                    )}
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
