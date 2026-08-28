'use client';

import { Activity, ShieldCheck, Heart, Server, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface DevelopersApiStatusPanelProps {
  uptime?: number;
  latency?: number;
  errorRate?: number;
  region?: string;
}

export function DevelopersApiStatusPanel({
  uptime = 99.95,
  latency = 198,
  errorRate = 0.02,
  region = "São Paulo, BR",
}: DevelopersApiStatusPanelProps) {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState('há 1 min');

  const triggerCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setLastCheck('há poucos segundos');
    }, 800);
  };

  return (
    <div className="w-full lg:w-[320px] bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shrink-0 flex flex-col justify-between overflow-y-auto no-scrollbar text-left shadow-sm shadow-slate-100/50">
      <div className="space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DDFD]/40 pb-3">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Status da API</span>
            <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
              Última verificação: {lastCheck}
            </span>
          </div>
          <button 
            disabled={checking}
            onClick={triggerCheck}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-slate-100 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
            title="Recarregar integridade"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-brand' : ''}`} />
          </button>
        </div>

        {/* Bloco 1 - Saúde Geral */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
            <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
            <span className="text-[10.5px] font-black uppercase tracking-wider">Totalmente Operacional</span>
          </div>
          
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-[10.5px] font-bold text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Uptime Médio:</span>
              <span className="font-black text-slate-800">{uptime}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Latência p95:</span>
              <span className="font-black text-slate-800">{latency} ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Taxa de Erro p95:</span>
              <span className="font-black text-slate-800">{errorRate}%</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
              <span className="text-slate-400 font-semibold">Região Hospedada:</span>
              <div className="flex items-center gap-1 font-black text-slate-800">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{region}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2 - Ambientes */}
        <div className="space-y-2.5">
          <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Serviços / Ambientes</span>
          
          <div className="space-y-2 text-[10px] font-bold text-slate-600 bg-white border border-slate-100 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>Produção API</span>
              </div>
              <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Ativo</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>Sandbox API</span>
              </div>
              <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Ativo</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>Webhooks Engine</span>
              </div>
              <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Ativo</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>Portal Documentação</span>
              </div>
              <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Ativo</span>
            </div>
          </div>
        </div>

        {/* Bloco 3 - Incidentes recentes */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider block">Incidentes Recentes</span>
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-slate-500">
              Nenhum incidente registrado nas últimas 24 horas.
            </p>
          </div>
        </div>

        {/* Bloco 4 - Links rápidos */}
        <div className="space-y-1.5 pt-2 border-t border-[#E8DDFD]/40">
          <a
            href="#"
            className="flex h-8 items-center justify-between px-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold transition-all"
          >
            <span>Ver Status Completo</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <a
            href="#"
            className="flex h-8 items-center justify-between px-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold transition-all"
          >
            <span>Limites e Rate Limit</span>
            <Server className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

      </div>
    </div>
  );
}
