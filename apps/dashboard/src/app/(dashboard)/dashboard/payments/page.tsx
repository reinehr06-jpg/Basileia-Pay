'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { 
  Download, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  ShieldCheck, 
  X, 
  Check, 
  Settings, 
  Loader2, 
  AlertCircle, 
  Lock, 
  MoreVertical,
  Scale,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
  Zap,
  Ban,
  Mail,
  User,
  ShoppingBag,
  CreditCard,
  QrCode,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Color map for status badges
const STATUS_META: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  'Aprovado': { label: 'Aprovado', text: 'text-green-700', bg: 'bg-green-50/40', border: 'border-green-200/50', dot: 'bg-green-500' },
  'Pendente': { label: 'Pendente', text: 'text-amber-700', bg: 'bg-amber-50/40', border: 'border-amber-200/50', dot: 'bg-amber-500' },
  'Falha técnica': { label: 'Falha técnica', text: 'text-red-800 bg-red-50/70 border-red-300/40', bg: 'bg-red-50/40', border: 'border-red-200/50', dot: 'bg-red-600' },
  'Recusado': { label: 'Recusado', text: 'text-red-700', bg: 'bg-red-50/40', border: 'border-red-200/50', dot: 'bg-red-500' },
  'Reembolsado': { label: 'Reembolsado', text: 'text-blue-700', bg: 'bg-blue-50/40', border: 'border-blue-200/50', dot: 'bg-blue-500' },
  'Processando': { label: 'Processando', text: 'text-blue-600', bg: 'bg-blue-50/40', border: 'border-blue-200/50', dot: 'bg-blue-400' },
  'Cancelado': { label: 'Cancelado', text: 'text-slate-500', bg: 'bg-slate-50/40', border: 'border-slate-200/50', dot: 'bg-slate-400' },
  'Expirado': { label: 'Expirado', text: 'text-slate-500', bg: 'bg-slate-50/40', border: 'border-slate-200/50', dot: 'bg-slate-400' },
  'Em disputa': { label: 'Em disputa', text: 'text-purple-800', bg: 'bg-purple-50/40', border: 'border-purple-200/50', dot: 'bg-purple-600' },
  'Em análise': { label: 'Em análise', text: 'text-violet-600', bg: 'bg-violet-50/40', border: 'border-violet-200/50', dot: 'bg-violet-400' }
};

// Color map for risks
const RISK_META: Record<string, { label: string; text: string; bg: string; dot: string }> = {
  'Baixo': { label: 'Baixo', text: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  'Médio': { label: 'Médio', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  'Alto': { label: 'Alto', text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
  'Crítico': { label: 'Crítico', text: 'text-purple-700', bg: 'bg-purple-50', dot: 'bg-purple-600' }
};

const initialPayments = [
  {
    id: 'PAY-2026-000982',
    ref: 'ref_pay_8f3a2d',
    venda: 'ORD-2024-09876',
    sistema: 'Sistema Core',
    cliente: 'Mariana Souza',
    email: 'mariana@gmail.com',
    metodo: 'Cartão',
    brand: 'Mastercard',
    last4: '4022',
    gateway: 'Asaas Principal',
    status: 'Aprovado',
    resultado: 'Autorizado',
    valor: 1259.90,
    taxa: 61.29,
    risco: 'Baixo',
    tempo: '1.2s',
    criadoEm: '19/05/2026 10:04',
    relativo: 'há 8 min'
  },
  {
    id: 'PAY-2026-000981',
    ref: 'ref_pay_7c9b1a',
    venda: 'ORD-2024-09874',
    sistema: 'Assinaturas',
    cliente: 'Amanda Silva',
    email: 'amanda@email.com',
    metodo: 'Cartão',
    brand: 'Visa',
    last4: '1882',
    gateway: 'Stripe Global',
    status: 'Recusado',
    resultado: 'Do not honor',
    valor: 899.90,
    taxa: 0.00,
    risco: 'Médio',
    tempo: '2.4s',
    criadoEm: '19/05/2026 09:58',
    relativo: 'há 14 min'
  },
  {
    id: 'PAY-2026-000980',
    ref: 'ref_pay_6b8f2d',
    venda: 'ORD-2024-09875',
    sistema: 'Marketplace',
    cliente: 'Lucas Ferreira',
    email: 'lucas@email.com',
    metodo: 'PIX',
    brand: 'Mercado Pago',
    last4: '',
    gateway: 'Mercado Pago BR',
    status: 'Pendente',
    resultado: 'Aguardando pagamento PIX',
    valor: 349.90,
    taxa: 2.10,
    risco: 'Baixo',
    tempo: '—',
    criadoEm: '19/05/2026 09:54',
    relativo: 'há 18 min'
  },
  {
    id: 'PAY-2026-000979',
    ref: 'ref_pay_5a7e1c',
    venda: 'ORD-2024-09870',
    sistema: 'Sistema Core',
    cliente: 'Beatriz Lima',
    email: 'beatriz@email.com',
    metodo: 'PIX',
    brand: 'Banco do Brasil',
    last4: '',
    gateway: 'Banco do Brasil PIX',
    status: 'Falha técnica',
    resultado: 'Timeout no gateway',
    valor: 2490.00,
    taxa: 0.00,
    risco: 'Alto',
    tempo: '38s',
    criadoEm: '19/05/2026 09:50',
    relativo: 'há 22 min'
  },
  {
    id: 'PAY-2026-000978',
    ref: 'ref_pay_4d6c9b',
    venda: 'ORD-2024-09869',
    sistema: 'Church',
    cliente: 'João Martins',
    email: 'joao@email.com',
    metodo: 'Cartão',
    brand: 'Elo',
    last4: '9031',
    gateway: 'Cielo Principal',
    status: 'Em análise',
    resultado: 'Antifraude em revisão',
    valor: 579.90,
    taxa: 18.50,
    risco: 'Alto',
    tempo: '4.8s',
    criadoEm: '19/05/2026 09:41',
    relativo: 'há 31 min'
  },
  {
    id: 'PAY-2026-000977',
    ref: 'ref_pay_3c5b8a',
    venda: 'ORD-2024-09873',
    sistema: 'Sistema Eventos',
    cliente: 'Rafael Costa',
    email: 'rafael@email.com',
    metodo: 'PIX',
    brand: 'Banco do Brasil',
    last4: '',
    gateway: 'Asaas Principal',
    status: 'Reembolsado',
    resultado: 'Reembolso concluído',
    valor: 199.90,
    taxa: 1.50,
    risco: 'Baixo',
    tempo: '1.6s',
    criadoEm: '19/05/2026 09:30',
    relativo: 'há 42 min'
  }
];

const STATUS_LABEL: Record<string, string> = {
  paid: 'Aprovado', pending: 'Pendente', failed: 'Falha técnica',
  refunded: 'Reembolsado', cancelled: 'Cancelado', chargeback: 'Chargeback',
  processing: 'Processando', expired: 'Expirado',
};

const RISK_LABEL: Record<string, string> = {
  low: 'Baixo', medium: 'Médio', high: 'Alto', critical: 'Crítico',
};

const METHOD_BRAND: Record<string, string> = {
  credit_card: 'Cartão', pix: 'PIX', boleto: 'Boleto', debit_card: 'Débito',
};

function apiPaymentToPage(p: any) {
  return {
    id: p.uuid || `PAY-${p.id}`,
    ref: `ref_${(p.uuid || p.id).toString().substring(0, 8)}`,
    venda: p.order?.uuid ? p.order.uuid.substring(0, 14) : '—',
    sistema: p.order?.connectedSystem?.name || '—',
    cliente: p.customer_name || p.customer || '—',
    email: p.customer_email || '',
    metodo: METHOD_BRAND[p.method] || p.method || '—',
    brand: '',
    last4: '',
    gateway: p.gateway_account?.name || p.gateway || '—',
    status: STATUS_LABEL[p.status] || p.status || '—',
    resultado: p.status || '—',
    valor: (p.amount ?? 0) / 100,
    taxa: 0,
    risco: RISK_LABEL[p.risk] || 'Baixo',
    tempo: '—',
    criadoEm: p.created_at ? new Date(p.created_at).toLocaleString('pt-BR') : '—',
    relativo: '—',
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/v1/dashboard/payments');
      if (res.success && Array.isArray(res.data)) {
        setPayments(res.data.map(apiPaymentToPage));
      } else {
        setError(res.error?.message || 'Erro ao carregar pagamentos');
      }
    } catch {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  
  // Advanced Filter state variables
  const [filterPeriod, setFilterPeriod] = useState('Hoje');
  const [filterStatusTab, setFilterStatusTab] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterResult, setFilterResult] = useState('Todos');
  const [filterMethod, setFilterMethod] = useState('Todos');
  const [filterGateway, setFilterGateway] = useState('Todos');
  const [filterSystem, setFilterSystem] = useState('Todos');
  const [filterOrigem, setFilterOrigem] = useState('');
  const [filterRisk, setFilterRisk] = useState('Todos');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');

  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Actions and Dropdown state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [refundingPayment, setRefundingPayment] = useState<any | null>(null);
  const [refundType, setRefundType] = useState<'total' | 'parcial'>('total');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Cliente solicitou cancelamento');
  const [refundNotify, setRefundNotify] = useState(true);

  const [cancellingPayment, setCancellingPayment] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Desistência do comprador');
  const [cancelNotify, setCancelNotify] = useState(true);

  const [resendingReceipt, setResendingReceipt] = useState<any | null>(null);
  const [receiptEmail, setReceiptEmail] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  const triggerSuccessAlert = (message: string) => {
    setSuccessAlert(message);
    setTimeout(() => setSuccessAlert(null), 4000);
  };

  const handleBulkAction = (action: string) => {
    if (!action) return;
    if (selectedIds.length === 0) return;
    if (action === 'exportar') {
      triggerSuccessAlert(`Exportando dados de ${selectedIds.length} pagamentos selecionados...`);
    } else if (action === 'revisao') {
      triggerSuccessAlert(`Encaminhando ${selectedIds.length} transações para revisão manual Trust Layer.`);
    } else if (action === 'webhook') {
      triggerSuccessAlert(`Reenviando webhooks para ${selectedIds.length} tentativas selecionadas.`);
    } else if (action === 'recibo') {
      triggerSuccessAlert(`Disparando recibos eletrônicos para ${selectedIds.length} compradores.`);
    }
    setSelectedIds([]);
  };

  // Confirm Refund Action
  const handleConfirmRefund = () => {
    if (!refundingPayment) return;
    const amount = refundType === 'total' ? refundingPayment.valor : parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > refundingPayment.valor) {
      alert('Valor de reembolso inválido.');
      return;
    }

    setPayments(prev => prev.map(p => {
      if (p.id === refundingPayment.id) {
        return {
          ...p,
          status: 'Reembolsado',
          resultado: 'Reembolso concluído',
          valor: p.valor - (refundType === 'parcial' ? amount : 0),
          relativo: 'há 1 min'
        };
      }
      return p;
    }));

    triggerSuccessAlert(`Estorno de R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} processado com sucesso para ${refundingPayment.id}. Auditoria registrada.`);
    setRefundingPayment(null);
    setRefundAmount('');
  };

  // Confirm Cancel Action
  const handleConfirmCancel = () => {
    if (!cancellingPayment) return;

    setPayments(prev => prev.map(p => {
      if (p.id === cancellingPayment.id) {
        return {
          ...p,
          status: 'Cancelado',
          resultado: 'Cancelado pelo operador',
          relativo: 'há 1 min'
        };
      }
      return p;
    }));

    triggerSuccessAlert(`Pagamento ${cancellingPayment.id} cancelado com sucesso. Notificação enviada.`);
    setCancellingPayment(null);
  };

  // Confirm Resend Receipt Action
  const handleConfirmResendReceipt = () => {
    if (!resendingReceipt) return;

    triggerSuccessAlert(`Comprovante de pagamento reenviado para ${receiptEmail} com sucesso.`);
    setResendingReceipt(null);
  };

  // Open modals helper
  const openRefundModal = (p: any) => {
    setRefundingPayment(p);
    setRefundType('total');
    setRefundAmount('');
  };

  const openCancelModal = (p: any) => {
    setCancellingPayment(p);
    setCancelReason('Desistência do comprador');
  };

  const openReceiptModal = (p: any) => {
    setResendingReceipt(p);
    setReceiptEmail(p.email);
    setReceiptUrl(`https://receipt.basileia.pay/r/${p.ref}`);
  };

  // Filtering Logic
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = 
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.venda.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatusTab = 
        filterStatusTab === 'Todos' ||
        (filterStatusTab === 'Aprovados' && p.status === 'Aprovado') ||
        (filterStatusTab === 'Recusados' && p.status === 'Recusado') ||
        (filterStatusTab === 'Pendentes' && p.status === 'Pendente') ||
        (filterStatusTab === 'Em análise' && p.status === 'Em análise') ||
        (filterStatusTab === 'Falhas técnicas' && p.status === 'Falha técnica');

      const matchStatus = filterStatus === 'Todos' || p.status === filterStatus;
      const matchResult = filterResult === 'Todos' || p.resultado === filterResult;
      const matchMethod = filterMethod === 'Todos' || p.metodo === filterMethod;
      const matchGateway = filterGateway === 'Todos' || p.gateway === filterGateway;
      const matchSystem = filterSystem === 'Todos' || p.sistema === filterSystem;
      const matchRisk = filterRisk === 'Todos' || p.risco === filterRisk;

      const minVal = parseFloat(filterMinAmount);
      const matchMinVal = isNaN(minVal) || p.valor >= minVal;

      const maxVal = parseFloat(filterMaxAmount);
      const matchMaxVal = isNaN(maxVal) || p.valor <= maxVal;

      const matchOrigem = !filterOrigem || p.sistema.toLowerCase().includes(filterOrigem.toLowerCase());

      return matchSearch && matchStatusTab && matchStatus && matchResult && matchMethod && matchGateway && matchSystem && matchRisk && matchMinVal && matchMaxVal && matchOrigem;
    });
  }, [payments, searchQuery, filterStatusTab, filterStatus, filterResult, filterMethod, filterGateway, filterSystem, filterRisk, filterMinAmount, filterMaxAmount, filterOrigem]);

  // Pagination calculation
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const displayPayments = useMemo(() => {
    return filteredPayments.slice(0, itemsPerPage);
  }, [filteredPayments]);

  const toggleSelectAll = () => {
    if (selectedIds.length === displayPayments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayPayments.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const uniqueGateways = useMemo(() => ['Todos', ...new Set(payments.map(p => p.gateway).filter(Boolean))], [payments]);
  const uniqueMethods = useMemo(() => ['Todos', ...new Set(payments.map(p => p.metodo).filter(Boolean))], [payments]);
  const uniqueRisks = useMemo(() => ['Todos', ...new Set(payments.map(p => p.risco).filter(Boolean))], [payments]);
  const uniqueStatuses = useMemo(() => ['Todos', ...new Set(payments.map(p => p.status).filter(Boolean))], [payments]);
  const uniqueResults = useMemo(() => ['Todos', ...new Set(payments.map(p => p.resultado).filter(Boolean))], [payments]);

  const handleExportPdf = async () => {
    triggerSuccessAlert(`Preparando exportação em formato PDF...`);
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
      
      const doc = new jsPDF('landscape');
      
      doc.setFontSize(18);
      doc.setTextColor(109, 40, 217);
      doc.text('Basileia Pay - Relatório de Operações', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(124, 58, 237);
      doc.text(`Total: ${filteredPayments.length} registros | Exportado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
      
      const tableColumn = ["ID", "Ref", "Venda", "Cliente", "Sistema", "Método", "Gateway", "Status", "Risco", "Valor"];
      const tableRows = filteredPayments.map(p => [
        p.id,
        p.ref,
        p.venda,
        p.cliente,
        p.sistema,
        p.metodo,
        p.gateway,
        p.status,
        p.risco,
        `R$ ${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: 40,
        head: [tableColumn],
        body: tableRows.length > 0 ? tableRows : [['Nenhum dado encontrado', '-', '-', '-', '-', '-', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [250, 245, 255], textColor: [88, 28, 135] },
        styles: { fontSize: 7 }
      });

      doc.save(`operacoes_${Date.now()}.pdf`);
      triggerSuccessAlert("Download do PDF concluído com sucesso!");
    } catch (err) {
      console.error(err);
      triggerSuccessAlert("Erro ao gerar PDF.");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      


      {/* Notifications Alert */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white p-3.5 rounded-2xl shadow-xl shadow-green-900/10 flex items-center justify-between gap-3 max-w-sm border border-green-400 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-white" />
            <span className="text-[11.5px] font-bold text-left">{successAlert}</span>
          </div>
          <button onClick={() => setSuccessAlert(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal: Refund */}
      {refundingPayment && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <Scale className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Troubleshooting: Reembolso</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF8FF] border border-[#E8DDFD]/60 p-3.5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">Pagamento / Gateway</p>
                <p className="text-slate-950 font-black text-[13px] mt-1.5">{refundingPayment.id}</p>
                <p className="text-slate-500 font-semibold text-[11px] mt-0.5">{refundingPayment.gateway}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Valor Total:</span>
                  <span className="text-slate-900 font-black">
                    R$ {refundingPayment.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Modalidade</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Motivo do Reembolso</label>
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
                  id="refundNotify"
                  checked={refundNotify}
                  onChange={(e) => setRefundNotify(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer"
                />
                <label htmlFor="refundNotify" className="text-[11.5px] font-bold text-slate-500 cursor-pointer">
                  Enviar notificação por e-mail para o cliente
                </label>
              </div>

              <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-[10.5px] font-bold text-red-700 leading-tight">
                ⚠️ <span className="font-black">Importante:</span> O valor será devolvido através das regras originais da transação e não pode ser desfeito.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRefundingPayment(null)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Cancelar
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

      {/* Modal: Cancel Payment */}
      {cancellingPayment && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-red-650 border-b border-slate-100 pb-3 mb-4">
              <Ban className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Cancelar Cobrança Pendente</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF8FF] border border-[#E8DDFD]/60 p-3.5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">Pagamento / Status</p>
                <p className="text-slate-950 font-black text-[13px] mt-1.5">{cancellingPayment.id}</p>
                <p className="text-slate-500 font-semibold text-[11px] mt-0.5">Método: {cancellingPayment.metodo} · R$ {cancellingPayment.valor.toLocaleString('pt-BR')}</p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">Motivo do Cancelamento</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cancelNotify"
                  checked={cancelNotify}
                  onChange={(e) => setCancelNotify(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer"
                />
                <label htmlFor="cancelNotify" className="text-[11.5px] font-bold text-slate-500 cursor-pointer">
                  Notificar comprador sobre o cancelamento
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCancellingPayment(null)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Manter Ativo
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white transition-all rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Resend Receipt */}
      {resendingReceipt && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <Mail className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Disparar Recibo / Comprovante</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">E-mail do Cliente</label>
                <input
                  type="email"
                  value={receiptEmail}
                  onChange={(e) => setReceiptEmail(e.target.value)}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">URL do Comprovante Digital</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={receiptUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono font-bold text-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(receiptUrl);
                      triggerSuccessAlert('Link do recibo copiado para a área de transferência.');
                    }}
                    className="px-3 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-[11px] font-black text-slate-700"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF8FF] border border-[#E8DDFD]/65 p-3 rounded-2xl text-[11px] text-slate-500 font-bold leading-relaxed">
                ℹ️ <span className="font-black text-brand">Status do Envio Anterior:</span> Entregue via Gateway em 19/05/2026 às 10:05.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setResendingReceipt(null)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmResendReceipt}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep transition-all rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Reenviar Recibo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Page Header */}
      <header className="flex items-center justify-between w-full px-1 shrink-0">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[23px] 2xl:text-[25px] font-black tracking-tighter text-slate-950 leading-none">Pagamentos</h1>
            <Activity className="w-4 h-4 text-brand-accent mt-0.5" />
          </div>
          <p className="text-slate/50 font-bold text-[11px] 2xl:text-[12px] tracking-tight">
            Todas as tentativas e pagamentos processados em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => triggerSuccessAlert('Filtros salvos carregados!')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E8DDFD] rounded-xl text-[10px] 2xl:text-[11px] font-black text-slate-700 shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-[34px] 2xl:h-[36px]"
          >
            Filtros salvos
          </button>
          
          <button 
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-[#E8DDFD] rounded-xl text-[10px] 2xl:text-[11px] font-black text-slate-700 shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-[34px] 2xl:h-[36px]"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Exportar
          </button>
        </div>
      </header>

      {/* 5. Advanced Filters Block */}
      <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3.5 shadow-sm flex flex-col gap-3.5 text-left shrink-0">
        {/* Row 1: Period, Status, Result, Method, Gateway */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Período</span>
            <div className="relative">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
              >
                <option value="Hoje">Hoje</option>
                <option value="Ontem">Ontem</option>
                <option value="SeteDias">Últimos 7 dias</option>
                <option value="Mes">Este Mês</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Status</span>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
              >
                {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Resultado</span>
            <div className="relative">
              <select
                value={filterResult}
                onChange={(e) => { setFilterResult(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
              >
                {uniqueResults.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Método</span>
            <div className="relative">
              <select
                value={filterMethod}
                onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
              >
                {uniqueMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Gateway</span>
            <div className="relative">
              <select
                value={filterGateway}
                onChange={(e) => { setFilterGateway(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
              >
                {uniqueGateways.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Sistema, Origem, Risco, Valor Mín/Máx, ID/Ref, Search Term */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Sistema</span>
            <div className="relative">
              <select
                value={filterSystem}
                onChange={(e) => { setFilterSystem(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
              >
                {['Todos', ...new Set(payments.map(p => p.sistema).filter(Boolean))].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Origem / Canal</span>
            <input
              type="text"
              placeholder="Ex: Core"
              value={filterOrigem}
              onChange={(e) => { setFilterOrigem(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand h-[34px]"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Risco Antifraude</span>
            <div className="relative">
              <select
                value={filterRisk}
                onChange={(e) => { setFilterRisk(e.target.value); setCurrentPage(1); }}
                className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
              >
                {uniqueRisks.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Valor Mínimo (R$)</span>
            <input
              type="number"
              placeholder="Mínimo"
              value={filterMinAmount}
              onChange={(e) => { setFilterMinAmount(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand h-[34px]"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Valor Máximo (R$)</span>
            <input
              type="number"
              placeholder="Máximo"
              value={filterMaxAmount}
              onChange={(e) => { setFilterMaxAmount(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand h-[34px]"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">ID / Ref Principal</span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-450 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Buscar ID ou ref"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand h-[34px]"
              />
            </div>
          </div>
        </div>

        {/* Selected Items toolbar */}
        <div className="border-t border-slate-100 pt-2 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={displayPayments.length > 0 && selectedIds.length === displayPayments.length}
                onChange={toggleSelectAll}
                className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer ml-1"
              />
              <span className="text-[11.5px] font-bold text-slate-400">
                <span className="text-slate-700 font-black">{selectedIds.length}</span> selecionados
              </span>
            </div>

            <div className="relative">
              <select
                disabled={selectedIds.length === 0}
                onChange={(e) => { handleBulkAction(e.target.value); e.target.value = ''; }}
                className="appearance-none bg-[#FAF8FF] disabled:bg-slate-50 disabled:text-slate-350 disabled:border-slate-200 border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1 text-[11px] font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer disabled:cursor-not-allowed h-[28px] transition-all"
              >
                <option value="">Ações em lote</option>
                <option value="exportar">Exportar selecionados</option>
                <option value="revisao">Revisão manual</option>
                <option value="webhook">Reenviar Webhooks</option>
                <option value="recibo">Disparar Recibos</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
            </div>
          </div>

          <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            Investigador operacional de pagamentos
          </div>
        </div>
      </div>

      {/* 6. Tabs of Status with counters */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none pb-0.5">
        {[
          { id: 'Todos', label: 'Todos' },
          { id: 'Aprovados', label: 'Aprovados' },
          { id: 'Recusados', label: 'Recusados' },
          { id: 'Pendentes', label: 'Pendentes' },
          { id: 'Em análise', label: 'Em análise' },
          { id: 'Falhas técnicas', label: 'Falhas técnicas' }
        ].map((tab) => {
          const isActive = filterStatusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setFilterStatusTab(tab.id); setCurrentPage(1); }}
              className={cn(
                "px-3.5 py-2 rounded-xl text-[11px] font-black tracking-tight transition-all border flex items-center gap-2 whitespace-nowrap h-[36px]",
                isActive
                  ? "bg-brand text-white border-brand shadow-lg shadow-brand/10"
                  : "bg-white border-[#E8DDFD] text-slate-600 hover:bg-slate-50/50"
              )}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded-lg text-[9px] font-bold",
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {payments.length.toLocaleString('pt-BR')}
              </span>
            </button>
          );
        })}
      </div>

      {/* 7. Real state renders */}
      {loading && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-20 flex flex-col items-center justify-center gap-4 shadow-sm h-[320px]">
          <Loader2 className="animate-spin text-brand w-8 h-8" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Carregando dados...</p>
        </div>
      )}

      {!loading && error && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-16 flex flex-col items-center justify-center text-center gap-3 shadow-sm h-[320px]">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-950 font-black text-[13.5px]">Erro de Rastreamento</h3>
            <p className="text-slate-400 font-bold text-[11.5px] mt-0.5">{error}</p>
          </div>
          <button 
            onClick={fetchPayments}
            className="mt-2 px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase tracking-tight transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {!loading && !error && payments.length === 0 && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-16 flex flex-col items-center justify-center text-center gap-3 shadow-sm h-[320px]">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-955 font-black text-[13.5px]">Nenhum pagamento encontrado</h3>
            <p className="text-slate-400 font-bold text-[11.5px] mt-0.5">Os pagamentos processados pelos sistemas conectados aparecerão aqui.</p>
          </div>
        </div>
      )}

      {!loading && !error && payments.length > 0 && (
        <>
          {/* 8. main payments table */}
          <div className="w-full bg-white rounded-3xl border border-[#E8DDFD] overflow-hidden shadow-sm shrink-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E8DDFD]/60 bg-[#FAF8FF]/60 select-none">
                    <th className="w-[40px] px-2 py-3 text-center"></th>
                    <th className="w-[10%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Pagamento</th>
                    <th className="w-[9%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Venda</th>
                    <th className="w-[10%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Cliente</th>
                    <th className="w-[9%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Método</th>
                    <th className="w-[10%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Gateway</th>
                    <th className="w-[8%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="w-[9%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Resultado</th>
                    <th className="w-[8%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Valor</th>
                    <th className="w-[6%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Risco</th>
                    <th className="w-[11%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Criado Em</th>
                    <th className="w-[10%] pr-4 pl-1 py-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDFD]/40">
                  {displayPayments.map((p) => {
                    const statusMeta = STATUS_META[p.status] || STATUS_META['Em análise'];
                    const riskMeta = RISK_META[p.risco] || RISK_META['Baixo'];
                    
                    return (
                      <tr 
                        key={p.id}
                        className={cn(
                          "group hover:bg-brand-50/20 transition-colors h-[64px]",
                          selectedIds.includes(p.id) && "bg-brand-soft/20"
                        )}
                      >
                        {/* checkbox selector */}
                        <td className="px-2 py-3 text-center w-[40px] align-middle">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer"
                          />
                        </td>

                        {/* Pagamento */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0">
                            <span className="block font-black text-slate-950 text-[12.5px] truncate">
                              {p.id}
                            </span>
                            <span className="text-[9.5px] font-mono font-semibold text-slate-400 block mt-0.5 truncate">
                              {p.ref}
                            </span>
                          </div>
                        </td>

                        {/* Venda / Sistema */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0 text-[11px] font-bold text-slate-500">
                            <Link 
                              href={`/dashboard/orders`}
                              className="block font-black text-slate-800 hover:text-brand transition-colors truncate"
                            >
                              #{p.venda}
                            </Link>
                            <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                              {p.sistema}
                            </span>
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0">
                            <span className="block font-black text-slate-900 text-[12.5px] truncate" title={p.cliente}>
                              {p.cliente}
                            </span>
                            <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5 truncate" title={p.email}>
                              {p.email}
                            </span>
                          </div>
                        </td>

                        {/* Método */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0 text-[11px] font-bold text-slate-500">
                            {p.metodo === 'Cartão' ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="block font-black text-slate-800 whitespace-nowrap">
                                    {p.brand}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-450 block mt-0.5">
                                  •••• {p.last4}
                                </span>
                              </>
                            ) : p.metodo === 'PIX' ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <QrCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="block font-black text-slate-800 whitespace-nowrap">
                                    PIX
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-450 block mt-0.5 truncate">
                                  {p.brand}
                                </span>
                              </>
                            ) : (
                              <div className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="block font-black text-slate-805">
                                  Boleto
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Gateway */}
                        <td className="px-3 py-3 align-middle">
                          <span className="text-[11.5px] font-black text-slate-800 truncate block">
                            {p.gateway}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 align-middle">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-black uppercase border shadow-sm",
                            statusMeta.text, statusMeta.bg, statusMeta.border
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", statusMeta.dot)} />
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Resultado */}
                        <td className="px-3 py-3 align-middle">
                          <span className="text-[11.5px] font-semibold text-slate-500 truncate block" title={p.resultado}>
                            {p.resultado}
                          </span>
                        </td>

                        {/* Valor */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0">
                            <span className="block font-black text-slate-950 text-[13px] whitespace-nowrap">
                              R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            {p.taxa > 0 && (
                              <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5">
                                Taxa: R$ {p.taxa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Risco */}
                        <td className="px-3 py-3 align-middle">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black border",
                            riskMeta.text, riskMeta.bg, p.risco === 'Crítico' || p.risco === 'Alto' ? 'border-red-200' : 'border-slate-100'
                          )}>
                            <div className={cn("w-1 h-1 rounded-full shrink-0", riskMeta.dot)} />
                            {riskMeta.label}
                          </span>
                        </td>

                        {/* Criado em / tempo relativo */}
                        <td className="px-3 py-3 align-middle">
                          <div className="flex flex-col leading-tight">
                            <span className="whitespace-nowrap text-[12px] font-black text-slate-900">
                              {p.relativo === 'há 8 min' ? 'Hoje, 10:04' :
                               p.relativo === 'há 14 min' ? 'Hoje, 09:58' :
                               p.relativo === 'há 18 min' ? 'Hoje, 09:54' :
                               p.relativo === 'há 22 min' ? 'Hoje, 09:50' :
                               p.relativo === 'há 31 min' ? 'Hoje, 09:41' :
                               p.relativo === 'há 42 min' ? 'Hoje, 09:30' : p.criadoEm}
                            </span>
                            <span className="whitespace-nowrap text-[11px] font-semibold text-slate-400 mt-0.5">
                              {p.relativo} {p.tempo !== '—' && `· ${p.tempo}`}
                            </span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="px-3 py-3 text-right align-middle">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            
                            <Link 
                              href={`/dashboard/payments/${p.id}`}
                              className="h-9 rounded-xl border border-[#E8DDFD] bg-white px-4 text-[12px] font-black text-slate-700 shadow-sm flex items-center justify-center transition-all hover:bg-brand-soft/40 hover:text-brand"
                            >
                              Detalhes
                            </Link>

                            {/* Dropdown Menu */}
                            <div className="relative">
                              <button
                                onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                                className={cn(
                                  "flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DDFD] bg-white text-slate-500 hover:text-brand shadow-sm transition-colors",
                                  activeMenuId === p.id && "border-brand/40 text-brand bg-slate-50"
                                )}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === p.id && (
                                <div className="absolute right-0 top-full z-30 mt-2 w-[200px] rounded-2xl border border-[#E8DDFD] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                  
                                  <button
                                    onClick={() => { openReceiptModal(p); setActiveMenuId(null); }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                  >
                                    <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                                    Reenviar recibo
                                  </button>

                                  <button
                                    onClick={() => { triggerSuccessAlert(`Abrindo payload de webhook para ${p.id}...`); setActiveMenuId(null); }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                  >
                                    <Zap className="h-4 w-4 text-slate-400 shrink-0" />
                                    Ver webhook
                                  </button>

                                  <Link
                                    href="/dashboard/orders"
                                    onClick={() => setActiveMenuId(null)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                  >
                                    <ShoppingBag className="h-4 w-4 text-slate-400 shrink-0" />
                                    Abrir venda
                                  </Link>

                                  {p.status === 'Aprovado' && (
                                    <button
                                      onClick={() => { openRefundModal(p); setActiveMenuId(null); }}
                                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors border-t border-slate-100 mt-1 pt-1.5"
                                    >
                                      <Scale className="h-4 w-4 text-slate-400 shrink-0" />
                                      Reembolsar
                                    </button>
                                  )}

                                  {p.status === 'Pendente' && (
                                    <button
                                      onClick={() => { openCancelModal(p); setActiveMenuId(null); }}
                                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1 pt-1.5"
                                    >
                                      <Ban className="h-4 w-4 text-red-400 shrink-0" />
                                      Cancelar
                                    </button>
                                  )}

                                  <button
                                    onClick={() => { triggerSuccessAlert('ID copiado com sucesso.'); setActiveMenuId(null); }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                  >
                                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                    Copiar ID
                                  </button>

                                  <button
                                    onClick={() => { triggerSuccessAlert(`Incidente de troubleshooting registrado para o pagamento ${p.id}.`); setActiveMenuId(null); }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                  >
                                    <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0" />
                                    Abrir incidente
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 9. Pagination controls */}
          <div className="flex items-center justify-between border-t border-[#E8DDFD]/60 pt-3 px-1 w-full shrink-0 select-none h-[58px]">
            <p className="text-[12.5px] font-bold text-slate-400 text-left">
              Mostrando <span className="text-slate-700">1 a 5</span> de <span className="text-slate-700">2.156</span> pagamentos
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="w-8 h-8 rounded-xl border border-[#E8DDFD] bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[12.5px] font-black text-brand bg-brand-soft/40 border border-brand/20 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="w-8 h-8 rounded-xl border border-[#E8DDFD] bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-400 text-right">
              <span>Itens por página:</span>
              <span className="text-slate-700 font-black bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-lg">5</span>
            </div>
          </div>

          {/* 10. Bottom Diagnostics Panels */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3 w-full select-none text-left">
            
            {/* Card 1: Comparação por Gateway */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300 h-[210px]">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 leading-none">Comparação por Gateway</span>
                
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
                  {[
                    { name: 'Asaas Principal', rate: '97,8% aprovação', delay: '1.2s médio', fail: '12 recusas', isGood: true },
                    { name: 'Mercado Pago BR', rate: '96,4% aprovação', delay: '1.8s médio', fail: '18 recusas', isGood: true },
                    { name: 'Stripe Global', rate: '91,2% aprovação', delay: '2.9s médio', fail: '47 recusas', isGood: false },
                    { name: 'Banco do Brasil PIX', rate: '84,6% aprovação', delay: '8.4s médio', fail: '31 falhas', isGood: false },
                    { name: 'Cielo Principal', rate: '94,1% aprovação', delay: '3.1s médio', fail: '22 recusas', isGood: true },
                  ].map((gw, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-xl border border-slate-100/70 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 leading-tight">
                        <p className="text-[10px] font-black text-slate-800 truncate">{gw.name}</p>
                        <p className="text-[8.5px] font-semibold text-slate-400 mt-0.5">{gw.delay}</p>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight",
                          gw.isGood ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        )}>
                          {gw.rate}
                        </span>
                        <span className="text-[8.5px] font-mono font-bold text-slate-500">{gw.fail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2: Falhas por Método */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300 h-[210px]">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 leading-none">Falhas por Método</span>
                
                <div className="space-y-1.5">
                  {[
                    { method: 'Cartão', count: '142 recusas', desc: 'Antifraude / Limite de crédito', pct: '74%', color: 'bg-brand' },
                    { method: 'PIX', count: '31 falhas técnicas', desc: 'Timeout no webhook BB', pct: '16%', color: 'bg-amber-500' },
                    { method: 'Boleto', count: '18 expirados', desc: 'Sem pagamento detectado', pct: '8%', color: 'bg-slate-400' },
                    { method: 'Wallet', count: '9 recusas', desc: 'Saldo Apple Pay / Google Pay', pct: '2%', color: 'bg-indigo-500' }
                  ].map((fm, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 leading-tight">
                        <p className="text-[10px] font-black text-slate-800 truncate">{fm.method}</p>
                        <p className="text-[8.5px] font-semibold text-slate-400 mt-0.5 truncate">{fm.desc}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                        <span className="text-[9.5px] font-black text-slate-800">{fm.count}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full", fm.color)} style={{ width: fm.pct }} />
                          </div>
                          <span className="text-[8.5px] font-mono text-slate-400">{fm.pct}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: Pagamentos que Exigem Ação */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300 h-[210px]">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 leading-none">Pagamentos que Exigem Ação</span>
                
                <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                  {[
                    { label: '31 falhas técnicas nas últimas 2h', info: 'Banco do Brasil PIX concentra 18 ocorrências', btn: 'Ver falhas', action: () => { setFilterStatusTab('Falhas técnicas'); } },
                    { label: '20 pagamentos em análise', info: 'Antifraude aguardando revisão manual', btn: 'Abrir análise', action: () => { setFilterStatusTab('Em análise'); } },
                    { label: '62 pagamentos pendentes acima de 30 minutos', info: 'PIX e boleto aguardando confirmação', btn: 'Ver pendentes', action: () => { setFilterStatusTab('Pendentes'); } },
                    { label: '12 recibos não enviados', info: 'Falha na entrega de e-mail ou webhook', btn: 'Reenviar', action: () => { triggerSuccessAlert('Reenviando recibos pendentes em segundo plano...'); } }
                  ].slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-xl border border-amber-100 bg-amber-50/10 hover:bg-amber-50/20 transition-all">
                      <div className="min-w-0 leading-tight">
                        <p className="text-[9.5px] font-black text-slate-800 truncate">{item.label}</p>
                        <p className="text-[8.5px] font-bold text-slate-400 mt-0.5 truncate">{item.info}</p>
                      </div>
                      <button 
                        onClick={item.action}
                        className="shrink-0 px-2 py-1 bg-white border border-[#E8DDFD] hover:bg-brand-soft rounded-lg text-[8px] font-black text-brand uppercase tracking-tight shadow-sm"
                      >
                        {item.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
