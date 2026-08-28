'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Play, HelpCircle, AlertCircle, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RoutingHistoryTab() {
  const [logs, setLogs] = useState<any[]>([]);

  const getMethodBadge = (m: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      pix: { bg: 'bg-emerald-50 border-emerald-250/30 text-emerald-700', text: 'PIX' },
      credit_card: { bg: 'bg-blue-50 border-blue-200/50 text-blue-700', text: 'Cartão' },
      boleto: { bg: 'bg-amber-50 border-amber-250/50 text-amber-700', text: 'Boleto' }
    };
    const c = config[m] || { bg: 'bg-slate-50 border-slate-200 text-slate-700', text: m };
    return (
      <span className={cn("px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase border tracking-wider", c.bg)}>
        {c.text}
      </span>
    );
  };

  return (
    <div className="space-y-4 text-left w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-slate-500">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider">Histórico de Decisões de Roteamento</span>
        </div>
      </div>

      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] shadow-sm shadow-slate-100/50 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#E8DDFD]/50 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4 text-left">Pagamento</th>
              <th className="py-3 px-4 text-left">Sistema</th>
              <th className="py-3 px-4 text-left">Método</th>
              <th className="py-3 px-4 text-left">Valor</th>
              <th className="py-3 px-4 text-left">Regra Aplicada</th>
              <th className="py-3 px-4 text-left">Gateway Usado</th>
              <th className="py-3 px-4 text-center">Contingência</th>
              <th className="py-3 px-4 text-center">Latência</th>
              <th className="py-3 px-4 text-right">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DDFD]/40">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold text-xs">
                  Nenhum registro de roteamento encontrado no histórico.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const isFallback = log.fallbackAcioned === 'Sim';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <Link 
                        href={log.paymentLink}
                        className="font-black text-brand hover:underline flex items-center gap-0.5"
                      >
                        {log.id}
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">
                        {log.system === 'sys_church' ? 'Church' : log.system === 'sys_vendor' ? 'Vendor' : 'SaaS'}
                      </span>
                      <span className="ml-1.5 px-1 rounded bg-slate-100 text-slate-500 text-[8px] uppercase font-black">
                        {log.environment}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getMethodBadge(log.method)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      R$ {(log.amount / 100).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-semibold">
                      #{log.priority} {log.ruleApplied}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-750">{log.gatewayUsed}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase border tracking-wider",
                        isFallback 
                          ? 'bg-amber-50 text-amber-700 border-amber-200/50' 
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      )}>
                        {log.fallbackAcioned}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-bold">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-semibold" title={new Date(log.date).toLocaleString('pt-BR')}>
                      há {Math.floor((Date.now() - new Date(log.date).getTime()) / 60000) || 5} min
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
