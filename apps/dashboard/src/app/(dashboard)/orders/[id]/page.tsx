import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Package, User, Clock, FileText, CheckCircle, Globe } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageLayout title={`Venda #${params.id}`} backHref="/orders">
      
      <div className="flex items-center gap-4 p-4 bg-success-muted/20 border border-success/30 rounded-lg mb-6">
        <div className="p-3 bg-success rounded-full text-white">
          <CheckCircle size={24} />
        </div>
        <div>
          <h2 className="font-bold text-ink text-lg">Venda Aprovada</h2>
          <p className="text-sm text-ink-muted">Aprovado em 15/05/2026 às 09:12 via PIX</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Itens da Venda">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-surface-raised border border-border rounded flex items-center justify-center text-ink-subtle">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-ink">Curso Basileia Pay Pro</div>
                    <div className="text-xs text-ink-muted">Acesso vitalício + Mentoria</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-ink">R$ 197,00</div>
                  <div className="text-xs text-ink-subtle">qtd: 1</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Subtotal</span>
                <span className="text-ink">R$ 197,00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Desconto</span>
                <span className="text-success">- R$ 0,00</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span className="text-ink">Total</span>
                <span className="text-brand">R$ 197,00</span>
              </div>
            </div>
          </Card>

          <Card title="Timeline da Venda">
             <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {[
                  { time: '09:12:05', event: 'Pagamento aprovado', desc: 'Gateway Asaas confirmou o recebimento do PIX', icon: '✅', color: 'success' },
                  { time: '09:11:45', event: 'Checkout finalizado', desc: 'Cliente clicou em pagar e gerou o QR Code', icon: '⚡', color: 'brand' },
                  { time: '09:10:30', event: 'Checkout iniciado', desc: 'Cliente visualizou a página de pagamento', icon: '👀', color: 'ink-subtle' },
                  { time: '09:10:00', event: 'Venda criada', desc: 'Sessão de checkout gerada pelo sistema', icon: '📝', color: 'ink-subtle' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 relative pl-8">
                    <div className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-surface border border-border z-10`}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink">{item.event}</div>
                      <div className="text-xs text-ink-muted mb-1">{item.desc}</div>
                      <div className="text-[10px] text-ink-subtle font-mono uppercase">{item.time}</div>
                    </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card title="Cliente">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center border border-border">
                  <User size={20} className="text-ink-subtle" />
                </div>
                <div>
                  <div className="font-bold text-ink">Vinicius Reinehr</div>
                  <div className="text-xs text-ink-muted">vinicius@reinehr.org</div>
                </div>
              </div>
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-ink-subtle uppercase">Documento</span>
                  <span className="text-sm text-ink">123.456.789-00</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-ink-subtle uppercase">Telefone</span>
                  <span className="text-sm text-ink">+55 (47) 99999-9999</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Sistema Origem">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-raised rounded-md border border-border">
                  <Globe size={18} className="text-ink-subtle" />
                </div>
                <div>
                  <div className="font-bold text-ink">Site Principal</div>
                  <div className="text-xs text-ink-muted">sys_8a9b2c</div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
