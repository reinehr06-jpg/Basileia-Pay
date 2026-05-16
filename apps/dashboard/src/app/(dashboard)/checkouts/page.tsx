'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Plus, ExternalLink, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { useCheckouts } from '@/hooks/api/useCheckouts';
import Link from 'next/link';

export default function CheckoutsPage() {
  const { checkouts, loading, error, refetch } = useCheckouts();

  return (
    <PageLayout
      title="Checkouts"
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
          <Plus size={16} /> Novo Checkout
        </button>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-brand" size={32} />
          <p className="text-ink-subtle text-sm">Carregando experiências...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
          <AlertCircle className="text-danger" size={32} />
          <div>
            <p className="text-ink font-medium">Erro ao carregar checkouts</p>
            <p className="text-ink-subtle text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : checkouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
          <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mb-2">
            <ShoppingBag className="text-ink-subtle" size={24} />
          </div>
          <div>
            <p className="text-ink font-medium">Nenhum checkout criado</p>
            <p className="text-ink-subtle text-sm mt-1">
              Crie sua primeira experiência de checkout para começar a vender.
            </p>
          </div>
          <button className="mt-2 px-4 py-2 bg-brand text-white rounded-md text-sm font-medium hover:bg-brand-deep transition-colors">
            Criar meu primeiro checkout
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checkouts.map((checkout) => (
            <Card key={checkout.id} className="hover:border-brand transition-all cursor-pointer group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-brand-muted text-brand">
                  <ShoppingBag size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    checkout.status === 'published' ? 'bg-success-muted text-success' : 'bg-surface-raised text-ink-muted'
                  }`}>
                    {checkout.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </span>
                  <button className="text-ink-subtle hover:text-ink p-1">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-bold text-ink text-lg mb-1">{checkout.name}</h3>
              <p className="text-sm text-ink-muted mb-4">
                {checkout.published_version ? `Versão ativa: ${checkout.published_version.split('-')[0]}` : 'Sem versão publicada'}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <span className="text-xs text-ink-subtle italic">Criado em {checkout.created_at}</span>
                <div className="flex gap-2">
                  <Link 
                    href={`/checkouts/${checkout.id}/builder`} 
                    className="px-3 py-1 text-xs font-medium bg-surface-raised border border-border rounded hover:bg-border transition-colors"
                  >
                    Editar no Studio
                  </Link>
                  <button className="p-1 text-ink-subtle hover:text-brand" title="Ver Link">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
