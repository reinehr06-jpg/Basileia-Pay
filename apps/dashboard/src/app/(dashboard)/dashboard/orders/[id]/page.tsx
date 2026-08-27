'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronRight, 
  Scale, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  User, 
  CreditCard, 
  Database,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Send,
  ShoppingBag,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Detailed order mock data mapper
const ORDER_DETAILS_MAP: Record<string, any> = {
  'ORD-2024-09876': {
    id: 'ORD-2024-09876',
    trxId: 'trx_8f3a2d7e',
    valorTotal: 1259.90,
    valorLiquido: 1198.61,
    taxa: 61.29,
    taxaDesc: 'Asaas • 4,87%',
    gateway: 'Asaas Principal',
    status: 'Aprovado',
    ambiente: 'Produção',
    sistema: 'Sistema Core',
    metodo: 'Cartão',
    brand: 'Mastercard',
    last4: '4022',
    criadoEm: '19/05/2026 09:12:03',
    aprovadoEm: '19/05/2026 09:12:41',
    risco: 'Baixo (2.1%)',
    cliente: {
      nome: 'Mariana Souza',
      email: 'mariana@gmail.com',
      telefone: '+55 (11) 98765-4321',
      doc: 'CPF 321.654.987-09',
      ip: '189.12.34.56',
      origem: 'Web Desktop',
      local: 'São Paulo / SP',
      cliId: 'CLI-2024-005782',
      extId: 'usr_8f3a2d7e9b1c'
    },
    itens: [
      { nome: 'Fone de Ouvido Pro', sku: 'FON-PRO-01', qtd: 1, preco: 899.90 },
      { nome: 'Capa Protetora Premium', sku: 'CAP-PRO-02', qtd: 1, preco: 360.00 }
    ],
    timeline: [
      { time: '09:12:48', title: 'Confirmação enviada', desc: 'Sinal de transação validada repassado ao Sistema Core.', status: 'success' },
      { time: '09:12:45', title: 'Webhook recebido', desc: 'Asaas disparou gatilho "payment.authorized".', status: 'success' },
      { time: '09:12:41', title: 'Captura concluída', desc: 'Valor total capturado e conciliado com sucesso.', status: 'success' },
      { time: '09:12:36', title: 'Autorização aprovada', desc: 'Adquirente Banco do Brasil aprovou o limite.', status: 'success' },
      { time: '09:12:35', title: 'Tentativa de pagamento', desc: 'Disparada transação com token de cartão mascarado.', status: 'pending' },
      { time: '09:12:08', title: 'Checkout iniciado', desc: 'Página de checkout visualizada no domínio core.pag.', status: 'info' },
      { time: '09:12:03', title: 'Pedido criado', desc: 'Sessão de pagamento gerada pelo sistema de origem.', status: 'info' }
    ],
    tentativas: [
      { id: '#3 Final', gateway: 'Asaas', metodo: 'Cartão Mastercard •••• 4022', status: 'Aprovada', resposta: 'Autorizado', codigo: '00', adq: 'Banco do Brasil', hora: '09:12:35' },
      { id: '#2', gateway: 'Asaas', metodo: 'Cartão Mastercard •••• 4022', status: 'Recusada', resposta: 'Do not honor', codigo: '05', adq: 'Banco do Brasil', hora: '09:12:28' }
    ],
    webhook: {
      evento: 'payment.authorized',
      endpoint: '/webhooks/asaas',
      status: '200 OK',
      tentativas: 1,
      origem: 'Asaas API v3',
      horario: '19/05/2026 09:12:45',
      payload: {
        event: 'payment.authorized',
        id: 'evt_asaas_8f32a7e2',
        created_at: '2026-05-19T09:12:45Z',
        data: {
          transaction: {
            id: 'trx_8f3a2d7e',
            amount: 125990,
            currency: 'BRL',
            payment_method: 'credit_card',
            card: {
              brand: 'Mastercard',
              last_four_digits: '4022',
              holder_name: 'MARIANA SOUZA'
            }
          }
        }
      }
    },
    auditoria: [
      { acao: 'Pedido criado pelo sistema', user: 'API (Token)', data: '19/05/2026 09:12:03', ip: '189.12.34.56', desc: 'Origem via rota /v1/orders' },
      { acao: 'Pagamento aprovado pelo gateway', user: 'Asaas Engine', data: '19/05/2026 09:12:41', ip: '18.231.11.90', desc: 'Autenticação de adquirente concluída' },
      { acao: 'Confirmação enviada', user: 'Webhook Dispatcher', data: '19/05/2026 09:12:48', ip: 'System', desc: 'Status code HTTP 200 retornado pelo endpoint' }
    ],
    notasCliente: 'Gostaria que o envio fosse feito em embalagem ecológica se possível.'
  }
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const order = ORDER_DETAILS_MAP[orderId] || ORDER_DETAILS_MAP['ORD-2024-09876'];

  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  
  // Custom Notes State
  const [internalNotes, setInternalNotes] = useState<string[]>([
    'Cliente entrou em contato para confirmar se a mentoria já foi liberada por e-mail.',
    'Suporte técnico validou o cadastro manual.'
  ]);
  const [newNote, setNewNote] = useState('');

  // Refund Modal State
  const [showRefund, setShowRefund] = useState(false);
  const [refundType, setRefundType] = useState<'total' | 'parcial'>('total');
  const [refundAmount, setRefundAmount] = useState('');
  
  // Order status state (simulate refund locally)
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [refundedValue, setRefundedValue] = useState(0);

  const triggerSuccessAlert = (message: string) => {
    setSuccessAlert(message);
    setTimeout(() => setSuccessAlert(null), 4000);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setInternalNotes(prev => [...prev, newNote.trim()]);
    setNewNote('');
    triggerSuccessAlert('Observação interna adicionada com sucesso!');
  };

  const handleConfirmRefund = () => {
    const finalAmount = refundType === 'total' ? order.valorTotal : parseFloat(refundAmount);
    
    if (isNaN(finalAmount) || finalAmount <= 0 || finalAmount > order.valorTotal) {
      alert('Valor de reembolso inválido.');
      return;
    }

    setOrderStatus('Reembolsado');
    setRefundedValue(finalAmount);
    triggerSuccessAlert(`Reembolso de R$ ${finalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} processado com sucesso.`);
    setShowRefund(false);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(order.webhook.payload, null, 2));
    triggerSuccessAlert('JSON do Webhook copiado para a área de transferência!');
  };

  return (
    <main className="min-w-0 w-full animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col gap-4 relative pt-4 pb-4 text-left">
      
      {/* Success Notifications */}
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

      {/* Reusable Refund Confirmation Modal */}
      {showRefund && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <Scale className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Estornar Recebimento do Cliente</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF8FF] border border-[#E8DDFD]/60 p-3.5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">Pedido / ID</p>
                <p className="text-slate-950 font-black text-[13px] mt-1.5">{order.id}</p>
                <p className="text-slate-500 font-semibold text-[11px] mt-0.5">{order.cliente?.nome}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-200/50 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Valor do Pedido:</span>
                  <span className="text-slate-900 font-black">
                    R$ {order.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-55"
                    )}
                  >
                    Integral (R$ {order.valorTotal.toLocaleString('pt-BR')})
                  </button>
                  <button
                    onClick={() => setRefundType('parcial')}
                    className={cn(
                      "p-2.5 rounded-xl border text-center font-bold text-xs transition-all",
                      refundType === 'parcial' 
                        ? "bg-brand/10 border-brand/40 text-brand"
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-55"
                    )}
                  >
                    Parcial (Personalizado)
                  </button>
                </div>
              </div>

              {refundType === 'parcial' && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Valor a ser Estornado (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full bg-white border border-[#E8DDFD] rounded-xl pl-8 pr-4 py-2 text-xs font-bold text-slate-950 focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              )}

              <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-[10.5px] font-bold text-red-700 leading-tight">
                ⚠️ <span className="font-black">Aviso do Trust Layer:</span> O reembolso será enviado imediatamente para a API do gateway <span className="font-black">{order.gateway}</span> e creditado de volta na conta ou cartão do cliente.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => { setShowRefund(false); setRefundAmount(''); }}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-55 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
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

      {/* 1. Header with Breadcrumb and Action buttons */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between w-full px-1 shrink-0 gap-3">
        <div className="space-y-0.5">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-[9px] font-black text-slate-450 uppercase tracking-widest leading-none mb-1">
            <Link href="/dashboard/orders" className="hover:text-brand transition-colors text-slate-400">Vendas</Link>
            <ChevronRight className="w-2.5 h-2.5 text-slate-350" />
            <span className="text-slate-550 font-bold">Detalhe</span>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href="/dashboard/orders"
              className="w-7 h-7 rounded-xl border border-[#E8DDFD] bg-white flex items-center justify-center text-slate-500 hover:text-brand transition-all shadow-sm hover:scale-105 active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <h1 className="text-[19px] 2xl:text-[21px] font-black tracking-tighter text-slate-950 leading-none">
              Pedido {order.id}
            </h1>
            
            {/* Badges */}
            <div className="flex items-center gap-1 ml-1.5">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase border shadow-sm",
                orderStatus === 'Aprovado' && "bg-green-50 border-green-200/50 text-green-700",
                orderStatus === 'Reembolsado' && "bg-blue-50 border-blue-200/50 text-blue-700",
                orderStatus === 'Pendente' && "bg-amber-50 border-amber-200/50 text-amber-700"
              )}>
                {orderStatus}
              </span>
              <span className="bg-slate-100 text-slate-600 border border-slate-200/60 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase">
                {order.sistema}
              </span>
              <span className="bg-green-50 text-green-700 border border-green-200/60 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase">
                {order.ambiente}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Action controls */}
        <div className="flex items-center gap-1.5">
          {orderStatus === 'Aprovado' ? (
            <button 
              onClick={() => setShowRefund(true)}
              className="flex items-center gap-1 px-3 py-1 bg-white border border-red-200 rounded-xl text-[9.5px] 2xl:text-[10px] font-black text-red-650 shadow-sm hover:bg-red-50 transition-all uppercase tracking-tight h-8"
            >
              <Scale className="w-3.5 h-3.5" />
              Reembolsar
            </button>
          ) : (
            <button 
              disabled
              className="flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-[9.5px] 2xl:text-[10px] font-black text-slate-350 cursor-not-allowed uppercase tracking-tight h-8"
            >
              <Scale className="w-3.5 h-3.5" />
              Reembolsar
            </button>
          )}

          <button 
            onClick={() => triggerSuccessAlert('Webhook reenviado com sucesso para o endpoint do Sistema Core!')}
            className="flex items-center gap-1 px-3 py-1 bg-white border border-[#E8DDFD] rounded-xl text-[9.5px] 2xl:text-[10px] font-black text-slate-700 shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-8"
          >
            <Zap className="w-3.5 h-3.5 text-brand" />
            Reenviar Webhook
          </button>

          <button 
            onClick={() => triggerSuccessAlert('Alerta de segurança/suporte aberto junto ao Trust Layer!')}
            className="flex items-center gap-1 px-3 py-1 bg-white border border-[#E8DDFD] rounded-xl text-[9.5px] 2xl:text-[10px] font-black text-slate-700 shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-8"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Abrir Incidente
          </button>
        </div>
      </header>

      {/* 2. Grid of Financial Highlights */}
      <div className="grid grid-cols-4 gap-4 xl:grid-cols-8 w-full">
        {[
          { label: 'Valor total', value: `R$ ${order.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-slate-950' },
          { label: 'Valor líquido', value: `R$ ${order.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-green-700' },
          { label: 'Taxa / Gateway', value: order.taxaDesc, color: 'text-slate-750' },
          { label: 'Forma de pagamento', value: `${order.brand} •••• ${order.last4}`, color: 'text-slate-750' },
          { label: 'Status atual', value: orderStatus, color: 'text-brand font-black' },
          { label: 'Criado em', value: '19/05 09:12', color: 'text-slate-700' },
          { label: 'Aprovado em', value: '19/05 09:12', color: 'text-slate-700' },
          { label: 'Risco / Fraude', value: order.risco, color: 'text-green-600' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-[#E8DDFD] p-3 text-left leading-tight shadow-sm hover:scale-[1.02] transition-all flex flex-col justify-center min-h-[58px]">
            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{item.label}</span>
            <span className={cn("text-[11px] xl:text-[12px] font-black block truncate", item.color)}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* 3. Main Grid layout: 8 Parts Left / 4 Parts Right */}
      <div className="grid grid-cols-12 gap-5 w-full">
        
        {/* Left Side: 8 Columns */}
        <div className="col-span-8 space-y-5">
          
          {/* Card: Client Profile details */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD]/60 p-[20px] shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-brand-accent" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">Perfil Completo do Cliente</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-slate-505">
              <div className="space-y-2">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Nome Completo</span>
                  <span className="text-slate-900 font-black text-[12.5px]">{order.cliente.nome}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block">E-mail de Contato</span>
                  <span className="text-slate-750 font-black">{order.cliente.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Documento Identificador</span>
                  <span className="text-slate-750 font-black">{order.cliente.doc}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Telefone Celular</span>
                  <span className="text-slate-750 font-black">{order.cliente.telefone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Conexão (IP / Geolocalização)</span>
                  <span className="text-slate-750 font-black">{order.cliente.ip} ({order.cliente.local})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">ID Interno</span>
                    <span className="text-slate-650 font-bold block truncate">{order.cliente.cliId}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">ID Externo</span>
                    <span className="text-slate-650 font-bold block truncate">{order.cliente.extId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Purchased Items - Table layout */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD]/60 p-[20px] shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShoppingBag className="w-4 h-4 text-brand" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">Itens e Produtos Relacionados</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                    <th className="px-4 py-2 text-left">Produto</th>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-center">Quantidade</th>
                    <th className="px-4 py-2 text-right">Preço Unitário</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {order.itens.map((item: any, idx: number) => (
                    <tr key={idx} className="text-slate-700">
                      <td className="px-4 py-2.5 font-black text-slate-900">{item.nome}</td>
                      <td className="px-4 py-2.5 text-slate-400 font-mono">{item.sku}</td>
                      <td className="px-4 py-2.5 text-center">{item.qtd}</td>
                      <td className="px-4 py-2.5 text-right">R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2.5 text-right text-slate-900 font-black">R$ {(item.preco * item.qtd).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summation footer Box */}
            <div className="pt-3 border-t border-slate-100 flex flex-col items-end gap-1 text-xs font-bold text-slate-500">
              <div className="flex justify-between w-64">
                <span>Subtotal dos Itens:</span>
                <span className="text-slate-705 font-black">R$ {order.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between w-64 text-green-600">
                <span>Descontos Aplicados:</span>
                <span>R$ 0,00</span>
              </div>
              <div className="flex justify-between w-64 text-slate-950 font-black text-sm pt-1.5 border-t border-slate-200">
                <span>Valor Total Quitado:</span>
                <span className="text-brand font-black">R$ {order.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Card: Payment Attempts Ledger Table */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD]/60 p-[20px] shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-brand-accent" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">Histórico de Tentativas de Pagamento</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-bold border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                    <th className="px-4 py-2 text-left">Tentativa</th>
                    <th className="px-4 py-2 text-left">Gateway</th>
                    <th className="px-4 py-2 text-left">Método</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Resposta</th>
                    <th className="px-4 py-2 text-left">Código</th>
                    <th className="px-4 py-2 text-left">Adquirente</th>
                    <th className="px-4 py-2 text-right">Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 text-slate-650">
                  {order.tentativas.map((t: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-black text-slate-800">{t.id}</td>
                      <td className="px-4 py-2 font-black text-slate-700">{t.gateway}</td>
                      <td className="px-4 py-2 text-slate-500 font-mono text-[10px]">{t.metodo}</td>
                      <td className="px-4 py-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-black uppercase border",
                          t.status === 'Aprovada' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                        )}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-black">{t.resposta}</td>
                      <td className="px-4 py-2 font-mono text-slate-400">{t.codigo}</td>
                      <td className="px-4 py-2 text-slate-450">{t.adq}</td>
                      <td className="px-4 py-2 text-right text-slate-400">{t.hora}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Internal Operations Notes (Suporte/Ops) - Compacted */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD]/60 p-[20px] shadow-sm flex flex-col space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <FileText className="w-4 h-4 text-brand" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">Observações Internas (Suporte/Ops)</h3>
            </div>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto no-scrollbar">
              {internalNotes.map((note, idx) => (
                <div key={idx} className="bg-slate-50/70 border border-slate-100/50 px-4 py-3 rounded-2xl text-[12px] font-bold text-slate-650 leading-normal">
                  <p className="text-slate-900 font-bold">{note}</p>
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 mt-1 block">
                    Operador • há {idx * 5 + 2} min
                  </span>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Adicionar observação interna..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl px-3 py-1 text-xs font-bold text-slate-900 placeholder:text-slate-450 focus:outline-none focus:border-brand h-8"
              />
              <button
                onClick={handleAddNote}
                className="px-4 bg-brand hover:bg-brand-deep transition-all text-white rounded-xl flex items-center justify-center h-8 shrink-0 text-[11px] font-black uppercase tracking-wider"
              >
                Salvar
              </button>
            </div>
          </div>

          {/* Card: Immutable Audit Trail - Table Fixed with Truncation */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD]/60 p-[20px] shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">Histórico de Auditoria Imutável (Audit Trail)</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-xs font-bold border-collapse text-slate-605">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-wider">
                    <th className="w-[26%] px-4 py-2 text-left">Ação Realizada</th>
                    <th className="w-[16%] px-4 py-2 text-left">Usuário / Agente</th>
                    <th className="w-[14%] px-4 py-2 text-left">Endereço IP</th>
                    <th className="w-[28%] px-4 py-2 text-left">Detalhes Operacionais</th>
                    <th className="w-[16%] px-4 py-2 text-right">Data e Horário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 text-[11px] font-bold">
                  {order.auditoria.map((a: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="min-w-0 px-4 py-3 text-slate-900 font-black">
                        <span className="block truncate" title={a.acao}>{a.acao}</span>
                      </td>
                      <td className="min-w-0 px-4 py-3 text-brand font-black">
                        <span className="block truncate" title={a.user}>{a.user}</span>
                      </td>
                      <td className="min-w-0 px-4 py-3 font-mono text-[10px] text-slate-400">
                        <span className="block truncate" title={a.ip}>{a.ip}</span>
                      </td>
                      <td className="min-w-0 px-4 py-3 text-slate-500 font-medium">
                        <span className="block truncate" title={a.desc}>{a.desc}</span>
                      </td>
                      <td className="min-w-0 px-4 py-3 text-right text-slate-400">
                        <span className="block truncate" title={a.data}>{a.data}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: 4 Columns */}
        <aside className="col-span-4 space-y-5">
          
          {/* Card: Transaction Timeline */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD]/60 p-[20px] shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-brand" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">Linha do Tempo da Transação</h3>
            </div>

            <div className="space-y-3.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100/80">
              {order.timeline.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3 relative pl-6 text-xs font-bold">
                  <div className={cn(
                    "absolute left-1 w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm z-10",
                    item.status === 'success' && "bg-green-500 text-white",
                    item.status === 'pending' && "bg-amber-500 text-white",
                    item.status === 'info' && "bg-brand text-white"
                  )}>
                    {item.status === 'success' && <CheckCircle className="w-2.5 h-2.5" />}
                    {item.status === 'pending' && <AlertCircle className="w-2.5 h-2.5 animate-ping" />}
                    {item.status === 'info' && <FileText className="w-2.5 h-2.5" />}
                  </div>
                  <div className="leading-tight">
                    <p className="text-slate-900 font-black text-[11px]">{item.title}</p>
                    <p className="text-slate-450 font-medium text-[10px] mt-0.5 leading-normal">{item.desc}</p>
                    <span className="text-[8.5px] text-slate-400 font-mono block mt-0.5 uppercase tracking-tight">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Webhook Received - Controlled Height & Max-Height */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD]/60 p-[20px] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-accent" />
                <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">Payload do Webhook</h3>
              </div>
              <button 
                onClick={handleCopyPayload}
                className="w-6.5 h-6.5 bg-[#FAF8FF] border border-[#E8DDFD] hover:bg-brand-soft rounded-lg flex items-center justify-center text-slate-500 hover:text-brand shadow-sm transition-all"
                title="Copiar JSON"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-505">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-[8px] font-black text-slate-400 block uppercase">Evento</span>
                  <span className="text-brand font-black">{order.webhook.evento}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 block uppercase">Endpoint</span>
                  <span className="text-slate-800 font-black truncate block">{order.webhook.endpoint}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 block uppercase">HTTP Response</span>
                  <span className="text-green-600 font-black">{order.webhook.status}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 block uppercase">Tentativas</span>
                  <span className="text-slate-800 font-black">{order.webhook.tentativas}</span>
                </div>
              </div>

              {/* JSON console block with max-h-[220px] scroll */}
              <div className="mt-1 pt-1.5 border-t border-slate-100">
                <span className="text-[8px] font-black text-slate-400 block uppercase mb-1">Payload JSON Recebido</span>
                <pre className="max-h-[220px] overflow-auto rounded-2xl bg-[#0B0F19] p-4 text-[11px] leading-relaxed text-emerald-400 border border-slate-800 shadow-inner">
                  {JSON.stringify(order.webhook.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Card: Customer Notes - Compacted & High-Density */}
          <div className="bg-white rounded-2xl border border-[#E8DDFD]/60 p-[20px] shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-brand-accent" />
              <h3 className="text-slate-950 font-black text-xs uppercase tracking-wider">Notas do Cliente</h3>
            </div>

            <div className="bg-[#FAF8FF] border border-[#E8DDFD]/60 p-3 rounded-xl min-h-[50px] flex flex-col justify-center text-left">
              {order.notasCliente ? (
                <p className="text-[11.5px] font-black text-slate-700 italic leading-relaxed">
                  &ldquo;{order.notasCliente}&rdquo;
                </p>
              ) : (
                <p className="text-[10px] font-bold text-slate-400 text-center italic">
                  Nenhuma nota adicional registrada.
                </p>
              )}
            </div>
            <span className="text-[8px] font-black text-slate-450 block uppercase text-right mt-1">Registrado em 19/05 09:12:08</span>
          </div>

        </aside>

      </div>

    </main>
  );
}
