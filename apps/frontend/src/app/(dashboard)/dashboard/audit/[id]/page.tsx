'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight,
  Check, 
  Clock, 
  FileCode
} from 'lucide-react';
import { AuditEvent } from '@/types/audit';
import { MOCK_AUDIT_EVENTS } from '../__mocks__/audit';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

const EVENT_MAP: Record<string, { category: string; level: string; type: string }> = {
  'login':               { category: 'ACESSO',     level: 'Informativo', type: 'login' },
  'logout':              { category: 'ACESSO',     level: 'Informativo', type: 'login' },
  'payment.captured':    { category: 'PAGAMENTO',  level: 'Informativo', type: 'payment' },
  'payment.created':     { category: 'PAGAMENTO',  level: 'Informativo', type: 'payment' },
  'payment.refunded':    { category: 'REEMBOLSO',  level: 'Crítico',     type: 'refund' },
  'payment.failed':      { category: 'PAGAMENTO',  level: 'Crítico',     type: 'payment' },
  'payment.risk_flagged':{ category: 'SEGURANÇA',  level: 'Crítico',     type: 'security' },
  'checkout.created':    { category: 'CHECKOUT',   level: 'Informativo', type: 'checkout' },
  'checkout.updated':    { category: 'CHECKOUT',   level: 'Alteração',   type: 'checkout' },
  'checkout.deleted':    { category: 'EXCLUSÃO',   level: 'Crítico',     type: 'checkout' },
  'webhook.sent':        { category: 'WEBHOOK',    level: 'Informativo', type: 'webhook' },
  'webhook.delivered':   { category: 'WEBHOOK',    level: 'Informativo', type: 'webhook' },
  'webhook.failed':      { category: 'WEBHOOK',    level: 'Crítico',     type: 'webhook' },
  'subscription.created':{ category: 'ASSINATURA', level: 'Informativo', type: 'subscription' },
  'subscription.canceled':{category: 'ASSINATURA', level: 'Alteração',   type: 'subscription' },
  'api_key.created':     { category: 'INTEGRAÇÃO', level: 'Alteração',   type: 'integration' },
  'api_key.deleted':     { category: 'INTEGRAÇÃO', level: 'Crítico',     type: 'integration' },
  'user.created':        { category: 'USUÁRIO',    level: 'Alteração',   type: 'user' },
  'user.updated':        { category: 'USUÁRIO',    level: 'Alteração',   type: 'user' },
  'user.deleted':        { category: 'USUÁRIO',    level: 'Crítico',     type: 'user' },
  'permissions.updated': { category: 'USUÁRIO',    level: 'Alteração',   type: 'user' },
  'settings.updated':    { category: 'CONFIGURAÇÃO', level: 'Alteração', type: 'config' },
  'security.access_denied':{ category: 'SEGURANÇA',level: 'Crítico',     type: 'security' },
  'security.flag_raised':{ category: 'SEGURANÇA',  level: 'Crítico',     type: 'security' },
};

function auditEventFromApi(log: any): AuditEvent {
  const created = new Date(log.created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  let relative: string;
  if (diffMin < 1) relative = 'agora';
  else if (diffMin < 60) relative = `${diffMin}m atrás`;
  else if (diffMin < 1440) relative = `${Math.floor(diffMin / 60)}h atrás`;
  else relative = `${Math.floor(diffMin / 1440)}d atrás`;

  const eventKey = log.event || '';
  const mapping = EVENT_MAP[eventKey] || { category: 'CONFIGURAÇÃO', level: 'Informativo', type: 'config' };
  const title = eventKey
    .replace(/_/g, ' ')
    .replace(/\./g, ' — ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  return {
    id: log.uuid || log.id,
    time: created.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    relative,
    date: created.toLocaleDateString('pt-BR'),
    title,
    category: mapping.category,
    details: log.metadata?.description || `${title} por ${log.user?.name || 'Sistema'}`,
    meta: log.ip_address_hash ? `IP: ${log.ip_address_hash}` : '',
    user: log.user?.name || 'Sistema',
    role: log.user?.role || (log.user ? 'Usuário' : 'Sistema'),
    system: log.metadata?.system || log.metadata?.gateway || log.metadata?.endpoint || 'Basileia Pay',
    environment: log.metadata?.environment || 'Produção',
    ip: log.ip_address_hash || '',
    location: log.metadata?.location || '',
    level: mapping.level,
    type: mapping.type,
    entityType: log.entity_type || '',
    entityId: log.entity_id || null,
    metadata: log.metadata || {},
    relatedIds: log.metadata?.order_id ? { orderId: log.metadata.order_id } : undefined,
  };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AuditEventDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<AuditEvent | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  
  const [reviewed, setReviewed] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/v1/dashboard/audit/' + resolvedParams.id);
        if (res.success && res.data) {
          setEvent(auditEventFromApi(res.data));
          return;
        }
      } catch (err) { console.error('Failed to fetch audit event:', err); }
      const found = MOCK_AUDIT_EVENTS.find(e => e.id === resolvedParams.id) || MOCK_AUDIT_EVENTS[0];
      setEvent(found);
    })();
  }, [resolvedParams.id]);

  const triggerAlert = (msg: string) => {
    setSuccessAlert(msg);
    setTimeout(() => setSuccessAlert(null), 4000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Crítico':
      case 'critical':
        return { label: 'Crítico', bg: 'bg-red-50 text-red-700 border-red-200' };
      case 'Alteração':
      case 'alteration':
        return { label: 'Alteração', bg: 'bg-violet-50 text-violet-750 border-violet-200' };
      case 'Informativo':
      case 'informative':
        return { label: 'Informativo', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'Acesso':
      case 'access':
        return { label: 'Acesso', bg: 'bg-green-50 text-green-700 border-green-200' };
      case 'Exclusão':
      case 'deletion':
        return { label: 'Exclusão', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      default:
        return { label: level, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 font-semibold text-xs gap-2">
        <Clock className="w-8 h-8 text-brand animate-spin" />
        <span>Carregando registro forense...</span>
      </div>
    );
  }

  const levelBadge = getLevelBadge(event.level);

  return (
    <div className="w-full text-left pt-2 pb-12 px-4 lg:px-6 max-w-[1400px] mx-auto select-none bg-[#F7F7FA] min-h-screen">
      
      {/* Toast Alert Banner */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-55 bg-brand text-white p-3.5 rounded-2xl shadow-xl border border-brand/50 flex items-center justify-between gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold">{successAlert}</span>
          </div>
          <button onClick={() => setSuccessAlert(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-455 mb-4 shrink-0">
        <Link href="/dashboard/audit" className="hover:text-brand flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Auditoria
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-450">Eventos</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-bold font-mono">{event.id}</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E5EF] pb-4 mb-5 shrink-0">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              {event.title}
            </h1>
            <span className={cn("px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0", levelBadge.bg)}>
              {levelBadge.label}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border bg-brand/5 border-brand/20 text-brand">
              {event.category}
            </span>
          </div>
          <p className="text-slate-400 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
            Análise detalhada de ação imutável registrada no hub operacional da Basileia Pay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => triggerAlert('Registro exportado para JSON.')}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-[#E7E5EF] hover:bg-brand-soft rounded-xl text-[10px] font-black text-slate-750 shadow-sm transition-all h-[34px]"
          >
            Exportar Evento
          </button>
          <button 
            onClick={() => { setReviewed(true); triggerAlert('Revisão confirmada.'); }}
            disabled={reviewed}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white border border-brand/20 hover:bg-brand-soft text-brand rounded-xl text-[10px] font-black shadow-sm transition-all h-[34px] uppercase"
          >
            {reviewed ? 'Revisado' : 'Marcar como revisado'}
          </button>
          <button 
            onClick={() => { const inc = 'INC-' + Math.floor(1000 + Math.random() * 9000); setIncidentId(inc); triggerAlert(`Incidente ${inc} aberto.`); }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-755 rounded-xl text-[10px] font-black shadow-sm transition-all h-[34px] uppercase"
          >
            {incidentId ? `Incidente Ativo: ${incidentId}` : 'Abrir incidente'}
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Col 1 & 2: Forensics block */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Bloco 1 — Informações do evento */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-3">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Informações do Evento
            </span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-500">
              {[
                { label: 'ID do Evento', value: event.id, mono: true },
                { label: 'Data e Hora', value: `${event.date} ${event.time}` },
                { label: 'Ambiente', value: event.environment, uppercase: true },
                { label: 'Usuário Operador', value: event.user },
                { label: 'Cargo do Usuário', value: event.role },
                { label: 'Sistema Utilizado', value: event.system },
                { label: 'IP de Origem', value: event.ip, mono: true },
                { label: 'Resultado', value: event.level === 'Crítico' ? 'Bloqueado' : 'Sucesso' },
                { label: 'Entidade Afetada', value: event.entityType || 'Configuração' }
              ].map((item) => (
                <div key={item.label} className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/60">
                  <span className="text-[8.5px] text-slate-400 uppercase block font-black leading-none mb-1">{item.label}</span>
                  <span className={cn(
                    "text-slate-850 font-bold block truncate mt-0.5",
                    item.mono ? 'font-mono text-[10.5px] text-slate-900' : '',
                    item.uppercase ? 'uppercase' : ''
                  )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bloco 2 — Contexto da sessão */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-3">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Contexto da Sessão & Geolocalização
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dispositivo e Navegador</span>
                <span className="text-slate-850 font-bold block">Chrome 124.0 / macOS (ARM64)</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Geolocalização</span>
                <span className="text-slate-850 font-bold block">{event.location || 'São Paulo, Brasil'}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Hash da Sessão (2FA Validado)</span>
                <span className="text-slate-850 font-mono font-bold block">sess_auth_01JTK8abc9912z3</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Histórico do IP (Últimas 24h)</span>
                <span className="text-slate-850 font-bold block">14 requisições associadas</span>
              </div>
            </div>
          </div>

          {/* Bloco 3 — Metadados completos */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-brand" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">Metadados Completos (Raw Payload)</span>
              </div>
              <button 
                onClick={() => handleCopy(JSON.stringify(event.metadata, null, 2), 'metadata')}
                className="flex items-center gap-1 text-[10px] font-black text-brand hover:underline"
              >
                {copiedField === 'metadata' ? 'Copiado!' : 'Copiar JSON'}
              </button>
            </div>
            <pre className="bg-slate-950 text-green-400 font-mono text-[10.5px] p-3.5 rounded-xl overflow-x-auto no-scrollbar max-h-[300px]">
              {JSON.stringify(event.metadata || { event: event.title, timestamp: event.date + ' ' + event.time }, null, 2)}
            </pre>
          </div>

        </div>

        {/* Col 3: Causation chain + timeline */}
        <div className="space-y-4">
          
          {/* Bloco 5 — Rastreabilidade */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-4">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Rastreabilidade & Causalidade
            </span>
            <div className="space-y-4 relative pl-3 font-semibold text-xs text-slate-655">
              <div className="absolute left-[18.5px] top-2 bottom-2 w-0.5 bg-slate-100" />
              {[
                { label: 'Origem', val: `Usuário ${event.user} acessa dashboard` },
                { label: 'Ação executora', val: event.title },
                { label: 'Entidade impactada', val: `${event.entityType || 'Configuração'}: ${event.entityId || 'N/A'}` }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start relative z-10">
                  <div className="w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center shrink-0 text-[8px] font-black">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8.5px] block font-black uppercase leading-none mb-0.5">{step.label}</span>
                    <span className="text-slate-850 font-bold block">{step.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bloco 4 — Timeline de eventos relacionados */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-3">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Eventos Relacionados
            </span>
            <div className="space-y-2 text-xs font-semibold">
              {MOCK_AUDIT_EVENTS.filter(e => e.id !== event.id).slice(0, 4).map((rel) => (
                <Link 
                  key={rel.id}
                  href={`/dashboard/audit/${rel.id}`}
                  className="p-2 border border-slate-100 hover:border-brand/35 bg-slate-50/50 hover:bg-brand-soft/20 rounded-xl flex items-center justify-between gap-1 transition-all block cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="text-slate-850 font-bold block truncate">{rel.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">{rel.id}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Minimal placeholder close helper for absolute imports
const X = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);
