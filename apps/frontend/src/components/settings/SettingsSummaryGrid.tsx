'use client';

import Link from 'next/link';
import { Shield, GitBranch, Code2, Server, ArrowRight } from 'lucide-react';
import { SettingsSummary } from '@/types/settings';
import { SettingsApiUsageBar } from './SettingsApiUsageBar';
import { SettingsTabValue } from './SettingsTabs';

interface SettingsSummaryGridProps {
  summary: SettingsSummary;
  onTabChange: (tab: SettingsTabValue) => void;
  onActionFeedback: (msg: string) => void;
}

export function SettingsSummaryGrid({ summary, onTabChange, onActionFeedback }: SettingsSummaryGridProps) {
  return (
    <div className="pt-6 border-t border-[#E8DDFD]/60 w-full text-left">
      
      {/* Bloco horizontal único, 4 colunas com divisórias discretas e borda lilás suave */}
      <div className="bg-white border border-[#E8DDFD] rounded-[22px] shadow-sm shadow-slate-100/50 divide-y lg:divide-y-0 lg:divide-x divide-[#E8DDFD]/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full overflow-hidden">
        
        {/* Seção 1 - Segurança */}
        <div className="p-5 flex flex-col justify-between min-h-[148px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Segurança</span>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                Protegido
              </span>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-450 leading-relaxed">
              Todas as políticas de segurança estão ativas e atualizadas.
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-violet-600">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Sistema Blindado</span>
          </div>
        </div>

        {/* Seção 2 - Integrações */}
        <div className="p-5 flex flex-col justify-between min-h-[148px]">
          <div>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Integrações</span>
            <p className="mt-3 text-[11px] font-medium text-slate-450 leading-relaxed">
              {summary.integrations.gatewaysCount} gateways conectados<br />
              {summary.integrations.webhooksCount} webhooks ativos
            </p>
          </div>
          <button
            onClick={() => onTabChange('integrations')}
            className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-violet-600 hover:text-violet-850 hover:underline cursor-pointer w-fit uppercase tracking-tight"
          >
            Ver integrações
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Seção 3 - Uso da API */}
        <div className="p-5 flex flex-col justify-between min-h-[148px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Uso da API</span>
              <Link 
                href="/dashboard/developers"
                className="inline-flex items-center gap-0.5 text-[10px] font-black text-violet-600 hover:text-violet-850 hover:underline uppercase tracking-tight"
              >
                Ver métricas
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-450 leading-relaxed">
              {summary.apiUsage.callsThisMonth.toLocaleString('pt-BR')} chamadas este mês<br />
              {summary.apiUsage.percentUsed}% do limite utilizado
            </p>
          </div>
          <div className="mt-2.5">
            <SettingsApiUsageBar percentUsed={summary.apiUsage.percentUsed} />
          </div>
        </div>

        {/* Seção 4 - Ambiente */}
        <div className="p-5 flex flex-col justify-between min-h-[148px]">
          <div>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Ambiente</span>
            <p className="mt-3 text-[11px] font-medium text-slate-450 leading-relaxed">
              Ambiente de {summary.environment === 'production' ? 'Produção' : 'Sandbox'} ativo<br />
              Região: {summary.company.region}
            </p>
          </div>
          <Link 
            href="/dashboard/settings/environments"
            className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-violet-600 hover:text-violet-850 hover:underline cursor-pointer w-fit uppercase tracking-tight"
          >
            Gerenciar ambientes
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
