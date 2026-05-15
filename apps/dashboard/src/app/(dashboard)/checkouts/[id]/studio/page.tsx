'use client';

import { useState } from 'react';
import { Layers, Palette, CreditCard, Brain, TrendingUp, Monitor, Smartphone, Save, Rocket, Plus, Settings2, ShieldCheck, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function StudioPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('blocks');
  const [previewMode, setPreviewMode] = useState('desktop');

  return (
    <div className="flex flex-col h-screen bg-surface-raised overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/checkouts" className="p-2 hover:bg-surface-raised rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-ink-subtle" />
          </Link>
          <div className="h-6 w-px bg-border"></div>
          <div>
            <h1 className="text-sm font-bold text-ink">Checkout Mentoria</h1>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-warning rounded-full"></span>
                <span className="text-[10px] font-bold text-ink-subtle uppercase tracking-widest">Draft • Não publicado</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-surface-raised p-1 rounded-lg border border-border">
            <button 
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded-md transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-brand' : 'text-ink-subtle hover:text-ink'}`}
            >
              <Monitor size={16} />
            </button>
            <button 
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded-md transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-brand' : 'text-ink-subtle hover:text-ink'}`}
            >
              <Smartphone size={16} />
            </button>
          </div>
          <div className="h-6 w-px bg-border"></div>
          <button className="flex items-center gap-2 px-4 py-1.5 border border-border text-ink-subtle hover:text-ink font-bold text-xs rounded-lg transition-all">
            <Save size={14} /> Salvar
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-brand text-white font-bold text-xs rounded-lg shadow-lg shadow-brand/20 hover:bg-brand-deep transition-all">
            <Rocket size={14} /> Publicar
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Toolset */}
        <aside className="w-72 bg-white border-r border-border flex flex-col shrink-0 overflow-hidden">
          <div className="flex p-2 border-b border-border">
            {[
              { id: 'blocks', icon: <Layers size={18} />, label: 'Blocos' },
              { id: 'theme', icon: <Palette size={18} />, label: 'Tema' },
              { id: 'methods', icon: <CreditCard size={18} />, label: 'Pagto' },
              { id: 'config', icon: <Settings2 size={18} />, label: 'IA' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-lg transition-all ${activeTab === tab.id ? 'bg-brand/5 text-brand' : 'text-ink-subtle hover:text-ink'}`}
              >
                {tab.icon}
                <span className="text-[10px] font-bold uppercase">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {activeTab === 'blocks' && (
              <>
                <div>
                  <h3 className="text-[10px] font-black text-ink-subtle uppercase tracking-widest mb-4">Essenciais</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['Header', 'Hero', 'Resumo', 'Métodos', 'Form', 'Botão'].map(b => (
                      <div key={b} className="p-3 bg-surface-raised border border-border rounded-lg text-center cursor-move hover:border-brand/50 hover:bg-brand/5 transition-all">
                        <div className="text-xs font-bold text-ink">{b}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-ink-subtle uppercase tracking-widest mb-4">Conversão</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['Depoimentos', 'FAQ', 'Garantia', 'Selo', 'Contador', 'Prova Social'].map(b => (
                      <div key={b} className="p-3 bg-surface-raised border border-border rounded-lg text-center cursor-move hover:border-brand/50 hover:bg-brand/5 transition-all">
                        <div className="text-xs font-bold text-ink">{b}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Canvas - Live Preview */}
        <main className="flex-1 bg-surface-raised flex items-center justify-center p-8 overflow-auto relative">
          <div className={`bg-white shadow-2xl transition-all duration-500 overflow-y-auto ${previewMode === 'desktop' ? 'w-full max-w-4xl h-full rounded-xl' : 'w-[375px] h-[667px] rounded-[40px] border-[8px] border-ink'}`}>
            {/* Mock Checkout Content */}
            <div className="p-6 space-y-8">
                <div className="flex justify-center py-4"><div className="w-32 h-12 bg-surface-raised rounded animate-pulse"></div></div>
                <div className="space-y-2 text-center">
                    <div className="h-6 w-3/4 bg-surface-raised mx-auto rounded animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-surface-raised mx-auto rounded animate-pulse"></div>
                </div>
                <div className="p-6 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-xs text-ink-subtle font-bold italic">
                    Área do Canvas — Arraste blocos aqui
                </div>
            </div>
          </div>

          {/* Quick Stats Overlay */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
             <div className="bg-white border border-border rounded-xl p-4 shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-brand/10 text-brand rounded-full flex items-center justify-center">
                    <TrendingUp size={20} />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-ink-subtle uppercase">Score BCI</div>
                    <div className="text-xl font-black text-ink">84/100</div>
                </div>
             </div>
             <div className="bg-white border border-border rounded-xl p-4 shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-success/10 text-success rounded-full flex items-center justify-center">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-ink-subtle uppercase">Trust Radar</div>
                    <div className="text-xl font-black text-success">Seguro</div>
                </div>
             </div>
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-80 bg-white border-l border-border flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-xs font-bold text-ink uppercase tracking-widest">Propriedades</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
             <div className="bg-surface-raised p-6 rounded-2xl border border-border mb-4">
                <Monitor size={32} className="text-ink-subtle mx-auto" />
             </div>
             <h4 className="text-sm font-bold text-ink mb-2">Nenhum bloco selecionado</h4>
             <p className="text-xs text-ink-muted">Clique em um bloco no canvas para editar suas propriedades.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
