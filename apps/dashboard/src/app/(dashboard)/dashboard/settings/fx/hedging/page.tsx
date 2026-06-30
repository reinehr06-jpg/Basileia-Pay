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
  AlertOctagon,
  ArrowRight,
  Lock,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HedgingSettingsPage() {
  const [engineActive, setEngineActive] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  
  // NOP & Exposure State
  const [exposures, setExposures] = useState<any[]>([]);

  // Liquidity Providers live quotes state
  const [providers, setProviders] = useState<any[]>([]);

  // Swap Deals / Hedging logs state
  const [swapLogs, setSwapLogs] = useState<any[]>([]);

  // Simulation form states
  const [simPair, setSimPair] = useState('USD/BRL');
  const [simAmount, setSimAmount] = useState('5000');
  const [simProvider, setSimProvider] = useState('StoneX Treasury');
  const [simulating, setSimulating] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateThreshold = (index: number, val: number) => {
    setExposures(prev => prev.map((item, idx) => idx === index ? { ...item, threshold: val } : item));
  };

  const handleSimulateSwap = () => {
    const amountNum = parseFloat(simAmount);
    if (!amountNum || amountNum <= 0) return;
    
    setSimulating(true);
    triggerToast("Iniciando cotação de Swap de câmbio futuro interbancário...");

    setTimeout(() => {
      const selectedProv = providers.find(p => p.name === simProvider) || providers[0];
      const rate = simPair === 'USD/BRL' ? selectedProv.usdRate : simPair === 'EUR/BRL' ? selectedProv.eurRate : selectedProv.gbpRate;
      
      const newDeal = {
        id: `HDG-SWP-${Math.floor(1000 + Math.random() * 9000)}`,
        pair: simPair,
        amount: amountNum,
        rate,
        spread: selectedProv.spread,
        status: 'Liquidado',
        provider: simProvider,
        date: 'Hoje, ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        hash: '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6)
      };

      setSwapLogs(prev => [newDeal, ...prev]);
      
      // Decrease NOP exposure for visual feedback
      setExposures(prev => prev.map(item => {
        if (item.pair === simPair) {
          const remainingExp = Math.max(0, item.exposure - amountNum);
          return {
            ...item,
            exposure: remainingExp,
            risk: remainingExp > item.threshold ? 'high' : remainingExp > item.threshold / 2 ? 'medium' : 'low'
          };
        }
        return item;
      }));

      setSimulating(false);
      setShowSimulateModal(false);
      triggerToast(`Swap cambial ${newDeal.id} executado e liquidado no custodiante! Posição NOP ajustada.`);
    }, 2000);
  };

  return (
    <div className="w-full text-left space-y-5 pt-2 pb-12 select-none animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1400px] mx-auto px-4 lg:px-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4.5 shadow-2xl flex items-center gap-2.5 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <span className="w-2.5 h-2.5 bg-brand rounded-full shrink-0 animate-ping" />
          <span className="text-[11.5px] font-black text-left">{toastMessage}</span>
        </div>
      )}

      {/* Manual Swap Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-55 flex items-center justify-center">
          <div className="bg-white border border-[#E8DDFD] w-[400px] rounded-[24px] p-5.5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-brand" />
                <span className="text-xs font-black text-slate-850 uppercase tracking-wider">Simular Cobertura (Swap Manual)</span>
              </div>
              <button onClick={() => setShowSimulateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Par de Moeda</label>
                <select 
                  value={simPair}
                  onChange={(e) => setSimPair(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 h-9.5"
                >
                  <option value="USD/BRL">USD/BRL - Dólar Americano</option>
                  <option value="EUR/BRL">EUR/BRL - Euro</option>
                  <option value="GBP/BRL">GBP/BRL - Libra Esterlina</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-455 uppercase tracking-wider block">Valor da Cobertura (Moeda Estrangeira)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                    {simPair.split('/')[0] === 'USD' ? '$' : simPair.split('/')[0] === 'EUR' ? '€' : '£'}
                  </span>
                  <input 
                    type="number" 
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl pl-8 pr-3 py-2 text-xs font-black text-slate-700 h-9.5" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Provedor de Liquidez Custodiante</label>
                <select 
                  value={simProvider}
                  onChange={(e) => setSimProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold text-slate-700 h-9.5"
                >
                  {providers.map(p => (
                    <option key={p.name} value={p.name}>{p.name} (Spread: {p.spread})</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span>Cotação Estimada:</span>
                  <span className="font-mono font-black text-slate-800">
                    {simPair === 'USD/BRL' ? providers.find(p => p.name === simProvider)?.usdRate.toFixed(4) :
                     simPair === 'EUR/BRL' ? providers.find(p => p.name === simProvider)?.eurRate.toFixed(4) :
                     providers.find(p => p.name === simProvider)?.gbpRate.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa Custódia (Arbitragem):</span>
                  <span className="font-mono text-emerald-650 font-black">
                    -{providers.find(p => p.name === simProvider)?.spread}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSimulateSwap}
              disabled={simulating}
              className="w-full h-10 bg-brand text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-brand-dark transition-all flex items-center justify-center gap-1.5"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  Fechando Câmbio...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 text-white" />
                  Executar Swap Cambial
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455">
        <Link href="/dashboard/settings" className="hover:text-brand flex items-center gap-1 transition-colors">
          Configurações
        </Link>
        <span className="text-slate-350">/</span>
        <Link href="/dashboard/settings/fx" className="hover:text-brand transition-colors">
          FX & Multimoeda
        </Link>
        <span className="text-slate-350">/</span>
        <span className="text-slate-700 font-bold">Hedging Engine Gateway</span>
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-650 border border-teal-150 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[20px] 2xl:text-[22px] font-black tracking-tight text-slate-950 font-mono">
              Hedging Engine Gateway
            </h1>
            <p className="text-slate-455 font-semibold text-[11.5px] 2xl:text-[12px] tracking-tight">
              Motor de tesouraria automático para travar o câmbio interbancário e mitigar flutuações cambiais de liquidação.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 bg-white border border-[#E8DDFD] rounded-xl px-3 py-1.5 h-9.5">
            <span className="text-xs font-bold text-slate-700">Auto-Hedge Ativo</span>
            <input 
              type="checkbox" 
              checked={engineActive}
              onChange={() => {
                setEngineActive(!engineActive);
                triggerToast(`Hedging automático ${!engineActive ? 'ativado' : 'desativado'}`);
              }}
              className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5"
            />
          </div>

          <button 
            onClick={() => setShowSimulateModal(true)}
            className="flex h-9.5 items-center justify-center gap-1.5 px-4 bg-brand hover:bg-brand-dark text-white rounded-xl text-[11px] font-black shadow-lg shadow-brand/15 transition-all uppercase tracking-tight"
          >
            <ArrowRightLeft className="w-4 h-4 shrink-0 text-white" />
            Swap manual
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        
        {/* Left Columns (col-span-2) */}
        <div className="xl:col-span-2 space-y-5">
          
          {/* Exposure and NOP Status Cards */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Exposição Líquida Aberta (NOP)</h3>
              <p className="text-[10.5px] font-semibold text-slate-450 mt-1">
                Sua exposição cambial consolidada em tempo real. Se exceder o threshold, o motor realiza um swap cambial automático.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exposures.map((item, index) => {
                const currency = item.pair.split('/')[0];
                const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
                const percentUsed = Math.min(100, (item.exposure / item.threshold) * 100);
                
                return (
                  <div key={item.pair} className="border border-[#E8DDFD]/60 rounded-2xl p-4 bg-slate-50/20 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{item.pair}</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        item.risk === 'high' ? 'bg-red-50 text-red-750 border-red-200' :
                        item.risk === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      )}>
                        {item.risk === 'high' ? 'Risco Alto' : item.risk === 'medium' ? 'Risco Médio' : 'Risco Baixo'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[22px] font-mono font-black text-slate-900">
                        {symbol}{item.exposure.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 mt-1">
                        <span>Threshold: {symbol}{item.threshold.toLocaleString('pt-BR')}</span>
                        <span>{percentUsed.toFixed(0)}% ocupado</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          item.risk === 'high' ? 'bg-red-500' :
                          item.risk === 'medium' ? 'bg-amber-500' :
                          'bg-brand'
                        )}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Threshold Configurations Table */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Parâmetros de Auto-Hedging por Moeda</h3>
              <p className="text-[10.5px] font-semibold text-slate-440 mt-1">
                Configure os gatilhos automáticos para que o motor de arbitragem de tesouraria feche contratos de swap.
              </p>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                    <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[25%]">Moeda Estrangeira</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[35%]">Threshold Limite (NOP)</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[25%]">Provedor Principal</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[15%] text-center">Gatilho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
                  {exposures.map((item, index) => {
                    const symbol = item.pair.split('/')[0] === 'USD' ? '$' : item.pair.split('/')[0] === 'EUR' ? '€' : '£';
                    return (
                      <tr key={item.pair} className="hover:bg-slate-50/50 h-[48px]">
                        <td className="py-2 px-3.5 font-extrabold text-slate-900">{item.pair}</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-400">{symbol}</span>
                            <input 
                              type="number"
                              value={item.threshold}
                              onChange={(e) => handleUpdateThreshold(index, parseFloat(e.target.value) || 0)}
                              className="w-[120px] bg-slate-50 hover:bg-slate-100/60 border border-[#E8DDFD] rounded-lg px-2 py-0.8 text-xs font-black text-slate-700 focus:outline-none"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-2 text-slate-600">
                          {item.pair === 'USD/BRL' ? 'StoneX Treasury' : item.pair === 'EUR/BRL' ? 'Citibank FX' : 'Bexs / Ebanx'}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider">
                            Gatilho Auto
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Swap Logs and Execution History */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Histórico de Coberturas Cambiais (Swap)</h3>
              <p className="text-[10.5px] font-semibold text-slate-440 mt-1">
                Logs auditados das liquidações de swap executadas pelo motor de arbitragem.
              </p>
            </div>

            <div className="w-full overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                    <th className="py-2.5 px-3.5 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">ID Contrato</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Par</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[22%]">Valor Coberto</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[15%]">Taxa Executada</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[10%]">Spread</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[25%]">Provedor</th>
                    <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[15%]">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10.5px] font-bold text-slate-700">
                  {swapLogs.map((log) => {
                    const symbol = log.pair.split('/')[0] === 'USD' ? '$' : log.pair.split('/')[0] === 'EUR' ? '€' : '£';
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 h-[48px]">
                        <td className="py-2 px-3.5 min-w-0 font-mono font-black text-slate-900">{log.id}</td>
                        <td className="py-2 px-2 text-slate-650">{log.pair}</td>
                        <td className="py-2 px-2 text-slate-800 font-extrabold">
                          {symbol}{log.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-slate-700 font-mono">{log.rate.toFixed(4)}</td>
                        <td className="py-2 px-2 text-emerald-650 font-black">{log.spread}</td>
                        <td className="py-2 px-2 text-slate-500 truncate">{log.provider}</td>
                        <td className="py-2 px-2 text-slate-450 font-mono text-[9.5px]">{log.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Sidebar (col-span-1) */}
        <div className="space-y-5">
          
          {/* Live Treasury Arbitrage Panel */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider block">Arbitragem de Liquidez (Live)</h3>
              <p className="text-[10px] font-semibold text-slate-400 mt-1">Cotações interbancárias em tempo real dos custodiantes de câmbio conectados.</p>
            </div>

            <div className="space-y-3.5 pt-1.5">
              {providers.map((p) => (
                <div key={p.name} className="border border-slate-50 rounded-xl p-3 bg-slate-50/15 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-teal-50 border border-teal-100 rounded flex items-center justify-center text-[9px] font-black text-teal-650">
                        {p.name[0]}
                      </div>
                      <span className="text-[11px] font-black text-slate-850">{p.name}</span>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 font-mono tracking-wider uppercase">
                      ⏱ {p.latency}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white border border-[#E8DDFD]/50 rounded-lg p-1.5">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">USD</span>
                      <span className="text-[10px] font-black font-mono text-slate-800 block mt-0.5">{p.usdRate.toFixed(4)}</span>
                    </div>
                    <div className="bg-white border border-[#E8DDFD]/50 rounded-lg p-1.5">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">EUR</span>
                      <span className="text-[10px] font-black font-mono text-slate-800 block mt-0.5">{p.eurRate.toFixed(4)}</span>
                    </div>
                    <div className="bg-white border border-[#E8DDFD]/50 rounded-lg p-1.5">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider block">GBP</span>
                      <span className="text-[10px] font-black font-mono text-slate-800 block mt-0.5">{p.gbpRate.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Treasury Risk Rules Info Card */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-3.5 text-left">
            <div className="flex items-center gap-2 text-brand">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Políticas de Tesouraria</h4>
            </div>

            <div className="text-[10.5px] font-semibold text-slate-500 space-y-2.5 leading-relaxed">
              <p>• <strong>Liquidação D+2:</strong> Todos os fundos cobertos pelo motor de hedging de câmbio são liberados para repasse na conta corporativa em D+2.</p>
              <p>• <strong>Garantia Cambial:</strong> O swap trava a taxa executada no provedor principal, eliminando 100% da variação no payout final.</p>
              <p>• <strong>Compliance AML:</strong> Valores acima de USD $50,000 requerem validação manual das ordens de exportação associadas.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
