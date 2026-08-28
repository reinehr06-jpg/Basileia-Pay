'use client';

import { Users, Monitor, ShieldAlert, Key, Globe, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityKpiCardsProps {
  activeUsers: number;
  activeSessions: number;
  twoFactorCount: number;
  allowlistCount: number;
  criticalEvents: number;
  onFilterTab?: (tab: any) => void;
}

export function SecurityKpiCards({
  activeUsers,
  activeSessions,
  twoFactorCount,
  allowlistCount,
  criticalEvents,
  onFilterTab
}: SecurityKpiCardsProps) {
  
  // Calculate 2FA rate
  const twoFactorRate = activeUsers > 0 ? (twoFactorCount / activeUsers) * 100 : 0;
  const isTwoFactorAlert = twoFactorRate < 80;

  // Determine if session count is high
  const isSessionsHigh = activeSessions > 10;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
      
      {/* 1. Score de Proteção Banner - Spans 2 columns, Slate 900 High Contrast, Premium */}
      <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-850 rounded-[22px] p-4.5 text-white flex flex-col justify-between relative overflow-hidden group shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">
            Score de Proteção Geral
          </span>
          <span className="text-[8.5px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg uppercase tracking-wider animate-pulse">
            Fortificado
          </span>
        </div>
        
        <div className="mt-2.5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black tracking-tight">92</span>
              <span className="text-xs text-slate-500 font-bold">/100</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 leading-normal mt-1">
              Políticas de 2FA obrigatório e restrição estrita de CIDR em allowlist ativas.
            </p>
          </div>
          <div className="w-11 h-11 bg-slate-850 rounded-xl flex items-center justify-center text-brand shrink-0 border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-brand" />
          </div>
        </div>
      </div>

      {/* 2. Usuários Ativos */}
      <div 
        onClick={() => onFilterTab?.('users')}
        className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 hover:shadow-md hover:border-brand/40 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Usuários
          </span>
          <div className="w-7 h-7 bg-slate-50 text-slate-450 border border-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-slate-800 leading-none">
            {activeUsers}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400">
            <span className="text-emerald-600 font-extrabold">+3 novos</span>
          </div>
        </div>
      </div>

      {/* 3. Sessões Ativas */}
      <div 
        onClick={() => onFilterTab?.('sessions')}
        className={cn(
          "border rounded-[22px] p-4.5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group",
          isSessionsHigh ? "bg-amber-50/50 border-amber-100" : "bg-white border-border/60"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Sessões
          </span>
          <div className="w-7 h-7 bg-white text-slate-450 border border-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors shrink-0">
            <Monitor className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-slate-800 leading-none">
            {activeSessions}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400">
            {isSessionsHigh ? (
              <span className="text-amber-600 font-black uppercase">Elevado</span>
            ) : (
              <span>Ativas</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. 2FA Habilitado */}
      <div 
        onClick={() => onFilterTab?.('2fa')}
        className={cn(
          "border rounded-[22px] p-4.5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group",
          isTwoFactorAlert ? "bg-amber-50/50 border-amber-100" : "bg-white border-border/60"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            2FA
          </span>
          <div className="w-7 h-7 bg-white text-slate-450 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
            <Key className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-slate-800 leading-none">
            {twoFactorCount} <span className="text-xs text-slate-400 font-bold">({twoFactorRate.toFixed(0)}%)</span>
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400">
            {isTwoFactorAlert ? (
              <span className="text-amber-650 font-extrabold">Abaixo 80%</span>
            ) : (
              <span className="text-emerald-650 font-extrabold">Seguro</span>
            )}
          </div>
        </div>
      </div>

      {/* 5. IPs Permitidos */}
      <div 
        onClick={() => onFilterTab?.('ips')}
        className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 hover:shadow-md hover:border-brand/40 transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            IPs
          </span>
          <div className="w-7 h-7 bg-slate-50 text-slate-450 border border-slate-100 rounded-lg flex items-center justify-center group-hover:bg-brand/10 group-hover:text-brand transition-colors shrink-0">
            <Globe className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="text-2xl font-black text-slate-800 leading-none">
            {allowlistCount}
          </h4>
          <div className="flex items-center gap-1 mt-1 text-[9px] font-bold text-slate-400">
            <span>Allowlist</span>
          </div>
        </div>
      </div>

    </div>
  );
}
