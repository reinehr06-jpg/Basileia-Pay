'use client';

import { Card } from '@/components/ui/card';
import { MousePointer2, Clock, MapPin, Smartphone, AlertCircle, TrendingDown } from 'lucide-react';

export function AbandonmentAutopsy() {
  return (
    <div className="space-y-8">
      {/* Funnel */}
      <div className="bg-surface border border-border rounded-xl p-8">
        <h3 className="text-sm font-bold text-ink uppercase tracking-widest mb-8">Funil de Conversão</h3>
        <div className="flex items-end gap-1 h-40">
            <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-brand/10 border border-brand/20 rounded-t-lg h-full flex items-center justify-center text-brand font-bold">100%</div>
                <span className="text-[10px] font-bold text-ink-subtle uppercase">Abriu</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-brand/20 border border-brand/30 rounded-t-lg h-[75%] flex items-center justify-center text-brand font-bold">75%</div>
                <span className="text-[10px] font-bold text-ink-subtle uppercase">Iniciou Form</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-brand/40 border border-brand/50 rounded-t-lg h-[50%] flex items-center justify-center text-white font-bold">50%</div>
                <span className="text-[10px] font-bold text-ink-subtle uppercase">Pix Gerado</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-brand rounded-t-lg h-[32%] flex items-center justify-center text-white font-bold">32%</div>
                <span className="text-[10px] font-bold text-ink-subtle uppercase">Pagou</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Onde acontece o abandono">
            <div className="space-y-6 p-4">
                {[
                    { label: 'Antes do formulário', value: 25, color: 'bg-danger' },
                    { label: 'Durante o formulário', value: 45, color: 'bg-warning' },
                    { label: 'Aguardando PIX', value: 20, color: 'bg-brand' },
                    { label: 'Após erro no checkout', value: 10, color: 'bg-danger' },
                ].map(item => (
                    <div key={item.label}>
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span>{item.label}</span>
                            <span>{item.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        <Card title="Campos com maior fricção">
            <div className="divide-y divide-border">
                {[
                    { field: 'CPF / CNPJ', issues: 'Hesitação média (4.5s)', impact: 'Alto' },
                    { field: 'Telefone', issues: 'Erro de máscara frequente', impact: 'Médio' },
                    { field: 'Email', issues: 'Autocomplete falhou em 12% das vezes', impact: 'Baixo' },
                ].map(item => (
                    <div key={item.field} className="py-4 px-2 flex justify-between items-center">
                        <div>
                            <div className="text-sm font-bold text-ink">{item.field}</div>
                            <div className="text-xs text-ink-muted">{item.issues}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.impact === 'Alto' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                        }`}>{item.impact}</span>
                    </div>
                ))}
            </div>
        </Card>
      </div>

      <div className="bg-danger/5 border border-danger/20 rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-danger text-white rounded-full">
                <TrendingDown size={24} />
            </div>
            <div>
                <h4 className="text-lg font-bold text-danger">R$ 197.400,00</h4>
                <p className="text-sm text-ink-muted">Receita perdida estimada nos últimos 30 dias por abandono.</p>
            </div>
        </div>
        <button className="bg-danger text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-danger-deep transition-all">Ver estratégias de recuperação</button>
      </div>
    </div>
  );
}
