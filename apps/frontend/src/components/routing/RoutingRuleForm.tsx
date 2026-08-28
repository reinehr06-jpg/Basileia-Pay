'use client';

import { useState } from 'react';
import { X, Check, ArrowRight, ArrowLeft, Plus, Trash2, HelpCircle } from 'lucide-react';
import { RoutingRule, RoutingCondition, RoutingAction, RoutingRuleType } from '@/types/routing';
import { cn } from '@/lib/utils';

interface RoutingRuleFormProps {
  onClose: () => void;
  onSave: (rule: Omit<RoutingRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'coverage7d'>) => void;
  initialRule?: RoutingRule;
}

export function RoutingRuleForm({ onClose, onSave, initialRule }: RoutingRuleFormProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(initialRule?.name || '');
  const [description, setDescription] = useState(initialRule?.description || '');
  const [type, setType] = useState<RoutingRuleType>(initialRule?.type || 'by_system');

  // Step 2 Conditions Builder
  const [conditions, setConditions] = useState<RoutingCondition[]>(
    initialRule?.conditions || [{ field: 'system', operator: 'equals', value: 'sys_church' }]
  );

  // Step 3 Destination & Fallback
  const [action, setAction] = useState<RoutingAction>(initialRule?.action || 'route_to_gateway');
  const [gatewayId, setGatewayId] = useState(initialRule?.gatewayId || 'gw_asaas');
  const [fallbackGatewayId, setFallbackGatewayId] = useState(initialRule?.fallbackGatewayId || 'gw_mercadopago');
  const [priority, setPriority] = useState(initialRule?.priority || 6);
  const [systems, setSystems] = useState<string[]>(initialRule?.systems || ['all']);
  const [environment, setEnvironment] = useState<'production' | 'sandbox' | 'both'>(initialRule?.environment || 'production');
  const [status, setStatus] = useState<boolean>(initialRule?.status === 'active' || true);

  // Confirmation Modal
  const [showConfirm, setShowConfirm] = useState(false);

  const addCondition = () => {
    setConditions([...conditions, { field: 'method', operator: 'equals', value: 'pix' }]);
  };

  const removeCondition = (idx: number) => {
    const next = [...conditions];
    next.splice(idx, 1);
    setConditions(next);
  };

  const updateCondition = (idx: number, key: keyof RoutingCondition, val: unknown) => {
    const next = [...conditions];
    next[idx] = { ...next[idx], [key]: val };
    setConditions(next);
  };

  const handleSystemCheck = (sysId: string) => {
    if (sysId === 'all') {
      setSystems(['all']);
    } else {
      let next = [...systems].filter(s => s !== 'all');
      if (next.includes(sysId)) {
        next = next.filter(s => s !== sysId);
      } else {
        next.push(sysId);
      }
      if (next.length === 0) next = ['all'];
      setSystems(next);
    }
  };

  const getGatewayName = (gwId: string) => {
    const map: Record<string, string> = {
      gw_asaas: 'Asaas',
      gw_cielo: 'Cielo',
      gw_mercadopago: 'Mercado Pago',
      gw_itau: 'Itaú',
      gw_asaas_church: 'Asaas Church',
      gw_bradesco: 'Bradesco',
      gw_rede: 'Rede',
    };
    return map[gwId] || gwId;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    onSave({
      priority,
      name,
      description,
      type,
      conditions,
      action,
      gatewayId: action === 'route_to_gateway' ? gatewayId : null,
      gatewayName: action === 'route_to_gateway' ? getGatewayName(gatewayId) : null,
      fallbackGatewayId: action === 'route_to_gateway' ? fallbackGatewayId : null,
      fallbackGatewayName: action === 'route_to_gateway' ? getGatewayName(fallbackGatewayId) : null,
      systems,
      environment,
      status: status ? 'active' : 'inactive',
    });
    setShowConfirm(false);
  };

  // Preview Logic
  const getRulePreviewText = () => {
    const condStrings = conditions.map(c => {
      let valDisplay = c.value;
      if (c.field === 'amount') valDisplay = `R$ ${(Number(c.value) || 0).toLocaleString('pt-BR')}`;
      return `${c.field} ${c.operator === 'equals' ? '=' : c.operator} ${valDisplay}`;
    });
    const conditionsText = condStrings.length > 0 ? condStrings.join(' E ') : 'Sem condições';
    const actionText = action === 'route_to_gateway' 
      ? `direcionar para ${getGatewayName(gatewayId)}` 
      : action === 'block_and_review' 
        ? 'bloquear e enviar para revisão' 
        : 'bloquear transação';
    return `Se [${conditionsText}] → ${actionText}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 select-none" role="dialog" aria-modal="true" aria-label={initialRule ? 'Editar regra de roteamento' : 'Nova regra de roteamento'}>
      <div className="bg-white w-full max-w-lg rounded-[24px] border border-[#E8DDFD] shadow-2xl overflow-hidden flex flex-col justify-between max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8DDFD]/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              {initialRule ? 'Editar regra de roteamento' : 'Nova regra de roteamento'}
            </h3>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Etapa {step} de 3</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer" aria-label="Fechar">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-4">
          
          {/* Real-time Preview bar */}
          <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-xl">
            <span className="text-[9px] font-black uppercase text-violet-755 tracking-wider block">Preview da regra</span>
            <p className="text-[11px] font-black text-slate-750 mt-1 leading-snug">
              {getRulePreviewText()}
            </p>
          </div>

          {step === 1 && (
            /* Step 1: Identificação */
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Nome da regra (Obrigatório)</label>
                <input
                  type="text"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                  placeholder="Ex: Roteamento PIX preferencial"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Descrição (Opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                  placeholder="Detalhamento operacional da regra..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Tipo de regra</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'by_system', label: 'Por Sistema' },
                    { id: 'by_method', label: 'Por Método' },
                    { id: 'by_value', label: 'Por Valor' },
                    { id: 'by_installments', label: 'Por Parcelamento' },
                    { id: 'by_risk', label: 'Por Risco' },
                    { id: 'by_availability', label: 'Disponibilidade' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as RoutingRuleType)}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-bold text-left cursor-pointer transition-all flex items-center justify-between",
                        type === t.id 
                          ? "bg-violet-50/50 border-brand text-brand"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                      )}
                    >
                      <span>{t.label}</span>
                      {type === t.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            /* Step 2: Condições */
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Regras de decisão (AND)</span>
                <button
                  type="button"
                  onClick={addCondition}
                  className="flex items-center gap-1 text-[9px] font-black text-brand uppercase tracking-tight bg-brand-soft px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Condição
                </button>
              </div>

              <div className="space-y-3">
                {conditions.map((cond, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
                    {/* Campo dropdown */}
                    <div className="w-full sm:w-1/3">
                      <select
                        value={cond.field}
                        onChange={(e) => updateCondition(idx, 'field', e.target.value)}
                        className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="system">Sistema</option>
                        <option value="method">Método</option>
                        <option value="amount">Valor (R$)</option>
                        <option value="installments">Parcelas</option>
                        <option value="risk_score">Risco</option>
                      </select>
                    </div>

                    {/* Operador dropdown */}
                    <div className="w-full sm:w-1/4">
                      <select
                        value={cond.operator}
                        onChange={(e) => updateCondition(idx, 'operator', e.target.value)}
                        className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="equals">igual a</option>
                        <option value="not_equals">diferente de</option>
                        <option value="greater_than">maior que</option>
                        <option value="less_than">menor que</option>
                      </select>
                    </div>

                    {/* Valor input dinâmico */}
                    <div className="w-full sm:flex-1">
                      {cond.field === 'system' ? (
                        <select
                          value={cond.value as string}
                          onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                          className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        >
                          <option value="sys_church">Church Integration</option>
                          <option value="sys_vendor">Vendor Platform</option>
                          <option value="sys_saas">SaaS Engine</option>
                        </select>
                      ) : cond.field === 'method' ? (
                        <select
                          value={cond.value as string}
                          onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                          className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                        >
                          <option value="pix">PIX</option>
                          <option value="credit_card">Cartão</option>
                          <option value="boleto">Boleto</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={cond.value as string}
                          onChange={(e) => updateCondition(idx, 'value', e.target.value)}
                          className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                          placeholder={cond.field === 'amount' ? 'Em centavos (Ex: 1000)' : 'Valor'}
                        />
                      )}
                    </div>

                    {/* Excluir cond */}
                    {conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCondition(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            /* Step 3: Destino e Fallback */
            <div className="space-y-4 text-left animate-in fade-in duration-200">
              
              {/* Ação principal */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Ação da Regra</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value as RoutingAction)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="route_to_gateway">Usar Gateway Específico</option>
                  <option value="block_and_review">Bloquear e Enviar para Revisão</option>
                  <option value="block">Bloquear Transação Completamente</option>
                </select>
              </div>

              {action === 'route_to_gateway' && (
                <>
                  {/* Gateway Destino */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Gateway Destino</label>
                      <select
                        value={gatewayId}
                        onChange={(e) => setGatewayId(e.target.value)}
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        <option value="gw_asaas">Asaas</option>
                        <option value="gw_cielo">Cielo</option>
                        <option value="gw_mercadopago">Mercado Pago</option>
                        <option value="gw_itau">Itaú</option>
                        <option value="gw_asaas_church">Asaas Church</option>
                      </select>
                    </div>

                    {/* Contingência */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Fallback Gateway</label>
                      <select
                        value={fallbackGatewayId}
                        onChange={(e) => setFallbackGatewayId(e.target.value)}
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                      >
                        <option value="gw_mercadopago">Mercado Pago</option>
                        <option value="gw_asaas">Asaas Principal</option>
                        <option value="gw_rede">Rede</option>
                        <option value="gw_bradesco">Bradesco</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Prioridade & Sistemas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Prioridade</label>
                  <input
                    type="number"
                    min={1}
                    value={priority}
                    onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Ambiente</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="production">Produção</option>
                    <option value="sandbox">Sandbox</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>
              </div>

              {/* Checklist de Sistemas */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Sistemas Afetados</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Todos os Sistemas' },
                    { id: 'sys_church', label: 'Church' },
                    { id: 'sys_vendor', label: 'Vendor' },
                    { id: 'sys_saas', label: 'SaaS' }
                  ].map((sys) => (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => handleSystemCheck(sys.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border cursor-pointer transition-all",
                        systems.includes(sys.id)
                          ? "bg-brand/10 border-brand text-brand"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {sys.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status inicial Toggle */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-800 block">Status Inicial</span>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Regra começa ativa no motor</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus(!status)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-all duration-205 focus:outline-none cursor-pointer",
                    status ? "bg-emerald-500 flex justify-end" : "bg-slate-300 flex justify-start"
                  )}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-[#E8DDFD]/50 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="flex h-9 items-center justify-center gap-1 px-3.5 bg-white border border-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            Voltar
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !name}
              onClick={() => setStep(step + 1)}
              className="flex h-9 items-center justify-center gap-1 px-4 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
            >
              Avançar
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name}
              className="flex h-9 items-center justify-center gap-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              Salvar Regra
            </button>
          )}
        </div>

      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white w-full max-w-sm rounded-[22px] border border-[#E8DDFD] shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                <HelpCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider leading-tight">
                  Confirmar e Ativar Regra?
                </h4>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-snug">
                  A regra {name} será inserida na prioridade {priority} do motor de decisão.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 space-y-1.5">
              <div>
                <span className="text-slate-400 font-medium block">Nome:</span>
                {name}
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Preview lógico:</span>
                {getRulePreviewText()}
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Prioridade ativa:</span>
                Posição #{priority}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer shadow-sm shadow-emerald-600/10"
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
