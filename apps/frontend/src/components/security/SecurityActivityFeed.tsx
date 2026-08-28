'use client';

import { Key, ShieldAlert, ShieldCheck, Play, ArrowRight, ExternalLink } from 'lucide-react';
import { SecurityActivityEvent } from '@/types/security';
import { cn } from '@/lib/utils';

interface SecurityActivityFeedProps {
  events: SecurityActivityEvent[];
  onActionFeedback: (msg: string) => void;
  onNavigateToAudit: () => void;
}

export function SecurityActivityFeed({
  events,
  onActionFeedback,
  onNavigateToAudit
}: SecurityActivityFeedProps) {
  return (
    <div className="space-y-4 text-left">
      
      {/* Header and export buttons */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Histórico de Auditoria Operacional</span>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5">
            Logs de Atividade Recentes
          </h3>
        </div>

        <button
          onClick={onNavigateToAudit}
          className="text-brand hover:underline font-black text-[9.5px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          Painel de Auditoria Geral
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Events table */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-650">
            <thead className="border-b border-[#E8DDFD]/40 bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Data / Hora</th>
                <th className="px-5 py-3.5">Evento Segurança</th>
                <th className="px-5 py-3.5">Integrante / Usuário</th>
                <th className="px-5 py-3.5">IP de Origem</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Detalhes Técnicos</th>
                <th className="px-5 py-3.5 text-right">Audit Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((evt) => {
                const isSuccess = evt.result === 'success';
                const isWarning = evt.result === 'warning';
                const isError = evt.result === 'error';

                return (
                  <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="px-5 py-4 text-slate-450 font-medium whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleString('pt-BR')}
                    </td>

                    {/* Event Name */}
                    <td className="px-5 py-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        {isSuccess && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                        {isWarning && <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />}
                        {isError && <ShieldAlert className="w-4 h-4 text-red-655 shrink-0" />}
                        <span>{evt.event}</span>
                      </div>
                    </td>

                    {/* Responsável */}
                    <td className="px-5 py-4 text-slate-600 font-extrabold">{evt.userName}</td>

                    {/* IP */}
                    <td className="px-5 py-4 font-mono text-[10.5px] text-slate-500 font-bold">{evt.ip}</td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8.5px] font-black leading-none uppercase",
                        isSuccess && 'bg-emerald-50 text-emerald-600',
                        isWarning && 'bg-amber-50 text-amber-600',
                        isError && 'bg-red-50 text-red-655'
                      )}>
                        {evt.result}
                      </span>
                    </td>

                    {/* Detalhes */}
                    <td className="px-5 py-4 text-[10.5px] font-medium text-slate-500 max-w-[220px] truncate" title={evt.details}>
                      {evt.details}
                    </td>

                    {/* Link */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          onNavigateToAudit();
                          onActionFeedback(`Direcionando para a trilha completa do evento ${evt.id} em Auditoria...`);
                        }}
                        className="text-slate-400 hover:text-brand p-1 cursor-pointer transition-colors"
                        title="Ver em Auditoria"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
