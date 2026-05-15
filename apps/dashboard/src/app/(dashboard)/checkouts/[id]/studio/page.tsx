'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Play, Globe, Check, MessageSquare, Code2, Link as LinkIcon, Undo2, Redo2 } from 'lucide-react';

export default function StudioPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden absolute inset-0 z-50">
      {/* Studio Topbar */}
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <a href="/checkouts" className="text-ink-muted hover:text-ink">
            <ArrowLeft size={20} />
          </a>
          <input 
            type="text" 
            defaultValue="Checkout Principal" 
            className="bg-transparent border-none font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand rounded px-2 py-1"
          />
          <div className="px-2 py-0.5 rounded text-xs font-medium bg-warning-muted text-warning border border-warning/20">
            Rascunho
          </div>
          <div className="px-2 py-0.5 rounded text-xs font-medium bg-surface-raised text-ink-muted border border-border">
            v1.2
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Toggles */}
          <div className="flex bg-surface-raised border border-border rounded-md p-0.5">
            <button 
              className={`p-1.5 rounded ${viewport === 'desktop' ? 'bg-surface shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
              onClick={() => setViewport('desktop')}
            >
              Desktop
            </button>
            <button 
              className={`p-1.5 rounded ${viewport === 'mobile' ? 'bg-surface shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
              onClick={() => setViewport('mobile')}
            >
              Mobile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-ink-muted hover:text-ink rounded transition-colors" title="Desfazer">
            <Undo2 size={18} />
          </button>
          <button className="p-2 text-ink-muted hover:text-ink rounded transition-colors" title="Refazer">
            <Redo2 size={18} />
          </button>
          <button 
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ink bg-surface-raised hover:bg-border rounded-md transition-colors"
            onClick={() => setAiDrawerOpen(true)}
          >
            <span className="text-brand">✨</span> IA
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ink bg-surface border border-border hover:bg-surface-raised rounded-md transition-colors">
            <Save size={16} /> Salvar
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-brand hover:bg-brand-deep rounded-md transition-colors">
            <Globe size={16} /> Publicar
          </button>
        </div>
      </header>

      {/* Studio Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Blocks) */}
        <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-border flex gap-2">
            <button className="flex-1 text-sm font-medium py-1 border-b-2 border-brand text-brand">Blocos</button>
            <button className="flex-1 text-sm font-medium py-1 border-b-2 border-transparent text-ink-muted hover:text-ink">Modelos</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-ink-subtle uppercase mb-3">Obrigatórios</h4>
              <div className="space-y-2">
                <div className="p-2 rounded-md border border-border bg-surface-raised flex items-center gap-2 text-sm text-ink cursor-move hover:border-brand transition-colors">
                  🛒 Resumo da compra
                </div>
                <div className="p-2 rounded-md border border-border bg-surface-raised flex items-center gap-2 text-sm text-ink cursor-move hover:border-brand transition-colors">
                  💳 Métodos de pag.
                </div>
                <div className="p-2 rounded-md border border-border bg-surface-raised flex items-center gap-2 text-sm text-ink cursor-move hover:border-brand transition-colors">
                  ⚡ Botão de pag.
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 bg-background overflow-y-auto p-8 flex justify-center">
          <div className={`bg-surface border border-border shadow-md min-h-[800px] transition-all duration-300 ${viewport === 'desktop' ? 'w-full max-w-4xl' : 'w-[375px]'}`}>
            {/* Canvas Empty State or Blocks */}
            <div className="h-full flex flex-col items-center justify-center text-ink-muted p-12 text-center border-2 border-dashed border-border m-4 rounded-lg">
              <p className="mb-2">Arraste os blocos da barra lateral para cá</p>
              <button 
                className="text-brand hover:underline text-sm flex items-center gap-1"
                onClick={() => setAiDrawerOpen(true)}
              >
                ✨ ou gere com IA
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar (Properties) */}
        <aside className="w-72 bg-surface border-l border-border flex flex-col flex-shrink-0">
           <div className="p-3 border-b border-border flex gap-2">
            <button className="flex-1 text-sm font-medium py-1 border-b-2 border-brand text-brand">Conteúdo</button>
            <button className="flex-1 text-sm font-medium py-1 border-b-2 border-transparent text-ink-muted hover:text-ink">Estilo</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-ink-subtle text-sm text-center">
            Selecione um bloco no canvas para editar suas propriedades
          </div>
        </aside>
      </div>

      {/* Basileia AI Drawer */}
      {aiDrawerOpen && (
        <div className="absolute inset-y-0 right-0 w-96 bg-surface shadow-lg border-l border-border flex flex-col z-50">
          <div className="h-14 border-b border-border flex items-center justify-between px-4">
            <h3 className="font-bold text-ink flex items-center gap-2">✨ Basileia AI</h3>
            <button className="text-ink-muted hover:text-ink" onClick={() => setAiDrawerOpen(false)}>✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-brand-muted/20 border border-brand/20 rounded-md p-3 mb-4 text-sm text-brand-deep">
              Descreva o checkout ideal ou cole um HTML/URL para a IA gerar um rascunho com nossos blocos otimizados.
            </div>
            
            <textarea 
              className="w-full bg-background border border-border rounded-md p-3 text-sm min-h-[120px] focus:outline-none focus:border-brand resize-none"
              placeholder="Ex: Checkout minimalista para evento corporativo, foco em PIX e fundo escuro..."
            ></textarea>
            
            <button className="w-full mt-3 bg-brand text-white py-2 rounded-md font-medium flex justify-center items-center gap-2 hover:bg-brand-deep transition-colors">
              <Globe size={16} /> Gerar Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
