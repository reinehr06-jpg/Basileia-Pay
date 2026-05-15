'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Shield, Search, Download, Loader2, AlertCircle } from 'lucide-react';
import { useAudit } from '@/hooks/api/useAudit';

export default function AuditPage() {
  const { logs, loading, error, refetch } = useAudit();

  return (
    <PageLayout 
      title="Auditoria"
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-ink rounded-md text-sm font-medium hover:bg-surface-raised transition-colors">
          <Download size={16} /> Exportar Logs
        </button>
      }
    >
      <div className="flex gap-4 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por evento, usuário ou entidade..." 
            className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex bg-surface border border-border rounded-md p-0.5">
          <button className="px-3 py-1.5 text-xs font-medium bg-surface shadow-sm text-ink rounded">Hoje</button>
          <button className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink rounded">7 dias</button>
          <button className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink rounded">30 dias</button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-brand" size={32} />
              <p className="text-ink-subtle text-sm">Carregando auditoria...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <AlertCircle className="text-danger" size={32} />
              <div>
                <p className="text-ink font-medium">Erro ao carregar auditoria</p>
                <p className="text-ink-subtle text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={() => refetch()}
                className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
              <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mb-2">
                <Shield className="text-ink-subtle" size={24} />
              </div>
              <div>
                <p className="text-ink font-medium">Nenhum log encontrado</p>
                <p className="text-ink-subtle text-sm mt-1">
                  Todas as ações realizadas na plataforma serão listadas aqui.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-ink">
              <thead className="border-b border-border bg-surface-raised text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Data/hora</th>
                  <th className="px-4 py-3 font-medium">Evento</th>
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Entidade</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-ink-subtle font-mono text-xs">{item.created_at}</td>
                    <td className="px-4 py-3 font-medium">{item.event}</td>
                    <td className="px-4 py-3 text-ink-muted">{item.user_name}</td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-ink-subtle">{item.entity_type}</td>
                    <td className="px-4 py-3 text-ink-subtle italic">{item.ip_address || '[mascarado]'}</td>
                    <td className="px-4 py-3">
                      <button className="text-brand hover:underline font-medium">Ver detalhes</button>
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
