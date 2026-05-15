import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { ReauthAction } from '@/components/security/ReauthAction';

export default function GatewaysPage() {
  return (
    <PageLayout
      title="Gateways"
      action={<button className="px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep">Adicionar Gateway</button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Asaas - Produção" className="border-l-4 border-l-brand">
          <div className="space-y-4">
             <div className="flex justify-between text-sm">
               <span className="text-ink-muted">Métodos suportados:</span>
               <span className="font-medium">PIX, Boleto, Cartão</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-ink-muted">Status:</span>
               <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success-muted text-success">Ativo</span>
             </div>
             
             <div className="pt-4 mt-4 border-t border-border flex gap-2">
               <button className="px-3 py-1.5 text-sm bg-surface-raised text-ink border border-border hover:bg-border rounded">Editar</button>
               <ReauthAction action="gateway.test">
                 <button className="px-3 py-1.5 text-sm bg-surface-raised text-ink border border-border hover:bg-border rounded">Testar Conexão</button>
               </ReauthAction>
             </div>
          </div>
        </Card>
        
        <Card title="Stripe - Produção">
          <div className="space-y-4">
             <div className="flex justify-between text-sm">
               <span className="text-ink-muted">Métodos suportados:</span>
               <span className="font-medium">Cartão</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-ink-muted">Status:</span>
               <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning-muted text-warning">Aviso</span>
             </div>
             
             <div className="pt-4 mt-4 border-t border-border flex gap-2">
               <button className="px-3 py-1.5 text-sm bg-surface-raised text-ink border border-border hover:bg-border rounded">Editar</button>
               <ReauthAction action="gateway.test">
                 <button className="px-3 py-1.5 text-sm bg-surface-raised text-ink border border-border hover:bg-border rounded">Testar Conexão</button>
               </ReauthAction>
             </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
