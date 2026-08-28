'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  FileText,
  Activity,
  Zap,
  Mail,
  Scale,
  Lock,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Copy,
  ExternalLink,
  ChevronRight,
  RefreshCcw,
  Ban,
  User,
  ShoppingBag,
  Trash2,
  Pause,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Color map for status badges
const STATUS_META: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  'Ativa': { label: 'Ativa', text: 'text-green-700', bg: 'bg-green-50/40', border: 'border-green-200/50', dot: 'bg-green-500' },
  'Em atraso': { label: 'Em atraso', text: 'text-red-700', bg: 'bg-red-50/40', border: 'border-red-200/50', dot: 'bg-red-500' },
  'Pausada': { label: 'Pausada', text: 'text-blue-750', bg: 'bg-blue-50/40', border: 'border-blue-200/50', dot: 'bg-blue-550' },
  'Falha no pagamento': { label: 'Falha pagamento', text: 'text-red-800', bg: 'bg-red-50/40', border: 'border-red-200/50', dot: 'bg-red-700' },
  'Cancelada': { label: 'Cancelada', text: 'text-slate-500', bg: 'bg-slate-50/40', border: 'border-slate-200/50', dot: 'bg-slate-400' }
};

export default function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const subscriptionId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState<'geral' | 'historico' | 'cobrancas' | 'timeline' | 'notas'>('geral');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Subscription state mock
  const [subscription, setSubscription] = useState({
    id: subscriptionId.startsWith('%23') ? decodeURIComponent(subscriptionId) : subscriptionId,
    ref: 'sub_hN9x72h3c9d456ef',
    criadoEm: '15/04/2024',
    cliente: 'Mariana Souza',
    email: 'mariana@email.com',
    cliId: 'CLI-57829',
    plano: 'PRO Anual',
    status: 'Ativa' as 'Ativa' | 'Em atraso' | 'Pausada' | 'Falha no pagamento' | 'Cancelada',
    ciclo: 'Anual 12/12',
    proximaCobranca: '15/05/2024',
    proximaCobrancaMeta: 'Em 3 dias',
    valor: 1299.00,
    inadimplencia: '0% — Em dia',
    inadimplenciaPct: 0,
    metodo: 'Cartão',
    metodoDetalhe: 'VISA •••• 4242',
    checkout: 'Pagar.me Checkout Padrão',
    events: [
      { time: '15/05/2024 10:12', label: 'Próxima cobrança agendada', source: 'Recurrence engine', desc: 'R$ 1.299,00 via Cartão de Crédito' },
      { time: '15/04/2024 10:13', label: 'Primeira cobrança realizada', source: 'Ledger Engine', desc: 'Pagamento aprovado — R$ 1.299,00' },
      { time: '15/04/2024 10:12', label: 'Assinatura criada', source: 'API Entrypoint', desc: 'Plano PRO Anual — R$ 1.299,00' }
    ],
    auditLogs: [
      { time: '19/05/2026 10:05:40', user: 'Vinícius Admin', action: 'Visualizou assinatura', details: 'Aba Geral consultada pelo operador' },
      { time: '15/04/2024 10:13', user: 'System Bot', action: 'Cobrança efetuada com sucesso', details: 'Fatura quitada via adquirente' }
    ]
  });

  // Modal states
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form states
  const [selectedPlanOption, setSelectedPlanOption] = useState('PREMIUM Anual');

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const triggerAlert = (msg: string) => {
    setSuccessAlert(msg);
    setTimeout(() => setSuccessAlert(null), 4000);
  };

  const handleConfirmPause = () => {
    setSubscription(prev => ({
      ...prev,
      status: 'Pausada',
      proximaCobranca: 'Pausada',
      proximaCobrancaMeta: 'Sem previsão',
      auditLogs: [
        {
          time: '19/05/2026 10:09:12',
          user: 'Vinícius Admin',
          action: 'Assinatura pausada manualmente',
          details: 'Cobranças automáticas suspensas'
        },
        ...prev.auditLogs
      ]
    }));
    setShowPauseModal(false);
    triggerAlert('Assinatura pausada com sucesso.');
  };

  const handleConfirmCancel = () => {
    setSubscription(prev => ({
      ...prev,
      status: 'Cancelada',
      proximaCobranca: 'Cancelada',
      proximaCobrancaMeta: 'Cobranças encerradas',
      auditLogs: [
        {
          time: '19/05/2026 10:09:44',
          user: 'Vinícius Admin',
          action: 'Assinatura cancelada definitivamente',
          details: 'Mandatos e cobranças rescindidos'
        },
        ...prev.auditLogs
      ]
    }));
    setShowCancelModal(false);
    triggerAlert('Assinatura cancelada com sucesso.');
  };

  const handleConfirmChangePlan = () => {
    const val = selectedPlanOption === 'PREMIUM Anual' ? 2499.00 : selectedPlanOption === 'PRO Anual' ? 1299.00 : 129.90;
    setSubscription(prev => ({
      ...prev,
      plano: selectedPlanOption,
      valor: val,
      auditLogs: [
        {
          time: '19/05/2026 10:10:12',
          user: 'Vinícius Admin',
          action: 'Plano da assinatura alterado',
          details: `Migrado para plano ${selectedPlanOption}`
        },
        ...prev.auditLogs
      ]
    }));
    setShowPlanModal(false);
    triggerAlert(`Plano alterado com sucesso para ${selectedPlanOption}.`);
  };

  const handleConfirmUpdatePayment = () => {
    setSubscription(prev => ({
      ...prev,
      metodoDetalhe: 'VISA •••• 9911 (Atualizado)',
      auditLogs: [
        {
          time: '19/05/2026 10:10:35',
          user: 'Vinícius Admin',
          action: 'Método de pagamento alterado',
          details: 'Novo token de cartão de crédito gravado'
        },
        ...prev.auditLogs
      ]
    }));
    setShowPaymentModal(false);
    triggerAlert('Método de pagamento atualizado com sucesso.');
  };

  const statusMeta = STATUS_META[subscription.status] || STATUS_META['Cancelada'];

  return (
    <div className="flex flex-col gap-4 w-full select-none text-left pt-4">

      {/* Alert Banner */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white p-3.5 rounded-2xl shadow-xl border border-green-400 animate-in slide-in-from-top-4 duration-300 flex items-center justify-between gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold">{successAlert}</span>
          </div>
          <button onClick={() => setSuccessAlert(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal: Confirm Pause */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-500 border-b border-slate-100 pb-3 mb-4">
              <Pause className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Pausar Cobranças</h3>
            </div>
            
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
              Você está prestes a pausar a assinatura do cliente <span className="font-bold text-slate-805">{subscription.cliente}</span>. 
              Isso interromperá as cobranças automáticas no próximo ciclo.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPauseModal(false)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmPause}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Confirmar Pausa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Cancel */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 border-b border-slate-100 pb-3 mb-4">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Cancelar Assinatura</h3>
            </div>
            
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
              Confirma o cancelamento definitivo da assinatura de <span className="font-bold text-slate-800">{subscription.cliente}</span>? 
              O cliente perderá o acesso aos produtos recorrentes.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Cancelar Assinatura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Change Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <RefreshCcw className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Alterar Plano</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Selecione o Novo Plano</label>
                <select
                  value={selectedPlanOption}
                  onChange={(e) => setSelectedPlanOption(e.target.value)}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand"
                >
                  <option value="BASIC Mensal">BASIC Mensal — R$ 49,90/mês</option>
                  <option value="PRO Mensal">PRO Mensal — R$ 129,90/mês</option>
                  <option value="PRO Anual">PRO Anual — R$ 1.299,00/ano</option>
                  <option value="PREMIUM Anual">PREMIUM Anual — R$ 2.499,00/ano</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmChangePlan}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Atualizar Plano
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Update Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <CreditCard className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Atualizar Cartão</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Mascaramento do Novo Cartão</label>
                <input
                  type="text"
                  placeholder="Ex: VISA •••• 9911"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmUpdatePayment}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Gravar Método
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-2 shrink-0 border-b border-[#E8DDFD]/60 pb-4">
        <div className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none">
          <Link href="/dashboard/subscriptions" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para lista
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[20px] 2xl:text-[22px] font-black tracking-tight text-slate-950 leading-none">
                {subscription.id}
              </h1>
              
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-black uppercase border shadow-sm",
                statusMeta.text, statusMeta.bg, statusMeta.border
              )}>
                <div className={cn("w-1 h-1 rounded-full shrink-0", statusMeta.dot)} />
                {statusMeta.label}
              </span>

              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-md text-[9px] font-mono font-bold">
                {subscription.ref}
              </span>
            </div>
            
            <p className="text-slate-400 font-semibold text-[11.5px] 2xl:text-[12px] tracking-tight">
              Plano <span className="text-slate-700 font-bold">{subscription.plano}</span> · Criada em {subscription.criadoEm}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(subscription.id, 'subId')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8DDFD] hover:bg-brand-soft rounded-xl text-[10.5px] font-black text-slate-700 shadow-sm transition-all h-[34px]"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              {copiedField === 'subId' ? 'Copiado!' : 'Copiar ID'}
            </button>

            {subscription.status !== 'Pausada' && subscription.status !== 'Cancelada' && (
              <button
                onClick={() => setShowPauseModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-250 hover:bg-amber-50 text-amber-700 rounded-xl text-[10.5px] font-black shadow-sm transition-all h-[34px]"
              >
                <Pause className="w-3.5 h-3.5" />
                Pausar Assinatura
              </button>
            )}

            {subscription.status !== 'Cancelada' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-xl text-[10.5px] font-black shadow-sm transition-all h-[34px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancelar Assinatura
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-[#E8DDFD]/60 select-none pb-0.5 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'geral', label: 'Informações Gerais', icon: FileText },
          { id: 'historico', label: 'Histórico de Plano', icon: RefreshCcw },
          { id: 'cobrancas', label: 'Histórico de Faturas', icon: Activity },
          { id: 'timeline', label: 'Timeline de Eventos', icon: Clock },
          { id: 'notas', label: 'Notas Internas', icon: Mail }
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-3.5 py-2.5 text-[11px] font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
                isActive 
                  ? "border-brand text-brand font-black bg-brand/5 rounded-t-xl" 
                  : "border-transparent text-slate-500 hover:text-brand hover:border-[#E8DDFD]"
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Primary Tab Content */}
        <div className="lg:col-span-2 space-y-4">
          
          {activeTab === 'geral' && (
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Informações da Assinatura</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs font-semibold">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Plano</span>
                  <span className="text-slate-900 font-bold block mt-1">{subscription.plano}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ciclo de Cobrança</span>
                  <span className="text-slate-900 font-bold block mt-1">{subscription.ciclo}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Valor do Ciclo</span>
                  <span className="text-brand font-black block mt-1">R$ {subscription.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Próxima Cobrança</span>
                  <span className="text-slate-900 font-bold block mt-1">{subscription.proximaCobranca} ({subscription.proximaCobrancaMeta})</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Data de Adesão</span>
                  <span className="text-slate-900 font-bold block mt-1">{subscription.criadoEm}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Inadimplência</span>
                  <span className="text-slate-900 font-bold block mt-1">{subscription.inadimplencia}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Método Ativo</span>
                  <span className="text-slate-900 font-bold block mt-1">{subscription.metodoDetalhe}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Checkout Origem</span>
                  <span className="text-slate-900 font-bold block mt-1">{subscription.checkout}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Histórico de Auditoria do Plano</span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-650">
                  <thead>
                    <tr className="border-b border-slate-150 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                      <th className="px-3 py-2">Data / Horário</th>
                      <th className="px-3 py-2">Usuário</th>
                      <th className="px-3 py-2">Ação</th>
                      <th className="px-3 py-2">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscription.auditLogs.map((log, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-3 py-3 font-mono font-bold text-slate-500 whitespace-nowrap">{log.time}</td>
                        <td className="px-3 py-3 font-black text-slate-800">{log.user}</td>
                        <td className="px-3 py-3 font-black text-brand">{log.action}</td>
                        <td className="px-3 py-3 text-slate-505">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'cobrancas' && (
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Grade de Faturamento Recorrente</span>
              
              <div className="space-y-3 font-semibold text-xs">
                {[
                  { ref: 'FAT-22910', date: '15/04/2024', val: 1299.00, status: 'Paga' },
                  { ref: 'FAT-22810', date: '15/04/2023', val: 1299.00, status: 'Paga' }
                ].map(fat => (
                  <div key={fat.ref} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div>
                      <span className="font-black text-slate-850 block">{fat.ref}</span>
                      <span className="text-[10.5px] text-slate-400 block mt-0.5">Vencimento: {fat.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">R$ {fat.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-green-50 text-green-700 border-green-200">
                        {fat.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Timeline de Ciclos Recorrentes</span>
              
              <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-2 text-xs font-semibold">
                {subscription.events.map((evt, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-brand rounded-full border-2 border-white ring-4 ring-brand/10" />
                    
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-slate-400 font-bold">{evt.time}</span>
                      <span className="font-black text-slate-800">{evt.label}</span>
                      <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded text-[9px] font-bold">
                        {evt.source}
                      </span>
                    </div>
                    <p className="text-slate-500 font-semibold">{evt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notas' && (
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Observações Operacionais</span>
              
              <textarea
                placeholder="Insira notas de auditoria interna sobre esta assinatura..."
                className="w-full bg-slate-50 border border-[#E8DDFD] rounded-2xl p-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand min-h-[120px]"
              />
              <button 
                onClick={() => triggerAlert('Nota de auditoria salva com sucesso.')}
                className="px-4 py-1.5 bg-brand hover:bg-brand-deep text-white rounded-xl text-xs font-black uppercase tracking-tight ml-auto block"
              >
                Salvar Nota
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Customer details and actions panel */}
        <div className="space-y-4">
          
          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Comprador Relacionado</span>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 border border-[#E8DDFD] flex items-center justify-center text-brand font-black text-sm">
                {subscription.cliente.charAt(0)}
              </div>
              <div className="text-xs">
                <span className="font-black text-slate-900 block leading-tight">{subscription.cliente}</span>
                <span className="text-slate-400 block mt-0.5">{subscription.email}</span>
                <span className="text-[9.5px] font-mono text-slate-450 font-bold block mt-1">ID: {subscription.cliId}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Ações de Recorrência</span>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowPlanModal(true)}
                className="w-full flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
              >
                Alterar Plano
              </button>
              
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="w-full flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
              >
                Atualizar Pagamento
              </button>

              <button 
                onClick={() => triggerAlert('Link de pagamento enviado.')}
                className="w-full flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
              >
                Enviar Link
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
