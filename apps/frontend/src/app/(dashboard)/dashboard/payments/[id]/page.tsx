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
  X,
  RefreshCcw,
  Ban,
  User,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Color map for status badges
const STATUS_META: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  'Aprovado': { label: 'Aprovado', text: 'text-green-700', bg: 'bg-green-50/40', border: 'border-green-200/50', dot: 'bg-green-500' },
  'Pendente': { label: 'Pendente', text: 'text-amber-700', bg: 'bg-amber-50/40', border: 'border-amber-200/50', dot: 'bg-amber-500' },
  'Falha técnica': { label: 'Falha técnica', text: 'text-red-800', bg: 'bg-red-50/40', border: 'border-red-200/50', dot: 'bg-red-600' },
  'Recusado': { label: 'Recusado', text: 'text-red-700', bg: 'bg-red-50/40', border: 'border-red-200/50', dot: 'bg-red-500' },
  'Reembolsado': { label: 'Reembolsado', text: 'text-blue-700', bg: 'bg-blue-50/40', border: 'border-blue-200/50', dot: 'bg-blue-500' },
  'Em análise': { label: 'Em análise', text: 'text-violet-650', bg: 'bg-violet-50/40', border: 'border-violet-200/50', dot: 'bg-violet-400' }
};

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;
  const [activeTab, setActiveTab] = useState<'resumo' | 'tentativas' | 'gateway' | 'eventos' | 'recibo' | 'reembolso' | 'auditoria'>('resumo');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Payment State mock
  const [payment, setPayment] = useState({
    id: paymentId,
    ref: 'ref_pay_8f3a2d',
    vendaId: 'ORD-2024-09876',
    sistema: 'Sistema Core',
    cliente: 'Mariana Souza',
    email: 'mariana@gmail.com',
    documento: '***.482.108-**',
    telefone: '(11) 99882-7711',
    metodo: 'Cartão',
    brand: 'Mastercard',
    last4: '4022',
    holder: 'MARIANA SOUZA',
    gateway: 'Asaas Principal',
    status: 'Aprovado',
    resultado: 'Autorizado',
    valor: 1259.90,
    taxa: 61.29,
    risco: 'Baixo',
    tempo: '1.2s',
    criadoEm: '19/05/2026 10:04:12',
    aprovadoEm: '19/05/2026 10:04:13.2',
    adquirente: 'Rede',
    correlationId: 'corr_asaas_8f3a2d_9921',
    correlationRaw: '{"id": "pay_asaas_82jks82", "status": "CONFIRMED", "billingType": "CREDIT_CARD", "amount": 1259.90, "netValue": 1198.61, "invoiceUrl": "https://asaas.com/i/82jks82"}',
    requests: [
      {
        endpoint: 'POST /v3/payments',
        timestamp: '19/05/2026 10:04:12.1',
        latency: '820ms',
        requestBody: JSON.stringify({
          customer: 'cus_8f9a2c110',
          billingType: 'CREDIT_CARD',
          value: 1259.90,
          dueDate: '2026-05-19',
          creditCard: {
            holderName: 'MARIANA SOUZA',
            number: '522238******4022',
            expiryMonth: '12',
            expiryYear: '2030'
          }
        }, null, 2),
        responseBody: JSON.stringify({
          object: 'payment',
          id: 'pay_asaas_82jks82',
          dateCreated: '2026-05-19',
          customer: 'cus_8f9a2c110',
          value: 1259.9,
          netValue: 1198.61,
          billingType: 'CREDIT_CARD',
          status: 'CONFIRMED'
        }, null, 2)
      }
    ],
    attempts: [
      { number: 3, time: '19/05/2026 10:04:12', method: 'Cartão · Mastercard', gateway: 'Asaas Principal', status: 'Aprovado', response: 'Autorizado', code: '00', duration: '1.2s', acquirer: 'Rede' },
      { number: 2, time: '19/05/2026 10:03:44', method: 'Cartão · Mastercard', gateway: 'Stripe Global', status: 'Recusado', response: 'Do not honor', code: '05', duration: '2.1s', acquirer: 'Stripe' },
      { number: 1, time: '19/05/2026 10:03:02', method: 'Cartão · Mastercard', gateway: 'Stripe Global', status: 'Recusado', response: 'Saldo insuficiente', code: '51', duration: '1.9s', acquirer: 'Stripe' }
    ],
    events: [
      { time: '19/05/2026 10:05:00', label: 'Venda comercial atualizada', source: 'Core Engine', desc: 'Status do pedido #ORD-2024-09876 alterado para Pago' },
      { time: '19/05/2026 10:04:30', label: 'Recibo / Comprovante disparado', source: 'Mail Notification', desc: 'E-mail de confirmação enviado para mariana@gmail.com' },
      { time: '19/05/2026 10:04:15', label: 'Webhook de confirmação recebido', source: 'Asaas Webhook Listener', desc: 'Evento payment.confirmed recebido do Asaas' },
      { time: '19/05/2026 10:04:13', label: 'Pagamento marcado como Aprovado', source: 'Payment Ledger', desc: 'Fatura financeira quitada com sucesso' },
      { time: '19/05/2026 10:04:13', label: 'Gateway respondeu com sucesso', source: 'Asaas SDK', desc: 'Cobrança confirmada pelo adquirente Rede' },
      { time: '19/05/2026 10:04:12', label: 'Tentativa #3 iniciada', source: 'API Router', desc: 'Enviando cobrança de cartão para Asaas Principal' },
      { time: '19/05/2026 10:02:40', label: 'Pagamento inicial registrado', source: 'API Entrypoint', desc: 'Entidade de pagamento criada em rascunho' }
    ],
    auditLogs: [
      { time: '19/05/2026 10:05:40', user: 'Vinícius Admin', action: 'Visualizou dados técnicos do pagamento', details: 'Aba Gateway consultada pelo operador' },
      { time: '19/05/2026 10:04:32', user: 'System Bot', action: 'Recibo enviado ao comprador', details: 'E-mail enviado para mariana@gmail.com' },
      { time: '19/05/2026 10:04:13', user: 'System Bot', action: 'Pagamento alterado para aprovado', details: 'Transação confirmada via webhook Asaas' }
    ]
  });

  // Modal states
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundType, setRefundType] = useState<'total' | 'parcial'>('total');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Cancelamento de pedido solicitado pelo cliente');
  const [refundNotify, setRefundNotify] = useState(true);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState(payment.email);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const triggerAlert = (msg: string) => {
    setSuccessAlert(msg);
    setTimeout(() => setSuccessAlert(null), 4000);
  };

  const handleConfirmRefund = () => {
    const amount = refundType === 'total' ? payment.valor : parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > payment.valor) {
      alert('Valor de reembolso inválido.');
      return;
    }

    setPayment(prev => ({
      ...prev,
      status: 'Reembolsado',
      resultado: 'Reembolso concluído',
      auditLogs: [
        {
          time: '19/05/2026 10:06:12',
          user: 'Vinícius Admin',
          action: 'Reembolso solicitado e aprovado',
          details: `Reembolso de R$ ${amount.toLocaleString('pt-BR')} via painel`
        },
        ...prev.auditLogs
      ]
    }));

    setShowRefundModal(false);
    triggerAlert(`Estorno de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} efetuado com sucesso.`);
  };

  const handleResendReceipt = () => {
    setPayment(prev => ({
      ...prev,
      auditLogs: [
        {
          time: '19/05/2026 10:06:45',
          user: 'Vinícius Admin',
          action: 'Recibo reenviado manualmente',
          details: `Comprovante reenviado para ${receiptEmail}`
        },
        ...prev.auditLogs
      ]
    }));
    setShowReceiptModal(false);
    triggerAlert(`Comprovante enviado com sucesso para ${receiptEmail}`);
  };

  const statusMeta = STATUS_META[payment.status] || STATUS_META['Em análise'];

  return (
    <div className="flex flex-col gap-4 w-full select-none text-left pt-4">
      
      {/* Alert Banner */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white p-3.5 rounded-2xl shadow-xl border border-green-400 animate-in slide-in-from-top-4 duration-300 flex items-center justify-between gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold text-left">{successAlert}</span>
          </div>
          <button onClick={() => setSuccessAlert(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal: Refund */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <Scale className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Estornar Transação</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF8FF] border border-[#E8DDFD]/60 p-3.5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">Pagamento / Referência</p>
                <p className="text-slate-950 font-black text-[13px] mt-1.5">{payment.id}</p>
                <p className="text-slate-500 font-semibold text-[11px] mt-0.5">{payment.gateway}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Valor Total:</span>
                  <span className="text-slate-900 font-black">
                    R$ {payment.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Modalidade do Estorno</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRefundType('total')}
                    className={cn(
                      "p-2.5 rounded-xl border text-center font-bold text-xs transition-all",
                      refundType === 'total' 
                        ? "bg-brand/10 border-brand/40 text-brand"
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                    )}
                  >
                    Integral
                  </button>
                  <button
                    onClick={() => setRefundType('parcial')}
                    className={cn(
                      "p-2.5 rounded-xl border text-center font-bold text-xs transition-all",
                      refundType === 'parcial' 
                        ? "bg-brand/10 border-brand/40 text-brand"
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                    )}
                  >
                    Parcial
                  </button>
                </div>
              </div>

              {refundType === 'parcial' && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Valor Reembolsado (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full bg-white border border-[#E8DDFD] rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Motivo do Estorno</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="refundNotifyDetail"
                  checked={refundNotify}
                  onChange={(e) => setRefundNotify(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer"
                />
                <label htmlFor="refundNotifyDetail" className="text-[11.5px] font-bold text-slate-500 cursor-pointer">
                  Enviar e-mail automático de cancelamento ao cliente
                </label>
              </div>

              <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-[10.5px] font-bold text-red-700 leading-tight">
                ⚠️ <span className="font-black">Aviso de Segurança:</span> Esta operação solicita o cancelamento financeiro direto na adquirente. A transação ficará marcada como estornada de forma definitiva.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmRefund}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep transition-all rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Confirmar Reembolso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Re-send Receipt */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <Mail className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Disparar Recibo / Comprovante</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Destinatário</label>
                <input
                  type="email"
                  value={receiptEmail}
                  onChange={(e) => setReceiptEmail(e.target.value)}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Link do Comprovante Digital</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://receipt.basileia.pay/r/${payment.ref}`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono font-bold text-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://receipt.basileia.pay/r/${payment.ref}`);
                      triggerAlert('Link copiado.');
                    }}
                    className="px-3 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-[11px] font-black text-slate-700"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Voltar
              </button>
              <button
                onClick={handleResendReceipt}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep transition-all rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Disparar Recibo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-2 shrink-0 border-b border-[#E8DDFD]/60 pb-4">
        <div className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none">
          <Link href="/dashboard/payments" className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para lista
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[20px] 2xl:text-[22px] font-black tracking-tight text-slate-950 leading-none">
                {payment.id}
              </h1>
              
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-black uppercase border shadow-sm",
                statusMeta.text, statusMeta.bg, statusMeta.border
              )}>
                <div className={cn("w-1 h-1 rounded-full shrink-0 animate-pulse", statusMeta.dot)} />
                {statusMeta.label}
              </span>

              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-md text-[9px] font-mono font-bold">
                {payment.ref}
              </span>
            </div>
            
            <p className="text-slate-400 font-semibold text-[11px] 2xl:text-[12px] tracking-tight">
              Processado por <span className="text-slate-700 font-bold">{payment.gateway}</span> · Criado em {payment.criadoEm}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(payment.id, 'id')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8DDFD] hover:bg-brand-soft rounded-xl text-[10.5px] font-black text-slate-700 shadow-sm transition-all h-[34px]"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              {copiedField === 'id' ? 'Copiado!' : 'Copiar ID'}
            </button>

            {payment.status === 'Aprovado' && (
              <button
                onClick={() => setShowRefundModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 rounded-xl text-[10.5px] font-black shadow-sm transition-all h-[34px]"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                Estornar Pagamento
              </button>
            )}

            <button
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black shadow-sm transition-all h-[34px] uppercase tracking-tight"
            >
              <Mail className="w-3.5 h-3.5" />
              Reenviar Recibo
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-[#E8DDFD]/60 select-none pb-0.5 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'resumo', label: 'Resumo Geral', icon: FileText },
          { id: 'tentativas', label: 'Tentativas no Provedor', icon: RefreshCcw },
          { id: 'gateway', label: 'Log Técnico Gateway', icon: Activity },
          { id: 'eventos', label: 'Eventos Auditáveis', icon: Clock },
          { id: 'recibo', label: 'Recibo & Entrega', icon: Mail },
          { id: 'reembolso', label: 'Estorno / Devolução', icon: Scale },
          { id: 'auditoria', label: 'Rastro de Auditoria', icon: ShieldCheck }
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

      {/* Tabs Content */}
      <div className="flex-1 w-full min-h-0">
        
        {/* Tab 1: Resumo Geral */}
        {activeTab === 'resumo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
            
            {/* Left Col: Details cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Informações Operacionais</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Gateway Responsável</span>
                    <span className="text-slate-900 font-bold block mt-1">{payment.gateway}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Método Utilizado</span>
                    <span className="text-slate-900 font-bold block mt-1 flex items-center gap-1.5">
                      {payment.metodo === 'Cartão' ? <CreditCard className="w-3.5 h-3.5 text-slate-400" /> : <QrCode className="w-3.5 h-3.5 text-slate-400" />}
                      {payment.metodo} · {payment.brand} {payment.last4 && `(•••• ${payment.last4})`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Status do Processamento</span>
                    <span className="text-slate-905 font-bold block mt-1 flex items-center gap-1.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusMeta.dot)} />
                      {payment.status} ({payment.resultado})
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nível de Risco Trust Layer</span>
                    <span className="text-slate-900 font-bold block mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {payment.risco} (Score: 12)
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Criado em</span>
                    <span className="text-slate-900 font-bold block mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {payment.criadoEm}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Aprovado em</span>
                    <span className="text-slate-900 font-bold block mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {payment.aprovadoEm}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Tempo total de processamento</span>
                    <span className="text-slate-900 font-bold block mt-1 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-slate-400" />
                      {payment.tempo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Venda comercial relacionada</span>
                    <Link href="/dashboard/orders" className="text-brand font-black block mt-1 hover:underline flex items-center gap-1">
                      #{payment.vendaId} ({payment.sistema})
                      <ExternalLink className="w-3 h-3 text-brand/75" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Perfil do Comprador</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs font-semibold">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Nome do Cliente</span>
                    <span className="text-slate-900 font-bold block mt-1">{payment.cliente}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">E-mail</span>
                    <span className="text-slate-900 font-bold block mt-1">{payment.email}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Documento Mascarado</span>
                    <span className="text-slate-900 font-bold block mt-1">{payment.documento}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Telefone</span>
                    <span className="text-slate-900 font-bold block mt-1">{payment.telefone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: values and actions */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Cálculo Financeiro</span>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Valor Bruto:</span>
                    <span className="text-slate-900 font-black">
                      R$ {payment.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Taxa de Intermediação:</span>
                    <span className="text-slate-900 font-black text-red-650">
                      - R$ {payment.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-black">
                    <span className="text-slate-900">Valor Líquido:</span>
                    <span className="text-brand">
                      R$ {(payment.valor - payment.taxa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Ações Rápidas</span>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setShowReceiptModal(true)}
                    className="w-full flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Enviar Comprovante
                  </button>
                  
                  <Link 
                    href="/dashboard/orders"
                    className="w-full flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    Acessar Venda
                  </Link>

                  <button 
                    onClick={() => handleCopy(`https://receipt.basileia.pay/r/${payment.ref}`, 'link')}
                    className="w-full flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    {copiedField === 'link' ? 'Copiado!' : 'Copiar Link Recibo'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Tentativas no Provedor */}
        {activeTab === 'tentativas' && (
          <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">Tentativas de Processamento</span>
              <span className="text-[10px] font-bold text-slate-500">Histórico de erros e aprovações</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-150 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-3 py-2">Ordem</th>
                    <th className="px-3 py-2">Horário</th>
                    <th className="px-3 py-2">Método</th>
                    <th className="px-3 py-2">Gateway</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Mensagem do Provedor</th>
                    <th className="px-3 py-2 text-center">Código</th>
                    <th className="px-3 py-2">Duração</th>
                    <th className="px-3 py-2">Adquirente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-650">
                  {payment.attempts.map((att) => (
                    <tr key={att.number} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3 font-bold text-slate-900">Tentativa #{att.number}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{att.time}</td>
                      <td className="px-3 py-3">{att.method}</td>
                      <td className="px-3 py-3 font-bold text-slate-800">{att.gateway}</td>
                      <td className="px-3 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase border",
                          att.status === 'Aprovado' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        )}>
                          {att.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-800">{att.response}</td>
                      <td className="px-3 py-3 text-center font-mono font-bold text-slate-500">{att.code}</td>
                      <td className="px-3 py-3">{att.duration}</td>
                      <td className="px-3 py-3">{att.acquirer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Log Técnico Gateway */}
        {activeTab === 'gateway' && (
          <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">Payloads de Transação</span>
              <span className="text-[10.5px] font-bold text-slate-400">Correlation ID: <span className="font-mono text-slate-600 font-bold">{payment.correlationId}</span></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Correlation Raw (Response)</span>
                <pre className="w-full bg-slate-900 border border-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[220px] select-text">
                  {JSON.stringify(JSON.parse(payment.correlationRaw), null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Variáveis de Integração</span>
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Endpoint final:</span>
                    <span className="text-slate-700 font-bold">https://api.asaas.com/v3/payments</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ambiente:</span>
                    <span className="text-green-700 font-black">PRODUÇÃO</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Conta ID:</span>
                    <span className="text-slate-700 font-mono font-bold">acc_asaas_prod_88219</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Latência do Gateway:</span>
                    <span className="text-slate-705 font-bold">820ms</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200/50 pt-2">
                    <span className="text-slate-400">Adquirente Responsável:</span>
                    <span className="text-slate-700 font-bold">Rede S.A.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 leading-none">Histórico de Chamadas HTTP (Request / Response)</span>
              
              <div className="space-y-4">
                {payment.requests.map((req, i) => (
                  <div key={i} className="border border-slate-200/80 rounded-2xl overflow-hidden text-xs">
                    <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex justify-between items-center">
                      <span className="font-black text-slate-800">{req.endpoint}</span>
                      <span className="font-bold text-slate-400">{req.timestamp} · Latência: {req.latency}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                      <div className="p-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Request Header & Body</span>
                        <pre className="bg-slate-900 border border-slate-950 text-slate-200 p-2.5 rounded-xl font-mono text-[10.5px] overflow-x-auto max-h-[180px] select-text">
                          {req.requestBody}
                        </pre>
                      </div>
                      <div className="p-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Response JSON</span>
                        <pre className="bg-slate-900 border border-slate-950 text-slate-200 p-2.5 rounded-xl font-mono text-[10.5px] overflow-x-auto max-h-[180px] select-text">
                          {req.responseBody}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Eventos Auditáveis */}
        {activeTab === 'eventos' && (
          <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">Timeline Operacional Imutável</span>
              <span className="text-[10px] font-bold text-slate-500">Rastreamento sistêmico de passos</span>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6 py-2">
              {payment.events.map((evt, idx) => (
                <div key={idx} className="relative group text-xs">
                  {/* dot icon */}
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 bg-brand rounded-full border-2 border-white ring-4 ring-brand/10 group-hover:scale-110 transition-transform" />
                  
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

        {/* Tab 5: Recibo & Entrega */}
        {activeTab === 'recibo' && (
          <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200 col-span-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Disparo de Recibo de Venda</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold">
              <div className="space-y-4">
                <div className="bg-[#FAF8FF] border border-[#E8DDFD]/60 p-4 rounded-xl space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Status do Envio</span>
                  <div className="flex items-center gap-2 text-green-700 font-black">
                    <CheckCircle className="w-4 h-4" />
                    Entregue com Sucesso
                  </div>
                  <p className="text-slate-500 font-medium text-[11px] mt-1">
                    O recibo foi enviado automaticamente para <span className="font-bold text-slate-705">{payment.email}</span> após a confirmação bancária.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ações Disponíveis</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setShowReceiptModal(true)}
                      className="flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 text-slate-450" />
                      Disparar Novamente
                    </button>
                    <button 
                      onClick={() => {
                        window.open(`https://receipt.basileia.pay/r/${payment.ref}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-450" />
                      Visualizar Recibo
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Registro do Disparo de E-mail</span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-450">Data de Envio:</span>
                    <span className="text-slate-700 font-bold">19/05/2026 10:04:32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">ID do Envio SES:</span>
                    <span className="text-slate-700 font-mono">ses_msg_29b3a0cf8e81</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-450">Cliques no Recibo:</span>
                    <span className="text-slate-700 font-bold">0 cliques</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Estorno / Devolução */}
        {activeTab === 'reembolso' && (
          <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none pb-2 border-b border-slate-100">Gerenciador de Estorno e Reembolso</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold">
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Disponibilidade de Devolução</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-black">
                    {payment.status === 'Aprovado' ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Disponível para Reembolso Total ou Parcial
                      </>
                    ) : payment.status === 'Reembolsado' ? (
                      <>
                        <XCircle className="w-4 h-4 text-blue-500" />
                        Esta transação já foi reembolsada
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        Indisponível (Cobrança não capturada ou aprovada)
                      </>
                    )}
                  </div>
                  <p className="text-slate-450 font-medium text-[11px] mt-1 leading-normal">
                    Reembolsos de pagamentos via Cartão de Crédito são creditados na fatura do cliente de acordo com as regras de fechamento do banco emissor.
                  </p>
                </div>

                {payment.status === 'Aprovado' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setRefundType('total'); setShowRefundModal(true); }}
                      className="flex-1 flex items-center justify-center gap-2 h-9 bg-brand hover:bg-brand-deep text-white rounded-xl text-xs font-black shadow-sm transition-all"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Estorno Total
                    </button>
                    <button 
                      onClick={() => { setRefundType('parcial'); setShowRefundModal(true); }}
                      className="flex-1 flex items-center justify-center gap-2 h-9 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-700 shadow-sm transition-all"
                    >
                      Estorno Parcial
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-[#FAF8FF] border border-[#E8DDFD]/65 p-4 rounded-xl space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Histórico de Reembolsos</span>
                {payment.status === 'Reembolsado' ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-500">Valor Estornado:</span>
                      <span className="text-slate-900 font-black">R$ {payment.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Data do Estorno:</span>
                      <span className="text-slate-700">19/05/2026 10:06:12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Operador:</span>
                      <span className="text-slate-700">Vinícius Admin</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 font-medium text-[11.5px] italic">Sem ocorrências registradas para esta transação.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Rastro de Auditoria */}
        {activeTab === 'auditoria' && (
          <div className="bg-white rounded-2xl border border-[#E8DDFD] p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">Rastreamento de Auditoria Técnica</span>
              <span className="text-[10px] font-bold text-slate-500">Registros imutáveis de ações de operadores</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-650">
                <thead>
                  <tr className="border-b border-slate-150 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-3 py-2.5">Horário</th>
                    <th className="px-3 py-2.5">Usuário / Agente</th>
                    <th className="px-3 py-2.5">Ação Efetuada</th>
                    <th className="px-3 py-2.5">Detalhes da Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payment.auditLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3 font-mono font-bold text-slate-500 whitespace-nowrap">{log.time}</td>
                      <td className="px-3 py-3 font-black text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {log.user}
                      </td>
                      <td className="px-3 py-3 font-black text-brand">{log.action}</td>
                      <td className="px-3 py-3 text-slate-500">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
