'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiFetch } from '@/lib/api';
import { 
  Download, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  X, 
  Loader2, 
  AlertCircle, 
  MoreVertical,
  Scale,
  Calendar,
  ShoppingBag,
  Clock,
  ArrowRight,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Predefined status styling dictionary
const STATUS_META: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  'Aprovado': { label: 'Aprovado', text: 'text-green-700', bg: 'bg-green-50/40', border: 'border-green-200/50', dot: 'bg-green-500' },
  'Pendente': { label: 'Pendente', text: 'text-amber-700', bg: 'bg-amber-50/40', border: 'border-amber-200/50', dot: 'bg-amber-500' },
  'Falhou': { label: 'Falhou', text: 'text-red-700', bg: 'bg-red-50/40', border: 'border-red-200/50', dot: 'bg-red-500' },
  'Reembolsado': { label: 'Reembolsado', text: 'text-blue-700', bg: 'bg-blue-50/40', border: 'border-blue-200/50', dot: 'bg-blue-500' },
  'Chargeback': { label: 'Chargeback', text: 'text-purple-700', bg: 'bg-purple-50/40', border: 'border-purple-200/50', dot: 'bg-purple-700' },
  'Em análise': { label: 'Em análise', text: 'text-violet-600', bg: 'bg-violet-50/40', border: 'border-violet-200/50', dot: 'bg-violet-400' }
};

const initialOrders = [
  {
    id: 'ORD-2024-09876',
    trxId: 'trx_8f3a2d7e',
    valor: 1259.90,
    reembolsadoValor: 0,
    cliente: 'Mariana Souza',
    email: 'mariana@gmail.com',
    sistema: 'Sistema Core',
    checkout: 'Checkout Pagar.Me Padrão',
    gateway: 'Asaas Principal',
    status: 'Aprovado',
    metodo: 'Cartão',
    brand: 'Mastercard',
    last4: '4022',
    tempo: 'há 12 min',
    dataAbs: '19/05/2026 09:12'
  },
  {
    id: 'ORD-2024-09875',
    trxId: 'trx_3d1a8c9e',
    valor: 349.90,
    reembolsadoValor: 0,
    cliente: 'Lucas Ferreira',
    email: 'lucas@email.com',
    sistema: 'Marketplace',
    checkout: 'Checkout Marketplace',
    gateway: 'Mercado Pago BR',
    status: 'Pendente',
    metodo: 'PIX',
    brand: 'Mercado Pago',
    last4: '',
    tempo: 'há 18 min',
    dataAbs: '19/05/2026 09:06'
  },
  {
    id: 'ORD-2024-09874',
    trxId: 'trx_9a2b7c4d',
    valor: 899.90,
    reembolsadoValor: 0,
    cliente: 'Amanda Silva',
    email: 'amanda@email.com',
    sistema: 'Assinaturas',
    checkout: 'Checkout Assinatura Pro',
    gateway: 'Stripe Global',
    status: 'Falhou',
    metodo: 'Cartão',
    brand: 'Visa',
    last4: '1882',
    tempo: 'há 19 min',
    dataAbs: '19/05/2026 09:05'
  },
  {
    id: 'ORD-2024-09873',
    trxId: 'trx_4f7e2a9b',
    valor: 199.90,
    reembolsadoValor: 199.90,
    cliente: 'Rafael Costa',
    email: 'rafael@email.com',
    sistema: 'Sistema Eventos',
    checkout: 'Checkout Evento',
    gateway: 'Banco do Brasil PIX',
    status: 'Reembolsado',
    metodo: 'PIX',
    brand: 'Banco do Brasil',
    last4: '',
    tempo: 'há 25 min',
    dataAbs: '19/05/2026 08:59'
  },
  {
    id: 'ORD-2024-09872',
    trxId: 'trx_2c8d1e9f',
    valor: 2490.00,
    reembolsadoValor: 0,
    cliente: 'Beatriz Lima',
    email: 'beatriz@email.com',
    sistema: 'Sistema Core',
    checkout: 'Checkout Pagar.Me Padrão',
    gateway: 'Cielo Principal',
    status: 'Chargeback',
    metodo: 'Cartão',
    brand: 'Elo',
    last4: '9031',
    tempo: 'há 31 min',
    dataAbs: '19/05/2026 08:53'
  },
  {
    id: 'ORD-2024-09871',
    trxId: 'trx_7b9c1d5a',
    valor: 579.90,
    reembolsadoValor: 0,
    cliente: 'João Martins',
    email: 'joao@email.com',
    sistema: 'Church',
    checkout: 'Checkout PIX BB',
    gateway: 'Asaas Principal',
    status: 'Em análise',
    metodo: 'Boleto',
    brand: 'Banco do Brasil',
    last4: '',
    tempo: 'há 40 min',
    dataAbs: '19/05/2026 08:44'
  }
];

const ORDER_STATUS_LABEL: Record<string, string> = {
  approved: 'Aprovado', pending: 'Pendente', failed: 'Falhou',
  refunded: 'Reembolsado', chargeback: 'Chargeback', cancelled: 'Cancelado',
};

function apiOrderToPage(o: any) {
  return {
    id: o.uuid || `ORD-${o.id}`,
    trxId: o.external_order_id || `trx_${(o.uuid || o.id).toString().substring(0, 8)}`,
    valor: (o.amount ?? 0) / 100,
    reembolsadoValor: 0,
    cliente: o.customer_name || '—',
    email: o.customer_email || '',
    sistema: o.system_name || '—',
    checkout: '—',
    gateway: '—',
    status: ORDER_STATUS_LABEL[o.status] || o.status || '—',
    metodo: o.payment_method || o.method || '—',
    brand: '',
    last4: '',
    tempo: '—',
    dataAbs: o.created_at ? new Date(o.created_at).toLocaleString('pt-BR') : '—',
  };
}

export default function SalesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('Hoje');
  const [filterSystem, setFilterSystem] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterMethod, setFilterMethod] = useState('Todos');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/v1/dashboard/orders');
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data.map(apiOrderToPage));
      } else {
        setError(res.error?.message || 'Erro ao carregar pedidos');
      }
    } catch {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Refund Modal State
  const [refundingOrder, setRefundingOrder] = useState<any | null>(null);
  const [refundType, setRefundType] = useState<'total' | 'parcial'>('total');
  const [refundAmount, setRefundAmount] = useState('');
  
  // Row options menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');

  // Trigger quick success alert
  const triggerSuccessAlert = (message: string) => {
    setSuccessAlert(message);
    setTimeout(() => setSuccessAlert(null), 4000);
  };

  // Handle single order refund confirm
  const handleConfirmRefund = () => {
    if (!refundingOrder) return;
    const finalAmount = refundType === 'total' ? refundingOrder.valor : parseFloat(refundAmount);
    
    if (isNaN(finalAmount) || finalAmount <= 0 || finalAmount > refundingOrder.valor) {
      alert('Valor de reembolso inválido.');
      return;
    }

    setOrders(prev => prev.map(o => {
      if (o.id === refundingOrder.id) {
        return {
          ...o,
          status: 'Reembolsado',
          reembolsadoValor: finalAmount,
          tempo: 'há 1 min'
        };
      }
      return o;
    }));

    triggerSuccessAlert(`Reembolso de R$ ${finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} efetuado para o pedido ${refundingOrder.id}.`);
    setRefundingOrder(null);
    setRefundAmount('');
  };

  // Bulk actions logic
  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (action === 'exportar') {
      handleDirectExport();
    } else if (action === 'revisao') {
      triggerSuccessAlert(`${selectedIds.length} pedidos marcados para revisão manual.`);
    } else if (action === 'webhook') {
      triggerSuccessAlert(`Webhooks reenviados com sucesso para ${selectedIds.length} transações.`);
    } else if (action === 'recibo') {
      triggerSuccessAlert(`Recibos de e-mail disparados para ${selectedIds.length} clientes.`);
    }
    // We do not clear selectedIds if they clicked export, since we might want to export only those.
    if (action !== 'exportar') setSelectedIds([]);
  };

  const handleDirectExport = () => {
    triggerSuccessAlert(`Preparando exportação em formato PDF...`);

    // Determine which orders to export (all filtered or just selected)
    const exportData = selectedIds.length > 0 
      ? filteredOrders.filter(o => selectedIds.includes(o.id)) 
      : filteredOrders;

    setTimeout(() => {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(109, 40, 217);
      doc.text('Basileia Pay - Relatório de Vendas', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(124, 58, 237);
      doc.text('Acompanhamento Operacional de Transações', 14, 30);
      
      doc.setFontSize(9);
      doc.setTextColor(88, 28, 135);
      doc.text(`Período: ${filterPeriod}`, 14, 40);
      doc.text(`Data de Geração: ${new Date().toLocaleString()}`, 14, 45);
      doc.text(`Total de Registros: ${exportData.length}`, 100, 40);

      autoTable(doc, {
        startY: 55,
        head: [['ID', 'Cliente', 'Status', 'Método', 'Valor', 'Data']],
        body: exportData.length > 0 ? exportData.map(o => [
          o.id,
          o.cliente,
          o.status,
          o.metodo,
          `R$ ${o.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          o.dataAbs
        ]) : [['Nenhum pedido encontrado', '-', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [250, 245, 255], textColor: [88, 28, 135] },
        styles: { fontSize: 8 }
      });

      doc.save(`relatorio_vendas_${Date.now()}.pdf`);
      triggerSuccessAlert("Download do PDF concluído com sucesso!");
    }, 1000);
  };

  // Filter systems & list
  const uniqueSystems = useMemo(() => ['Todos', ...new Set(orders.map(o => o.sistema).filter(Boolean))], [orders]);
  const uniqueStatuses = useMemo(() => ['Todos', ...new Set(orders.map(o => o.status).filter(Boolean))], [orders]);
  const uniqueMethods = useMemo(() => ['Todos', ...new Set(orders.map(o => o.metodo).filter(Boolean))], [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchQuery = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchSystem = filterSystem === 'Todos' || o.sistema === filterSystem;
      const matchStatus = filterStatus === 'Todos' || o.status === filterStatus;
      const matchMethod = filterMethod === 'Todos' || o.metodo === filterMethod;

      return matchQuery && matchSystem && matchStatus && matchMethod;
    });
  }, [orders, searchQuery, filterSystem, filterStatus, filterMethod]);

  // Pagination calculation
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const displayOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(0, itemsPerPage);
  }, [filteredOrders, currentPage]);

  const toggleSelectAll = () => {
    if (selectedIds.length === displayOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayOrders.map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      


      {/* 2. Live Notifications */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white p-3.5 rounded-2xl shadow-xl shadow-green-900/10 flex items-center justify-between gap-3 max-w-sm border border-green-400 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-white" />
            <span className="text-[11.5px] font-bold">{successAlert}</span>
          </div>
          <button onClick={() => setSuccessAlert(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Refund Confirmation Modal */}
      {refundingOrder && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <Scale className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Conciliação: Reembolsar Transação</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF8FF] border border-[#E8DDFD]/60 p-3.5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">Pedido / Cliente</p>
                <p className="text-slate-950 font-black text-[13px] mt-1.5">{refundingOrder.id}</p>
                <p className="text-slate-500 font-semibold text-[11px] mt-0.5">{refundingOrder.cliente} ({refundingOrder.email})</p>
                
                <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Valor Original:</span>
                  <span className="text-slate-900 font-black">
                    R$ {refundingOrder.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Modalidade do Reembolso</label>
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
                    Integral (100%)
                  </button>
                  <button
                    onClick={() => setRefundType('parcial')}
                    className={cn(
                      "p-2.5 rounded-xl border text-center font-bold text-xs transition-all",
                      refundType === 'parcial' 
                        ? "bg-brand/10 border-brand/40 text-brand"
                        : "bg-white border-slate-200 text-slate-655 hover:bg-slate-50"
                    )}
                  >
                    Parcial (Parcial)
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
                  <p className="text-[9.5px] font-bold text-slate-400 leading-none">O valor não pode exceder o total original de R$ {refundingOrder.valor.toLocaleString('pt-BR')}.</p>
                </div>
              )}

              <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-[10.5px] font-bold text-red-700 leading-tight">
                ⚠️ <span className="font-black">Atenção:</span> Esta ação é irreversível. O valor será estornado diretamente na conta do cliente junto ao gateway <span className="font-black">{refundingOrder.gateway}</span>.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setRefundingOrder(null); setRefundAmount(''); }}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRefund}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep transition-all rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Confirmar Estorno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Page Header */}
      <header className="flex items-center justify-between w-full px-1 shrink-0">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[23px] 2xl:text-[25px] font-black tracking-tighter text-slate-950 leading-none">Vendas</h1>
            <ShoppingBag className="w-4 h-4 text-brand-accent mt-0.5" />
          </div>
          <p className="text-slate/50 font-bold text-[11px] 2xl:text-[12px] tracking-tight">
            Acompanhe pedidos, pagamentos, reembolsos e ocorrências operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleDirectExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E8DDFD] rounded-xl text-[10px] 2xl:text-[11px] font-black text-slate-700 shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-[34px] 2xl:h-[36px]"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Exportar
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          </button>
          
          <button 
            onClick={() => triggerSuccessAlert('Abertura do módulo de conciliação financeira...')}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand text-white rounded-xl text-[10px] 2xl:text-[11px] font-black shadow-lg shadow-brand/10 hover:shadow-brand/35 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight h-[34px] 2xl:h-[36px]"
          >
            <Scale className="w-3.5 h-3.5 text-white/80" />
            Conciliação
          </button>
        </div>
      </header>

      {/* 5. Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3.5 shadow-sm flex flex-col gap-3 shrink-0">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          {/* Main search */}
          <div className="flex-1 relative w-full text-left">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Buscar Termo</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por pedido, cliente ou transação"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand h-[34px]"
              />
            </div>
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto text-left">
            
            {/* Period */}
            <div className="flex flex-col min-w-[100px]">
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

            {/* System */}
            <div className="flex flex-col min-w-[110px]">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Sistema</span>
              <div className="relative">
                <select
                  value={filterSystem}
                  onChange={(e) => { setFilterSystem(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
                >
                  {uniqueSystems.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col min-w-[100px]">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Status</span>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
                >
                  {uniqueStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Method */}
            <div className="flex flex-col min-w-[100px]">
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

            {/* Result count */}
            <div className="ml-auto pl-4 text-right shrink-0">
              <span className="text-[12.5px] font-black text-slate-700 block">{filteredOrders.length}</span>
              <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider leading-none">resultados</span>
            </div>

          </div>
        </div>

        {/* 6. Bulk Action Toolbar */}
        <div className="border-t border-slate-100 pt-2 flex items-center gap-3 select-none">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={displayOrders.length > 0 && selectedIds.length === displayOrders.length}
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
              <option value="revisao">Marcar para revisão</option>
              <option value="recibo">Reenviar recibo</option>
              <option value="webhook">Reenviar webhook</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 7. Real State Rendering */}
      {loading && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-20 flex flex-col items-center justify-center gap-4 shadow-sm h-[320px]">
          <Loader2 className="animate-spin text-brand w-8 h-8" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Carregando transações...</p>
        </div>
      )}

      {!loading && error && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-16 flex flex-col items-center justify-center text-center gap-3 shadow-sm h-[320px]">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-950 font-black text-[13.5px]">Erro de Conexão com API</h3>
            <p className="text-slate-400 font-bold text-[11.5px] mt-0.5">{error}</p>
          </div>
          <button 
            onClick={fetchOrders}
            className="mt-2 px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase tracking-tight transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-16 flex flex-col items-center justify-center text-center gap-3 shadow-sm h-[320px]">
          <div className="w-12 h-12 bg-brand-soft/50 rounded-full flex items-center justify-center text-brand">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-950 font-black text-[13.5px]">Nenhuma venda encontrada</h3>
            <p className="text-slate-400 font-bold text-[11.5px] mt-0.5">As vendas criadas pelos sistemas conectados aparecerão aqui.</p>
          </div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          {/* 8. Main Dynamic Orders Table */}
          <div className="w-full bg-white rounded-3xl border border-[#E8DDFD] overflow-hidden shadow-sm shrink-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-[#E8DDFD]/60 bg-[#FAF8FF]/60 select-none">
                    <th className="w-[40px] px-2 py-3 text-center"></th>
                    <th className="w-[13%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Pedido</th>
                    <th className="w-[8%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Valor</th>
                    <th className="w-[13%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Cliente</th>
                    <th className="w-[18%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Origem</th>
                    <th className="w-[12%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Pagamento</th>
                    <th className="w-[10%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="w-[11%] px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Data</th>
                    <th className="w-[12%] pr-4 pl-1 py-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DDFD]/40">
                  {displayOrders.map((o) => {
                    const meta = STATUS_META[o.status] || STATUS_META['Em análise'];
                    
                    return (
                      <tr 
                        key={o.id}
                        className={cn(
                          "group hover:bg-brand-50/20 transition-colors h-[64px]",
                          selectedIds.includes(o.id) && "bg-brand-soft/20"
                        )}
                      >
                        {/* Checkbox */}
                        <td className="px-2 py-3 text-center w-[40px] align-middle">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(o.id)}
                            onChange={() => toggleSelect(o.id)}
                            className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer"
                          />
                        </td>

                        {/* Pedido */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0">
                            <Link 
                              href={`/dashboard/orders/${o.id}`}
                              className="block font-black text-slate-950 text-[12.5px] hover:text-brand transition-colors whitespace-nowrap"
                            >
                              #{o.id}
                            </Link>
                            <span className="text-[9.5px] font-mono font-semibold text-slate-400 block mt-0.5 truncate">
                              {o.trxId}
                            </span>
                          </div>
                        </td>

                        {/* Valor */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0">
                            <span className="block font-black text-slate-950 text-[13px] whitespace-nowrap">
                              R$ {o.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            {o.reembolsadoValor > 0 && (
                              <span className="text-[9.5px] font-bold text-blue-650 block mt-0.5 truncate">
                                Estorno: R$ {o.reembolsadoValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0">
                            <span className="block font-black text-slate-900 text-[12.5px] truncate" title={o.cliente}>
                              {o.cliente}
                            </span>
                            <span className="text-[9.5px] font-bold text-slate-400 block mt-0.5 truncate" title={o.email}>
                              {o.email}
                            </span>
                          </div>
                        </td>

                        {/* Origem (Sistema, Checkout, Gateway) */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0 text-[11px] font-bold text-slate-500">
                            <span className="block font-black text-slate-800 truncate" title={o.sistema}>
                              {o.sistema}
                            </span>
                            <span className="text-[10px] text-slate-455 block mt-0.5 truncate" title={o.checkout}>
                              {o.checkout}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5 truncate" title={o.gateway}>
                              {o.gateway}
                            </span>
                          </div>
                        </td>

                        {/* Pagamento */}
                        <td className="px-3 py-3 align-middle">
                          <div className="leading-tight min-w-0 text-[11px] font-bold text-slate-500">
                            {o.metodo === 'Cartão' ? (
                              <>
                                <span className="block font-black text-slate-800 whitespace-nowrap">
                                  {o.metodo} · {o.brand}
                                </span>
                                {o.last4 && (
                                  <span className="text-[10px] text-slate-450 block mt-0.5">
                                    •••• {o.last4}
                                  </span>
                                )}
                              </>
                            ) : o.metodo === 'PIX' ? (
                              <>
                                <span className="block font-black text-slate-800">
                                  PIX
                                </span>
                                <span className="text-[10px] text-slate-450 block mt-0.5 truncate">
                                  {o.brand || 'Banco do Brasil'}
                                </span>
                              </>
                            ) : (
                              <span className="block font-black text-slate-800">
                                Boleto
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 align-middle">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border shadow-sm",
                            meta.text, meta.bg, meta.border
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", meta.dot)} />
                            {meta.label}
                          </span>
                        </td>

                        {/* Data */}
                        <td className="px-3 py-3 align-middle">
                          <div className="flex flex-col leading-tight text-left">
                            <span className="whitespace-nowrap text-sm font-black text-slate-900">
                              {o.tempo === 'há 12 min' ? 'Hoje, 09:12' : 
                               o.tempo === 'há 18 min' ? 'Hoje, 09:06' :
                               o.tempo === 'há 19 min' ? 'Hoje, 09:05' :
                               o.tempo === 'há 25 min' ? 'Hoje, 08:59' :
                               o.tempo === 'há 31 min' ? 'Hoje, 08:53' :
                               o.tempo === 'há 40 min' ? 'Hoje, 08:44' : o.tempo}
                            </span>
                            <span className="whitespace-nowrap text-[11px] font-semibold text-slate-400 mt-0.5">
                              {o.tempo}
                            </span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="px-3 py-3 text-right align-middle">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            
                            <Link 
                              href={`/dashboard/orders/${o.id}`}
                              className="h-9 rounded-xl border border-[#E8DDFD] bg-white px-4 text-[12px] font-black text-slate-700 shadow-sm flex items-center justify-center transition-all hover:bg-brand-soft/40 hover:text-brand"
                            >
                              Detalhes
                            </Link>

                            {/* Options dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setActiveMenuId(activeMenuId === o.id ? null : o.id)}
                                className={cn(
                                  "flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DDFD] bg-white text-slate-500 hover:text-brand shadow-sm transition-colors",
                                  activeMenuId === o.id && "border-brand/40 text-brand bg-slate-50"
                                )}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {activeMenuId === o.id && (
                                <div className="absolute right-0 top-full z-30 mt-2 w-[200px] rounded-2xl border border-[#E8DDFD] bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                                  {o.status === 'Aprovado' && (
                                    <button
                                      onClick={() => { setRefundingOrder(o); setActiveMenuId(null); }}
                                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                    >
                                      <Scale className="h-4 w-4 text-slate-400 shrink-0" />
                                      Reembolsar
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { triggerSuccessAlert('Sincronização de webhook reenviada com sucesso!'); setActiveMenuId(null); }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                  >
                                    <Zap className="h-4 w-4 text-slate-400 shrink-0" />
                                    Reenviar webhook
                                  </button>
                                  <button
                                    onClick={() => { triggerSuccessAlert('Novo incidente operacional aberto no Trust Layer.'); setActiveMenuId(null); }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                  >
                                    <AlertTriangle className="h-4 w-4 text-slate-400 shrink-0" />
                                    Abrir incidente
                                  </button>
                                  <button
                                    onClick={() => { triggerSuccessAlert('Carregando timeline do pedido...'); setActiveMenuId(null); }}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-semibold text-slate-705 hover:bg-slate-50 transition-colors"
                                  >
                                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                    Timeline
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
              Mostrando <span className="text-slate-700">1 a 5</span> de <span className="text-slate-700">1.740</span> resultados
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

          {/* 10. Bottom Diagnostics and Financial Grid */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3 w-full select-none">
            
            {/* Card 1: Resumo Financeiro */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300 h-[210px] text-left">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 leading-none">Resumo Financeiro</span>
                
                <div className="grid grid-cols-4 gap-1 mt-1 shrink-0">
                  {[
                    { label: 'Aprovadas', count: 1248, valor: 'R$ 1.265.890,40', bg: 'bg-green-50/30 border-green-100 text-green-700' },
                    { label: 'Pendentes', count: 312, valor: 'R$ 86.930,20', bg: 'bg-amber-50/30 border-amber-100 text-amber-750' },
                    { label: 'Falhadas', count: 96, valor: 'R$ 18.420,90', bg: 'bg-red-50/30 border-red-100 text-red-700' },
                    { label: 'Estornadas', count: 84, valor: 'R$ 75.230,60', bg: 'bg-blue-50/30 border-blue-100 text-blue-700' },
                  ].map((st) => (
                    <div 
                      key={st.label}
                      className={cn(
                        "flex flex-col items-center justify-between p-1 rounded-xl border text-center transition-all hover:scale-[1.02] shadow-sm h-[58px]",
                        st.bg
                      )}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[12.5px] font-black text-slate-900 leading-none">{st.count}</span>
                        <span className="text-[8.5px] font-bold text-slate-500 leading-none mt-0.5">{st.label}</span>
                      </div>
                      <span className="text-[7.5px] font-black text-slate-400 block mt-0.5 truncate max-w-full">{st.valor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Segmented Color Progress Bar representing distribution */}
              <div className="mt-2.5 pt-2 border-t border-slate-100">
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200/50">
                  <div className="h-full bg-green-500 transition-all" style={{ width: '75%' }} title="Aprovadas (75%)" />
                  <div className="h-full bg-amber-500 transition-all" style={{ width: '12.5%' }} title="Pendentes (12.5%)" />
                  <div className="h-full bg-red-500 transition-all" style={{ width: '6.5%' }} title="Falhadas (6.5%)" />
                  <div className="h-full bg-blue-500 transition-all" style={{ width: '6%' }} title="Reembolsadas (6%)" />
                </div>
                <div className="flex justify-between items-center mt-2 text-[10.5px]">
                  <span className="text-slate-400 font-bold">Total Transacionado:</span>
                  <span className="text-brand font-black text-[12px]">R$ 1.446.472,10</span>
                </div>
              </div>
            </div>

            {/* Card 2: Ocorrências Recentes */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300 h-[210px] text-left">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 leading-none">Ocorrências Recentes</span>
                
                <div className="space-y-1.5 mt-1 max-h-[145px] overflow-y-auto no-scrollbar">
                  {[
                    { text: 'Reembolso executado — #ORD-09873', detail: 'R$ 199,90 via PIX - Banco do Brasil', time: 'há 12 min', tag: 'Estorno', bg: 'bg-blue-50 border-blue-200/50 text-blue-700' },
                    { text: 'Pagamento recusado — #ORD-09874', detail: 'Cartão recusado - Stripe Global', time: 'há 19 min', tag: 'Falhou', bg: 'bg-red-50 border-red-200/50 text-red-700' },
                    { text: 'Pedido aprovado — #ORD-09876', detail: 'R$ 1.259,90 via Cartão - Asaas Principal', time: 'há 12 min', tag: 'Aprovado', bg: 'bg-green-50 border-green-200/50 text-green-700' },
                    { text: 'Análise manual concluída — #ORD-09871', detail: 'Boleto validado e liberado', time: 'há 40 min', tag: 'Análise', bg: 'bg-violet-50 border-violet-200/50 text-violet-750' }
                  ].slice(0, 3).map((e, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="min-w-0 leading-tight">
                        <p className="text-[10px] font-black text-slate-900 truncate">{e.text}</p>
                        <p className="text-[8.5px] font-bold text-slate-400 mt-0.5 truncate">{e.detail}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                        <span className={cn("px-1.5 py-0.5 rounded-md text-[7.5px] font-black uppercase tracking-tight", e.bg)}>{e.tag}</span>
                        <span className="text-[8px] font-bold text-slate-400">{e.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-1 pt-1 border-t border-slate-100 text-right">
                <button 
                  onClick={() => triggerSuccessAlert('Exibindo histórico completo de logs operacionais...')}
                  className="text-[9px] font-black text-brand hover:text-brand-deep hover:underline inline-flex items-center gap-0.5 uppercase tracking-wider"
                >
                  Ver todas as ocorrências <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Card 3: Pontos de Atenção */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300 h-[210px] text-left">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2 leading-none">Pontos de Atenção</span>
                
                <div className="space-y-1.5 max-h-[145px] overflow-y-auto no-scrollbar">
                  {[
                    { label: '78 pedidos pendentes acima de 30 minutos', info: 'Total pendente: R$ 23.450,70', action: 'Ver' },
                    { label: '1 gateway com falhas concentradas', info: 'Stripe Global - 24 falhas nas últimas 2h', action: 'Ver' },
                    { label: '2 reembolsos aguardam captura', info: 'Valor total: R$ 1.459,80', action: 'Ver' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-xl border border-amber-100 bg-amber-50/10 hover:bg-amber-50/20 transition-all">
                      <div className="min-w-0 leading-tight">
                        <p className="text-[9.5px] font-black text-slate-800 truncate">{item.label}</p>
                        <p className="text-[8.5px] font-bold text-slate-400 mt-0.5 truncate">{item.info}</p>
                      </div>
                      <button 
                        onClick={() => triggerSuccessAlert(`Filtrando por: ${item.label}`)}
                        className="shrink-0 px-2 py-1 bg-white border border-[#E8DDFD] hover:bg-brand-soft rounded-lg text-[8px] font-black text-brand uppercase tracking-tight shadow-sm"
                      >
                        {item.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
      {/* Export Modal Removed - direct PDF download enabled */}

    </div>
  );
}

// Dummy MailIcon component for options dropdown
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2050/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
