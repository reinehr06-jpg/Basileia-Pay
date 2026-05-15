'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { ReauthAction } from '@/components/security/ReauthAction';
import { useGateways } from '@/hooks/api/useGateways';
import { Loader2, AlertCircle, Plus, CreditCard, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function GatewaysPage() {
  const { gateways, loading, error, refetch } = useGateways();

  return (
    <PageLayout
      title="Gateways"
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
          <Plus size={16} /> Adicionar Gateway
        </button>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-brand" size={32} />
          <p className="text-ink-subtle text-sm">Carregando gateways...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
          <AlertCircle className="text-danger" size={32} />
          <div>
            <p className="text-ink font-medium">Erro ao carregar gateways</p>
            <p className="text-ink-subtle text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={refetch}
            className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : gateways.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
          <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mb-2">
            <CreditCard className="text-ink-subtle" size={24} />
          </div>
          <div>
            <p className="text-ink font-medium">Nenhum gateway configurado</p>
            <p className="text-ink-subtle text-sm mt-1">
              Você precisa de pelo menos uma conta de recebimento para processar vendas.
            </p>
          </div>
          <button className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
            Configurar meu primeiro gateway
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((gateway) => (
            <Card key={gateway.id} className={`border-l-4 ${gateway.status === 'active' ? 'border-l-success' : 'border-l-warning'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-ink text-lg">{gateway.name}</h3>
                  <p className="text-xs text-ink-subtle uppercase tracking-wider font-semibold mt-1">
                    {gateway.provider} • {gateway.environment}
                  </p>
                </div>
                {gateway.last_test_status === 'success' ? (
                  <ShieldCheck size={20} className="text-success" />
                ) : gateway.last_test_status === 'error' ? (
                  <ShieldAlert size={20} className="text-danger" />
                ) : (
                  <Activity size={20} className="text-ink-muted" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    gateway.status === 'active' ? 'bg-success-muted text-success' : 'bg-warning-muted text-warning'
                  }`}>
                    {gateway.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-ink-muted">Último teste:</span>
                  <span className="text-ink font-medium">{gateway.last_tested_at || 'Nunca testado'}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex gap-2">
                  <button className="flex-1 px-3 py-1.5 text-sm bg-surface-raised text-ink border border-border hover:bg-border rounded font-medium transition-colors">
                    Editar
                  </button>
                  <ReauthAction action="gateway.test">
                    <button className="flex-1 px-3 py-1.5 text-sm bg-brand-muted text-brand border border-brand/20 hover:bg-brand/10 rounded font-medium transition-colors">
                      Testar
                    </button>
                  </ReauthAction>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
