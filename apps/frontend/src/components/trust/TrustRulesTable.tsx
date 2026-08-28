'use client';

import { useState } from 'react';
import { Power, Edit2, Trash2, MoreHorizontal, AlertTriangle, Play, HelpCircle } from 'lucide-react';
import { TrustRule, TrustRuleType, TrustRuleStatus } from '@/types/trust';
import { cn } from '@/lib/utils';

interface TrustRulesTableProps {
  rules: TrustRule[];
  isAdmin: boolean;
  onToggleStatus: (id: string) => void;
  onEdit: (rule: TrustRule) => void;
  onDelete: (id: string) => void;
  onDuplicate: (rule: TrustRule) => void;
}

export function TrustRulesTable({
  rules,
  isAdmin,
  onToggleStatus,
  onEdit,
  onDelete,
  onDuplicate,
}: TrustRulesTableProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const triggerStyles: Record<string, { label: string; color: string }> = {
    ip: { label: 'Endereço IP', color: 'bg-blue-50 text-blue-700 border-blue-200/50' },
    device: { label: 'Dispositivo', color: 'bg-violet-50 text-violet-755 border-violet-200/50' },
    velocity: { label: 'Velocidade', color: 'bg-orange-50 text-orange-700 border-orange-200/50' },
    amount: { label: 'Valor da Compra', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' },
    history: { label: 'Histórico', color: 'bg-slate-100 text-slate-700 border-slate-200/50' },
    country: { label: 'Geografia', color: 'bg-red-50 text-red-700 border-red-200/50' },
  };

  return (
    <div className="w-full bg-white border border-[#E8DDFD]/65 rounded-[22px] shadow-sm shadow-slate-100/50 overflow-hidden text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#E8DDFD]/50 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Regra / Tipo</th>
              <th className="py-3.5 px-3">Gatilho</th>
              <th className="py-3.5 px-3">Ação</th>
              <th className="py-3.5 px-3 text-center">Impacto no Score</th>
              <th className="py-3.5 px-3 text-center">Acionamentos 7d</th>
              <th className="py-3.5 px-3 text-center">Falso Positivo</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pr-4 text-right w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DDFD]/40">
            {rules.map((rule) => {
              const isHighFP = rule.falsePositiveRate > 15;
              const isTesting = rule.status === 'testing';

              return (
                <tr 
                  key={rule.id} 
                  className={cn(
                    "hover:bg-slate-50/20 transition-colors",
                    rule.status === 'inactive' && "opacity-75"
                  )}
                >
                  
                  {/* Name + description details */}
                  <td className="py-3.5 px-4 max-w-[240px]">
                    <span className="font-bold text-slate-900 block leading-tight">{rule.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1 truncate" title={rule.description}>
                      {rule.description}
                    </span>
                  </td>

                  {/* Trigger */}
                  <td className="py-3.5 px-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase border tracking-wider",
                      triggerStyles[rule.trigger]?.color || "bg-slate-100 text-slate-650"
                    )}>
                      {triggerStyles[rule.trigger]?.label || rule.trigger}
                    </span>
                    <span className="text-[9.5px] font-bold text-slate-500 block mt-1 leading-none">{rule.triggerDetail}</span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-800 capitalize">
                      {rule.action === 'blocked_auto' ? 'Bloqueio auto' : rule.action === 'manual_review' ? 'Revisão manual' : 'Regra ativada'}
                    </span>
                  </td>

                  {/* Impact on score */}
                  <td className="py-3.5 px-3 text-center">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-black border",
                      rule.scoreImpact > 0
                        ? "bg-red-50 text-red-750 border-red-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    )}>
                      {rule.scoreImpact > 0 ? `+${rule.scoreImpact}` : rule.scoreImpact} pts
                    </span>
                  </td>

                  {/* Triggers 7d */}
                  <td className="py-3.5 px-3 text-center font-bold text-slate-650">
                    {rule.triggers7d.toLocaleString('pt-BR')}
                  </td>

                  {/* False positive rate */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={cn(
                        "font-bold",
                        isHighFP ? "text-red-655" : "text-slate-600"
                      )}>
                        {rule.falsePositiveRate}%
                      </span>
                      {isHighFP && (
                        <span className="px-1.5 py-0.2 bg-red-50 text-red-750 rounded text-[8px] font-black uppercase tracking-tight flex items-center gap-0.5 border border-red-150/40">
                          <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                          Ajustar
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Badges */}
                  <td className="py-3.5 px-3">
                    {isTesting ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase bg-violet-50 text-violet-755 border border-violet-200/50 tracking-wider">
                        <Play className="w-2.5 h-2.5 text-violet-600 shrink-0" />
                        Em Teste
                      </span>
                    ) : rule.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-250/30">
                        Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase bg-slate-50 text-slate-400 border border-slate-200">
                        Inativa
                      </span>
                    )}
                  </td>

                  {/* Operations actions */}
                  <td className="py-3.5 pr-4 text-right relative">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <>
                          <button 
                            onClick={() => onEdit(rule)}
                            className="p-1 text-slate-450 hover:text-brand hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Editar Regra"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onToggleStatus(rule.id)}
                            className="p-1 text-slate-450 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Ativar/Desativar"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === rule.id ? null : rule.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {openDropdownId === rule.id && (
                          <>
                            <div 
                              onClick={() => setOpenDropdownId(null)}
                              className="fixed inset-0 z-40"
                            />
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-[#E8DDFD] rounded-xl shadow-lg z-50 py-1 text-left">
                              <button
                                onClick={() => {
                                  onDuplicate(rule);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                              >
                                Duplicar
                              </button>
                              {isAdmin && (
                                <button
                                  onClick={() => {
                                    onDelete(rule.id);
                                    setOpenDropdownId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-[11px] font-black text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                                >
                                  Excluir
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
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
