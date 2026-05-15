import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { ReauthAction } from '@/components/security/ReauthAction';
import { RefreshCcw, Calendar, CheckCircle2, AlertCircle, Trash2, Pause, Play } from 'lucide-react';

export default function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageLayout title={`Assinatura #${params.id}`} backHref="/subscriptions">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card title="Informações da Recorrência">
                <div className="grid grid-cols-2 gap-y-6">
                    <div>
                        <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Status</div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success">Ativa</span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Valor do Ciclo</div>
                        <div className="text-lg font-bold text-ink">R$ 299,00</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Intervalo</div>
                        <div className="text-sm text-ink">Mensal (Todo dia 10)</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Próxima Cobrança</div>
                        <div className="flex items-center gap-2 text-sm text-ink font-medium">
                            <Calendar size={14} className="text-ink-subtle" /> 10/06/2026
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Total Pago</div>
                        <div className="text-sm text-success font-bold">R$ 1.196,00</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Ciclo Atual</div>
                        <div className="text-sm text-ink font-medium">Ciclo #4</div>
                    </div>
                </div>
            </Card>

            <Card title="Ciclos de Cobrança">
                <div className="space-y-4">
                    {[
                        { num: 4, date: '10/05/2026', status: 'paid', statusLabel: 'Pago', amount: 'R$ 299,00' },
                        { num: 3, date: '10/04/2026', status: 'paid', statusLabel: 'Pago', amount: 'R$ 299,00' },
                        { num: 2, date: '10/03/2026', status: 'paid', statusLabel: 'Pago', amount: 'R$ 299,00' },
                        { num: 1, date: '10/02/2026', status: 'paid', statusLabel: 'Pago', amount: 'R$ 299,00' },
                    ].map(cycle => (
                        <div key={cycle.num} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="text-xs font-bold text-ink-subtle w-8">#{cycle.num}</div>
                                <div>
                                    <div className="text-sm font-medium text-ink">{cycle.date}</div>
                                    <div className="text-xs text-ink-subtle">Vencimento</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-right">
                                <div className="text-sm font-bold text-ink">{cycle.amount}</div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-success-muted text-success">
                                    {cycle.statusLabel}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>

        <div className="space-y-6">
            <Card title="Gestão">
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-ink hover:bg-surface-raised rounded-md text-sm font-medium transition-colors">
                        <Pause size={16} /> Pausar Cobranças
                    </button>
                    <ReauthAction action="subscription.cancel">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-danger text-danger hover:bg-danger-muted/10 rounded-md text-sm font-medium transition-colors">
                            <Trash2 size={16} /> Cancelar Assinatura
                        </button>
                    </ReauthAction>
                </div>
            </Card>

            <Card title="Mandato PIX">
                <div className="flex items-center gap-3 p-3 bg-success-muted/20 border border-success/30 rounded-lg">
                    <div className="p-2 bg-success rounded-full text-white">
                        <CheckCircle2 size={16} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-success uppercase">Autorizado</div>
                        <div className="text-[10px] text-ink-muted">Mandato: as_mand_82js81</div>
                    </div>
                </div>
                <button className="w-full mt-4 text-xs font-bold text-brand hover:underline">Ver documento de autorização</button>
            </Card>
        </div>
      </div>
    </PageLayout>
  );
}
