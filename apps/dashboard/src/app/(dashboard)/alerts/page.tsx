'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { useAlerts, Alert } from '@/hooks/api/useAlerts';
import { Bell, AlertTriangle, CheckCircle2, VolumeX, Eye, Loader2, ShieldAlert, Zap, Wrench } from 'lucide-react';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Crítico' },
  high:     { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Alto' },
  medium:   { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Médio' },
  low:      { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Baixo' },
  info:     { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Info' },
};

const CATEGORY_ICONS: Record<string, any> = {
  financial: Zap,
  technical: Wrench,
  security:  ShieldAlert,
};

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

function AlertRow({ alert, onAck, onResolve, onMute }: { alert: Alert; onAck: () => void; onResolve: () => void; onMute: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const CategoryIcon = CATEGORY_ICONS[alert.category] || Bell;

  return (
    <div className={`border border-border rounded-lg p-4 transition-all hover:shadow-md ${alert.severity === 'critical' ? 'border-l-4 border-l-danger' : alert.severity === 'high' ? 'border-l-4 border-l-warning' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${SEVERITY_CONFIG[alert.severity]?.bg || 'bg-gray-100'}`}>
            <CategoryIcon size={18} className={SEVERITY_CONFIG[alert.severity]?.color || 'text-gray-500'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-ink text-sm">{alert.title}</h3>
              <SeverityBadge severity={alert.severity} />
              <span className="text-xs text-ink-subtle capitalize">{alert.category}</span>
            </div>
            <p className="text-sm text-ink-muted mt-1">{alert.message}</p>
            {expanded && alert.recommended_action && (
              <div className="mt-3 p-3 rounded-md bg-brand-muted/30 border border-brand/20">
                <p className="text-xs font-semibold text-brand mb-1">💡 Ação recomendada</p>
                <p className="text-sm text-ink-muted">{alert.recommended_action}</p>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-ink-subtle">
                {alert.last_seen_at ? new Date(alert.last_seen_at).toLocaleString('pt-BR') : '—'}
              </span>
              {alert.entity_type && (
                <span className="text-xs text-ink-subtle">
                  {alert.entity_type}: {alert.entity_id}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-md hover:bg-surface-raised text-ink-subtle hover:text-ink transition-colors" title="Detalhes">
            <Eye size={16} />
          </button>
          {alert.status === 'open' && (
            <button onClick={onAck} className="p-1.5 rounded-md hover:bg-info-muted text-ink-subtle hover:text-info transition-colors" title="Reconhecer">
              <CheckCircle2 size={16} />
            </button>
          )}
          {alert.status !== 'resolved' && (
            <button onClick={onResolve} className="p-1.5 rounded-md hover:bg-success-muted text-ink-subtle hover:text-success transition-colors" title="Resolver">
              <CheckCircle2 size={16} />
            </button>
          )}
          {alert.status !== 'muted' && (
            <button onClick={onMute} className="p-1.5 rounded-md hover:bg-warning-muted text-ink-subtle hover:text-warning transition-colors" title="Silenciar">
              <VolumeX size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { alerts, summary, loading, acknowledgeAlert, resolveAlert, muteAlert } = useAlerts({
    severity: filterSeverity || undefined,
    category: filterCategory || undefined,
    status: filterStatus || undefined,
  });

  return (
    <PageLayout title="Central de Alertas">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(['critical', 'high', 'medium', 'low', 'info'] as const).map(sev => (
          <button key={sev} onClick={() => setFilterSeverity(filterSeverity === sev ? '' : sev)}
            className={`p-3 rounded-lg border transition-all text-center ${filterSeverity === sev ? 'border-brand bg-brand-muted' : 'border-border bg-surface hover:border-brand/30'}`}>
            <div className={`text-2xl font-bold ${SEVERITY_CONFIG[sev].color}`}>{summary[sev]}</div>
            <div className="text-xs text-ink-muted mt-1">{SEVERITY_CONFIG[sev].label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-md border border-border bg-surface text-ink">
          <option value="">Todas categorias</option>
          <option value="financial">Financeiro</option>
          <option value="technical">Técnico</option>
          <option value="security">Segurança</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-md border border-border bg-surface text-ink">
          <option value="">Todos status</option>
          <option value="open">Aberto</option>
          <option value="acknowledged">Reconhecido</option>
          <option value="resolved">Resolvido</option>
          <option value="muted">Silenciado</option>
        </select>
        {(filterSeverity || filterCategory || filterStatus) && (
          <button onClick={() => { setFilterSeverity(''); setFilterCategory(''); setFilterStatus(''); }}
            className="text-sm text-brand hover:underline">Limpar filtros</button>
        )}
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand" size={32} /></div>
      ) : alerts.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-ink-subtle/30 mb-4" />
            <p className="text-ink-muted">Nenhum alerta encontrado.</p>
            <p className="text-sm text-ink-subtle mt-1">Sua operação está funcionando normalmente.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <AlertRow key={alert.id} alert={alert}
              onAck={() => acknowledgeAlert(alert.id)}
              onResolve={() => resolveAlert(alert.id)}
              onMute={() => muteAlert(alert.id)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
