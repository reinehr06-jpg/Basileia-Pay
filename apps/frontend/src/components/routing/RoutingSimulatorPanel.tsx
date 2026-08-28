'use client';

import { useState } from 'react';
import { Play, HelpCircle, X, Check, ShieldAlert, AlertTriangle, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { RoutingSimulatorInput, RoutingSimulatorResult, RoutingRule } from '@/types/routing';

import { cn } from '@/lib/utils';

interface RoutingSimulatorPanelProps {
  onSimulate: (input: RoutingSimulatorInput) => RoutingSimulatorResult;
  isOpen: boolean;
  onClose: () => void;
  rules: RoutingRule[];
}

export function RoutingSimulatorPanel({ onSimulate, isOpen, onClose, rules }: RoutingSimulatorPanelProps) {
  const [systemId, setSystemId] = useState('sys_church');
  const [method, setMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [amountInput, setAmountInput] = useState('150,00');
  const [installments, setInstallments] = useState(1);
  const [riskScore, setRiskScore] = useState(20);
  const [customerId, setCustomerId] = useState('');
  
  const [result, setResult] = useState<RoutingSimulatorResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    
    // Parse amount from currency mask (remove points and comma, convert to cents)
    const numericAmount = Math.round(
      parseFloat(amountInput.replace(/\./g, '').replace(',', '.')) * 100
    ) || 15000;

    setTimeout(() => {
      const input: RoutingSimulatorInput = {
        systemId,
        method,
        amount: numericAmount,
        installments,
        riskScore,
        customerId: customerId || undefined
      };
      
      const res = onSimulate(input);
      setResult(res);
      setSimulating(false);
    }, 450);
  };

  const handleClear = () => {
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60] flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white shadow-2xl h-full animate-in slide-in-from-right-full duration-300 p-5 shrink-0 flex flex-col overflow-y-auto no-scrollbar text-left border-l border-[#E8DDFD]/60 relative">
      <div className="space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DDFD]/40 pb-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-brand shrink-0" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Simulador de Roteamento
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Badge */}
        <div className="p-2.5 bg-amber-50/50 border border-amber-200/50 rounded-xl flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[10px] font-semibold text-amber-700 leading-snug">
            <span className="font-black uppercase block tracking-wider">Apenas simulação</span>
            Nenhuma transação financeira real é processada ou enviada aos gateways.
          </div>
        </div>

        {!result ? (
          /* Form block */
          <form onSubmit={handleSimulate} className="space-y-4">
            
            {/* Sistema */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Sistema de Origem</label>
              <select
                value={systemId}
                onChange={(e) => setSystemId(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand cursor-pointer"
              >
                <option value="sys_church">Church Integration</option>
                <option value="sys_vendor">Vendor Platform</option>
                <option value="sys_saas">SaaS Engine</option>
              </select>
            </div>

            {/* Método de pagamento */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Método</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-xl">
                {(['pix', 'credit_card', 'boleto'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={cn(
                      "py-1.5 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer",
                      method === m 
                        ? "bg-white text-brand shadow-sm" 
                        : "text-slate-500 hover:bg-white/40"
                    )}
                  >
                    {m === 'credit_card' ? 'Cartão' : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Valor da transação (R$)</label>
              <input
                type="text"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                placeholder="0,00"
              />
            </div>

            {/* Parcelas (only card) */}
            {method === 'credit_card' && (
              <div className="space-y-1 animate-in fade-in duration-200">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Parcelas</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={installments}
                  onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                />
              </div>
            )}

            {/* Risco Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Score de Risco</label>
                <span className={cn(
                  "text-[10px] font-black px-1.5 py-0.5 rounded-md border",
                  riskScore > 80 ? "bg-red-50 text-red-700 border-red-200/50" : "bg-slate-100 text-slate-600 border-slate-200"
                )}>
                  {riskScore} / 100
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={riskScore}
                onChange={(e) => setRiskScore(parseInt(e.target.value))}
                className="w-full accent-brand cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
              />
            </div>

            {/* Cliente */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">ID do Cliente (Opcional)</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand"
                placeholder="cli_9812"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={simulating}
              className="w-full h-9 bg-brand hover:bg-brand-dark disabled:bg-slate-200 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-md shadow-brand/10 transition-all cursor-pointer"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  Simulando...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  Simular Roteamento
                </>
              )}
            </button>

          </form>
        ) : (
          /* Results block */
          <div className="space-y-4 animate-in fade-in duration-300">
            
            {/* Box 1 - Chosen Destination */}
            {result.action === 'block' || result.action === 'block_and_review' ? (
              <div className="bg-red-50/50 border border-red-250/70 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-red-700">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Pagamento Bloqueado</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">Regra aplicada:</span>
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    {result.ruleApplied?.name || '#3 Alto risco — bloquear'}
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                  Score de risco simulado: <span className="font-bold text-red-700">{riskScore}</span> (acima do limite de 80). Transação enviada para revisão manual.
                </div>
              </div>
            ) : result.isFallback ? (
              <div className="bg-amber-50/50 border border-amber-250/70 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Fallback Global Aplicado</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">Gateway padrão:</span>
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    {result.gatewayName || 'Mercado Pago'}
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                  Nenhuma regra específica satisfeita. Aplicado gateway de contingência global da empresa.
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/50 border border-emerald-250/70 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check className="w-5 h-5 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Gateway Selecionado</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">Provedor direcionado:</span>
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    {result.gatewayName || 'Gateway'}
                  </span>
                </div>
                <div className="space-y-2 text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                  <div>
                    <span className="text-slate-400 block font-medium">Regra aplicada:</span>
                    <span className="font-bold text-slate-700">{result.ruleApplied?.name}</span>
                  </div>
                  {result.ruleApplied?.fallbackGatewayName && (
                    <div>
                      <span className="text-slate-400 block font-medium">Fallback disponível:</span>
                      <span className="font-bold text-slate-700">{result.ruleApplied.fallbackGatewayName}</span>
                    </div>
                  )}
                  <div className="pt-1 flex items-center gap-1.5 text-slate-600">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Latência estimada: ~{result.estimatedLatencyMs}ms</span>
                  </div>
                </div>
              </div>
            )}

            {/* Box 2 - Decision Chain */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cadeia de Decisão</h4>
              <div className="space-y-1.5">
                {result.decisionChain.map((step, idx) => (
                  <div 
                    key={step.rule.id}
                    className={cn(
                      "p-2.5 rounded-xl border text-[10px] font-semibold space-y-1 text-slate-600 text-left",
                      step.satisfied 
                        ? "bg-emerald-50/20 border-emerald-250/50 text-emerald-950 font-bold" 
                        : "bg-slate-50/50 border-slate-100 text-slate-400"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[80%] block">
                        #{step.rule.priority} {step.rule.name}
                      </span>
                      <span>
                        {step.satisfied ? '✅ Aplicada' : '✗ Pula'}
                      </span>
                    </div>
                    {step.satisfied && (
                      <div className="text-[9px] font-medium text-emerald-700 mt-1">
                        Condição Satisfeita: {step.rule.type === 'by_system' ? 'Sistema = Church' : step.rule.type === 'by_method' ? 'Método = PIX' : 'Regra aceita'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClear}
              className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-4"
            >
              Nova Simulação
            </button>

          </div>
        )}

      </div>
      </div>
    </div>
  );
}
