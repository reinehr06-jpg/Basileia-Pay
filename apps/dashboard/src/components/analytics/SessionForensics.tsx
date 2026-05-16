'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Search, History, MousePointer2, Smartphone, Monitor, Shield, AlertCircle, ArrowRight } from 'lucide-react';

export function SessionForensics() {
  const [selectedSession, setSelectedSession] = useState<string | null>('SESS_9x2b81');

  const sessions = [
    { id: 'SESS_9x2b81', device: 'mobile', browser: 'Safari / iOS', time: '14:25:32', status: 'abandoned', value: 'R$ 299,00', method: 'PIX' },
    { id: 'SESS_4k1s02', device: 'desktop', browser: 'Chrome / macOS', time: '14:20:15', status: 'failed', value: 'R$ 150,00', method: 'CARTÃO' },
    { id: 'SESS_7m8j19', device: 'mobile', browser: 'Chrome / Android', time: '14:18:44', status: 'abandoned', value: 'R$ 50,00', method: 'PIX' },
  ];

  const frames = [
    { time: '0s', type: 'Sessão Iniciada', desc: 'Usuário entrou na página via mobile (Safari)' },
    { time: '2.5s', type: 'Interação', desc: 'Foco no campo: Nome Completo' },
    { time: '12.4s', type: 'Scroll', desc: 'Rolou até o bloco de pagamento' },
    { time: '15.2s', type: 'Pausa Longa', desc: 'Hesitação detectada (8.2s) antes de selecionar método', warning: true },
    { time: '23.4s', type: 'Método Alterado', desc: 'Trocou CARTÃO por PIX' },
    { time: '28.1s', type: 'Evento PIX', desc: 'QR Code gerado com sucesso' },
    { time: '45.0s', type: 'Abandono', desc: 'Página fechada após 17s de espera do PIX', critical: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Session List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" size={16} />
            <input 
                type="text" 
                placeholder="Filtrar por ID ou valor..." 
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand"
            />
        </div>

        {sessions.map(session => (
            <div 
                key={session.id}
                onClick={() => setSelectedSession(session.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedSession === session.id ? 'bg-surface border-brand shadow-sm' : 'bg-surface border-border hover:border-ink-subtle'
                }`}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-ink">{session.id}</span>
                    <span className="text-[10px] font-bold text-ink-subtle">{session.time}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                    {session.device === 'mobile' ? <Smartphone size={14} className="text-ink-muted" /> : <Monitor size={14} className="text-ink-muted" />}
                    <span className="text-xs text-ink-muted">{session.browser}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-ink">{session.value}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        session.status === 'abandoned' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                    }`}>{session.status}</span>
                </div>
            </div>
        ))}
      </div>

      {/* Forensics Replay */}
      <div className="lg:col-span-8 space-y-6">
        <Card title={`Autópsia Forense: ${selectedSession}`}>
            <div className="mb-8 p-4 bg-ink text-white rounded-xl font-mono text-xs overflow-hidden relative">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-danger rounded-full"></div>
                            REPLAY
                        </div>
                        <span className="text-white/50">Duração: 45s</span>
                    </div>
                    <div className="flex gap-2">
                        <History size={14} />
                        <Shield size={14} />
                    </div>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-auto">
                    {frames.map((frame, i) => (
                        <div key={i} className={`flex gap-4 p-2 rounded transition-colors ${frame.critical ? 'bg-danger/20' : frame.warning ? 'bg-warning/20' : ''}`}>
                            <span className="w-12 shrink-0 text-white/40">{frame.time}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold ${frame.critical ? 'text-danger' : frame.warning ? 'text-warning' : 'text-brand'}`}>
                                        {frame.type}
                                    </span>
                                    {frame.critical && <AlertCircle size={10} className="text-danger" />}
                                </div>
                                <div className="text-white/70 mt-1">{frame.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-4 right-4 bg-white/10 px-2 py-1 rounded text-[8px] font-bold text-white/50">
                    PII MASKED • NO PERSONAL DATA RECORDED
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-surface-raised rounded-lg border border-border">
                    <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Ponto de Saída</div>
                    <div className="text-sm font-bold text-ink">Pós-Geração PIX</div>
                </div>
                <div className="p-4 bg-surface-raised rounded-lg border border-border">
                    <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Trocas de Método</div>
                    <div className="text-sm font-bold text-ink">2 vezes</div>
                </div>
                <div className="p-4 bg-surface-raised rounded-lg border border-border">
                    <div className="text-[10px] font-bold text-ink-subtle uppercase mb-1">Causa Provável</div>
                    <div className="text-sm font-bold text-danger">Hesitação no Checkout</div>
                </div>
            </div>
        </Card>

        <div className="p-6 border border-brand/20 bg-brand/5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white font-bold text-xl">F</div>
                <div>
                    <h4 className="text-lg font-bold text-brand">Falcon3 Insights</h4>
                    <p className="text-sm text-ink-muted">A IA sugere que este usuário abandonou devido à falta de prova social acima da dobra.</p>
                </div>
            </div>
            <button className="text-brand font-bold text-sm flex items-center gap-2 hover:underline">
                Aplicar Correção <ArrowRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
}
