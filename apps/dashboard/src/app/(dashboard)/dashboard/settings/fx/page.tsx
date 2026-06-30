'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronDown,
  Plus, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Settings2, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  Globe,
  Coins,
  Shield,
  Percent,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  X,
  CreditCard,
  Building,
  Clock,
  Briefcase,
  AlertOctagon
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ActiveTab = 
  | 'visao_geral' 
  | 'taxas_ao_vivo' 
  | 'moedas' 
  | 'markup_spread' 
  | 'trava_cambio' 
  | 'liquidacao' 
  | 'por_checkout' 
  | 'regras_conversao' 
  | 'historico'
  | 'disputas_fx';

export default function FxSettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('visao_geral');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Interactive Live Currency rates state
  const [exchangeRates, setExchangeRates] = useState<any[]>([]);

  // Quick Converter Input State
  const [convertAmount, setConvertAmount] = useState<number>(1000);
  const [selectedConvertCurrency, setSelectedConvertCurrency] = useState<string>('USD');

  // DCC and Hedging settings states
  const [dccActive, setDccActive] = useState(false);
  const [dccWindow, setDccWindow] = useState('30m');
  const [hedgingActive, setHedgingActive] = useState(false);
  const [hedgingThreshold, setHedgingThreshold] = useState(0);
  const [hedgingLogs, setHedgingLogs] = useState<any[]>([]);

  // Whitelisted currencies list state
  const [whitelistedCurrencies, setWhitelistedCurrencies] = useState<any[]>([]);

  // Rounding and tax configs state
  const [roundingRule, setRoundingRule] = useState('.99');
  const [embedIof, setEmbedIof] = useState(false);
  const [importTax, setImportTax] = useState(false);

  // Settlement accounts state
  const [settlementCurrency, setSettlementCurrency] = useState('BRL');
  const [settlementSchedule, setSettlementSchedule] = useState('D+2');
  const [settlementAccount, setSettlementAccount] = useState('');

  // Checkout currency override state
  const [checkoutOverrides, setCheckoutOverrides] = useState<any[]>([]);

  // Live currency feed source
  const [feedSource, setFeedSource] = useState('reuters');

  // Disputas FX states
  const [fxDisputes, setFxDisputes] = useState<any[]>([]);

  const [fxAuditLogs, setFxAuditLogs] = useState<any[]>([]);

  const handleConciliateDispute = (id: string) => {
    setFxDisputes(prev => prev.map(d => {
      if (d.id === id) {
        const newLog = {
          id: `adj_${Date.now()}`,
          user: 'Carlos Oliveira',
          disputeId: d.id,
          variance: d.variance,
          date: '19/05 16:13',
          status: 'Sucesso'
        };
        setFxAuditLogs(prevLogs => [newLog, ...prevLogs]);
        return { ...d, status: 'Conciliado' };
      }
      return d;
    }));
    triggerToast(`Conciliação de variação concluída com sucesso!`);
  };

  // Disputas FX simulator states
  const [disputeAmount, setDisputeAmount] = useState(150);
  const [disputeDateRate, setDisputeDateRate] = useState(5.12);
  const [disputeChargebackRate, setDisputeChargebackRate] = useState(5.28);
  const [calculatedVariance, setCalculatedVariance] = useState<number | null>(null);

  // Modal to add currency
  const [showAddModal, setShowAddModal] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateRates = () => {
    setIsUpdating(true);
    triggerToast("Buscando últimas taxas interbancárias em tempo real...");
    setTimeout(() => {
      setIsUpdating(false);
      setExchangeRates(prev => prev.map(rate => {
        const factor = 1 + (Math.random() * 0.004 - 0.002);
        const newInter = parseFloat((rate.interbank * factor).toFixed(4));
        const newOur = parseFloat((newInter * 1.0243).toFixed(4));
        return {
          ...rate,
          interbank: newInter,
          ourRate: newOur,
          bid: parseFloat((newInter * 0.999).toFixed(4)),
          ask: parseFloat((newInter * 1.001).toFixed(4)),
          var24h: parseFloat((rate.var24h + (Math.random() * 0.1 - 0.05)).toFixed(2))
        };
      }));
      triggerToast("Taxas de câmbio ao vivo atualizadas com sucesso!");
    }, 1200);
  };

  const handleCalculateVariance = () => {
    const diff = disputeChargebackRate - disputeDateRate;
    const lossGained = parseFloat((disputeAmount * diff).toFixed(2));
    setCalculatedVariance(lossGained);
    triggerToast(`Diferença cambial calculada: R$ ${Math.abs(lossGained).toLocaleString('pt-BR')} de ${lossGained >= 0 ? 'perda por volatilidade' : 'economia'}`);
  };

  const handleCreateSimulatedDispute = () => {
    const diff = disputeChargebackRate - disputeDateRate;
    const lossGained = parseFloat((disputeAmount * diff).toFixed(2));
    const newDispute = {
      id: `dsp_098${fxDisputes.length + 2}`,
      txId: `tx_${Math.floor(10000 + Math.random() * 90000)}`,
      currency: 'USD',
      amount: disputeAmount,
      rateCapture: disputeDateRate,
      rateDispute: disputeChargebackRate,
      variance: lossGained,
      status: 'Aguardando Conciliação',
      date: '19/05 16:13'
    };
    setFxDisputes(prev => [newDispute, ...prev]);
    triggerToast("Disputa simulada adicionada à fila de liquidação!");
  };

  // Convert amount based on ourRate of selected currency
  const convertedAmount = (() => {
    const rate = exchangeRates.find(c => c.code === selectedConvertCurrency);
    if (!rate) return 0;
    return convertAmount * rate.ourRate;
  })();

  return (
    <div className="w-full text-left space-y-5 pt-2 pb-12 select-none animate-in fade-in slide-in-from-bottom-2 duration-700">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4.5 shadow-2xl flex items-center gap-2.5 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <span className="w-2.5 h-2.5 bg-brand rounded-full shrink-0 animate-ping" />
          <span className="text-[11.5px] font-black text-left">{toastMessage}</span>
        </div>
      )}

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-[#E8DDFD] w-[380px] rounded-[24px] p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Habilitar Nova Moeda</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Código da Moeda (ex: GBP)</label>
                <input type="text" placeholder="GBP" className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Markup Inicial (%)</label>
                <input type="text" defaultValue="2.45" className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold" />
              </div>
            </div>

            <button 
              onClick={() => {
                setShowAddModal(false);
                triggerToast("Moeda adicionada para aprovação do Compliance.");
              }}
              className="w-full h-10 bg-brand text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-all"
            >
              Confirmar Adição
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455">
        <Link href="/dashboard/settings" className="hover:text-brand flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Configurações
        </Link>
        <span className="text-slate-350">/</span>
        <span className="text-slate-700 font-bold">FX & Multimoeda</span>
      </div>

      {/* Page Header */}
      <header className="flex items-center justify-between w-full shrink-0 border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-brand border border-violet-100/40 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[20px] 2xl:text-[22px] font-black tracking-tight text-slate-950">
              FX & Multimoeda
            </h1>
            <p className="text-slate-455 font-semibold text-[11.5px] 2xl:text-[12px] tracking-tight">
              Gerencie moedas, taxas de câmbio, markup, regras de liquidação e configurações por checkout.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex h-9 items-center justify-center gap-1.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-[11px] font-black shadow-lg shadow-brand/15 transition-all uppercase tracking-tight"
        >
          <Plus className="w-4 h-4 shrink-0 text-white" />
          Nova moeda
        </button>
      </header>

      {/* Tab Navigation (10 Abas) */}
      <div className="flex items-center justify-between border-b border-[#E8DDFD]/65 pb-0 w-full shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-5">
          {[
            { id: 'visao_geral', label: 'Visão geral' },
            { id: 'taxas_ao_vivo', label: 'Taxas ao vivo' },
            { id: 'moedas', label: 'Moedas' },
            { id: 'markup_spread', label: 'Markup & Spread' },
            { id: 'trava_cambio', label: 'Trava de câmbio' },
            { id: 'liquidacao', label: 'Liquidação' },
            { id: 'por_checkout', label: 'Por checkout' },
            { id: 'regras_conversao', label: 'Regras & Conversão' },
            { id: 'disputas_fx', label: 'Disputas FX' },
            { id: 'historico', label: 'Histórico' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as ActiveTab);
                  triggerToast(`Aba carregada: ${tab.label}`);
                }}
                className={cn(
                  "pb-2.5 text-[12px] font-black relative transition-all tracking-tight whitespace-nowrap cursor-pointer",
                  isActive ? "text-brand" : "text-slate-400 hover:text-slate-650"
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* visao_geral Tab Content */}
      {activeTab === 'visao_geral' && (
        <div className="space-y-5">
          
          {/* KPI Cards Row (5 compact cards inline) */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 w-full">
            
            {/* Card 1: Taxas ao vivo */}
            <div className="bg-white border border-[#E8DDFD]/60 rounded-2xl p-4 shadow-sm text-left relative flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Taxas ao vivo</span>
                <span className="text-[20px] font-black text-slate-900 leading-none block mt-2.5">8</span>
                <span className="text-[9px] font-bold text-slate-400 block mt-1.5">moedas ativas</span>
                <span className="text-[8px] font-black text-slate-350 block mt-0.5 uppercase tracking-wider">Atualizado há 12s</span>
              </div>
              <div className="w-14 h-8 text-emerald-500 shrink-0">
                <svg viewBox="0 0 50 20" className="w-full h-full stroke-current fill-none stroke-[2.5] stroke-linecap-round">
                  <path d="M 0,15 L 10,13 L 20,16 L 30,10 L 40,12 L 50,5" />
                </svg>
              </div>
            </div>

            {/* Card 2: Markup médio */}
            <div className="bg-white border border-[#E8DDFD]/60 rounded-2xl p-4 shadow-sm text-left relative flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Markup médio</span>
                <span className="text-[20px] font-black text-slate-900 leading-none block mt-2.5">2,45%</span>
                <span className="text-[9px] font-bold text-slate-400 block mt-1.5">Sobre taxa interbancária</span>
              </div>
              <div className="w-14 h-8 text-brand shrink-0">
                <svg viewBox="0 0 50 20" className="w-full h-full stroke-current fill-none stroke-[2.5] stroke-linecap-round">
                  <path d="M 0,18 L 10,14 L 20,10 L 30,12 L 40,8 L 50,2" />
                </svg>
              </div>
            </div>

            {/* Card 3: Travas ativas */}
            <div className="bg-white border border-[#E8DDFD]/60 rounded-2xl p-4 shadow-sm text-left relative flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Travas ativas</span>
                <span className="text-[20px] font-black text-slate-900 leading-none block mt-2.5">3</span>
                <span className="text-[9px] font-bold text-slate-400 block mt-1.5">Protegendo transações</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-brand flex items-center justify-center shrink-0 border border-violet-100/50">
                <Shield className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Volume convertido (mês) */}
            <div className="bg-white border border-[#E8DDFD]/60 rounded-2xl p-4 shadow-sm text-left relative flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Volume convertido (mês)</span>
                <span className="text-[17px] font-black text-slate-900 leading-none block mt-2.5 truncate" title="US$ 1.842.569">US$ 1.842.569</span>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[9px] font-black text-emerald-650 bg-emerald-50 px-1 py-0.2 rounded">+ 18,6%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">vs mês anterior</span>
                </div>
              </div>
            </div>

            {/* Card 5: Economia (best FX) */}
            <div className="bg-white border border-[#E8DDFD]/60 rounded-2xl p-4 shadow-sm text-left relative flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">Economia (best FX)</span>
                <span className="text-[20px] font-black text-emerald-600 leading-none block mt-2.5">US$ 24.781</span>
                <span className="text-[9px] font-bold text-slate-400 block mt-1.5">Versus taxa cartão</span>
              </div>
            </div>

          </div>

          {/* Primary Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-start w-full">
            
            {/* Left Main Section (col-span-3) */}
            <div className="xl:col-span-3 space-y-4">
              
              {/* Live FX Rates Card */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Taxas de câmbio ao vivo</h3>
                    <p className="text-[9px] font-black text-emerald-650 flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Atualizado em tempo real
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleUpdateRates}
                      className={cn(
                        "h-8 px-3 border border-[#E8DDFD] bg-white hover:bg-slate-50 rounded-xl text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all",
                        isUpdating && "opacity-55"
                      )}
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5 text-slate-400", isUpdating && "animate-spin")} />
                      Atualizar
                    </button>
                    
                    <button className="w-8 h-8 border border-[#E8DDFD] bg-white hover:bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Settings2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rates Table */}
                <div className="w-full overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                        <th className="py-2 px-3 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">Moeda</th>
                        <th className="py-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Par</th>
                        <th className="py-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[16%]">Taxa interbank</th>
                        <th className="py-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[16%]">Nossa taxa</th>
                        <th className="py-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[10%]">Markup</th>
                        <th className="py-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Variação 24h</th>
                        <th className="py-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[10%]">Trava ativa</th>
                        <th className="py-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Status</th>
                        <th className="py-2 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[8%] text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                      {exchangeRates.map((rate) => {
                        const isPositive = rate.var24h >= 0;
                        return (
                          <tr key={rate.code} className="hover:bg-slate-50/50 h-[50px]">
                            <td className="py-2 px-3 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-base leading-none shrink-0">{rate.flag}</span>
                                <div className="leading-tight truncate">
                                  <span className="font-extrabold text-slate-900 block truncate">{rate.code}</span>
                                  <span className="text-[9.5px] font-semibold text-slate-400 block truncate">{rate.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-2 font-mono text-[10px] text-slate-500">{rate.pair}</td>
                            <td className="py-2 px-2 font-mono text-[10.5px] text-slate-600">{rate.interbank.toFixed(4)}</td>
                            <td className="py-2 px-2 font-mono text-[11px] font-extrabold text-slate-900">{rate.ourRate.toFixed(4)}</td>
                            <td className="py-2 px-2 text-slate-500 font-extrabold">{rate.markup}</td>
                            <td className="py-2 px-2">
                              <span className={cn(
                                "inline-flex items-center text-[9.5px] font-extrabold leading-none",
                                isPositive ? "text-green-600" : "text-red-500"
                              )}>
                                {isPositive ? '▲' : '▼'} {Math.abs(rate.var24h).toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-2 px-2 text-slate-500">{rate.lock}</td>
                            <td className="py-2 px-2">
                              <span className="inline-flex items-center gap-1.5 text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                {rate.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button className="text-slate-400 hover:text-brand font-black text-sm shrink-0">•••</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 text-center select-none">
                  <button onClick={() => setActiveTab('taxas_ao_vivo')} className="text-brand font-black text-[10.5px] uppercase tracking-wider hover:underline">
                    Ver todas as moedas e taxas &gt;
                  </button>
                </div>
              </div>

              {/* Bottom 3 sub-cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                
                {/* 1. Configurações por checkout */}
                <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                      Configurações por checkout
                    </h4>
                    
                    <div className="divide-y divide-slate-100 text-[10px] font-semibold text-slate-500 mt-2.5">
                      {[
                        { chk: 'Checkout Padrão', active: 8, mk: '2,45%', lock: 'Ativa', liq: 'D+2' },
                        { chk: 'Checkout Internacional', active: 6, mk: '2,20%', lock: 'Ativa', liq: 'D+1' },
                        { chk: 'Marketplace', active: 5, mk: '2,60%', lock: 'Ativa', liq: 'D+3' }
                      ].map((c) => (
                        <div key={c.chk} className="py-2 flex items-center justify-between gap-1.5">
                          <span className="font-extrabold text-slate-800 truncate flex-1 leading-tight">{c.chk}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="bg-slate-50 text-slate-600 px-1 py-0.2 rounded border border-slate-200/50 leading-none">{c.active} moedas</span>
                            <span className="font-black text-slate-800 leading-none">{c.mk}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <button onClick={() => setActiveTab('por_checkout')} className="text-brand font-black text-[9.5px] uppercase tracking-wider hover:underline">
                      Ver todas as configurações &gt;
                    </button>
                  </div>
                </div>

                {/* 2. Travas de câmbio ativas */}
                <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                      Travas de câmbio ativas
                    </h4>
                    
                    <div className="divide-y divide-slate-100 text-[10px] font-semibold text-slate-500 mt-2.5">
                      {[
                        { id: 'LCK-8732', ref: 'Pedido #93221', pair: 'USD/BRL', rate: '5,2450', exp: '2h 15m' },
                        { id: 'LCK-8721', ref: 'Pedido #93011', pair: 'EUR/BRL', rate: '5,7150', exp: '4h 42m' }
                      ].map((l) => (
                        <div key={l.id} className="py-2 flex items-center justify-between gap-1.5">
                          <div>
                            <span className="font-extrabold text-slate-850 block leading-tight">{l.id}</span>
                            <span className="text-[9px] text-slate-400 block leading-tight mt-0.5">{l.ref} • {l.pair}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-slate-900 block leading-tight">{l.rate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <button onClick={() => setActiveTab('trava_cambio')} className="text-brand font-black text-[9.5px] uppercase tracking-wider hover:underline">
                      Ver todas as travas &gt;
                    </button>
                  </div>
                </div>

                {/* 3. Liquidação */}
                <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                      Liquidação
                    </h4>
                    
                    <div className="space-y-3 mt-3.5 text-[10px] font-bold text-slate-500">
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <div className="leading-tight">
                          <span className="text-slate-400 block">Prazo padrão</span>
                          <span className="font-black text-slate-800 block mt-0.5">D+2 dias úteis</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <div className="leading-tight">
                          <span className="text-slate-400 block">Moeda base</span>
                          <span className="font-black text-slate-800 block mt-0.5">BRL - Real</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <button onClick={() => setActiveTab('liquidacao')} className="text-brand font-black text-[9.5px] uppercase tracking-wider hover:underline">
                      Configurar liquidação &gt;
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Sidebar Section (col-span-1) */}
            <div className="space-y-4">
              
              {/* Resumo de FX */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 text-left">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                  Resumo de FX
                </h4>

                <div className="space-y-3 text-[11px] font-bold text-slate-500">
                  {[
                    { label: 'Moedas ativas', val: '8', bold: true },
                    { label: 'Travas ativas', val: '3', bold: true },
                    { label: 'Markup médio', val: '2,45%', bold: true },
                    { label: 'Melhor taxa vs cartão', val: '-3,12%', green: true }
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between border-b border-slate-50 pb-2">
                      <span>{item.label}</span>
                      <span className={cn(
                        item.bold && "font-black text-slate-855",
                        item.green && "font-black text-emerald-650"
                      )}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversor rápido */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 text-left">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
                  Conversor rápido
                </h4>

                <div className="space-y-3">
                  {/* De selector */}
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider">De</label>
                    <div className="relative">
                      <select 
                        value={selectedConvertCurrency}
                        onChange={(e) => setSelectedConvertCurrency(e.target.value)}
                        className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none appearance-none cursor-pointer h-9.5"
                      >
                        {exchangeRates.map(c => (
                          <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Icon Switcher */}
                  <div className="flex justify-center -my-1 shrink-0">
                    <div className="w-7 h-7 rounded-full bg-brand-soft/20 text-brand border border-brand/10 flex items-center justify-center">
                      <ArrowRightLeft className="w-3.5 h-3.5 rotate-90" />
                    </div>
                  </div>

                  {/* Para selector */}
                  <div className="space-y-1">
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider">Para</label>
                    <div className="relative">
                      <select className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none appearance-none cursor-pointer h-9.5" disabled>
                        <option>BRL - Real Brasileiro</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Value input and equals */}
                  <div className="grid grid-cols-2 gap-2 pt-2 items-center">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Quantidade</span>
                      <input 
                        type="number" 
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand/35 h-9.5" 
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block text-right">Equivale em BRL</span>
                      <div className="w-full bg-[#FAF8FF] border border-[#E8DDFD]/60 rounded-xl px-3 py-2 text-xs font-black text-right text-brand h-9.5 flex items-center justify-end">
                        R$ {convertedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* taxas_ao_vivo Tab Content */}
      {activeTab === 'taxas_ao_vivo' && (
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-6 text-left animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Painel Financeiro de Taxas ao Vivo</h3>
              <p className="text-[10.5px] font-bold text-slate-400 mt-1">Monitore bids, asks e cotações das principais moedas em tempo real.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Fonte de Feed:</span>
                <select 
                  value={feedSource}
                  onChange={(e) => {
                    setFeedSource(e.target.value);
                    triggerToast(`Feed financeiro alterado para ${e.target.value.toUpperCase()}`);
                  }}
                  className="bg-transparent border-none outline-none font-black text-slate-800 cursor-pointer"
                >
                  <option value="reuters">Reuters Global</option>
                  <option value="bloomberg">Bloomberg Terminal</option>
                  <option value="bcb">Banco Central (BCB)</option>
                  <option value="oanda">Oanda Rates</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {exchangeRates.map((c) => {
              const varColor = c.var24h >= 0 ? 'text-green-600 bg-green-50 border-green-100/50' : 'text-red-500 bg-red-50 border-red-100/50';
              return (
                <div key={c.code} className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3.5 hover:shadow-md transition-all relative overflow-hidden bg-gradient-to-tr from-white to-slate-50/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{c.flag}</span>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">{c.code}/BRL</span>
                        <span className="text-[9.5px] font-semibold text-slate-400 block">{c.name}</span>
                      </div>
                    </div>
                    <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg border", varColor)}>
                      {c.var24h >= 0 ? '+' : ''}{c.var24h}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 text-left">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Bid (Compra)</span>
                      <span className="font-mono text-xs font-extrabold text-slate-850 block mt-0.5">{c.bid.toFixed(4)}</span>
                    </div>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 text-left">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Ask (Venda)</span>
                      <span className="font-mono text-xs font-extrabold text-slate-850 block mt-0.5">{c.ask.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-semibold text-slate-450 border-t border-slate-100/60 pt-2.5">
                    <span>Nossa Taxa Aplicada:</span>
                    <span className="font-mono font-black text-brand text-xs">R$ {c.ourRate.toFixed(4)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* moedas Tab Content */}
      {activeTab === 'moedas' && (
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left animate-in fade-in duration-300">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Moedas Habilitadas (Whitelist)</h3>
            <p className="text-[10.5px] font-bold text-slate-400 mt-1">Controle quais moedas estrangeiras estão ativas nos checkouts e configure thresholds.</p>
          </div>

          <div className="w-full overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                  <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[8%] text-center">Ativa</th>
                  <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[22%]">Moeda</th>
                  <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[15%]">Código</th>
                  <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[25%]">Mínimo de Transação</th>
                  <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[25%]">Máximo de Transação</th>
                  <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[15%] text-center">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                {whitelistedCurrencies.map((c, idx) => (
                  <tr key={c.code} className={cn("hover:bg-slate-50/50 h-[50px]", !c.enabled && "opacity-60")}>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="checkbox" 
                        checked={c.enabled}
                        onChange={() => {
                          const updated = [...whitelistedCurrencies];
                          updated[idx].enabled = !updated[idx].enabled;
                          setWhitelistedCurrencies(updated);
                          triggerToast(`Status da moeda ${c.code} atualizado!`);
                        }}
                        className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="font-extrabold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 font-mono font-black text-slate-650">{c.code}</td>
                    <td className="py-2 px-2">
                      <input 
                        type="text" 
                        value={c.min}
                        onChange={(e) => {
                          const updated = [...whitelistedCurrencies];
                          updated[idx].min = e.target.value;
                          setWhitelistedCurrencies(updated);
                        }}
                        className="bg-slate-50 border border-[#E8DDFD] rounded-xl px-2.5 py-1 text-xs font-mono font-bold w-[120px]" 
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        type="text" 
                        value={c.max}
                        onChange={(e) => {
                          const updated = [...whitelistedCurrencies];
                          updated[idx].max = e.target.value;
                          setWhitelistedCurrencies(updated);
                        }}
                        className="bg-slate-50 border border-[#E8DDFD] rounded-xl px-2.5 py-1 text-xs font-mono font-bold w-[140px]" 
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-100 text-[9px] uppercase tracking-wider font-black">Aprovado</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* markup_spread Tab Content */}
      {activeTab === 'markup_spread' && (
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-5 text-left animate-in fade-in duration-300">
          <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Markup & Spread Corporativo</h3>
              <p className="text-[10.5px] font-bold text-slate-400 mt-1">Configure o spread administrativo aplicado sobre a taxa de câmbio interbancária comercial.</p>
            </div>
            <button 
              onClick={() => triggerToast("Parâmetros globais de markup atualizados!")}
              className="h-8.5 px-4 bg-brand text-white text-[10.5px] font-black uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-all"
            >
              Salvar Configurações
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3.5 bg-slate-50/20">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Spread Padrão (Semana)</span>
              <div className="flex items-center gap-2">
                <input type="text" defaultValue="2.45" className="bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 w-[100px]" />
                <span className="text-xs font-extrabold text-slate-500">% sobre taxa base</span>
              </div>
              <p className="text-[9.5px] font-semibold text-slate-400 leading-relaxed">Taxa administrativa aplicada de Segunda a Sexta em horário bancário oficial.</p>
            </div>

            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3.5 bg-slate-50/20">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Spread Final de Semana</span>
              <div className="flex items-center gap-2">
                <input type="text" defaultValue="2.95" className="bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 w-[100px]" />
                <span className="text-xs font-extrabold text-slate-500">% sobre taxa base</span>
              </div>
              <p className="text-[9.5px] font-semibold text-slate-400 leading-relaxed">Markup de segurança estendido para compensar a volatilidade de fechamento bancário no final de semana.</p>
            </div>

            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3.5 bg-slate-50/20">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Tiers Regressivos</span>
              <div className="space-y-1.5 text-[9.5px] font-bold text-slate-500">
                <div className="flex justify-between"><span>Até R$ 50k/mês:</span><span className="text-slate-900 font-extrabold">2.45%</span></div>
                <div className="flex justify-between"><span>De R$ 50k a R$ 200k/mês:</span><span className="text-slate-900 font-extrabold">2.20%</span></div>
                <div className="flex justify-between"><span>Acima de R$ 200k/mês:</span><span className="text-slate-900 font-extrabold">1.90%</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* trava_cambio Tab Content */}
      {activeTab === 'trava_cambio' && (
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-5 text-left animate-in fade-in duration-300">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Trava de Câmbio (DCC & Hedging Engine Gateway)</h3>
            <p className="text-[10.5px] font-bold text-slate-400 mt-1">Gerencie a Dynamic Currency Conversion (DCC) e o motor de cobertura cambial de tesouraria.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
            
            {/* DCC form config */}
            <div className="xl:col-span-1 border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-4 bg-slate-50/20">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Configuração DCC</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Conversão Dinâmica (DCC)</span>
                <input 
                  type="checkbox" 
                  checked={dccActive}
                  onChange={() => {
                    setDccActive(!dccActive);
                    triggerToast(`DCC ${!dccActive ? 'ativado' : 'desativado'}`);
                  }}
                  className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Janela de Fixação da Taxa</label>
                <div className="relative">
                  <select 
                    value={dccWindow}
                    onChange={(e) => {
                      setDccWindow(e.target.value);
                      triggerToast(`Janela de DCC definida para ${e.target.value}`);
                    }}
                    className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none appearance-none cursor-pointer h-9"
                  >
                    <option value="5m">5 Minutos</option>
                    <option value="10m">10 Minutos</option>
                    <option value="30m">30 Minutos (Recomendado)</option>
                    <option value="1h">1 Hora</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Hedging trigger config */}
            <div className="xl:col-span-1 border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-4 bg-slate-50/20 flex flex-col justify-between min-h-[220px]">
              <div>
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Hedging Engine Gateway</h4>
                
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-bold text-slate-700">Hedge Automático Ativo</span>
                  <input 
                    type="checkbox" 
                    checked={hedgingActive}
                    onChange={() => {
                      setHedgingActive(!hedgingActive);
                      triggerToast(`Hedging automático ${!hedgingActive ? 'ativado' : 'desativado'}`);
                    }}
                    className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5"
                  />
                </div>

                <div className="space-y-1.5 mt-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Threshold de Cobertura ($ USD)</label>
                  <input 
                    type="number" 
                    value={hedgingThreshold}
                    onChange={(e) => setHedgingThreshold(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700 focus:outline-none h-9" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[8.5px] font-semibold text-slate-400 leading-relaxed">Sempre que a exposição cambial líquida em aberto superar o threshold, o motor fecha um swap de câmbio futuro no banco custodiante.</p>
                <Link 
                  href="/dashboard/settings/fx/hedging"
                  className="flex items-center justify-center gap-1 w-full py-2 border border-brand/20 hover:bg-brand-soft/20 text-brand rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all"
                >
                  Painel de Tesouraria <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Hedging Logs table */}
            <div className="xl:col-span-1 border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3 bg-slate-50/20">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">Logs de Hedging Executados</h4>
              
              <div className="divide-y divide-slate-100 text-[10px] font-semibold text-slate-500">
                {hedgingLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-800 block leading-tight">{log.id} • {log.pair}</span>
                      <span className="text-[8.5px] text-slate-400 block mt-0.5">{log.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block leading-tight">{log.amount}</span>
                      <span className="text-[8.5px] text-emerald-650 font-black block mt-0.5 uppercase tracking-wider">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* liquidacao Tab Content */}
      {activeTab === 'liquidacao' && (
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-5 text-left animate-in fade-in duration-300">
          <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Liquidação Financeira</h3>
              <p className="text-[10.5px] font-bold text-slate-400 mt-1">Configure as contas bancárias de destino de recebíveis e o calendário de repasse.</p>
            </div>
            <button 
              onClick={() => triggerToast("Regras de liquidação bancária salvas!")}
              className="h-8.5 px-4 bg-brand text-white text-[10.5px] font-black uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-all"
            >
              Salvar Alterações
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3.5 bg-slate-50/20">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Moeda de Liquidação</span>
              <div className="relative">
                <select 
                  value={settlementCurrency}
                  onChange={(e) => setSettlementCurrency(e.target.value)}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none h-9 appearance-none"
                >
                  <option value="BRL">BRL - Real Brasileiro</option>
                  <option value="USD">USD - Dólar Americano</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3.5 bg-slate-50/20">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Janela de Payout</span>
              <div className="relative">
                <select 
                  value={settlementSchedule}
                  onChange={(e) => setSettlementSchedule(e.target.value)}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none h-9 appearance-none"
                >
                  <option value="D+1">D+1 (1 Dia Útil)</option>
                  <option value="D+2">D+2 (2 Dias Úteis)</option>
                  <option value="D+3">D+3 (3 Dias Úteis)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3.5 bg-slate-50/20">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Conta Bancária de Destino</span>
              <div className="relative">
                <select 
                  value={settlementAccount}
                  onChange={(e) => setSettlementAccount(e.target.value)}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none h-9 appearance-none"
                >
                  <option value="basileia_corp">Basileia Corp Principal (Itaú)</option>
                  <option value="basileia_secundária">Basileia Sweep (Banco Rendimento)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* por_checkout Tab Content */}
      {activeTab === 'por_checkout' && (
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left animate-in fade-in duration-300">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Configurações Customizadas Por Checkout</h3>
            <p className="text-[10.5px] font-bold text-slate-400 mt-1">Force moedas estrangeiras ou markups individualizados em frentes de venda específicas.</p>
          </div>

          <div className="w-full overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                  <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[35%]">Checkout</th>
                  <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[20%]">Moeda Padrão</th>
                  <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[25%] text-center">Forçar Exibição Moeda</th>
                  <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[20%] text-center">Markup Especial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                {checkoutOverrides.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 h-[50px]">
                    <td className="py-2 px-3.5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-brand shrink-0" />
                        <span className="font-extrabold text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 font-mono font-black text-slate-650">{c.defaultCurrency}</td>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="checkbox" 
                        checked={c.forceCurrency}
                        onChange={() => {
                          const updated = [...checkoutOverrides];
                          updated[idx].forceCurrency = !updated[idx].forceCurrency;
                          setCheckoutOverrides(updated);
                          triggerToast(`Exibição forçada de moeda atualizada para ${c.name}`);
                        }}
                        className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4 h-4 mx-auto"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input 
                        type="text" 
                        value={c.customMarkup}
                        onChange={(e) => {
                          const updated = [...checkoutOverrides];
                          updated[idx].customMarkup = e.target.value;
                          setCheckoutOverrides(updated);
                        }}
                        className="bg-slate-50 border border-[#E8DDFD] rounded-xl px-2 py-0.5 text-xs font-bold text-center w-[80px] mx-auto block" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* regras_conversao Tab Content */}
      {activeTab === 'regras_conversao' && (
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-5 text-left animate-in fade-in duration-300">
          <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Regras de Conversão & Impostos</h3>
              <p className="text-[10.5px] font-bold text-slate-400 mt-1">Defina regras lógicas de arredondamento de valores e inclusão automática de taxas.</p>
            </div>
            <button 
              onClick={() => triggerToast("Parâmetros de conversão e impostos atualizados!")}
              className="h-8.5 px-4 bg-brand text-white text-[10.5px] font-black uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-all"
            >
              Salvar Regras
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-3.5 bg-slate-50/20">
              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Arredondamento Centavos</span>
              <div className="relative">
                <select 
                  value={roundingRule}
                  onChange={(e) => {
                    setRoundingRule(e.target.value);
                    triggerToast(`Regra de arredondamento definida para ${e.target.value}`);
                  }}
                  className="w-full bg-white border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-black text-slate-700 focus:outline-none h-9 appearance-none"
                >
                  <option value="none">Sem Arredondamento</option>
                  <option value=".99">Terminar com .99 (ex: $12.99)</option>
                  <option value=".90">Terminar com .90 (ex: $12.90)</option>
                  <option value="round">Arredondar para inteiro próximo</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-4 bg-slate-50/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Embutir IOF em Cartões</span>
                <input 
                  type="checkbox" 
                  checked={embedIof}
                  onChange={() => {
                    setEmbedIof(!embedIof);
                    triggerToast(`Embutir IOF ${!embedIof ? 'ativado' : 'desativado'}`);
                  }}
                  className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5"
                />
              </div>
              <p className="text-[8.5px] font-semibold text-slate-400 leading-relaxed">Embutir automaticamente a taxa de IOF (4,38%) no valor total convertido exibido no checkout final para o comprador.</p>
            </div>

            <div className="border border-[#E8DDFD]/60 rounded-2xl p-4.5 space-y-4 bg-slate-50/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Taxas de Importação</span>
                <input 
                  type="checkbox" 
                  checked={importTax}
                  onChange={() => {
                    setImportTax(!importTax);
                    triggerToast(`Taxas de importação ${!importTax ? 'ativadas' : 'desativadas'}`);
                  }}
                  className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5"
                />
              </div>
              <p className="text-[8.5px] font-semibold text-slate-400 leading-relaxed">Adicionar estimativa de custos de taxas de alfândegas internacionais conforme destino do comprador.</p>
            </div>
          </div>
        </div>
      )}

      {/* historico Tab Content */}
      {activeTab === 'historico' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
          
          {/* Main audit history table (col-span-2) */}
          <div className="xl:col-span-2 bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left animate-in fade-in duration-300">
            <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Histórico de Reconciliações FX</h3>
                <p className="text-[10.5px] font-bold text-slate-400 mt-1">Logs e transações convertidas de recebimentos transfronteiriços.</p>
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                    <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">ID Transação</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">Conversão</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">Cotação</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">Valor Equivalente</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[16%] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10.5px] font-bold text-slate-700">
                  {[
                    { id: 'tx_87f9e8a', from: 'USD $150.00', rate: '5.2520 BRL', to: 'R$ 787,80', status: 'Liquidado' },
                    { id: 'tx_87f9e8b', from: 'EUR €82.00', rate: '5.7200 BRL', to: 'R$ 469,04', status: 'Liquidado' },
                    { id: 'tx_87f9e8c', from: 'GBP £60.00', rate: '6.6950 BRL', to: 'R$ 401,70', status: 'Liquidado' },
                    { id: 'tx_87f9e8d', from: 'USD $20.00', rate: '5.2520 BRL', to: 'R$ 105,04', status: 'Liquidado' }
                  ].map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 h-[48px]">
                      <td className="py-2 px-3.5 font-mono text-[9.5px] text-brand">{h.id}</td>
                      <td className="py-2 px-2 text-slate-800 font-extrabold">{h.from}</td>
                      <td className="py-2 px-2 font-mono text-[10px] text-slate-500">{h.rate}</td>
                      <td className="py-2 px-2 text-slate-900 font-black">{h.to}</td>
                      <td className="py-2 px-2 text-center">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider">✓ {h.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conceptual Disputas FX simulator (col-span-1) */}
          <div className="xl:col-span-1 bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 text-left animate-in fade-in duration-300">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2.5">
              <div className="w-6 h-6 rounded-lg bg-red-50 text-red-500 border border-red-100 flex items-center justify-center">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-none">Simulador de Disputas FX</h4>
                <span className="text-[8px] font-bold text-slate-400 block mt-1 leading-none">Módulo conceitual de perda por volatilidade de chargeback</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-slate-650">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Valor do Pedido ($ USD)</label>
                <input 
                  type="number" 
                  value={disputeAmount}
                  onChange={(e) => setDisputeAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800 focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Taxa Captura (BRL)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={disputeDateRate}
                    onChange={(e) => setDisputeDateRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Taxa Disputa (BRL)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={disputeChargebackRate}
                    onChange={(e) => setDisputeChargebackRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none" 
                  />
                </div>
              </div>

              <button 
                onClick={handleCalculateVariance}
                className="w-full h-9.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
              >
                Calcular Perda Retroativa
              </button>

              {calculatedVariance !== null && (
                <div className={cn(
                  "rounded-2xl p-4.5 border text-left mt-2.5 space-y-1",
                  calculatedVariance >= 0 ? "bg-red-50/50 border-red-100 text-red-700" : "bg-green-50/50 border-green-100 text-green-700"
                )}>
                  <span className="text-[9px] font-black uppercase tracking-wider block">Diferença Cambial Cambial:</span>
                  <span className="text-[15px] font-black block">R$ {Math.abs(calculatedVariance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <p className="text-[9px] font-semibold leading-relaxed mt-1">
                    {calculatedVariance >= 0 
                      ? "O merchant deve compensar a perda de variação cambial retroativa na liquidação final para cobrir a oscilação."
                      : "Economia cambial gerada a favor da tesouraria da Basileia Pay."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* disputas_fx Tab Content */}
      {activeTab === 'disputas_fx' && (
        <div className="space-y-6 text-left animate-in fade-in duration-300">
          
          {/* FX Dispute KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Disputas Cambiais Abertas', val: fxDisputes.filter(d => d.status === 'Aguardando Conciliação').length, color: 'text-amber-600' },
              { label: 'Perda Cambial Acumulada', val: `R$ ${fxDisputes.filter(d => d.status === 'Aguardando Conciliação').reduce((acc, curr) => acc + curr.variance, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, color: 'text-red-650' },
              { label: 'Sucesso na Conciliação', val: '92.4%', sub: 'Compensado no saldo', color: 'text-emerald-650' },
              { label: 'Ajustes Auditados', val: fxAuditLogs.length, sub: 'Rastreabilidade total', color: 'text-brand' }
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white border border-[#E8DDFD]/65 rounded-2xl p-4.5 space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">{kpi.label}</span>
                <span className={cn("text-[20px] font-black block leading-none", kpi.color)}>{kpi.val}</span>
                {kpi.sub && <span className="text-[9px] font-bold text-slate-350 block">{kpi.sub}</span>}
              </div>
            ))}
          </div>

          {/* Main open disputes list and Simulator split */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
            
            {/* Disputes table (col-span-2) */}
            <div className="xl:col-span-2 bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Disputas Cambiais Pendentes</h3>
                  <p className="text-[10.5px] font-bold text-slate-400 mt-1">Monitore a variação cambial histórica de chargebacks e execute compensações financeiras no saldo.</p>
                </div>
              </div>

              <div className="w-full overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                      <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">ID Disputa</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[16%]">Pedido</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">Original (FX)</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">Taxas (Cap. vs Disp.)</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">Variação BRL</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[16%] text-center">Status</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%] text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10.5px] font-bold text-slate-700">
                    {fxDisputes.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 h-[48px]">
                        <td className="py-2 px-3.5 font-mono text-[9.5px] text-brand">{d.id}</td>
                        <td className="py-2 px-2 font-mono text-[9px] text-slate-400">{d.txId}</td>
                        <td className="py-2 px-2 text-slate-800 font-extrabold">{d.currency} ${d.amount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-slate-500 font-mono text-[10px] leading-tight">
                          <span className="block text-slate-400 font-semibold text-[8px] uppercase">Cap: {d.rateCapture.toFixed(2)} BRL</span>
                          <span className="block text-slate-700 font-black text-[9px] uppercase">Disp: {d.rateDispute.toFixed(2)} BRL</span>
                        </td>
                        <td className="py-2 px-2">
                          <span className={cn(
                            "font-mono text-[10.5px] font-black",
                            d.variance >= 0 ? "text-red-650" : "text-emerald-650"
                          )}>
                            {d.variance >= 0 ? '+' : ''} R$ {d.variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider block truncate",
                            d.status === 'Conciliado' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700 animate-pulse"
                          )}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {d.status === 'Aguardando Conciliação' ? (
                            <button
                              onClick={() => handleConciliateDispute(d.id)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[8.5px] font-black uppercase tracking-tight transition-all cursor-pointer shadow-sm shadow-slate-900/10 block w-full text-center"
                            >
                              Conciliar
                            </button>
                          ) : (
                            <span className="text-slate-350 text-[8.5px] font-bold block uppercase tracking-wide">Ajustado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Volatility simulator (col-span-1) */}
            <div className="xl:col-span-1 bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider block">Calculadora de Impacto de Chargeback</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Cruze a disputa cambial com o fx_rates do dia do chargeback.</span>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Valor do Pedido ($ USD)</label>
                  <input 
                    type="number" 
                    value={disputeAmount}
                    onChange={(e) => setDisputeAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800 focus:outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Taxa Captura (BRL)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={disputeDateRate}
                      onChange={(e) => setDisputeDateRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Taxa Disputa (BRL)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={disputeChargebackRate}
                      onChange={(e) => setDisputeChargebackRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleCalculateVariance}
                    className="h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Simular Variação
                  </button>
                  <button 
                    onClick={handleCreateSimulatedDispute}
                    className="h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Inserir Disputa
                  </button>
                </div>

                {calculatedVariance !== null && (
                  <div className={cn(
                    "rounded-2xl p-4 border text-left mt-2 space-y-1",
                    calculatedVariance >= 0 ? "bg-red-50/50 border-red-100 text-red-700" : "bg-emerald-50/50 border-emerald-100 text-emerald-700"
                  )}>
                    <span className="text-[9px] font-black uppercase tracking-wider block">Variação Cambial a Conciliar:</span>
                    <span className="text-[15px] font-black block">R$ {Math.abs(calculatedVariance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <p className="text-[9px] font-semibold leading-relaxed mt-1">
                      {calculatedVariance >= 0 
                        ? "Diferença desfavorável por oscilação cambial. Compensar variação na liquidação do merchant."
                        : "Ajuste positivo por valorização do BRL a favor da liquidação cambial do merchant."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Audit Logs & Laravel Integration split */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
            
            {/* Audit Logs of Adjustments */}
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2.5">
                <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider block">Trilha de Auditoria Cambial (Dispute Audit Logs)</h4>
                <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Monitoramento completo das liquidações de variações cambiais de chargebacks.</span>
              </div>

              <div className="w-full overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                      <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">Operador</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[24%]">ID Ajuste</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[20%]">Variação</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">Horário</th>
                      <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[14%] text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[10px] font-bold text-slate-700">
                    {fxAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 h-[44px]">
                        <td className="py-2 px-3.5 text-slate-900 truncate font-extrabold">{log.user}</td>
                        <td className="py-2 px-2 font-mono text-[9.5px] text-brand">{log.id}</td>
                        <td className="py-2 px-2">
                          <span className={cn(
                            "font-mono font-black",
                            log.variance >= 0 ? "text-red-650" : "text-emerald-650"
                          )}>
                            R$ {log.variance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-slate-500 font-semibold">{log.date}</td>
                        <td className="py-2 px-2 text-center">
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono text-[8px] font-black uppercase">Liquido</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Laravel Integration Controller hook */}
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider block">Controller de Conciliação Cambial (Laravel Backend)</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Vincule chargebacks e fx_rates históricos para reconciliar saldos automaticamente.</span>
                </div>
                <span className="bg-purple-50 text-brand px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest font-mono">
                  Laravel Controller
                </span>
              </div>

              <div className="font-mono text-[9px] bg-slate-950 border border-slate-900 rounded-xl p-4 leading-relaxed text-slate-350 select-text overflow-x-auto relative">
                <div className="absolute right-3.5 top-3.5 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[8px] font-black uppercase text-slate-400 pointer-events-none select-none">
                  FxDisputeController.php
                </div>
                <pre className="text-left font-mono">
                  {`<?php

namespace App\\Http\\Controllers\\Admin;

use App\\Models\\Dispute;
use App\\Models\\FxRate;
use App\\Models\\MerchantBalance;
use Illuminate\\Http\\Request;

class FxDisputeController extends Controller
{
    /**
     * Calcula e concilia a variação cambial entre a captura e o chargeback.
     */
    public function conciliate(Request $request, string $disputeId)
    {
        $dispute = Dispute::findOrFail($disputeId);
        
        // Recupera taxas históricas das datas de captura e disputa
        $captureRate = FxRate::getHistoricalRate($dispute->currency, $dispute->captured_at);
        $disputeRate = FxRate::getHistoricalRate($dispute->currency, $dispute->disputed_at);
        
        // Calcula a variação financeira
        $varianceBrl = ($dispute->amount * $disputeRate) - ($dispute->amount * $captureRate);
        
        // Executa o ajuste no saldo do merchant
        MerchantBalance::adjust(
            $dispute->merchant_id,
            $varianceBrl,
            'fx_variance_chargeback',
            "Variação cambial retroativa do chargeback {$disputeId}"
        );
        
        // Atualiza status da disputa cambial
        $dispute->update(['fx_status' => 'conciliated', 'variance_brl' => $varianceBrl]);
        
        return response()->json([
            'status' => 'success',
            'variance_brl' => $varianceBrl,
            'message' => 'Variação cambial reconciliada no saldo!'
        ]);
    }
}`}
                </pre>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
