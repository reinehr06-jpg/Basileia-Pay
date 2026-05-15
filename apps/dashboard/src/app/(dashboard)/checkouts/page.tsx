import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { ShoppingBag, Plus, ExternalLink, MoreVertical } from 'lucide-react';

export default function CheckoutsPage() {
  return (
    <PageLayout
      title="Checkouts"
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
          <Plus size={16} /> Novo Checkout
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Checkout Card */}
        <Card className="hover:border-brand transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <ShoppingBag size={24} />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-success-muted text-success">Publicado</span>
              <button className="text-ink-subtle hover:text-ink p-1">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
          
          <h3 className="font-bold text-ink text-lg mb-1">Checkout Principal</h3>
          <p className="text-sm text-ink-muted mb-4">Venda de curso online (v2.4)</p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
            <span className="text-xs text-ink-subtle italic">Atualizado há 2 dias</span>
            <div className="flex gap-2">
              <a 
                href="/checkouts/1/studio" 
                className="px-3 py-1 text-xs font-medium bg-surface-raised border border-border rounded hover:bg-border transition-colors"
              >
                Editar no Studio
              </a>
              <button className="p-1 text-ink-subtle hover:text-brand" title="Ver Link">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </Card>

        {/* Another Card */}
        <Card className="hover:border-brand transition-colors cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-ink-subtle/10 text-ink-subtle">
              <ShoppingBag size={24} />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-raised text-ink-muted">Rascunho</span>
              <button className="text-ink-subtle hover:text-ink p-1">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
          
          <h3 className="font-bold text-ink text-lg mb-1">Landing Page Evento</h3>
          <p className="text-sm text-ink-muted mb-4">Teste A/B em progresso (v1.0)</p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
            <span className="text-xs text-ink-subtle italic">Criado hoje</span>
            <div className="flex gap-2">
              <a 
                href="/checkouts/2/studio" 
                className="px-3 py-1 text-xs font-medium bg-surface-raised border border-border rounded hover:bg-border transition-colors"
              >
                Editar no Studio
              </a>
              <button className="p-1 text-ink-subtle hover:text-brand" title="Ver Link">
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
