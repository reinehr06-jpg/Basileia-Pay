'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { ArrowLeft, Play, HelpCircle, ShieldAlert, AlertTriangle, Check, Zap, Download } from 'lucide-react';
import { RoutingSimulatorInput, RoutingSimulatorResult, RoutingDecisionStep } from '@/types/routing';
import { MOCK_ROUTING_RULES } from '../__mocks__/routing';
import { cn } from '@/lib/utils';

export default function SimulatorPage() {
  const [systemId, setSystemId] = useState('sys_church');
  const [method, setMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');
  const [amountInput, setAmountInput] = useState('150,00');
  const [installments, setInstallments] = useState(1);
  const [riskScore, setRiskScore] = useState(20);
  const [customerId, setCustomerId] = useState('');
  
  // Extra Simulator fields
  const [country, setCountry] = useState('BR');
  const [device, setDevice] = useState<'mobile' | 'desktop' | 'api'>('desktop');
  const [customerHistory, setCustomerHistory] = useState<'new' | 'returning' | 'chargeback'>('new');

  const [result, setResult] = useState<RoutingSimulatorResult | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    
    const numericAmount = Math.round(
      parseFloat(amountInput.replace(/\./g, '').replace(',', '.')) * 100
    ) || 15000;

    setTimeout(() => {
      // Run evaluation decision chain
      const decisionChain: RoutingDecisionStep[] = MOCK_ROUTING_RULES.map((r) => {
        let satisfied = false;

        const conditionResults = r.conditions.map((cond) => {
          let condSatisfied = false;
          if (cond.field === 'system') condSatisfied = systemId === cond.value;
          else if (cond.field === 'method') condSatisfied = cond.value === method;
          else if (cond.field === 'amount') {
            if (cond.operator === 'greater_than') condSatisfied = numericAmount > Number(cond.value);
            if (cond.operator === 'less_than') condSatisfied = numericAmount < Number(cond.value);
          } else if (cond.field === 'risk_score') {
            if (cond.operator === 'greater_than') condSatisfied = riskScore > Number(cond.value);
            if (cond.operator === 'less_than') condSatisfied = riskScore < Number(cond.value);
          }
          return { condition: cond, satisfied: condSatisfied, actualValue: '' };
        });

        satisfied = conditionResults.length > 0 && conditionResults.every(c => c.satisfied);

        return {
          rule: r,
          evaluated: true,
          satisfied,
          conditionResults
        };
      });

      const isHighRisk = riskScore > 80;
      const appliedStep = decisionChain.find(step => step.satisfied && step.rule.status === 'active');

      let finalResult: RoutingSimulatorResult;

      if (isHighRisk) {
        finalResult = {
          action: 'block_and_review',
          isFallback: false,
          ruleApplied: MOCK_ROUTING_RULES[2],
          decisionChain
        };
      } else if (appliedStep) {
        finalResult = {
          gatewayId: appliedStep.rule.gatewayId,
          gatewayName: appliedStep.rule.gatewayName,
          action: appliedStep.rule.action,
          isFallback: false,
          estimatedLatencyMs: 98,
          ruleApplied: appliedStep.rule,
          decisionChain
        };
      } else {
        finalResult = {
          gatewayId: 'gw_mercadopago',
          gatewayName: 'Mercado Pago',
          action: 'route_to_gateway',
          isFallback: true,
          fallbackReason: 'Contingência global ativada',
          estimatedLatencyMs: 120,
          decisionChain
        };
      }

      setResult(finalResult);
      setSimulating(false);
    }, 400);
  };

  const handleExport = () => {
    if (!result) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(result, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `simulacao_roteamento_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    setFeedback("Resultado JSON baixado.");
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <PageLayout title="Simulador de Roteamento">
      {feedback && (
        <div className="fixed bottom-5 right-5 z-55 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl text-[11px] font-black uppercase">
          {feedback}
        </div>
      )}

      <div className="space-y-6 text-left">
        
        {/* Navigation line */}
        <div className="border-b border-[#E8DDFD]/60 pb-4">
          <Link
            href="/dashboard/routing"
            className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-500 hover:text-slate-800 tracking-wider transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o Painel
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Form Widget */}
          <div className="lg:col-span-1 bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-brand shrink-0" />
              Parâmetros de Simulação
            </h3>

            <form onSubmit={handleSimulate} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Sistema</label>
                <select
                  value={systemId}
                  onChange={(e) => setSystemId(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="sys_church">Church Integration</option>
                  <option value="sys_vendor">Vendor Platform</option>
                  <option value="sys_saas">SaaS Engine</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Método</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="pix">PIX</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Valor (R$)</label>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              {method === 'credit_card' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Parcelas</label>
                  <input
                    type="number"
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Score de Risco</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={riskScore}
                  onChange={(e) => setRiskScore(parseInt(e.target.value))}
                  className="w-full accent-brand cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                />
              </div>

              {/* Advanced columns */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">País Pagador</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="BR">Brasil (BR)</option>
                  <option value="US">Estados Unidos (US)</option>
                  <option value="PT">Portugal (PT)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Dispositivo</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-xl text-center">
                  {(['desktop', 'mobile', 'api'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDevice(d)}
                      className={cn(
                        "py-1 rounded-md text-[9px] font-black uppercase cursor-pointer",
                        device === d ? "bg-white text-brand shadow-sm" : "text-slate-500"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full h-9.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center gap-1.5 shadow-md shadow-brand/10 transition-all cursor-pointer mt-4"
              >
                Simular Roteamento
              </button>
            </form>
          </div>

          {/* Right Results Widget */}
          <div className="lg:col-span-2 space-y-4">
            {!result ? (
              <div className="bg-white border border-dashed border-[#E8DDFD] rounded-[22px] p-12 text-center text-slate-400 font-semibold space-y-2">
                <span className="text-4xl block">⚡</span>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Aguardando Parâmetros</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Defina os valores na barra lateral e clique em Simular para visualizar a árvore de decisão lógica aplicada pelo motor de roteamento.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* Result header banner */}
                <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      result.action === 'block' || result.action === 'block_and_review'
                        ? 'bg-red-50 text-red-655 border-red-200/50'
                        : result.isFallback
                          ? 'bg-amber-50 text-amber-600 border-amber-200/50'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-250/30'
                    )}>
                      {result.action === 'block' || result.action === 'block_and_review' ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : result.isFallback ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Resultado Obtido</span>
                      <h4 className="text-sm font-black text-slate-900 leading-none">
                        {result.action === 'block' || result.action === 'block_and_review' 
                          ? 'Transação Bloqueada por Risco' 
                          : `${result.gatewayName} selecionado`}
                      </h4>
                      {result.ruleApplied && (
                        <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                          Regra satisfeita: <span className="font-bold text-slate-600">{result.ruleApplied.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleExport}
                    className="flex h-9 items-center justify-center gap-1.5 px-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar JSON
                  </button>
                </div>

                {/* Chain comparison steps */}
                <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
                  <span className="text-[10px] text-slate-400 block font-black uppercase tracking-wider">Cadeia de Decisão Expandida</span>
                  <div className="space-y-3">
                    {result.decisionChain.map((step, idx) => (
                      <div 
                        key={step.rule.id}
                        className={cn(
                          "p-3.5 rounded-xl border text-[11px] font-semibold space-y-2 text-left transition-all",
                          step.satisfied
                            ? "bg-emerald-50/20 border-emerald-250/50 text-emerald-950 font-bold"
                            : "bg-slate-50/50 border-slate-100 text-slate-400"
                        )}
                      >
                        <div className="flex items-center justify-between border-b pb-2 border-slate-200/40">
                          <span className="font-bold block">
                            Regra #{step.rule.priority} — {step.rule.name}
                          </span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border tracking-wider",
                            step.satisfied 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          )}>
                            {step.satisfied ? 'Aplicada' : 'Não aplicada'}
                          </span>
                        </div>

                        {/* Conditions List check */}
                        <div className="space-y-1 text-[10px] font-medium text-slate-500">
                          {step.rule.conditions.map((c, condIdx) => (
                            <div key={condIdx} className="flex items-center gap-1.5">
                              <span className={step.satisfied ? "text-emerald-600" : "text-slate-400"}>
                                {step.satisfied ? '✓' : '✗'}
                              </span>
                              <span>
                                Condição: {c.field} {c.operator === 'equals' ? '=' : c.operator} {c.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </PageLayout>
  );
}
