'use client';

import { useState, useEffect } from 'react';
import { GripVertical, AlertTriangle, ArrowUp, ArrowDown, Edit2, Play, Power, Trash2, MoreHorizontal, CheckCircle2, PauseCircle, HelpCircle } from 'lucide-react';
import { RoutingRule, RoutingRuleType, RoutingRuleStatus, RoutingCondition } from '@/types/routing';
import { cn } from '@/lib/utils';

interface RoutingRulesTableProps {
  rules: RoutingRule[];
  isAdmin: boolean;
  onReorder: (draggedIndex: number, hoverIndex: number) => void;
  onToggleStatus: (ruleId: string) => void;
  onEdit: (rule: RoutingRule) => void;
  onDelete: (ruleId: string) => void;
  onDuplicate: (rule: RoutingRule) => void;
  onShowConflict: (rule: RoutingRule) => void;
}

export function RoutingRulesTable({
  rules,
  isAdmin,
  onReorder,
  onToggleStatus,
  onEdit,
  onDelete,
  onDuplicate,
  onShowConflict,
}: RoutingRulesTableProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin || isMobile) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Smooth drag ghost image opacity
    setTimeout(() => {
      const target = e.target as HTMLElement;
      target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Mobile Reordering
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < rules.length - 1) {
      onReorder(index, index + 1);
    }
  };

  const typeConfig: Record<RoutingRuleType, { label: string; color: string }> = {
    by_system: { label: 'Sistema', color: 'bg-blue-50 text-blue-700 border-blue-200/50' },
    by_method: { label: 'Método', color: 'bg-violet-50 text-violet-755 border-violet-200/50' },
    by_value: { label: 'Valor', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/50' },
    by_installments: { label: 'Parcelas', color: 'bg-amber-50 text-amber-700 border-amber-250/50' },
    by_risk: { label: 'Risco', color: 'bg-red-50 text-red-700 border-red-200/50' },
    by_availability: { label: 'Disponibilidade', color: 'bg-orange-50 text-orange-700 border-orange-200/50' },
    fallback: { label: 'Fallback', color: 'bg-slate-100 text-slate-700 border-slate-200/50' },
  };

  const formatCondition = (cond: RoutingCondition) => {
    const fieldNames: Record<string, string> = {
      system: 'Sistema',
      method: 'Método',
      amount: 'Valor',
      installments: 'Parcelas',
      risk_score: 'Risco',
      environment: 'Ambiente',
      hour: 'Horário',
      country: 'País',
    };
    const operatorNames: Record<string, string> = {
      equals: '=',
      not_equals: '≠',
      greater_than: '>',
      less_than: '<',
      between: 'entre',
      contains: 'contém',
    };

    const field = fieldNames[cond.field] || cond.field;
    const op = operatorNames[cond.operator] || cond.operator;
    let val = cond.value;

    if (cond.field === 'amount' && typeof val === 'number') {
      val = `R$ ${(val / 100).toLocaleString('pt-BR')}`;
    }

    return `${field} ${op} ${val}`;
  };

  return (
    <div className="w-full bg-white border border-[#E8DDFD]/65 rounded-[22px] shadow-sm shadow-slate-100/50 overflow-hidden text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50/50 border-b border-[#E8DDFD]/50 text-slate-400 font-bold uppercase tracking-wider">
              {isAdmin && !isMobile && <th className="py-3.5 pl-4 w-10"></th>}
              <th className="py-3.5 px-3 w-16 text-center">Prioridade</th>
              <th className="py-3.5 px-3 min-w-[200px]">Regra</th>
              <th className="py-3.5 px-3 min-w-[240px]">Condições</th>
              <th className="py-3.5 px-3 min-w-[150px]">Destino / Fallback</th>
              <th className="py-3.5 px-3 min-w-[100px]">Sistemas</th>
              <th className="py-3.5 px-3 w-24">Status</th>
              <th className="py-3.5 px-3 text-center w-20">Cobertura 7d</th>
              <th className="py-3.5 px-3 w-28">Última decisão</th>
              <th className="py-3.5 pr-4 w-12 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DDFD]/40">
            {rules.map((rule, index) => {
              const isDragged = draggedIndex === index;
              const isOver = dragOverIndex === index;
              const hasHealthAlert = rule.gatewayHealth !== undefined && rule.gatewayHealth < 90;
              const isGlobal = rule.systems.includes('all');

              return (
                <tr
                  key={rule.id}
                  draggable={isAdmin && !isMobile}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={cn(
                    "transition-all duration-150 hover:bg-slate-50/30",
                    isDragged && "opacity-40 bg-slate-100 cursor-grabbing",
                    isOver && "border-t-2 border-brand",
                    rule.status === 'inactive' && "opacity-75"
                  )}
                >
                  {/* Grip Handle for Desktop Admins */}
                  {isAdmin && !isMobile && (
                    <td className="py-3 pl-4 text-slate-350 cursor-grab group-hover:text-slate-400">
                      <GripVertical className="w-4 h-4 shrink-0" />
                    </td>
                  )}

                  {/* Priority Badge */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {isMobile && isAdmin && (
                        <div className="flex flex-col gap-0.5 mr-1.5">
                          <button 
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                            className="p-0.5 text-slate-400 hover:text-brand disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button 
                            disabled={index === rules.length - 1}
                            onClick={() => handleMoveDown(index)}
                            className="p-0.5 text-slate-400 hover:text-brand disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      <span className={cn(
                        "w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black leading-none shrink-0",
                        rule.status === 'conflict' 
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : index < 3 
                            ? "bg-brand/10 text-brand border border-brand/20 font-black"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                      )}>
                        {rule.status === 'conflict' ? (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        ) : (
                          rule.priority
                        )}
                      </span>
                    </div>
                  </td>

                  {/* Rule Name & Type */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block leading-tight">{rule.name}</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[8.5px] font-black uppercase border tracking-wider",
                        typeConfig[rule.type]?.color || "bg-slate-100 text-slate-700"
                      )}>
                        {typeConfig[rule.type]?.label || rule.type}
                      </span>
                      {hasHealthAlert && (
                        <span className="px-1.5 py-0.5 rounded-md text-[8.5px] font-black bg-red-55 text-red-655 border border-red-200 uppercase tracking-tight flex items-center gap-0.5">
                          ⚠ Gateway Instável ({rule.gatewayHealth}%)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Conditions pills */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {rule.conditions.slice(0, 3).map((cond, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200/50 rounded-md text-[9px] font-semibold">
                          {formatCondition(cond)}
                        </span>
                      ))}
                      {rule.conditions.length > 3 && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[8.5px] font-bold">
                          +{rule.conditions.length - 3} mais
                        </span>
                      )}
                      {rule.conditions.length === 0 && (
                        <span className="text-slate-350 italic">Sem condições adicionais</span>
                      )}
                    </div>
                  </td>

                  {/* Destination Gateway & Fallback */}
                  <td className="py-3 px-3 leading-tight">
                    {rule.action === 'block_and_review' ? (
                      <span className="text-slate-500 font-bold uppercase text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                        Bloquear e Revisar
                      </span>
                    ) : rule.action === 'block' ? (
                      <span className="text-slate-500 font-bold uppercase text-[9px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md">
                        Bloquear Transação
                      </span>
                    ) : (
                      <div>
                        <span className="font-bold text-slate-800">{rule.gatewayName || 'Gateway'}</span>
                        {rule.fallbackGatewayName && (
                          <div className="text-[9.5px] text-slate-400 font-medium mt-0.5 flex items-center gap-0.5">
                            <span>fallback:</span>
                            <span className="font-bold text-slate-500">{rule.fallbackGatewayName}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Affected Systems */}
                  <td className="py-3 px-3">
                    {isGlobal ? (
                      <span className="px-1.5 py-0.5 bg-violet-50 text-violet-750 border border-violet-200/50 rounded-md text-[8.5px] font-black uppercase tracking-wider">
                        Global
                      </span>
                    ) : (
                      <div className="flex -space-x-1 overflow-hidden">
                        {rule.systems.map((sysId) => (
                          <div
                            key={sysId}
                            title={sysId === 'sys_church' ? 'Church Integration' : 'Vendor Platform'}
                            className="w-5.5 h-5.5 rounded-full bg-slate-100 border border-white text-[10px] flex items-center justify-center font-bold"
                          >
                            {sysId === 'sys_church' ? '⛪' : '🛍️'}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    {rule.status === 'active' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-250/30">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Ativa
                      </span>
                    )}
                    {rule.status === 'inactive' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-50 text-slate-400 border border-slate-200">
                        <PauseCircle className="w-2.5 h-2.5" />
                        Inativa
                      </span>
                    )}
                    {rule.status === 'conflict' && (
                      <span 
                        onClick={() => onShowConflict(rule)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-red-50 text-red-655 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        <AlertTriangle className="w-2.5 h-2.5 animate-bounce" />
                        Conflito
                      </span>
                    )}
                  </td>

                  {/* 7d Coverage */}
                  <td className="py-3 px-3 text-center font-bold text-slate-600">
                    {rule.coverage7d}%
                  </td>

                  {/* Last Decision */}
                  <td className="py-3 px-3 text-slate-400 font-semibold">
                    {rule.lastDecisionAt ? (
                      <span title={new Date(rule.lastDecisionAt).toLocaleString('pt-BR')}>
                        há {Math.floor((Date.now() - new Date(rule.lastDecisionAt).getTime()) / 60000) || 2} min
                      </span>
                    ) : (
                      <span className="text-slate-300 italic">—</span>
                    )}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3 pr-4 text-right relative">
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
                                  <Trash2 className="w-3 h-3" />
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
