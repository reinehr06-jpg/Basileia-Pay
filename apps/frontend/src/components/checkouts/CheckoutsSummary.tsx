'use client';

import { 
  Info, 
  RefreshCw,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutsSummaryProps {
  checkouts?: any[];
  onFilterStatus?: (status: string) => void;
  onFilterAttention?: (type: string) => void;
}

export function CheckoutsSummary({ checkouts = [], onFilterStatus, onFilterAttention }: CheckoutsSummaryProps) {
  return (
    <div className="mt-2.5 grid grid-cols-1 gap-4 xl:grid-cols-3 w-full">
      <StatusSummaryCard checkouts={checkouts} onFilterStatus={onFilterStatus} />
      <RecentActivityFeed checkouts={checkouts} />
      <AttentionPointsCard checkouts={checkouts} onFilterAttention={onFilterAttention} />
    </div>
  );
}

function StatusSummaryCard({ checkouts = [], onFilterStatus }: { checkouts: any[], onFilterStatus?: (status: string) => void }) {
  const stats = { published: 0, draft: 0, paused: 0, archived: 0 };
  checkouts.forEach((c: any) => {
    const status = c.status?.toLowerCase();
    if (status === 'publicado' || status === 'published') stats.published++;
    else if (status === 'rascunho' || status === 'draft') stats.draft++;
    else if (status === 'pausado' || status === 'paused') stats.paused++;
    else if (status === 'arquivado' || status === 'archived') stats.archived++;
  });

  const total = checkouts.length || 1;
  const pct = (val: number) => ((val / total) * 100).toFixed(1) + '%';
  const pctNum = (val: number) => (val / total) * 100;

  const items = [
    { label: "Publicados", value: stats.published, percent: pct(stats.published), color: "bg-green-500", key: 'Publicado' },
    { label: "Rascunhos", value: stats.draft, percent: pct(stats.draft), color: "bg-amber-500", key: 'Rascunho' },
    { label: "Pausados", value: stats.paused, percent: pct(stats.paused), color: "bg-yellow-500", key: 'Pausado' },
    { label: "Arquivados", value: stats.archived, percent: pct(stats.archived), color: "bg-slate-400", key: 'Arquivado' },
  ];

  return (
    <div className="rounded-[22px] border border-border bg-surface/85 p-4 shadow-[0_10px_30px_rgba(76,29,149,0.08)] flex flex-col justify-between h-[195px] xl:h-[200px]">
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-950 dark:text-ink">
            Resumo de Status
          </h3>
          <Info className="h-4 w-4 text-violet-500" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              onClick={() => onFilterStatus?.(item.key)}
              className="rounded-2xl border border-border bg-surface p-2 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-brand-soft/30 hover:border-brand/30 transition-all"
            >
              <div className={`mb-1.5 h-2 w-2 rounded-full shrink-0 ${item.color}`} />
              <p className="text-lg font-black text-slate-950 dark:text-ink leading-none">{item.value}</p>
              <p className="mt-1 text-[9px] font-bold text-slate-600 dark:text-slate leading-tight">
                {item.label}
              </p>
              <p className="text-[9px] font-semibold text-slate-400 leading-tight">
                {item.percent}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
        <div style={{ width: `${pctNum(stats.published)}%` }} className="bg-green-500" />
        <div style={{ width: `${pctNum(stats.draft)}%` }} className="bg-amber-500" />
        <div style={{ width: `${pctNum(stats.paused)}%` }} className="bg-yellow-500" />
        <div style={{ width: `${pctNum(stats.archived)}%` }} className="bg-slate-400" />
      </div>
    </div>
  );
}

function RecentActivityFeed({ checkouts = [] }: { checkouts: any[] }) {
  const activities = checkouts.slice(0, 4).map((c: any) => {
    const status = c.status?.toLowerCase();
    const isPublished = status === 'publicado' || status === 'published';
    const isDraft = status === 'rascunho' || status === 'draft';
    const isPaused = status === 'pausado' || status === 'paused';
    return {
      title: `Checkout "${c.name}" foi atualizado`,
      description: `Versão: ${c.version || 'v1.0.0'} • Slug: /${c.slug || ''}`,
      time: c.lastUpdate || '—',
      badge: isPublished ? 'Publicado' : isDraft ? 'Rascunho' : isPaused ? 'Pausado' : c.status,
      badgeClass: isPublished 
        ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30" 
        : isDraft 
          ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/30" 
          : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-955/20 dark:text-blue-400 dark:border-blue-900/30",
    };
  });

  return (
    <div className="rounded-[22px] border border-border bg-surface/85 p-4 shadow-[0_10px_30px_rgba(76,29,149,0.08)] flex flex-col justify-between h-[195px] xl:h-[200px]">
      <div>
        <h3 className="mb-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-950 dark:text-ink shrink-0">
          Atividades Recentes
        </h3>

        {activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
            <Info className="w-4 h-4 text-slate-400 mb-1" />
            <p className="text-[10px] font-bold text-slate-500">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-1.5 overflow-hidden">
            {activities.slice(0, 3).map((act, idx) => (
              <div key={idx} className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    act.badge === 'Publicado' || act.badge === 'published' ? 'bg-green-500' : '',
                    act.badge === 'Rascunho' || act.badge === 'draft' ? 'bg-amber-500' : '',
                    act.badge === 'Pausado' || act.badge === 'paused' ? 'bg-yellow-500' : '',
                  )} />
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-black text-slate-950 dark:text-ink leading-tight">
                      {act.title}
                    </p>
                    <p className="truncate text-[9.5px] font-medium text-slate-500 mt-0.5 leading-none">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className={`rounded-lg border px-1.5 py-0.5 text-[8px] font-black leading-none ${act.badgeClass}`}>
                    {act.badge}
                  </span>
                  <span className="text-[9.5px] font-semibold text-slate-400">
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-violet-650 dark:text-brand-accent uppercase tracking-wider hover:gap-2 transition-all shrink-0">
        Ver todas as atividades →
      </button>
    </div>
  );
}

function AttentionPointsCard({ checkouts = [], onFilterAttention }: { checkouts: any[], onFilterAttention?: (type: string) => void }) {
  const rascunhos = checkouts.filter((c: any) => c.status?.toLowerCase() === 'rascunho' || c.status?.toLowerCase() === 'draft');
  const points = [];
  
  if (rascunhos.length > 0) {
    points.push({
      title: `${rascunhos.length} rascunho${rascunhos.length > 1 ? 's' : ''} pendente${rascunhos.length > 1 ? 's' : ''}`,
      description: "Edite o layout no Studio antes de publicar",
      action: "Configurar",
      icon: RefreshCw,
      key: 'rascunho',
    });
  }

  return (
    <div className="rounded-[22px] border border-border bg-surface/85 p-4 shadow-[0_10px_30px_rgba(76,29,149,0.08)] flex flex-col justify-between h-[195px] xl:h-[200px]">
      <div>
        <h3 className="mb-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-slate-950 dark:text-ink shrink-0">
          Pontos de Atenção
        </h3>

        {points.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <Info className="w-5 h-5 text-emerald-500 mb-1" />
            <p className="text-[10px] font-bold text-slate-500">Tudo em ordem. Nenhum ponto de atenção detectado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {points.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.title} className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-955/20 text-violet-650 dark:text-brand-accent border border-violet-100 dark:border-violet-900/30 shadow-sm">
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11.5px] font-black text-slate-950 dark:text-ink leading-tight">
                        {point.title}
                      </p>
                      <p className="truncate text-[9.5px] font-medium text-slate-500 mt-0.5 leading-none">
                        {point.description}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onFilterAttention?.(point.key)}
                    className="shrink-0 text-[10px] font-black text-violet-650 dark:text-brand-accent hover:underline"
                  >
                    {point.action}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
