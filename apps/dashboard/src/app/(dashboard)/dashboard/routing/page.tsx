'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';

import { apiFetch } from '@/lib/api';
import { RoutingHeader } from '@/components/routing/RoutingHeader';
import { RoutingKpiCards } from '@/components/routing/RoutingKpiCards';
import { RoutingTabs, RoutingTabValue } from '@/components/routing/RoutingTabs';
import { RoutingFilters } from '@/components/routing/RoutingFilters';
import { RoutingConflictBanner } from '@/components/routing/RoutingConflictBanner';
import { RoutingRulesTable } from '@/components/routing/RoutingRulesTable';
import { RoutingSimulatorPanel } from '@/components/routing/RoutingSimulatorPanel';
import { RoutingFallbacksTab } from '@/components/routing/RoutingFallbacksTab';
import { RoutingHistoryTab } from '@/components/routing/RoutingHistoryTab';
import { RoutingRuleForm } from '@/components/routing/RoutingRuleForm';
import { RoutingRule, RoutingRuleType, RoutingAction, RoutingKpi, RoutingSimulatorInput, RoutingSimulatorResult, RoutingDecisionStep } from '@/types/routing';
import { 
  cn 
} from '@/lib/utils';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Activity, 
  ShieldAlert, 
  Check, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  DollarSign, 
  BookOpen, 
  ArrowRight,
  Edit2,
  Trash2,
  Copy,
  Terminal,
  Lock,
  Settings,
  ShieldCheck,
  History,
  Code,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  RefreshCw,
  PlusCircle
} from 'lucide-react';

export default function RoutingPage() {
  const [activeTab, setActiveTab] = useState<RoutingTabValue>('rules');
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [kpis, setKpis] = useState<RoutingKpi>({
    activeRulesCount: 0,
    activeRulesDelta: 0,
    gatewaysInPool: 0,
    decisionsToday: 0,
    decisionsTodayDelta: 0,
    conflictsCount: 0
  });
  const [showSimulator, setShowSimulator] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | undefined>(undefined);
  const [userRole, setUserRole] = useState<'admin' | 'viewer'>('admin');
  const [loading, setLoading] = useState(true);
  
  // Notification Toast state
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/v1/dashboard/routing');
        if (res.success && res.data) {
          const data = res.data as { rules?: any[] };
          setRules((data.rules || []).map((r: any) => ({
            id: r.uuid || r.id?.toString(),
            name: r.name || '',
            description: r.description || '',
            priority: r.priority || 0,
            type: (r.type || 'by_system') as RoutingRuleType,
            status: r.status === 'active' ? 'active' : 'inactive' as const,
            conditions: typeof r.conditions === 'string' ? JSON.parse(r.conditions) : (r.conditions || []),
            action: (r.action || 'route_to_gateway') as RoutingAction,
            gatewayId: r.gateway_id,
            gatewayName: r.gateway?.name || '',
            systemId: r.system_id?.toString() || '',
            systemName: r.system?.name || '',
            systems: r.systems || [],
            method: r.payment_method || 'pix',
            environment: r.environment || 'production',
            coverage7d: r.coverage7d || 0,
            createdBy: r.created_by || '',
            createdAt: r.created_at || '',
            updatedAt: r.updated_at || '',
            metrics: { approvalRate: 0, volume7d: 0, avgLatency: 0, successRate: 0 },
          })));
        } else {
          setRules([]);
        }
      } catch (err) { console.error('Failed to fetch routing data:', err); setRules([]); } finally {
        setLoading(false);
      }
    })();
    setKpis({
      activeRulesCount: 0,
      activeRulesDelta: 0,
      gatewaysInPool: 0,
      decisionsToday: 0,
      decisionsTodayDelta: 0,
      conflictsCount: 0
    });
  }, []);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Drag and Drop confirmation dialog state
  const [reorderPending, setReorderPending] = useState<{ from: number; to: number } | null>(null);

  // Smart Retries states
  const [retriesActive, setRetriesActive] = useState(true);
  const [smartRetriesRules, setSmartRetriesRules] = useState<any[]>([]);

  // Smart Retry Modal States
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [editingRetryRule, setEditingRetryRule] = useState<any | null>(null);
  
  // Smart Retry Form Fields
  const [formCode, setFormCode] = useState('91');
  const [formName, setFormName] = useState('Banco Emissor Indisponível');
  const [formAction, setFormAction] = useState('retry_alternative');
  const [formGateway, setFormGateway] = useState('Mercado Pago');
  const [formMaxRetries, setFormMaxRetries] = useState(2);
  const [formDelay, setFormDelay] = useState(0);
  const [formStatus, setFormStatus] = useState('active');

  // Smart Retries Simulator states
  const [simValue, setSimValue] = useState(250);
  const [simMethod, setSimMethod] = useState('credit_card');
  const [simSystem, setSimSystem] = useState('Checkout V2');
  const [simRiskScore, setSimRiskScore] = useState(15);
  const [simErrorCode, setSimErrorCode] = useState('91');
  const [simPrimaryGateway, setSimPrimaryGateway] = useState('Cielo');
  const [simResultTrace, setSimResultTrace] = useState<string[]>([]);
  const [simResultSuccess, setSimResultSuccess] = useState<boolean | null>(null);
  const [simulatingInProgress, setSimulatingInProgress] = useState(false);

  // Simulated smart retry executions logs feed
  const [retryLogs, setRetryLogs] = useState<any[]>([]);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  const isAdmin = userRole === 'admin';

  // Filtered Rules list for the routing table
  const filteredRules = rules.filter((rule) => {
    const matchesSearch = searchQuery
      ? rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rule.gatewayName && rule.gatewayName.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesStatus = statusFilter === 'all' ? true : rule.status === statusFilter;
    const matchesSystem = systemFilter === 'all' ? true : rule.systems.includes(systemFilter) || rule.systems.includes('all');
    const matchesMethod = methodFilter === 'all' 
      ? true 
      : rule.conditions.some(c => c.field === 'method' && c.value === methodFilter);
    
    const matchesGateway = gatewayFilter === 'all' ? true : rule.gatewayId === gatewayFilter;
    const matchesType = typeFilter === 'all' ? true : rule.type === typeFilter;

    return matchesSearch && matchesStatus && matchesSystem && matchesMethod && matchesGateway && matchesType;
  });

  // Reorder confirmation handler
  const handleReorderTrigger = (from: number, to: number) => {
    setReorderPending({ from, to });
  };

  const confirmReorder = () => {
    if (!reorderPending) return;
    const { from, to } = reorderPending;
    
    const updated = [...rules];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    // Re-calculate priority numbers sequentially
    const sequential = updated.map((r, index) => ({
      ...r,
      priority: index + 1
    }));

    setRules(sequential);
    setReorderPending(null);
    triggerFeedback(`Ordem de prioridade atualizada. Posição #${from + 1} movida para #${to + 1}. Alteração registrada na auditoria.`);
  };

  // Toggle status of routing rules
  const handleToggleStatus = (ruleId: string) => {
    setRules(rules.map(r => {
      if (r.id === ruleId) {
        const nextStatus = r.status === 'active' ? 'inactive' : 'active';
        triggerFeedback(`Regra "${r.name}" alterada para ${nextStatus === 'active' ? 'Ativa' : 'Inativa'}.`);
        return { ...r, status: nextStatus as any };
      }
      return r;
    }));
  };

  // Create or Update routing rule
  const handleSaveRule = (formData: any) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...formData } : r));
      triggerFeedback(`Regra "${formData.name}" editada com sucesso.`);
    } else {
      const newRule: RoutingRule = {
        id: `rule_00${rules.length + 1}`,
        priority: rules.length + 1,
        coverage7d: 0.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin Basileia',
        ...formData
      };
      setRules([...rules, newRule]);
      triggerFeedback(`Nova regra "${formData.name}" criada e adicionada ao pool.`);
    }
    setShowRuleForm(false);
    setEditingRule(undefined);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId).map((r, idx) => ({ ...r, priority: idx + 1 })));
    triggerFeedback('Regra excluída com sucesso do motor de decisão.');
  };

  const handleDuplicateRule = (rule: RoutingRule) => {
    const duplicated: RoutingRule = {
      ...rule,
      id: `rule_dup_${Date.now()}`,
      name: `${rule.name} (Cópia)`,
      priority: rules.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRules([...rules, duplicated]);
    triggerFeedback(`Regra "${rule.name}" duplicada.`);
  };

  // Simulator Decision engine logic simulation
  const simulateRouting = (input: RoutingSimulatorInput): RoutingSimulatorResult => {
    const isHighRisk = input.riskScore > 80;
    
    const decisionChain: RoutingDecisionStep[] = rules.map((r) => {
      let evaluated = true;
      let satisfied = false;

      const conditionResults = r.conditions.map((cond) => {
        let condSatisfied = false;
        let actualValue: string | number = '';

        if (cond.field === 'system') {
          actualValue = input.systemId;
          condSatisfied = cond.operator === 'equals' ? input.systemId === cond.value : input.systemId !== cond.value;
        } else if (cond.field === 'method') {
          actualValue = input.method;
          condSatisfied = cond.value === input.method;
        } else if (cond.field === 'amount') {
          actualValue = input.amount;
          if (cond.operator === 'greater_than') condSatisfied = input.amount > Number(cond.value);
          if (cond.operator === 'less_than') condSatisfied = input.amount < Number(cond.value);
        } else if (cond.field === 'risk_score') {
          actualValue = input.riskScore;
          if (cond.operator === 'greater_than') condSatisfied = input.riskScore > Number(cond.value);
          if (cond.operator === 'less_than') condSatisfied = input.riskScore < Number(cond.value);
        }

        return { condition: cond, satisfied: condSatisfied, actualValue };
      });

      satisfied = conditionResults.length > 0 && conditionResults.every(c => c.satisfied);

      return {
        rule: r,
        evaluated,
        satisfied,
        conditionResults
      };
    });

    const appliedStep = decisionChain.find(step => step.satisfied && step.rule.status === 'active');

    if (isHighRisk) {
      const riskRule = rules.find(r => r.type === 'by_risk');
      return {
        action: 'block_and_review',
        isFallback: false,
        ruleApplied: riskRule,
        decisionChain
      };
    }

    if (appliedStep) {
      const r = appliedStep.rule;
      const isGatewayInstable = r.gatewayHealth !== undefined && r.gatewayHealth < 90;

      return {
        gatewayId: isGatewayInstable ? r.fallbackGatewayId : r.gatewayId,
        gatewayName: isGatewayInstable ? r.fallbackGatewayName : r.gatewayName,
        action: r.action,
        isFallback: isGatewayInstable,
        fallbackReason: isGatewayInstable ? 'Gateway principal instável (saúde < 90%)' : undefined,
        estimatedLatencyMs: isGatewayInstable ? 145 : 98,
        ruleApplied: r,
        decisionChain
      };
    }

    return {
      gatewayId: 'gw_mercadopago',
      gatewayName: 'Mercado Pago',
      action: 'route_to_gateway',
      isFallback: true,
      fallbackReason: 'Nenhuma regra atendida. Fallback Global corporativo.',
      estimatedLatencyMs: 120,
      decisionChain
    };
  };

  // Smart Retry CRUD Handlers
  const handleOpenNewRetryModal = () => {
    setEditingRetryRule(null);
    setFormCode('91');
    setFormName('Banco Emissor Indisponível');
    setFormAction('retry_alternative');
    setFormGateway('Mercado Pago');
    setFormMaxRetries(2);
    setFormDelay(0);
    setFormStatus('active');
    setShowRetryModal(true);
  };

  const handleOpenEditRetryModal = (rule: any) => {
    setEditingRetryRule(rule);
    setFormCode(rule.code);
    setFormName(rule.name);
    setFormAction(rule.action);
    setFormGateway(rule.gateway);
    setFormMaxRetries(rule.maxRetries);
    setFormDelay(rule.delay);
    setFormStatus(rule.status);
    setShowRetryModal(true);
  };

  const handleSaveRetryRule = () => {
    if (editingRetryRule) {
      // Update
      setSmartRetriesRules(prev => prev.map(r => r.id === editingRetryRule.id ? {
        ...r,
        code: formCode,
        name: formName,
        action: formAction,
        gateway: formAction === 'retry_alternative' || formAction === 'retry_alternative_delay' ? formGateway : '—',
        maxRetries: formAction === 'block' ? 0 : formMaxRetries,
        delay: formDelay,
        status: formStatus
      } : r));
      triggerFeedback(`Regra para código ${formCode} editada com sucesso!`);
    } else {
      // Create
      const newRule = {
        id: `sr_${Date.now()}`,
        priority: smartRetriesRules.length + 1,
        code: formCode,
        name: formName,
        action: formAction,
        gateway: formAction === 'retry_alternative' || formAction === 'retry_alternative_delay' ? formGateway : '—',
        maxRetries: formAction === 'block' ? 0 : formMaxRetries,
        delay: formDelay,
        status: formStatus,
        count: 0
      };
      setSmartRetriesRules(prev => [...prev, newRule]);
      triggerFeedback(`Nova regra para código ${formCode} criada!`);
    }
    setShowRetryModal(false);
  };

  const handleDeleteRetryRule = (id: string) => {
    setSmartRetriesRules(prev => prev.filter(r => r.id !== id).map((r, idx) => ({ ...r, priority: idx + 1 })));
    triggerFeedback("Regra de retentativa excluída do motor.");
  };

  const handleDuplicateRetryRule = (rule: any) => {
    const duplicated = {
      ...rule,
      id: `sr_dup_${Date.now()}`,
      priority: smartRetriesRules.length + 1,
      code: `${rule.code}-COPY`,
      name: `${rule.name} (Cópia)`,
      count: 0
    };
    setSmartRetriesRules(prev => [...prev, duplicated]);
    triggerFeedback(`Regra duplicada para código ${rule.code}-COPY.`);
  };

  const handleToggleRetryStatus = (id: string) => {
    setSmartRetriesRules(prev => prev.map(r => r.id === id ? {
      ...r,
      status: r.status === 'active' ? 'inactive' : 'active'
    } : r));
    triggerFeedback("Status da regra atualizado.");
  };

  // Run Smart Retry simulation with multiple trace logs
  const handleSimulateSmartRetryTrace = () => {
    setSimulatingInProgress(true);
    setSimResultTrace([]);
    setSimResultSuccess(null);

    const step1 = `🔍 Analisando falha na transação de R$ ${simValue.toFixed(2)} via ${simMethod === 'credit_card' ? 'Cartão de Crédito' : simMethod === 'pix' ? 'Pix' : 'Boleto'}...`;
    const step2 = `⚠️ Adquirente ${simPrimaryGateway} retornou Código de Erro: ${simErrorCode}`;
    
    setTimeout(() => {
      setSimResultTrace(prev => [...prev, step1]);
      
      setTimeout(() => {
        setSimResultTrace(prev => [...prev, step2]);
        
        // Find matching active smart retry rule
        const activeRule = smartRetriesRules.find(r => r.code === simErrorCode && r.status === 'active');
        
        setTimeout(() => {
          if (!activeRule) {
            setSimResultTrace(prev => [
              ...prev, 
              `⚡ Nenhuma regra ativa correspondente encontrada na prioridade.`,
              `❌ Falha Final: Transação marcada como recusada.`
            ]);
            setSimResultSuccess(false);
            setSimulatingInProgress(false);
            return;
          }

          setSimResultTrace(prev => [...prev, `🎯 Regra encontrada: [Prioridade #${activeRule.priority}] - ${activeRule.name}`]);

          setTimeout(() => {
            if (activeRule.action === 'block') {
              setSimResultTrace(prev => [
                ...prev,
                `🛑 Diretiva: Bloquear Retentativas (evita custos de processamento desnecessários com taxas extras).`,
                `❌ Falha Final registrada com sucesso.`
              ]);
              setSimResultSuccess(false);
            } else if (activeRule.action === 'three_d_secure') {
              setSimResultTrace(prev => [
                ...prev,
                `🔒 Diretiva: Exigir Autenticação 3D Secure.`,
                `📲 Redirecionando cliente para app emissor...`,
                `✅ Sucesso! Cliente autenticou transação. Capturada com êxito.`
              ]);
              setSimResultSuccess(true);
            } else if (activeRule.action === 'retry_alternative') {
              setSimResultTrace(prev => [
                ...prev,
                `🔄 Diretiva: Retentar imediatamente em Gateway Secundário.`,
                `🚀 Roteando transação para adquirente secundária: ${activeRule.gateway}...`,
                `✅ Sucesso! Transação autorizada na adquirente de backup.`
              ]);
              setSimResultSuccess(true);
            } else if (activeRule.action === 'retry_alternative_delay') {
              setSimResultTrace(prev => [
                ...prev,
                `⏱️ Diretiva: Retentativa com delay programado.`,
                `⏳ Aguardando delay de ${activeRule.delay} segundos...`,
                `🚀 Roteando transação para adquirente secundária: ${activeRule.gateway}...`,
                `✅ Sucesso! Transação capturada na adquirente de backup após cooldown.`
              ]);
              setSimResultSuccess(true);
            } else {
              setSimResultTrace(prev => [
                ...prev,
                `🔄 Diretiva: Retentar imediatamente no mesmo gateway (${simPrimaryGateway})...`,
                `✅ Sucesso! Capturada na retentativa 1 de 2.`
              ]);
              setSimResultSuccess(true);
            }
            setSimulatingInProgress(false);
          }, 800);

        }, 800);

      }, 600);

    }, 400);
  };

  return (
    <PageLayout title="Roteamento Inteligente">
      
      {/* Feedback Toast Notification */}
      {feedbackMsg && (
        <div className="fixed bottom-5 right-5 z-60 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0 animate-ping" />
          <span className="text-[11px] font-black">{feedbackMsg}</span>
        </div>
      )}

      {/* Smart Retry Dialog Modal */}
      {showRetryModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4 text-left">
          <div className="bg-white border border-[#E8DDFD] w-full max-w-md rounded-[24px] p-5.5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <span className="text-xs font-black text-slate-850 uppercase tracking-wider">
                {editingRetryRule ? 'Editar Regra de Retentativa' : 'Criar Regra de Retentativa'}
              </span>
              <button onClick={() => setShowRetryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Código ISO 8583</label>
                  <input 
                    type="text" 
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700" 
                    placeholder="ex: 91"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nome do Erro</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700" 
                    placeholder="ex: Timeout do emissor"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Diretiva de Ação</label>
                <select 
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 h-9.5"
                >
                  <option value="block">Bloquear Retentativas (Falha Imediata)</option>
                  <option value="retry_immediate">Retentar Imediatamente no mesmo Gateway</option>
                  <option value="retry_alternative">Failover Automático para Gateway Secundário</option>
                  <option value="retry_alternative_delay">Failover Automático com Delay de Cooldown</option>
                  <option value="three_d_secure">Exigir Autenticação 3D Secure</option>
                </select>
              </div>

              {(formAction === 'retry_alternative' || formAction === 'retry_alternative_delay') && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Gateway Secundário</label>
                  <select 
                    value={formGateway}
                    onChange={(e) => setFormGateway(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 h-9.5"
                  >
                    <option value="Mercado Pago">Mercado Pago</option>
                    <option value="Cielo">Cielo</option>
                    <option value="Stone">Stone</option>
                    <option value="Pagar.me">Pagar.me</option>
                  </select>
                </div>
              )}

              {formAction !== 'block' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Max Tentativas</label>
                    <input 
                      type="number" 
                      value={formMaxRetries}
                      onChange={(e) => setFormMaxRetries(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Delay (segundos)</label>
                    <input 
                      type="number" 
                      value={formDelay}
                      onChange={(e) => setFormDelay(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700" 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Status Inicial</label>
                <select 
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 h-9.5"
                >
                  <option value="active">Ativo (Habilitado em Produção)</option>
                  <option value="inactive">Inativo (Em rascunho)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSaveRetryRule}
              className="w-full h-10 bg-brand text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-all"
            >
              Salvar Regra de Retentativa
            </button>
          </div>
        </div>
      )}

      {/* Outer row split for Desktop simulator stickiness */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        
        {/* Main workflow content area */}
        <div className="flex-1 space-y-6 w-full">
          
          <RoutingHeader 
            onOpenDoc={() => setShowDocsModal(true)}
            onOpenSimulator={() => setShowSimulator(!showSimulator)}
            onNewRule={() => {
              if (activeTab === 'retries') {
                handleOpenNewRetryModal();
              } else {
                setEditingRule(undefined);
                setShowRuleForm(true);
              }
            }}
            isAdmin={isAdmin}
          />

          <RoutingKpiCards 
            kpis={kpis} 
            onFilterConflict={() => setStatusFilter('conflict')}
            onFilterActive={() => setStatusFilter('active')}
          />

          <div className="border-b border-[#E8DDFD]/60 flex items-center justify-between">
            <RoutingTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              activeRulesCount={rules.filter(r => r.status === 'active').length}
              fallbacksCount={3}
              retriesCount={smartRetriesRules.filter(r => r.status === 'active').length}
            />
          </div>

          {activeTab === 'rules' ? (
            <div className="space-y-4">
              <RoutingFilters 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                systemFilter={systemFilter}
                setSystemFilter={setSystemFilter}
                methodFilter={methodFilter}
                setMethodFilter={setMethodFilter}
                gatewayFilter={gatewayFilter}
                setGatewayFilter={setGatewayFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
              />

              <RoutingConflictBanner 
                conflictsCount={rules.filter(r => r.status === 'conflict').length}
                onResolveClick={() => triggerFeedback("Direcionando para painel de resolução rápida de prioridades...")}
              />

              {filteredRules.length === 0 ? (
                <div className="py-12 bg-white border border-[#E8DDFD]/60 rounded-[22px] text-center space-y-3">
                  <span className="text-3xl">🔀</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Nenhuma regra encontrada</h4>
                  <p className="text-[11px] font-semibold text-slate-400">Ajuste os filtros ou crie uma nova regra de roteamento.</p>
                </div>
              ) : (
                <RoutingRulesTable 
                  rules={filteredRules}
                  isAdmin={isAdmin}
                  onReorder={handleReorderTrigger}
                  onToggleStatus={handleToggleStatus}
                  onEdit={(rule) => {
                    setEditingRule(rule);
                    setShowRuleForm(true);
                  }}
                  onDelete={handleDeleteRule}
                  onDuplicate={handleDuplicateRule}
                  onShowConflict={(rule) => triggerFeedback(`Avaliando conflito na regra: ${rule.name}`)}
                />
              )}
            </div>
          ) : activeTab === 'fallbacks' ? (
            <RoutingFallbacksTab onActionFeedback={triggerFeedback} isAdmin={isAdmin} />
          ) : activeTab === 'retries' ? (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              
              {/* Smart Retries KPI Summary Cards for strict specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Regras de Retentativa', val: smartRetriesRules.length, color: 'text-brand' },
                  { label: 'Taxa de Sucesso (Média)', val: '0%', sub: 'Recuperação direta', color: 'text-emerald-650' },
                  { label: 'Falhas Inúteis Evitadas', val: '0', sub: 'Sem processamento extra', color: 'text-purple-650' },
                  { label: 'Conflitos de Prioridade', val: '0', sub: 'Conformidade auditada', color: 'text-slate-400' }
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-white border border-[#E8DDFD]/65 rounded-2xl p-4.5 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">{kpi.label}</span>
                    <span className={cn("text-[20px] font-black block leading-none", kpi.color)}>{kpi.val}</span>
                    {kpi.sub && <span className="text-[9px] font-bold text-slate-350 block">{kpi.sub}</span>}
                  </div>
                ))}
              </div>

              {/* Smart Retries Control Header and Rules List */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Mapeamento de Falhas e Reprocessamento</h3>
                    <p className="text-[10.5px] font-semibold text-slate-400 mt-1">
                      Evite processamento inútil de taxas e recupere até 20% das vendas recusadas por falhas sistêmicas de adquirentes.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleOpenNewRetryModal}
                      className="h-8.5 px-3 bg-brand text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Nova Regra
                    </button>
                    <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
                      <span className="text-xs font-bold text-slate-700">Motor Ativo</span>
                      <input 
                        type="checkbox" 
                        checked={retriesActive}
                        onChange={() => {
                          setRetriesActive(!retriesActive);
                          triggerFeedback(`Smart Retries ${!retriesActive ? 'ativado' : 'desativado'}`);
                        }}
                        className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Retries config table */}
                <div className="w-full overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                        <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Pri.</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[14%]">Erro ISO</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">Descrição do Erro</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[22%]">Ação Automática</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">Destino Secundário</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[10%] text-center">Tentativas</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[10%] text-center">Delay</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%] text-center">Status</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[14%] text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                      {smartRetriesRules.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 h-[48px]">
                          <td className="py-2 px-3.5 text-slate-400 font-mono text-[10px]">#{item.priority}</td>
                          <td className="py-2 px-2 font-mono font-black text-brand">{item.code}</td>
                          <td className="py-2 px-2 text-slate-800 font-extrabold truncate">{item.name}</td>
                          <td className="py-2 px-2 text-slate-550 leading-tight">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider block w-fit",
                              item.action === 'block' ? "bg-red-50 text-red-700" :
                              item.action === 'three_d_secure' ? "bg-amber-50 text-amber-700" :
                              "bg-purple-50 text-purple-700"
                            )}>
                              {item.action === 'block' ? 'Bloquear' :
                               item.action === 'three_d_secure' ? 'Autenticar 3DS' :
                               item.action === 'retry_immediate' ? 'Retentar Mesma' :
                               'Failover'}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-extrabold text-slate-600 font-mono text-[10px]">{item.gateway}</td>
                          <td className="py-2 px-2 text-center text-slate-500 font-mono">{item.maxRetries}x</td>
                          <td className="py-2 px-2 text-center text-slate-500 font-mono">{item.delay}s</td>
                          <td className="py-2 px-2 text-center">
                            <button 
                              onClick={() => handleToggleRetryStatus(item.id)}
                              className={cn(
                                "px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider cursor-pointer border",
                                item.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                              )}
                            >
                              {item.status === 'active' ? 'Ativo' : 'Inativo'}
                            </button>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleOpenEditRetryModal(item)} className="p-1 text-slate-400 hover:text-brand transition-colors cursor-pointer rounded-lg border border-slate-100 bg-white shadow-sm">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDuplicateRetryRule(item)} className="p-1 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer rounded-lg border border-slate-100 bg-white shadow-sm">
                                <Copy className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleDeleteRetryRule(item.id)} className="p-1 text-slate-400 hover:text-red-650 transition-colors cursor-pointer rounded-lg border border-slate-100 bg-white shadow-sm">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Two Column Grid: Advanced trace simulator & Execution History */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
                
                {/* Advanced Simulator panel */}
                <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
                      <div>
                        <h4 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider block">Simulador Real-Time de Cooldown</h4>
                        <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Simule o comportamento lógico completo do middleware para transações recusadas.</span>
                      </div>
                      
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Valor de Venda (R$)</label>
                        <input 
                          type="number" 
                          value={simValue} 
                          onChange={(e) => setSimValue(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-black text-slate-700" 
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Erro Simulado (ISO 8583)</label>
                        <select 
                          value={simErrorCode}
                          onChange={(e) => setSimErrorCode(e.target.value)}
                          className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 h-8.5 cursor-pointer"
                        >
                          {smartRetriesRules.map(r => (
                            <option key={r.code} value={r.code}>{r.code} - {r.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Origem do Pedido</label>
                        <select 
                          value={simSystem}
                          onChange={(e) => setSimSystem(e.target.value)}
                          className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 h-8.5"
                        >
                          <option>Checkout V2</option>
                          <option>API Gateway</option>
                          <option>Assinaturas (Recorrente)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Gateway de Origem</label>
                        <select 
                          value={simPrimaryGateway}
                          onChange={(e) => setSimPrimaryGateway(e.target.value)}
                          className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 h-8.5"
                        >
                          <option value="Cielo">Cielo</option>
                          <option value="Stone">Stone</option>
                          <option value="Adyen">Adyen</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-4">
                    {/* Simulated terminal result screen */}
                    {simResultTrace.length > 0 && (
                      <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 font-mono text-[10px] space-y-1.5 leading-normal text-left text-emerald-400 min-h-[120px] shadow-inner select-text">
                        {simResultTrace.map((log, idx) => (
                          <div key={idx} className="flex gap-1.5 items-start">
                            <span className="text-slate-500 shrink-0">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button 
                      onClick={handleSimulateSmartRetryTrace}
                      disabled={simulatingInProgress}
                      className={cn(
                        "w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider shadow-md shrink-0 flex items-center justify-center gap-1.5 transition-all",
                        simulatingInProgress && "opacity-75 cursor-not-allowed"
                      )}
                    >
                      {simulatingInProgress ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Processando fluxo...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          Testar Regra de Reprocessamento
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulated execution history logs */}
                <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-slate-50 pb-2.5">
                      <h4 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider block">Auditoria de Logs do Middleware</h4>
                      <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Acompanhe as últimas execuções ativas de retentativas inteligentes na API.</span>
                    </div>

                    <div className="space-y-2 pt-3">
                      {retryLogs.map((log, idx) => (
                        <div key={idx} className="border border-slate-50 rounded-xl p-3 bg-slate-50/15 flex items-center justify-between text-xs hover:border-[#E8DDFD]/50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[9px] text-slate-400">{log.time}</span>
                              <span className="font-mono text-[9.5px] text-brand font-black">{log.txId}</span>
                              <span className="bg-purple-50 text-purple-700 px-1 py-0.2 rounded font-mono text-[8px] font-black">ISO {log.code}</span>
                            </div>
                            <span className="text-slate-800 font-extrabold block text-[10.5px]">{log.action}</span>
                            <span className="text-slate-400 font-semibold block text-[9.5px]">{log.details}</span>
                          </div>
                          
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider shrink-0",
                            log.result === 'Sucesso' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          )}>
                            {log.result}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <span className="text-[9px] font-bold text-slate-400 block text-center pt-2">Registrando dados para conformidade PCI-DSS.</span>
                </div>

              </div>

              {/* Laravel / PHP Code Hook Previewer collapsible panel */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider block">Emulação Técnica do Middleware (Laravel integration)</h4>
                    <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Copie o hook de interceptação HTTP para colar diretamente no seu controller de transações.</span>
                  </div>
                  
                  <span className="bg-purple-50 text-brand px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest font-mono">
                    PHP V8.2
                  </span>
                </div>

                <div className="font-mono text-[9px] bg-slate-950 border border-slate-900 rounded-xl p-4.5 leading-relaxed text-slate-350 select-text overflow-x-auto relative">
                  <div className="absolute right-3.5 top-3.5 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[8px] font-black uppercase text-slate-400 pointer-events-none select-none">
                    Laravel Hook
                  </div>
                  <pre className="text-left font-mono">
                    {`<?php

namespace App\\Http\\Middleware;

use Closure;
use App\\Models\\Transaction;
use App\\Models\\RetryRule;
use App\\Services\\GatewayService;

class SmartRetryMiddleware
{
    /**
     * Intercepta falhas de adquirentes e aplica regras inteligentes de retentativa.
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // Se a transação falhou com código de erro adquirente (ISO 8583)
        if ($response->failed() && $response->hasErrorCode()) {
            $errorCode = $response->getErrorCode();
            
            // Busca regra de retentativa inteligente ativa mais prioritária
            $rule = RetryRule::where('code', $errorCode)
                ->where('status', 'active')
                ->orderBy('priority', 'asc')
                ->first();

            if ($rule) {
                // Caso a diretiva seja bloquear retentativas
                if ($rule->action === 'block') {
                    $this->logAudit($response->transactionId, $rule, 'Transação bloqueada automaticamente para poupar taxas.');
                    return $response;
                }

                // Caso a diretiva seja acionar 3D Secure
                if ($rule->action === 'three_d_secure') {
                    return redirect()->route('checkout.3ds', ['tx' => $response->transactionId]);
                }

                // Caso a diretiva seja reprocessar em gateway secundário
                if ($rule->action === 'retry_alternative' || $rule->action === 'retry_alternative_delay') {
                    if ($rule->delay > 0) {
                        sleep($rule->delay); // Cooldown delay respeitado
                    }

                    $secondaryGateway = $rule->gateway;
                    return GatewayService::routeTo($secondaryGateway, $request->all());
                }
            }
        }

        return $response;
    }
}`}
                  </pre>
                </div>
              </div>

            </div>
          ) : (
            <RoutingHistoryTab />
          )}

        </div>

        {/* Simulator side widget */}
        <RoutingSimulatorPanel 
          isOpen={showSimulator}
          onClose={() => setShowSimulator(false)}
          onSimulate={simulateRouting}
          rules={rules}
        />

      </div>

      {/* Drag & Drop Reordering Confirmation modal */}
      {reorderPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white w-full max-w-sm rounded-[22px] border border-[#E8DDFD] shadow-2xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Confirmar alteração de prioridades?
              </h4>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-snug">
                Você reordenou uma regra de roteamento. Isso irá mudar a ordem na qual o motor avalia os pagamentos.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReorderPending(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer"
              >
                Descartar
              </button>
              <button
                onClick={confirmReorder}
                className="px-3.5 py-1.5 bg-violet-650 hover:bg-violet-750 text-white text-[10px] font-black uppercase tracking-tight rounded-lg cursor-pointer shadow-md shadow-violet-650/15"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Rule Creator Modal */}
      {showRuleForm && (
        <RoutingRuleForm 
          onClose={() => {
            setShowRuleForm(false);
            setEditingRule(undefined);
          }}
          onSave={handleSaveRule}
          initialRule={editingRule}
        />
      )}

      {/* Modal Docs */}
      {showDocsModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E5EF] shadow-2xl p-6 max-w-2xl w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-brand">
                <BookOpen className="w-5 h-5 shrink-0" />
                <h3 className="text-slate-950 font-black text-sm">Documentação: Roteamento Inteligente</h3>
              </div>
              <button onClick={() => setShowDocsModal(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-semibold">
              <p>
                O módulo de Roteamento permite que você distribua suas transações entre diferentes adquirentes (gateways) com base em regras personalizadas de prioridade, valor, risco ou sistema de origem.
              </p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
                <strong className="text-slate-900 block uppercase tracking-wider text-[10px]">Smart Retries (Retentativas Inteligentes)</strong>
                <p>
                  Quando um pagamento é recusado, o sistema intercepta o código ISO de erro do adquirente e executa um comportamento automático:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><span className="font-bold text-slate-800">Bloquear:</span> Impede novas tentativas para evitar taxas de transação em cartões roubados.</li>
                  <li><span className="font-bold text-slate-800">Autenticar 3DS:</span> Força o comprador a verificar a transação com o banco.</li>
                  <li><span className="font-bold text-slate-800">Reprocessar:</span> Tenta processar novamente em outro adquirente (failover).</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-800">
                <strong className="block uppercase tracking-wider text-[10px] text-amber-900">Importante</strong>
                <p className="mt-1 text-[11px]">As regras são avaliadas em ordem de prioridade. A primeira regra que satisfazer as condições da transação será aplicada.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase h-[32px]"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
}
