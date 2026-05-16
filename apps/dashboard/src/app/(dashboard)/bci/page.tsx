'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Zap, Brain, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, BarChart3 } from 'lucide-react';

export default function BCIPage() {
  const [analyzing, setAnalyzing] = useState(false);

  const scores = [
    { label: 'Copy (Texto)', value: 85, color: 'text-success' },
    { label: 'Layout & Blocos', value: 72, color: 'text-warning' },
    { label: 'Prova Social', value: 45, color: 'text-danger' },
    { label: 'Garantia', value: 90, color: 'text-success' },
    { label: 'Urgência', value: 65, color: 'text-warning' },
    { label: 'Aderência ao Nicho', value: 88, color: 'text-success' },
  ];

  const recommendations = [
    { priority: 1, severity: 'critical', title: 'Adicionar depoimentos flutuantes', lift: '12.4%', cat: 'Social Proof' },
    { priority: 2, severity: 'high', title: 'Reduzir campos do formulário', lift: '5.2%', cat: 'Layout' },
    { priority: 3, severity: 'medium', title: 'Mudar CTA para "Garantir minha vaga"', lift: '2.1%', cat: 'Copy' },
  ];

  return (
    <PageLayout title="Basileia Checkout Intelligence (BCI)">
      <div className="bg-brand/5 border border-brand/20 rounded-xl p-8 mb-8 flex items-center justify-between">
        <div className="flex gap-6 items-center">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
                <Brain size={32} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-brand">Otimização por IA</h2>
                <p className="text-sm text-ink-muted max-w-md">O BCI analisa seu checkout contra centenas de benchmarks do seu nicho para recomendar melhorias de conversão.</p>
            </div>
        </div>
        <button 
            onClick={() => { setAnalyzing(true); setTimeout(() => setAnalyzing(false), 3000); }}
            disabled={analyzing}
            className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-bold hover:bg-brand-deep transition-all shadow-md disabled:opacity-50"
        >
            <Zap size={18} /> {analyzing ? 'Analisando...' : 'Solicitar Nova Análise'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
            <Card title="Score BCI">
                <div className="space-y-6 p-2">
                    <div className="text-center mb-8">
                        <div className="text-5xl font-black text-brand">78</div>
                        <div className="text-[10px] font-bold text-ink-subtle uppercase tracking-widest mt-1">Overall Conversion Score</div>
                    </div>
                    {scores.map(s => (
                        <div key={s.label}>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span>{s.label}</span>
                                <span className={s.color}>{s.value}/100</span>
                            </div>
                            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                <div className={`h-full ${s.color.replace('text', 'bg')}`} style={{ width: `${s.value}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Benchmarks do Nicho">
                <div className="space-y-4">
                    <div className="p-3 bg-surface-raised rounded-lg border border-border">
                        <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Média do Nicho (Cursos)</div>
                        <div className="text-lg font-bold text-ink">12.5%</div>
                    </div>
                    <div className="p-3 bg-surface-raised rounded-lg border border-border">
                        <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Top 10% da Plataforma</div>
                        <div className="text-lg font-bold text-success">35.2%</div>
                    </div>
                </div>
            </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
            <h3 className="text-sm font-bold text-ink uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={16} /> Recomendações de IA
            </h3>
            
            {recommendations.map(rec => (
                <div key={rec.priority} className={`bg-surface border border-border rounded-xl p-6 transition-all hover:border-brand/50 group cursor-pointer ${rec.severity === 'critical' ? 'border-l-4 border-l-danger' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                            <div className={`p-2 rounded-lg ${rec.severity === 'critical' ? 'bg-danger/10 text-danger' : 'bg-brand/10 text-brand'}`}>
                                {rec.severity === 'critical' ? <AlertCircle size={20} /> : <Zap size={20} />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase text-ink-subtle tracking-tighter px-1.5 py-0.5 bg-surface-raised rounded">{rec.cat}</span>
                                    <span className="text-xs font-bold text-success">Lift Estimado: +{rec.lift}</span>
                                </div>
                                <h4 className="font-bold text-ink group-hover:text-brand transition-colors">{rec.title}</h4>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-ink-subtle" />
                    </div>
                    <div className="flex gap-2">
                        <button className="text-[10px] font-bold uppercase text-brand hover:underline">Ver Detalhes</button>
                        <span className="text-[10px] text-ink-subtle">•</span>
                        <button className="text-[10px] font-bold uppercase text-success flex items-center gap-1"><CheckCircle2 size={12} /> Aplicar Automaticamente</button>
                    </div>
                </div>
            ))}

            <div className="p-12 border-2 border-dashed border-border rounded-xl text-center">
                <p className="text-sm text-ink-muted italic">Mais 5 sugestões de baixo impacto ocultas. <span className="text-brand font-bold cursor-pointer hover:underline">Ver tudo</span></p>
            </div>
        </div>
      </div>
    </PageLayout>
  );
}
