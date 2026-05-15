import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { ReauthAction } from '@/components/security/ReauthAction';
import { CreditCard, QrCode, ShieldCheck, RefreshCcw, ArrowRightLeft } from 'lucide-react';

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageLayout title={`Pagamento #${params.id}`} backHref="/payments">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informações do Pagamento">
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Status</div>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success">Aprovado</span>
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Método</div>
                <div className="flex items-center gap-2 text-sm text-ink font-medium">
                  <QrCode size={16} className="text-ink-subtle" /> PIX
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Valor</div>
                <div className="text-lg font-bold text-ink">R$ 197,00</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Moeda</div>
                <div className="text-sm text-ink">BRL (Real Brasileiro)</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Gateway</div>
                <div className="text-sm text-ink">Asaas (Produção)</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Referência Externa</div>
                <div className="text-sm font-mono text-ink-subtle">pay_asaas_82jks82</div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Idempotency Key</div>
                <div className="text-xs font-mono text-ink-subtle bg-surface-raised p-2 rounded border border-border">
                  idmp_session_8a9b2c_pix_v1
                </div>
              </div>
            </div>
          </Card>

          <Card title="Timeline Técnica (Eventos Imutáveis)">
             <div className="space-y-4">
                {[
                  { time: '15/05 09:12:05.122', event: 'payment.approved', desc: 'Status atualizado para aprovado via Webhook' },
                  { time: '15/05 09:11:50.450', event: 'gateway.charge_created', desc: 'Cobrança PIX gerada no Asaas' },
                  { time: '15/05 09:11:45.010', event: 'payment.processing', desc: 'Processamento iniciado' },
                  { time: '15/05 09:11:44.880', event: 'payment.created', desc: 'Entidade de pagamento criada em rascunho' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 text-xs">
                    <div className="w-32 flex-shrink-0 font-mono text-ink-subtle">{item.time}</div>
                    <div className="font-bold text-ink w-32">{item.event}</div>
                    <div className="text-ink-muted">{item.desc}</div>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* Right: Actions and Logs */}
        <div className="space-y-6">
          <Card title="Ações Disponíveis">
            <div className="space-y-3">
              <ReauthAction action="payment.refund">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-danger text-danger hover:bg-danger-muted/10 rounded-md text-sm font-medium transition-colors">
                  <ArrowRightLeft size={16} /> Reembolsar Total
                </button>
              </ReauthAction>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-ink-muted hover:bg-surface-raised rounded-md text-sm font-medium transition-colors">
                <RefreshCcw size={16} /> Reenviar Comprovante
              </button>
            </div>
          </Card>

          <Card title="Tentativas no Gateway">
             <div className="space-y-4">
               <div className="p-3 border border-border rounded-md bg-surface-raised">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-bold text-ink-subtle uppercase">Tentativa #1</span>
                   <span className="text-[10px] font-bold text-success uppercase">Sucesso</span>
                 </div>
                 <div className="text-xs font-mono text-ink-subtle truncate">ID: pay_82jks82...</div>
                 <button className="mt-2 text-[10px] font-bold text-brand hover:underline">Ver Payload JSON</button>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
