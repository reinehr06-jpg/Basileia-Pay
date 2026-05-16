'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Copy, Plus, Trash2, Key, ShieldCheck, Globe, Settings as SettingsIcon } from 'lucide-react';

export default function SystemDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<'overview' | 'api-keys' | 'webhooks' | 'settings'>('overview');
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    // Mock key generation
    setNewKey('ck_live_' + Math.random().toString(36).substring(2, 32));
  };

  return (
    <PageLayout title="Site Principal" backHref="/systems">
      {/* Tabs Navigation */}
      <div className="flex border-b border-border mb-6">
        {[
          { id: 'overview', label: 'Visão geral', icon: Globe },
          { id: 'api-keys', label: 'API Keys', icon: Key },
          { id: 'webhooks', label: 'Webhooks', icon: ShieldCheck },
          { id: 'settings', label: 'Configurações', icon: SettingsIcon },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === item.id ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Status do Sistema">
             <div className="space-y-4">
               <div className="flex justify-between text-sm">
                 <span className="text-ink-muted">Token ID:</span>
                 <span className="font-mono text-ink">sys_8a9b2c</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-ink-muted">Ambiente:</span>
                 <span className="font-medium text-ink">Produção</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-ink-muted">Chaves Ativas:</span>
                 <span className="font-medium text-ink">2</span>
               </div>
             </div>
          </Card>
          
          <Card title="Uso (24h)">
             <div className="h-40 flex items-center justify-center text-ink-subtle border border-dashed border-border rounded bg-background">
               Gráfico de Requisições
             </div>
          </Card>
        </div>
      )}

      {tab === 'api-keys' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-ink">Gerenciar Chaves</h3>
            <button 
              onClick={handleCreateKey}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand text-white rounded-md text-xs font-medium hover:bg-brand-deep"
            >
              <Plus size={14} /> Nova Key
            </button>
          </div>

          {newKey && (
            <div className="bg-warning-muted/20 border border-warning/50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-warning">⚠️</div>
                <div>
                  <h4 className="font-bold text-ink text-sm">Salve sua nova chave agora</h4>
                  <p className="text-xs text-ink-muted">Por segurança, ela não será exibida novamente após você fechar este aviso.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-surface border border-border p-3 rounded font-mono text-sm text-brand-deep">
                {newKey}
                <button className="ml-auto p-1 hover:bg-surface-raised rounded transition-colors text-ink-subtle" title="Copiar">
                  <Copy size={16} />
                </button>
              </div>
              <button 
                onClick={() => setNewKey(null)}
                className="text-xs font-bold text-ink-muted hover:text-ink"
              >
                Já salvei a chave
              </button>
            </div>
          )}

          <Card>
             <table className="w-full text-left text-sm text-ink">
               <thead className="bg-surface-raised text-ink-muted border-b border-border">
                 <tr>
                   <th className="px-4 py-3 font-medium">Nome</th>
                   <th className="px-4 py-3 font-medium">Chave (Prefixo)</th>
                   <th className="px-4 py-3 font-medium">Criada em</th>
                   <th className="px-4 py-3 font-medium">Último uso</th>
                   <th className="px-4 py-3 font-medium text-right">Ações</th>
                 </tr>
               </thead>
               <tbody>
                 <tr className="border-b border-border">
                   <td className="px-4 py-3 font-medium">Checkout Principal</td>
                   <td className="px-4 py-3 font-mono text-ink-subtle text-xs">ck_live_8a9b2c...</td>
                   <td className="px-4 py-3 text-ink-subtle">12/05/2026</td>
                   <td className="px-4 py-3 text-ink-subtle">Hoje, 10:15</td>
                   <td className="px-4 py-3 text-right">
                     <button className="text-danger hover:text-danger-muted p-1"><Trash2 size={16} /></button>
                   </td>
                 </tr>
               </tbody>
             </table>
          </Card>
        </div>
      )}

      {tab === 'webhooks' && (
        <Card title="Webhooks do Sistema">
           <p className="text-sm text-ink-muted">Configure URLs para receber notificações de eventos deste sistema.</p>
           {/* Webhooks table or empty state */}
        </Card>
      )}

      {tab === 'settings' && (
        <Card title="Configurações do Sistema">
           <div className="py-10 text-center text-ink-subtle text-sm">
             Configurações em breve.
           </div>
        </Card>
      )}
    </PageLayout>
  );
}
