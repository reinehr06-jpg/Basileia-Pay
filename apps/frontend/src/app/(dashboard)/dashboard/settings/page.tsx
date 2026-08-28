'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { SettingsSandboxBanner } from '@/components/settings/SettingsSandboxBanner';
import { SettingsTabs, SettingsTabValue } from '@/components/settings/SettingsTabs';
import { SettingsCard } from '@/components/settings/SettingsCard';
import { SettingsCardSpecial } from '@/components/settings/SettingsCardSpecial';
import { SettingsSummaryGrid } from '@/components/settings/SettingsSummaryGrid';
import { MOCK_SETTINGS_CARDS, MOCK_SETTINGS_SUMMARY } from './__mocks__/settings';
import { Check, X, ShieldAlert, Users, Sliders, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsHubPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production');
  const [activeTab, setActiveTab] = useState<SettingsTabValue>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic user role to test permissions in live mockup
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'financial' | 'developer' | 'support' | 'auditor'>('owner');

  // Feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/v1/dashboard/company');
        if (res.success && res.data) {
          const data = res.data as { environment?: 'production' | 'sandbox' };
          if (data.environment) setEnvironment(data.environment);
        }
      } catch (err) { /* company endpoint is optional */ } finally {
        setMounted(true);
        setLoading(false);
      }
    })();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleEnvironment = () => {
    setEnvironment((prev) => {
      const next = prev === 'production' ? 'sandbox' : 'production';
      triggerToast(`Ambiente alterado para ${next === 'production' ? 'Produção' : 'Sandbox'}.`);
      return next;
    });
  };

  // Filter logic
  const filteredCards = MOCK_SETTINGS_CARDS.filter((card) => {
    // Search matching
    const matchesSearch = 
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab matching
    let matchesTab = true;
    if (activeTab === 'company') matchesTab = card.category === 'Empresa';
    else if (activeTab === 'security') matchesTab = card.category === 'Segurança';
    else if (activeTab === 'integrations') matchesTab = card.category === 'Integrações';
    else if (activeTab === 'operation') matchesTab = card.category === 'Operação';
    else if (activeTab === 'financial') matchesTab = card.category === 'Financeiro';
    else if (activeTab === 'system') matchesTab = card.category === 'Sistema';

    return matchesSearch && matchesTab;
  });

  if (!mounted) return null;

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

      {/* Role Simulator Toolbar (Only visible in development environment) */}
      {process.env.NODE_ENV === "development" && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-violet-50/50 border border-[#E8DDFD] p-3 rounded-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Users className="w-4 h-4 text-brand" />
            <span>Simulador de Permissões (Cargo ativo):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['owner', 'admin', 'financial', 'developer', 'support', 'auditor'] as const).map((role) => (
              <button
                key={role}
                onClick={() => {
                  setUserRole(role);
                  triggerToast(`Visualizando configurações como ${role.toUpperCase()}.`);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer",
                  userRole === role
                    ? "bg-brand border-brand text-white shadow-sm"
                    : "bg-white border-[#E8DDFD] text-slate-600 hover:bg-slate-50"
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header section (Section 4) */}
      <SettingsHeader 
        environment={environment} 
        lastUpdatedAt={MOCK_SETTINGS_SUMMARY.lastUpdatedAt} 
        onToggleEnvironment={handleToggleEnvironment} 
      />

      {/* Sandbox Warning Banner (Section 4) */}
      <SettingsSandboxBanner 
        isVisible={environment === 'sandbox'} 
        onGoToProduction={() => {
          setEnvironment('production');
          triggerToast('Retornando ao ambiente de Produção.');
        }} 
      />

      {/* Search Bar & Tabs Container - Compact and horizontal aligned */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E8DDFD]/60 pb-0 w-full">
        <SettingsTabs activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          triggerToast(`Filtrando por categoria: ${tab.toUpperCase()}.`);
        }} />

        {/* Search box input - Aligned to the right, 42px height, soft lilac border */}
        <div className="relative w-full md:w-[320px] shrink-0 pb-2">
          <input
            type="text"
            placeholder="Buscar configurações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[42px] pl-3.5 pr-9 bg-white border border-[#E8DDFD]/90 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-brand placeholder:text-slate-350 shadow-sm shadow-slate-50/20"
          />
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-[14px] text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-slate-350 absolute right-3.5 top-[14px]" />
          )}
        </div>
      </div>

      {/* Grid of Settings Cards */}
      {loading ? (
        // Skeleton loader
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="h-[154px] bg-slate-100 rounded-[20px] border border-slate-200" />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white border border-[#E7E5EF] rounded-[22px] shadow-sm">
          <ShieldAlert className="w-10 h-10 text-slate-300 mb-2.5" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nenhuma configuração encontrada</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] text-center leading-normal">
            Nenhuma configuração disponível nesta categoria para a busca realizada.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          
          {/* Main cards mapping */}
          {filteredCards.map((card) => (
            <SettingsCard 
              key={card.id} 
              card={card} 
              userRole={userRole} 
              onActionFeedback={triggerToast} 
            />
          ))}

          {/* Render platform status card widget (Section 7) */}
          {(activeTab === 'all' || activeTab === 'system') && !searchQuery && (
            <SettingsCardSpecial onActionFeedback={triggerToast} />
          )}

        </div>
      )}

      {/* Account metrics and usage summaries footer (Section 8) */}
      <SettingsSummaryGrid 
        summary={{
          ...MOCK_SETTINGS_SUMMARY,
          environment: environment
        }} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          triggerToast(`Navegando para tab ${tab.toUpperCase()}.`);
        }} 
        onActionFeedback={triggerToast} 
      />

    </div>
  );
}
