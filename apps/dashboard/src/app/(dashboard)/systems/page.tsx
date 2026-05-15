'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { useSystems } from '@/hooks/api/useSystems';
import { Loader2, AlertCircle, Plus, Cpu } from 'lucide-react';

export default function SystemsPage() {
  const { systems, loading, error, refetch } = useSystems();

  return (
    <PageLayout
      title="Sistemas"
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
          <Plus size={16} /> Novo sistema
        </button>
      }
    >
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand" size={32} />
              <p className="text-ink-subtle text-sm">Carregando sistemas...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <AlertCircle className="text-danger" size={32} />
              <div>
                <p className="text-ink font-medium">Erro ao carregar sistemas</p>
                <p className="text-ink-subtle text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={refetch}
                className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : systems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mb-2">
                <Cpu className="text-ink-subtle" size={24} />
              </div>
              <div>
                <p className="text-ink font-medium">Nenhum sistema conectado</p>
                <p className="text-ink-subtle text-sm mt-1">
                  Comece conectando seu primeiro sistema para processar pagamentos.
                </p>
              </div>
              <button className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
                Criar primeiro sistema
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-ink">
              <thead className="border-b border-border bg-surface-raised text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Ambiente</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((system) => (
                  <tr key={system.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{system.name}</td>
                    <td className="px-4 py-3 font-mono text-ink-subtle">{system.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        system.environment === 'production' ? 'bg-brand-muted text-brand' : 'bg-surface-raised text-ink-muted'
                      }`}>
                        {system.environment.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        system.status === 'active' ? 'bg-success-muted text-success' : 'bg-danger-muted text-danger'
                      }`}>
                        {system.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-brand hover:underline">Ver detalhes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </PageLayout>
  );
}
