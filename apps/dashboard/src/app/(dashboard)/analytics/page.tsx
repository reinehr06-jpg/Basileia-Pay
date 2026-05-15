'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { TrustRadar } from '@/components/analytics/TrustRadar';
import { AbandonmentAutopsy } from '@/components/analytics/AbandonmentAutopsy';
import { RiskMap } from '@/components/analytics/RiskMap';
import { SessionForensics } from '@/components/analytics/SessionForensics';
import { Activity, ShieldCheck, UserX, Map, Search } from 'lucide-react';

export default function AnalyticsPage() {
  const [tab, setTab] = useState('overview');

  return (
    <PageLayout title="Observabilidade">
      <div className="flex gap-1 bg-surface-raised p-1 rounded-lg border border-border mb-8 inline-flex">
        <button 
            onClick={() => setTab('overview')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${tab === 'overview' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        >
            <Activity size={16} /> Visão Geral
        </button>
        <button 
            onClick={() => setTab('score')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${tab === 'score' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        >
            <ShieldCheck size={16} /> Score
        </button>
        <button 
            onClick={() => setTab('abandonment')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${tab === 'abandonment' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        >
            <UserX size={16} /> Autópsia
        </button>
        <button 
            onClick={() => setTab('riskmap')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${tab === 'riskmap' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        >
            <Map size={16} /> Mapa de Risco
        </button>
        <button 
            onClick={() => setTab('forensics')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${tab === 'forensics' ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        >
            <Search size={16} /> Forensics
        </button>
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
                <div className="text-xs font-bold text-ink-subtle uppercase mb-1">Taxa de Conversão</div>
                <div className="text-2xl font-bold text-success">32.5%</div>
                <div className="text-[10px] text-success font-bold">+12.4% vs mês anterior</div>
            </Card>
            <Card className="p-6">
                <div className="text-xs font-bold text-ink-subtle uppercase mb-1">Taxa de Abandono</div>
                <div className="text-2xl font-bold text-danger">45.2%</div>
                <div className="text-[10px] text-success font-bold">-5.2% vs mês anterior</div>
            </Card>
            <Card className="p-6">
                <div className="text-xs font-bold text-ink-subtle uppercase mb-1">Tempo Médio (Pagamento)</div>
                <div className="text-2xl font-bold text-ink">124s</div>
                <div className="text-[10px] text-ink-muted">Estável</div>
            </Card>
            <Card className="p-6">
                <div className="text-xs font-bold text-ink-subtle uppercase mb-1">PIX: Gerado → Pago</div>
                <div className="text-2xl font-bold text-brand">88.4%</div>
                <div className="text-[10px] text-brand font-bold">Performance excelente</div>
            </Card>
        </div>
      )}

      {tab === 'score' && <TrustRadar />}
      {tab === 'abandonment' && <AbandonmentAutopsy />}
      {tab === 'riskmap' && <RiskMap />}
      {tab === 'forensics' && <SessionForensics />}
    </PageLayout>
  );
}
