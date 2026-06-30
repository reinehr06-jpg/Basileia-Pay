'use client';

import { useState } from 'react';
import { Landmark, AlertCircle, Edit2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoutingFallbacksTabProps {
  onActionFeedback: (msg: string) => void;
  isAdmin: boolean;
}

export function RoutingFallbacksTab({ onActionFeedback, isAdmin }: RoutingFallbacksTabProps) {
  const [fallbacks, setFallbacks] = useState<any[]>([]);

  const handleEdit = (system: string) => {
    if (!isAdmin) {
      onActionFeedback("Permissão insuficiente: Apenas Owners ou Admins podem modificar fallbacks.");
      return;
    }
    onActionFeedback(`Ajustando configurações de contingência para: ${system}`);
  };

  return (
    <div className="space-y-5 text-left w-full">
      
      {/* Global Fallback card */}
      <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-violet-50 text-violet-650 border border-violet-100 rounded-xl flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Fallback Global da Empresa
            </h4>
            <p className="text-[10.5px] font-semibold text-slate-400 leading-snug">
              Direcionamento padrão do motor de roteamento quando nenhuma regra é satisfeita.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 bg-violet-50 text-violet-755 border border-violet-150/60 rounded-md text-[8.5px] font-black uppercase tracking-wider">
                Mercado Pago
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-250/30 rounded-md text-[8.5px] font-black uppercase tracking-wider">
                Produção ativo
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => handleEdit('Fallback Global')}
            className="flex h-9 items-center justify-center gap-1.5 px-4 bg-white border border-[#E8DDFD] hover:bg-violet-50/50 text-violet-750 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Alterar Fallback
          </button>
        )}
      </div>

      {/* Systems Fallback overrides list */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-slate-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-wider">Sobreposições de Fallback por Sistema</span>
        </div>

        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] shadow-sm shadow-slate-100/50 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-[#E8DDFD]/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Sistema</th>
                <th className="py-3 px-4 text-left">Gateway de Fallback</th>
                <th className="py-3 px-4 text-left">Ambiente</th>
                <th className="py-3 px-4 text-left">Última Ativação</th>
                {isAdmin && <th className="py-3 px-4 text-right w-24">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDFD]/40">
              {fallbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold text-xs">
                    Nenhum fallback configurado.
                  </td>
                </tr>
              ) : (
                fallbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{fb.systemName === 'Fallback Global da Empresa' ? '⚓ Corporativo' : fb.systemName}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-750">{fb.gatewayName}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-slate-500">{fb.environment}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-semibold">
                      {fb.lastActivated ? new Date(fb.lastActivated).toLocaleString('pt-BR') : 'Nunca acionado'}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleEdit(fb.systemName)}
                          className="p-1.5 text-slate-400 hover:text-brand hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
