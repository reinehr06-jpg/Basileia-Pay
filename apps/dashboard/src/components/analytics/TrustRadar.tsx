'use client';

import { Card } from '@/components/ui/Card';
import { AlertOctagon, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react';

export function TrustRadar() {
  const score = {
    overall: 82,
    subscores: {
      clarity: 90,
      trust: 75,
      mobile: 85,
      payment: 95,
      security: 60,
      conversion: 88
    },
    issues: [
      { code: 'security_badge_missing', severity: 'critical', title: 'Selo de segurança ausente', description: 'O checkout não exibe selos de segurança perto do botão de pagamento.', suggestion: 'Adicione o bloco "Selos de Confiança" abaixo do CTA.', impact: 4.2 },
      { code: 'total_not_above_fold', severity: 'warning', title: 'Resumo abaixo da dobra', description: 'Em dispositivos mobile, o valor total exige scroll para ser visto.', suggestion: 'Ative a opção "Fixar total no topo" nas configurações.', impact: 2.1 },
      { code: 'no_support_link', severity: 'info', title: 'Link de suporte ausente', description: 'Não há link para contato em caso de dúvidas.', suggestion: 'Adicione um link de WhatsApp ou Email no rodapé.', impact: 0.8 },
    ]
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl">
            <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-border" />
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={440} strokeDashoffset={440 - (440 * score.overall) / 100} className="text-brand transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-ink">{score.overall}</span>
                    <span className="text-xs font-bold text-ink-subtle uppercase tracking-widest">Global</span>
                </div>
            </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(score.subscores).map(([label, value]) => (
                <div key={label} className="p-4 bg-surface border border-border rounded-lg">
                    <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1 tracking-wider">{label}</div>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-ink">{value}</span>
                        <div className="h-1.5 w-12 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-brand" style={{ width: `${value}%` }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        {score.issues.map(issue => (
            <Card key={issue.code} className={`border-l-4 ${
                issue.severity === 'critical' ? 'border-l-danger' : 
                issue.severity === 'warning' ? 'border-l-warning' : 'border-l-info'
            }`}>
                <div className="flex items-start gap-4 p-4">
                    <div className={`p-2 rounded-lg ${
                        issue.severity === 'critical' ? 'bg-danger/10 text-danger' : 
                        issue.severity === 'warning' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
                    }`}>
                        {issue.severity === 'critical' ? <AlertOctagon size={20} /> : 
                         issue.severity === 'warning' ? <AlertTriangle size={20} /> : <Info size={20} />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-ink">{issue.title}</h4>
                            <span className="text-xs font-bold text-success">+{issue.impact}% conversão estimada</span>
                        </div>
                        <p className="text-sm text-ink-muted mb-3">{issue.description}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-brand">
                            <ArrowRight size={14} /> {issue.suggestion}
                        </div>
                    </div>
                </div>
            </Card>
        ))}
      </div>
    </div>
  );
}
