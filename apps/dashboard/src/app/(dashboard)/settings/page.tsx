'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { useCompany } from '@/hooks/api/useCompany';
import { Loader2, AlertCircle, Save, Building, Shield, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { company, loading, error, refetch } = useCompany();
  const [name, setName] = useState('');

  useEffect(() => {
    if (company) {
      setName(company.name);
    }
  }, [company]);

  return (
    <PageLayout title="Configurações">
      <div className="max-w-4xl space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand" size={32} />
            <p className="text-ink-subtle text-sm">Carregando configurações...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
            <AlertCircle className="text-danger" size={32} />
            <div>
              <p className="text-ink font-medium">Erro ao carregar configurações</p>
              <p className="text-ink-subtle text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <Card title="Perfil da Empresa">
              <div className="space-y-4 max-w-lg">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-ink-muted">Nome da Empresa</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" size={18} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 opacity-50">
                  <label className="text-xs font-bold uppercase text-ink-muted">Slug (URL)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" size={18} />
                    <input 
                      type="text" 
                      value={company?.slug}
                      disabled
                      className="w-full bg-surface-raised border border-border rounded-md pl-10 pr-4 py-2 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
                    <Save size={16} /> Salvar Alterações
                  </button>
                </div>
              </div>
            </Card>

            <Card title="Segurança">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface-raised rounded-md text-ink-muted">
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink">Autenticação de Dois Fatores (2FA)</div>
                      <div className="text-xs text-ink-subtle">Adicione uma camada extra de segurança à sua conta.</div>
                    </div>
                  </div>
                  <button className="text-brand text-sm font-medium hover:underline">Configurar</button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
}
