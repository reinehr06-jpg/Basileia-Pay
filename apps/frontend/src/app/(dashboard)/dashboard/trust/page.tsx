'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TrustHeader } from '@/components/trust/TrustHeader';
import { TrustKpiCards } from '@/components/trust/TrustKpiCards';
import { TrustTabs, TrustTabValue } from '@/components/trust/TrustTabs';
import { TrustScoreChart } from '@/components/trust/TrustScoreChart';
import { TrustEventFeed } from '@/components/trust/TrustEventFeed';
import { TrustEventDetailPanel } from '@/components/trust/TrustEventDetailPanel';
import { TrustRulesTable } from '@/components/trust/TrustRulesTable';
import { TrustEventsTable } from '@/components/trust/TrustEventsTable';
import { TrustScoreSearch } from '@/components/trust/TrustScoreSearch';
import { TrustReviewQueue } from '@/components/trust/TrustReviewQueue';
import { TrustRuleForm } from '@/components/trust/TrustRuleForm';
import { TrustMotorConfigDialog } from '@/components/trust/TrustMotorConfigDialog';
import { TrustMotorUnavailableBanner } from '@/components/trust/TrustMotorUnavailableBanner';
import { MOCK_TRUST_RULES, MOCK_TRUST_EVENTS, MOCK_TRUST_KPIS, MOCK_TRUST_MOTOR_CONFIG } from './__mocks__/trust';
import { TrustRule, TrustEvent, TrustKpi, TrustMotorConfig } from '@/types/trust';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, CheckCircle2, RefreshCw, Activity } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function TrustPage() {
  const [activeTab, setActiveTab] = useState<TrustTabValue>('overview');
  const [selectedEvent, setSelectedEvent] = useState<TrustEvent | null>(null);
  const [rules, setRules] = useState<TrustRule[]>([]);
  const [events, setEvents] = useState<TrustEvent[]>([]);
  const [kpis, setKpis] = useState<TrustKpi>(MOCK_TRUST_KPIS);
  const [motorConfig, setMotorConfig] = useState<TrustMotorConfig>(MOCK_TRUST_MOTOR_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/v1/dashboard/trust-layer');
        if (res.success && res.data) {
          const data = res.data as { score?: number; alerts?: any[]; recent_decisions?: any[] };
        }
      } catch (err) { console.error('Failed to fetch trust data:', err); } finally {
        setLoading(false);
      }
    })();
    setRules([]);
    setEvents([]);
    setSelectedEvent(null);
  }, []);
  
  // Motor States
  const [isMotorUnavailable, setIsMotorUnavailable] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<TrustRule | undefined>(undefined);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  
  // Transition state for individual forensics breakdown loading
  const [preloadedPaymentId, setPreloadedPaymentId] = useState<string | null>(null);

  // Active simulated user permissions
  const [userRole, setUserRole] = useState<'owner' | 'viewer'>('owner');
  const isAdmin = userRole === 'owner';

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Rule actions handlers
  const handleToggleRuleStatus = (id: string) => {
    setRules(rules.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'active' ? 'inactive' : 'active';
        triggerFeedback(`Regra "${r.name}" definida como ${nextStatus === 'active' ? 'Ativa' : 'Inativa'}.`);
        return { ...r, status: nextStatus, executionMode: nextStatus };
      }
      return r;
    }));
  };

  const handleEditRule = (rule: TrustRule) => {
    setEditingRule(rule);
    setShowRuleForm(true);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    triggerFeedback("Regra de risco excluída com sucesso.");
  };

  const handleDuplicateRule = (rule: TrustRule) => {
    const dup: TrustRule = {
      ...rule,
      id: `tr_${Math.floor(Math.random() * 1000)}`,
      name: `${rule.name} (Cópia)`,
      createdAt: new Date().toISOString(),
    };
    setRules([...rules, dup]);
    triggerFeedback(`Regra "${rule.name}" duplicada.`);
  };

  const handleSaveRule = (partialRule: Partial<TrustRule>) => {
    if (editingRule) {
      // Editing mode
      setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...partialRule } as TrustRule : r));
      triggerFeedback(`Regra "${partialRule.name}" atualizada com sucesso.`);
    } else {
      // Adding new rule
      const newR: TrustRule = {
        ...partialRule,
        id: `tr_custom_${Math.floor(Math.random() * 1000)}`,
        triggers7d: 0,
        falsePositiveRate: 0.0,
      } as TrustRule;
      setRules([...rules, newR]);
      triggerFeedback(`Nova regra "${partialRule.name}" criada e ativada.`);
    }
    setShowRuleForm(false);
    setEditingRule(undefined);
  };

  return (
    <PageLayout title="Trust Layer">
      
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="fixed bottom-5 right-5 z-60 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0 animate-ping" />
          <span className="text-[11px] font-black text-left">{feedbackMsg}</span>
        </div>
      )}

      {/* TrustHeader */}
      <TrustHeader 
        onOpenDoc={() => triggerFeedback("Carregando documentação técnica antifraude...")}
        onConfigureMotor={() => setShowConfigDialog(true)}
        onNewRule={() => {
          setEditingRule(undefined);
          setShowRuleForm(true);
        }}
        isAdmin={isAdmin}
      />

      {/* Removed Simulator Panel */}

      {/* Motor Unavailable Banner */}
      {isMotorUnavailable && (
        <TrustMotorUnavailableBanner />
      )}

      {/* KPI Cards Grid */}
      <TrustKpiCards 
        kpis={kpis} 
        onFilterReview={() => setActiveTab('review')}
        onFilterBlocked={() => setActiveTab('events')}
      />

      {/* Navigation tabs header */}
      <div className="border-b border-[#E8DDFD]/60 flex items-center justify-between">
        <TrustTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          activeRulesCount={rules.filter(r => r.status === 'active').length}
          criticalEventsCount={events.filter(e => e.score >= 70).length}
          pendingReviewCount={activeTab === 'review' ? 0 : 3} // Dynamic mock queue length
        />
      </div>

      {/* Rule Creator Step-by-Step Drawer / Page */}
      {showRuleForm ? (
        <TrustRuleForm 
          onSave={handleSaveRule} 
          onCancel={() => {
            setShowRuleForm(false);
            setEditingRule(undefined);
          }}
          initialRule={editingRule}
        />
      ) : (
        /* Render Selected Tab content */
        <div className="w-full">
          
          {/* Tab 1: Overview (Dashboard visual charts & recent logs list) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top row: Evolution chart on left, Simplified Selected event summary on right */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2">
                  <TrustScoreChart />
                </div>
                
                <div className="lg:col-span-1">
                  {selectedEvent ? (
                    <TrustEventDetailPanel 
                      event={selectedEvent}
                      onClose={() => setSelectedEvent(null)}
                      isAdmin={isAdmin}
                      onActionFeedback={triggerFeedback}
                      onViewFullAnalysis={(paymentId) => {
                        setPreloadedPaymentId(paymentId);
                        setActiveTab('score');
                      }}
                    />
                  ) : (
                    <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[220px]">
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">Selecione uma transação</span>
                      <p className="text-[9.5px] font-bold text-slate-400 max-w-[200px] leading-relaxed">
                        Clique em qualquer registro da tabela de eventos abaixo para carregar o resumo de score nesta coluna.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main table: takes full viewport width, maximizing structural readability */}
              <div className="w-full">
                <TrustEventFeed 
                  events={events} 
                  onSelectEvent={setSelectedEvent}
                  selectedEventId={selectedEvent?.id}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Rules (Risk Rules) */}
          {activeTab === 'rules' && (
            <TrustRulesTable 
              rules={rules}
              isAdmin={isAdmin}
              onToggleStatus={handleToggleRuleStatus}
              onEdit={handleEditRule}
              onDelete={handleDeleteRule}
              onDuplicate={handleDuplicateRule}
            />
          )}

          {/* Tab 3: Events (Complete and filterable query) */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {/* Event specific filters bar placeholder */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-wrap gap-4 text-xs font-semibold items-center text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros Ativos:</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-700">Período: Últimas 24h</span>
                <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-slate-700">Resultado: Todos</span>
                <button 
                  onClick={() => triggerFeedback("Filtros avançados de score redefinidos.")}
                  className="text-brand hover:underline font-black text-[9.5px] uppercase tracking-wider"
                >
                  Limpar tudo
                </button>
              </div>

              <TrustEventsTable 
                events={events}
                onSelectEvent={setSelectedEvent}
                selectedEventId={selectedEvent?.id}
              />
            </div>
          )}

          {/* Tab 4: Score (Individual Query Search) */}
          {activeTab === 'score' && (
            <TrustScoreSearch 
              preloadedPaymentId={preloadedPaymentId}
              onClearPreload={() => setPreloadedPaymentId(null)}
            />
          )}

          {/* Tab 5: Review Queue (Manual review SLAs) */}
          {activeTab === 'review' && (
            <TrustReviewQueue 
              onActionFeedback={triggerFeedback}
              isAdmin={isAdmin}
            />
          )}

        </div>
      )}

      {/* Global Config Dialog */}
      <TrustMotorConfigDialog 
        config={motorConfig}
        isOpen={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        onSave={(newConf) => {
          setMotorConfig({ ...motorConfig, ...newConf } as TrustMotorConfig);
          triggerFeedback("Thresholds e regras de contingenciamento salvos com sucesso.");
        }}
      />

    </PageLayout>
  );
}
