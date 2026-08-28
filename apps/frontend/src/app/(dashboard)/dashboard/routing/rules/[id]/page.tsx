'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { ArrowLeft, CheckCircle2, PauseCircle, AlertTriangle, Trash2, Edit2, Play, Users } from 'lucide-react';
import { MOCK_ROUTING_RULES, MOCK_HISTORY_LOGS } from '../../__mocks__/routing';
import { RoutingRuleForm } from '@/components/routing/RoutingRuleForm';

interface Params {
  id: string;
}

export default function RuleDetailPage({ params }: { params: Promise<Params> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ruleId = resolvedParams.id;

  const [rules, setRules] = useState(MOCK_ROUTING_RULES);
  const rule = rules.find(r => r.id === ruleId) || rules[0];

  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'history' | 'conflicts' | 'audit'>('summary');
  const [showEdit, setShowEdit] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = () => {
    rule.status = rule.status === 'active' ? 'inactive' : 'active';
    setFeedback(`Regra alterada para ${rule.status === 'active' ? 'Ativa' : 'Inativa'}`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleSave = (formData: any) => {
    rule.name = formData.name;
    rule.conditions = formData.conditions;
    rule.priority = formData.priority;
    rule.gatewayId = formData.gatewayId;
    rule.gatewayName = formData.gatewayName;
    rule.fallbackGatewayId = formData.fallbackGatewayId;
    rule.fallbackGatewayName = formData.fallbackGatewayName;
    rule.status = formData.status;
    setShowEdit(false);
    setFeedback("Regra atualizada com sucesso.");
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDelete = () => {
    setFeedback("Regra deletada.");
    setTimeout(() => {
      router.push('/dashboard/routing');
    }, 1000);
  };

  return (
    <PageLayout title="Detalhes da Regra">
      {feedback && (
        <div className="fixed bottom-5 right-5 z-55 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl text-[11px] font-black uppercase">
          {feedback}
        </div>
      )}

      <div className="space-y-6 text-left">
        
        {/* Header Breadcrumb & back button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDFD]/60 pb-4">
          <div className="space-y-1">
            <Link
              href="/dashboard/routing"
              className="flex items-center gap-1 text-[11px] font-black uppercase text-slate-500 hover:text-slate-800 tracking-wider transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Roteamento
            </Link>
            <h2 className="text-[20px] font-black text-slate-900 mt-1 leading-tight">
              {rule.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="flex h-9 items-center justify-center gap-1.5 px-3.5 bg-white border border-[#E8DDFD] hover:bg-violet-50/50 text-violet-750 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 shrink-0" />
              Editar
            </button>
            <button
              onClick={handleToggle}
              className="flex h-9 items-center justify-center gap-1.5 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer"
            >
              Ativar / Inativar
            </button>
            <button
              onClick={handleDelete}
              className="flex h-9 items-center justify-center gap-1.5 px-3.5 bg-red-50 hover:bg-red-100 text-red-655 rounded-xl text-xs font-black uppercase tracking-tight transition-all cursor-pointer border border-red-200/50"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              Excluir
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-[#E8DDFD]/40 pb-2">
          {(['summary', 'history', 'conflicts', 'audit'] as const).map((tab) => {
            const labels = {
              summary: 'Resumo',
              history: 'Histórico de decisões',
              conflicts: 'Conflitos',
              audit: 'Auditoria'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`pb-2 px-3 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer -mb-[9px] border-b-2 ${
                  activeSubTab === tab 
                    ? 'border-brand text-brand' 
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm shadow-slate-100/50 min-h-[220px]">
          {activeSubTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Nome da Regra</span>
                  <span className="text-xs font-black text-slate-800 block mt-1">{rule.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Ambiente ativo</span>
                  <span className="text-xs font-black text-slate-800 block mt-1 capitalize">{rule.environment}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Gateway Destino</span>
                  <span className="text-xs font-black text-slate-800 block mt-1">{rule.gatewayName || 'Nenhum'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Fallback destino</span>
                  <span className="text-xs font-black text-slate-800 block mt-1">{rule.fallbackGatewayName || 'Nenhum'}</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'history' && (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Decisões Associadas</span>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E8DDFD]/40 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2 text-left">ID Transação</th>
                    <th className="py-2 text-left">Gateway</th>
                    <th className="py-2 text-left">Latência</th>
                    <th className="py-2 text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDFD]/30">
                  {MOCK_HISTORY_LOGS.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2 text-brand font-black">{log.id}</td>
                      <td className="py-2 font-bold text-slate-800">{log.gatewayUsed}</td>
                      <td className="py-2 text-slate-500">{log.latencyMs}ms</td>
                      <td className="py-2 text-slate-400 text-right font-semibold">
                        {new Date(log.date).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSubTab === 'conflicts' && (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Detecção de Conflito de Prioridade</span>
              {rule.status === 'conflict' ? (
                <div className="p-3.5 bg-red-50/50 border border-red-200/50 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-red-700 text-xs font-black">
                    <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                    <span>Conflito ativo com prioridade #5</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                    A regra de menor ID (esta) é aplicada em desempate automático, mas a prioridade deve ser alterada para evitar falhas lógicas no checkout.
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 font-semibold">
                  Nenhum conflito de prioridade detectado para esta regra.
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'audit' && (
            <div className="space-y-4">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Histórico de Alterações (Audit Log)</span>
              <div className="relative border-l border-[#E8DDFD] pl-4 ml-2 space-y-4 text-xs font-semibold">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-violet-600 border border-white" />
                  <span className="text-slate-400 text-[10px] block">Ontem às 14:22 · Gabriel Silva</span>
                  <span className="text-slate-750 font-bold block mt-0.5">Regra editada - Modificou prioridade de #6 para #5</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border border-white" />
                  <span className="text-slate-400 text-[10px] block">10/03/2026 às 09:00 · Gabriel Silva</span>
                  <span className="text-slate-750 font-bold block mt-0.5">Criação inicial da regra</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {showEdit && (
        <RoutingRuleForm 
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
          initialRule={rule}
        />
      )}
    </PageLayout>
  );
}
