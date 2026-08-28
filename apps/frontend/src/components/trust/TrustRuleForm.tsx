'use client';

import { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, Plus, Trash2, Code2, HelpCircle } from 'lucide-react';
import { TrustRule, TrustRuleTrigger, TrustCondition, TrustRuleType, TrustRuleStatus } from '@/types/trust';
import { cn } from '@/lib/utils';

interface TrustRuleFormProps {
  onSave: (rule: Partial<TrustRule>) => void;
  onCancel: () => void;
  initialRule?: TrustRule;
}

export function TrustRuleForm({ onSave, onCancel, initialRule }: TrustRuleFormProps) {
  const [step, setStep] = useState(1);
  
  // Step 1 values
  const [name, setName] = useState(initialRule?.name || '');
  const [description, setDescription] = useState(initialRule?.description || '');
  const [type, setType] = useState<TrustRuleType>(initialRule?.type || 'score_increase');

  // Step 2 values - conditions builder
  const [triggerType, setTriggerType] = useState<TrustRuleTrigger>(initialRule?.trigger || 'ip');
  const [conditions, setConditions] = useState<TrustCondition[]>(
    initialRule?.conditions || [{ field: 'ip', operator: 'equals', value: '' }]
  );

  // Step 3 values
  const [scoreImpact, setScoreImpact] = useState<number>(initialRule?.scoreImpact || 10);
  const [executionMode, setExecutionMode] = useState<TrustRuleStatus>(initialRule?.executionMode || 'active');
  const [environment, setEnvironment] = useState<'production' | 'sandbox' | 'both'>(initialRule?.environment || 'both');

  const addCondition = () => {
    setConditions([...conditions, { field: triggerType, operator: 'equals', value: '', logic: 'AND' }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length === 1) return;
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index: number, key: keyof TrustCondition, val: unknown) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [key]: val };
    setConditions(updated);
  };

  const getLivePreview = () => {
    const condStrs = conditions.map((cond, i) => {
      const fieldName = cond.field.toUpperCase();
      const opName = cond.operator === 'equals' ? 'IGUAL A' : cond.operator === 'greater_than' ? 'MAIOR QUE' : cond.operator === 'less_than' ? 'MENOR QUE' : cond.operator === 'in_list' ? 'NA LISTA' : 'CONTÉM';
      const logicStr = i > 0 ? ` ${cond.logic || 'AND'} ` : '';
      return `${logicStr}[${fieldName} ${opName} "${cond.value}"]`;
    }).join('');

    const actionStr = type === 'block' 
      ? 'Bloquear automaticamente' 
      : type === 'review' 
        ? 'Enviar para revisão manual' 
        : type === 'score_increase' 
          ? `Aumentar score de risco em +${scoreImpact} pontos` 
          : `Diminuir score de risco em ${scoreImpact} pontos`;

    return `QUANDO ${condStrs} ENTÃO [${actionStr}]`;
  };

  const handleFinish = () => {
    if (!name.trim()) return;

    onSave({
      name,
      description,
      type,
      trigger: triggerType,
      triggerDetail: `Regra customizada de gatilho ${triggerType}`,
      conditions,
      action: type === 'block' ? 'blocked_auto' : type === 'review' ? 'manual_review' : 'rule_triggered',
      scoreImpact: type === 'score_decrease' ? -Math.abs(scoreImpact) : Math.abs(scoreImpact),
      executionMode,
      environment,
      status: executionMode,
      triggers7d: 0,
      falsePositiveRate: 0.0,
      createdAt: new Date().toISOString(),
      createdBy: 'Gabriel Silva',
    });
  };

  return (
    <div className="w-full bg-white border border-[#E8DDFD] rounded-[24px] p-6 shadow-2xl space-y-6 text-left max-w-2xl mx-auto select-none animate-in slide-in-from-bottom-2 duration-300">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[#E8DDFD]/40 pb-4">
        <div>
          <h2 className="text-xs font-black uppercase text-slate-800 tracking-wider">
            {initialRule ? 'Editar Regra de Risco' : 'Criar Nova Regra de Risco'}
          </h2>
          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
            Etapa {step} de 3 — Configure as condições comportamentais.
          </span>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={cn(
                "w-4.5 h-1.5 rounded-full transition-all",
                step >= s ? "bg-brand" : "bg-slate-100"
              )} 
            />
          ))}
        </div>
      </div>

      {/* Step 1: Identification */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Nome da Regra</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
              placeholder="Ex: IP suspeito originado de nuvem comercial..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Descrição detalhada</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
              placeholder="Descreva as especificidades desta regra para fins de auditoria..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Tipo de Regra / Ação Base</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { id: 'score_increase', label: 'Aumentar Score', desc: 'Sinaliza comportamento de risco adicionando pontos.' },
                { id: 'score_decrease', label: 'Diminuir Score', desc: 'Favorece usuários legítimos reduzindo o score final.' },
                { id: 'review', label: 'Enviar para Revisão', desc: 'Retém o pagamento para averiguação manual de suporte.' },
                { id: 'block', label: 'Bloquear Automático', desc: 'Recusa imediatamente sem processar o gateway.' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setType(opt.id as TrustRuleType)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left cursor-pointer transition-all hover:bg-slate-50/50",
                    type === opt.id ? "border-brand bg-violet-50/10" : "border-slate-100 bg-white"
                  )}
                >
                  <span className="text-[11px] font-black text-slate-850 block">{opt.label}</span>
                  <span className="text-[9.5px] font-semibold text-slate-400 block mt-1 leading-snug">{opt.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Trigger Conditions */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Categoria do Gatilho Principal</label>
            <select
              value={triggerType}
              onChange={(e) => {
                const tr = e.target.value as TrustRuleTrigger;
                setTriggerType(tr);
                // Update all conditions field to match category
                setConditions(conditions.map(c => ({ ...c, field: tr })));
              }}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="ip">Endereço IP</option>
              <option value="device">Dispositivo (Device Fingerprint)</option>
              <option value="velocity">Velocidade de preenchimento</option>
              <option value="amount">Valor monetário da transação</option>
              <option value="history">Histórico do cliente</option>
              <option value="country">Geolocalização / País</option>
              <option value="email_age">Tempo de criação do e-mail</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black uppercase text-slate-455 tracking-wider">Construtor de Condições</label>
              <button
                type="button"
                onClick={addCondition}
                className="flex items-center gap-0.5 text-[10px] font-black text-brand uppercase tracking-tight cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar E/OU
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto no-scrollbar pr-1">
              {conditions.map((cond, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  {idx > 0 && (
                    <select
                      value={cond.logic || 'AND'}
                      onChange={(e) => handleConditionChange(idx, 'logic', e.target.value)}
                      className="h-8.5 px-2 bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-600 cursor-pointer"
                    >
                      <option value="AND">E</option>
                      <option value="OR">OU</option>
                    </select>
                  )}
                  
                  <select
                    value={cond.operator}
                    onChange={(e) => handleConditionChange(idx, 'operator', e.target.value)}
                    className="h-8.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="equals">Igual a</option>
                    <option value="not_equals">Diferente de</option>
                    <option value="greater_than">Maior que</option>
                    <option value="less_than">Menor que</option>
                    <option value="contains">Contém</option>
                    <option value="in_list">Na lista</option>
                  </select>

                  <input
                    type="text"
                    value={cond.value as string}
                    onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                    className="flex-1 h-8.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-350"
                    placeholder="Valor (Ex: blacklist, 5, US)..."
                  />

                  {conditions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCondition(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Action & Impact config */}
      {step === 3 && (
        <div className="space-y-5">
          {type.includes('score') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-450 uppercase tracking-wider">
                <span>Impacto Absoluto no Score</span>
                <span className="text-slate-800 text-xs">{scoreImpact} pontos</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={scoreImpact}
                onChange={(e) => setScoreImpact(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-brand"
              />
              <span className="text-[9.5px] text-slate-400 font-semibold block mt-1 leading-none">
                Estipula o peso de severidade desta regra ao somar o total ponderado de risco.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Modo de Execução</label>
              <select
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value as TrustRuleStatus)}
                className="w-full h-9.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="active">Ativo (Produção imediata)</option>
                <option value="testing">Em Teste (Apenas loga)</option>
                <option value="inactive">Inativo (Pausado)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Ambientes Alvo</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full h-9.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="both">Produção & Sandbox</option>
                <option value="production">Somente Produção</option>
                <option value="sandbox">Somente Sandbox</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Live Natural Preview Box */}
      <div className="bg-slate-50 border border-[#E8DDFD]/60 rounded-xl p-3.5 flex items-start gap-2">
        <Code2 className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase text-violet-750 tracking-wider block">Preview em linguagem natural</span>
          <p className="text-[10px] font-black text-slate-700 leading-snug">
            {getLivePreview()}
          </p>
        </div>
      </div>

      {/* Back and Next buttons footer */}
      <div className="flex items-center justify-between border-t border-[#E8DDFD]/40 pt-4">
        <button
          onClick={step === 1 ? onCancel : () => setStep(step - 1)}
          className="flex h-9 items-center justify-center gap-1 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          {step === 1 ? 'Cancelar' : 'Voltar'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1 && !name.trim()) return;
              setStep(step + 1);
            }}
            disabled={step === 1 && !name.trim()}
            className="flex h-9 items-center justify-center gap-1 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            Avançar
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex h-9 items-center justify-center gap-1.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer shadow-md shadow-brand/10"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Salvar Regra
          </button>
        )}
      </div>

    </div>
  );
}
