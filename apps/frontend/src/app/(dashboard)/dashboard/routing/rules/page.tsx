'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/layout/PageLayout';
import { ArrowLeft, Plus, Network, Activity, Settings2, Server, Power, Zap, Clock, ShieldCheck, FileText, ChevronRight, Filter, PlusCircle } from 'lucide-react';
import { RoutingRule, RoutingKpi } from '@/types/routing';
import { MOCK_ROUTING_KPIS } from '../__mocks__/routing';
import { RoutingRulesTable } from '@/components/routing/RoutingRulesTable';
import { RoutingFilters } from '@/components/routing/RoutingFilters';
import { RoutingRuleForm } from '@/components/routing/RoutingRuleForm';
import { cn } from '@/lib/utils';

export default function RulesPage() {
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RoutingRule | undefined>(undefined);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

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

  const handleReorder = (from: number, to: number) => {
    const updated = [...rules];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setRules(updated.map((r, i) => ({ ...r, priority: i + 1 })));
    triggerFeedback('Prioridades atualizadas.');
  };

  const handleSaveRule = (formData: any) => {
    if (editingRule) {
      setRules(rules.map(r => r.id === editingRule.id ? { ...r, ...formData } : r));
      triggerFeedback('Regra atualizada.');
    } else {
      const newRule: RoutingRule = {
        id: `rule_${Date.now()}`,
        priority: rules.length + 1,
        coverage7d: 0.0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin',
        ...formData
      };
      setRules([...rules, newRule]);
      triggerFeedback('Regra criada.');
    }
    setShowRuleForm(false);
    setEditingRule(undefined);
  };

  return (
    <PageLayout title="Todas as Regras de Roteamento">
      {feedbackMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-[11px] font-black rounded-xl p-3 shadow-lg">
          {feedbackMsg}
        </div>
      )}

      <div className="space-y-6 text-left">
        
        {/* Navigation line */}
        <div className="flex items-center justify-between border-b border-[#E8DDFD]/60 pb-4">
          <Link
            href="/dashboard/routing"
            className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-500 hover:text-slate-800 tracking-wider transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o Painel
          </Link>

          <button
            onClick={() => {
              setEditingRule(undefined);
              setShowRuleForm(true);
            }}
            className="flex h-8.5 items-center justify-center gap-1 px-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            Nova regra
          </button>
        </div>

        {/* Filters */}
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

        {/* Table */}
        <RoutingRulesTable 
          rules={filteredRules}
          isAdmin={true}
          onReorder={handleReorder}
          onToggleStatus={(id) => {
            setRules(rules.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r));
            triggerFeedback('Status alterado.');
          }}
          onEdit={(r) => {
            setEditingRule(r);
            setShowRuleForm(true);
          }}
          onDelete={(id) => {
            setRules(rules.filter(r => r.id !== id).map((r, i) => ({ ...r, priority: i + 1 })));
            triggerFeedback('Regra excluída.');
          }}
          onDuplicate={(r) => {
            const dup: RoutingRule = {
              ...r,
              id: `rule_dup_${Date.now()}`,
              name: `${r.name} (Cópia)`,
              priority: rules.length + 1,
            };
            setRules([...rules, dup]);
            triggerFeedback('Regra duplicada.');
          }}
          onShowConflict={() => {}}
        />

      </div>

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
    </PageLayout>
  );
}
