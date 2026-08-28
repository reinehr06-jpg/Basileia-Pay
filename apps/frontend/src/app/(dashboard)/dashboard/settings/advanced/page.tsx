'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Save, Check, X, SlidersHorizontal, AlertTriangle, ShieldCheck, Database } from 'lucide-react';

export default function AdvancedSettingsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [betaFeatures, setBetaFeatures] = useState({
    smartCheckoutAB: false,
    whatsappRecovery: true,
    realtimeRoutingSimulator: false
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast('Configurações avançadas salvas.');
  };

  const handleClearCache = () => {
    triggerToast('Invalidação de cache geral executada com sucesso.');
  };

  const handleExportData = () => {
    triggerToast('Solicitação LGPD recebida. O link de download do dump foi enviado por e-mail.');
  };

  return (
    <div className="w-full text-left space-y-6 pt-2 pb-12 select-none">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-brand text-white p-3.5 rounded-2xl shadow-xl border border-brand/50 flex items-center justify-between gap-3 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455">
        <Link href="/dashboard/settings" className="hover:text-brand flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Configurações
        </Link>
        <span className="text-slate-350">/</span>
        <span className="text-slate-700 font-bold">Avançado</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5EF] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-150 text-zinc-700 border border-zinc-200 flex items-center justify-center shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              Configurações Avançadas
            </h1>
            <p className="text-slate-455 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
              Gerencie limites da conta, invalidação de caches de gateways e recursos experimentais em fase beta.
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="flex h-9 items-center justify-center gap-1.5 px-4 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-600/15 transition-all uppercase tracking-tight"
        >
          <Save className="w-3.5 h-3.5 shrink-0" />
          Salvar alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Col 1 & 2: Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account limits list */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Limites Operacionais Atuais da Conta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-black uppercase text-slate-400">Máx. Checkouts</span>
                <p className="text-sm font-black text-slate-900 mt-1">Sem limite</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-black uppercase text-slate-400">Máx. Gateways</span>
                <p className="text-sm font-black text-slate-900 mt-1">20 ativos</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-black uppercase text-slate-400">Conexões simultâneas</span>
                <p className="text-sm font-black text-slate-900 mt-1">10.000 / sec</p>
              </div>
            </div>
          </div>

          {/* Feature flags experimental */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Recursos Experimentais (Beta Flags)
            </h3>

            <div className="space-y-4">
              {[
                { id: 'smartCheckoutAB', label: 'Testes A/B automatizados no checkout', desc: 'Permite testar layouts e ordenações de gateway simultaneamente para mensurar performance de conversão.' },
                { id: 'whatsappRecovery', label: 'Recuperação ativa via chatbot WhatsApp', desc: 'Aciona um assistente virtual cognitivo de suporte para clientes com compras recusadas ou abandonadas.' },
                { id: 'realtimeRoutingSimulator', label: 'Simulador visual de fluxo de roteamento em tempo real', desc: 'Fornece diagnóstico imediato de qual gateway será selecionado antes do checkout rodar.' }
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-1">
                  <div className="max-w-[80%] text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-slate-900">{item.label}</p>
                      <span className="bg-brand-soft text-brand border border-brand/10 px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider">Beta</span>
                    </div>
                    <p className="text-[10.5px] font-semibold text-slate-455 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setBetaFeatures({ ...betaFeatures, [item.id as keyof typeof betaFeatures]: !betaFeatures[item.id as keyof typeof betaFeatures] })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${betaFeatures[item.id as keyof typeof betaFeatures] ? 'bg-brand' : 'bg-slate-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${betaFeatures[item.id as keyof typeof betaFeatures] ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Maintenance tools */}
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Ferramentas de Manutenção e Dados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
                <span className="text-xs font-black text-slate-950 block">Invalidação de Cache</span>
                <p className="text-[10.5px] font-semibold text-slate-450 leading-relaxed">
                  Força a invalidação instantânea do cache operacional de gateways de pagamento e configurações salvas.
                </p>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-[10px] font-black uppercase transition-all"
                >
                  Limpar cache
                </button>
              </div>

              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-3">
                <span className="text-xs font-black text-slate-950 block">Exportação LGPD (Dados)</span>
                <p className="text-[10.5px] font-semibold text-slate-450 leading-relaxed">
                  Gere um dump completo contendo todos os dados cadastrais da sua empresa coletados na plataforma.
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-[10px] font-black uppercase transition-all"
                >
                  Exportar dados
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Col 3: Maintenance Switch */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E5EF] rounded-[22px] p-5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Modo de Manutenção
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Checkout público</span>
              <button 
                type="button"
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode);
                  triggerToast(`Modo de manutenção dos checkouts ${!maintenanceMode ? 'ativado' : 'desativado'}.`);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${maintenanceMode ? 'bg-red-500' : 'bg-slate-200'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <p className="text-[10.5px] font-semibold text-slate-450 leading-relaxed">
              Ao ativar, todos os checkouts ativos serão redirecionados temporariamente para uma página de manutenção.
            </p>

            {maintenanceMode && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50/70 border border-red-200 rounded-xl text-[10.5px] font-bold text-red-800 leading-normal animate-in slide-in-from-top-2 duration-200">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>O tráfego de pagamento público de todos os checkouts está bloqueado enquanto estiver ativo.</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
