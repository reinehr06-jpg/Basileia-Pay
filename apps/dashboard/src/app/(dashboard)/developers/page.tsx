'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { useApiKeys } from '@/hooks/api/useApiKeys';
import { Loader2, AlertCircle, Plus, Code, Key, ExternalLink, Copy, Webhook } from 'lucide-react';

export default function DevelopersPage() {
  const { keys, loading, error, refetch } = useApiKeys();

  return (
    <PageLayout
      title="Desenvolvedores"
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
          <Plus size={16} /> Criar Chave de API
        </button>
      }
    >
      <div className="space-y-6">
        <Card title="Recursos para Integração">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#" className="p-4 border border-border rounded-lg hover:border-brand hover:bg-brand/5 transition-all group">
              <Code className="text-ink-muted group-hover:text-brand mb-2" size={24} />
              <div className="font-bold text-ink text-sm">Documentação API</div>
              <p className="text-xs text-ink-subtle mt-1">Guia completo para integrar sistemas via HTTP.</p>
            </a>
            <a href="#" className="p-4 border border-border rounded-lg hover:border-brand hover:bg-brand/5 transition-all group">
              <ExternalLink className="text-ink-muted group-hover:text-brand mb-2" size={24} />
              <div className="font-bold text-ink text-sm">SDK JavaScript</div>
              <p className="text-xs text-ink-subtle mt-1">Pacote NPM para checkouts embutidos.</p>
            </a>
            <a href="#" className="p-4 border border-border rounded-lg hover:border-brand hover:bg-brand/5 transition-all group">
              <Webhook className="text-ink-muted group-hover:text-brand mb-2" size={24} />
              <div className="font-bold text-ink text-sm">Explorador de Eventos</div>
              <p className="text-xs text-ink-subtle mt-1">Simule e visualize payloads de webhooks.</p>
            </a>
          </div>
        </Card>

        <Card title="Minhas Chaves de API">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-brand" size={32} />
                <p className="text-ink-subtle text-sm">Carregando chaves...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
                <AlertCircle className="text-danger" size={32} />
                <div>
                  <p className="text-ink font-medium">Erro ao carregar chaves</p>
                  <p className="text-ink-subtle text-sm mt-1">{error}</p>
                </div>
                <button 
                  onClick={() => refetch()}
                  className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            ) : keys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
                <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mb-2">
                  <Key className="text-ink-subtle" size={24} />
                </div>
                <div>
                  <p className="text-ink font-medium">Nenhuma chave de API</p>
                  <p className="text-ink-subtle text-sm mt-1">
                    Crie uma chave para começar a realizar transações via integração.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-border bg-surface-raised text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Ambiente</th>
                    <th className="px-4 py-3 font-medium">Sistema</th>
                    <th className="px-4 py-3 font-medium">Chave</th>
                    <th className="px-4 py-3 font-medium">Último Uso</th>
                    <th className="px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{key.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          key.environment === 'production' ? 'bg-brand-muted text-brand' : 'bg-surface-raised text-ink-muted'
                        }`}>
                          {key.environment.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-subtle">{key.system_name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink-subtle">
                        <div className="flex items-center gap-2">
                          {key.key_preview}
                          <button className="text-ink-muted hover:text-brand" title="Copiar"><Copy size={12} /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-subtle whitespace-nowrap">{key.last_used_at}</td>
                      <td className="px-4 py-3">
                        <button className="text-danger hover:underline font-medium">Revogar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
