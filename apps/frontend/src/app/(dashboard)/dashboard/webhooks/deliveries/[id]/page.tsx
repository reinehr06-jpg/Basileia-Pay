'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Copy, 
  Check, 
  ArrowRight,
  Database,
  Globe,
  Terminal,
  Activity,
  X
} from 'lucide-react';
import { WebhookDelivery } from '@/types/webhook';
import { MOCK_DELIVERIES } from '../../__mocks__/webhooks';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function WebhookDeliveryDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [delivery, setDelivery] = useState<WebhookDelivery | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Find delivery in mock deliveries list
    const found = MOCK_DELIVERIES.find(d => d.id === resolvedParams.id) || MOCK_DELIVERIES[0];
    setDelivery(found);
  }, [resolvedParams.id]);

  const triggerSuccessAlert = (message: string) => {
    setSuccessAlert(message);
    setTimeout(() => setSuccessAlert(null), 4500);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRetryNow = () => {
    if (!delivery) return;
    setRetrying(true);
    setTimeout(() => {
      setDelivery(prev => prev ? {
        ...prev,
        status: 'delivered',
        httpStatus: 200,
        attempts: prev.attempts + 1,
        deliveredAt: new Date().toISOString()
      } : null);
      setRetrying(false);
      triggerSuccessAlert('Webhook reenviado com sucesso! O servidor de destino retornou HTTP 200 OK.');
    }, 1500);
  };

  if (!delivery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 font-semibold text-xs gap-2">
        <Clock className="w-8 h-8 text-brand animate-spin" />
        <span>Carregando detalhes da entrega...</span>
      </div>
    );
  }

  return (
    <div className="w-full text-left pt-2 pb-12 px-4 lg:px-6 max-w-[1400px] mx-auto select-none bg-[#F7F7FA] min-h-screen">
      
      {/* Toast Alert Banner */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-55 bg-brand text-white p-3.5 rounded-2xl shadow-xl border border-brand/50 animate-in slide-in-from-top-4 duration-300 flex items-center justify-between gap-3 max-w-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold">{successAlert}</span>
          </div>
          <button onClick={() => setSuccessAlert(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-450 mb-4 shrink-0">
        <Link href="/dashboard/webhooks" className="hover:text-brand flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Webhooks
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-450">Entregas</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-bold font-mono">{delivery.id}</span>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E5EF] pb-4 mb-5 shrink-0">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950 font-mono">
              {delivery.id}
            </h1>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 flex items-center gap-1.5",
              delivery.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
              delivery.status === 'retrying' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-red-50 border-red-200 text-red-700'
            )}>
              <div className={cn(
                "w-1 h-1 rounded-full",
                delivery.status === 'delivered' ? 'bg-green-500' :
                delivery.status === 'retrying' ? 'bg-amber-500' : 'bg-red-500'
              )} />
              {delivery.status === 'delivered' ? 'Entregue' : delivery.status === 'retrying' ? 'Reenviando' : 'Falhou'}
            </span>
          </div>
          <p className="text-slate-400 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight">
            Evento disparado pelo sistema de origem para o endpoint do receptor configurado.
          </p>
        </div>

        <button 
          onClick={handleRetryNow}
          disabled={retrying}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-brand hover:bg-brand-deep disabled:bg-slate-200 text-white rounded-xl text-[10px] font-black shadow-sm transition-all h-[34px] uppercase tracking-tight"
        >
          {retrying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Reenviar evento
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Col 1 & 2: Payload details */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Section 1: Payload enviado */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-2 text-slate-800">
                <Database className="w-4 h-4 text-brand" />
                <span className="text-[11.5px] font-black uppercase tracking-wider">Payload Enviado (JSON POST Body)</span>
              </div>
              <button 
                onClick={() => handleCopy(JSON.stringify(delivery.payload, null, 2), 'payload')}
                className="flex items-center gap-1 text-[10px] font-black text-brand hover:underline"
              >
                {copiedField === 'payload' ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copiar payload
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 text-green-400 font-mono text-[10.5px] p-3.5 rounded-xl overflow-x-auto no-scrollbar max-h-[300px]">
              {JSON.stringify(delivery.payload, null, 2)}
            </pre>
          </div>

          {/* Section 2: Resposta recebida */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-2 text-slate-800">
                <Terminal className="w-4 h-4 text-brand" />
                <span className="text-[11.5px] font-black uppercase tracking-wider">Resposta do Servidor de Destino</span>
              </div>
              <button 
                onClick={() => handleCopy(delivery.responseBody || '', 'response')}
                className="flex items-center gap-1 text-[10px] font-black text-brand hover:underline"
              >
                {copiedField === 'response' ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copiar resposta
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3 font-semibold text-xs text-slate-600">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Response Headers</span>
                <pre className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] font-mono text-slate-700 overflow-x-auto mt-1 max-h-[100px] no-scrollbar">
                  {delivery.responseHeaders ? JSON.stringify(delivery.responseHeaders, null, 2) : 'Nenhum header retornado'}
                </pre>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Response Body</span>
                <pre className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10px] font-mono text-slate-700 overflow-x-auto mt-1 max-h-[140px] no-scrollbar">
                  {delivery.responseBody || 'Nenhum corpo retornado pelo receptor.'}
                </pre>
              </div>
            </div>
          </div>

        </div>

        {/* Col 3: Side info + timeline */}
        <div className="space-y-4">
          
          {/* Main info properties list */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-4">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Detalhes Operacionais
            </span>
            <div className="space-y-3 font-semibold text-xs text-slate-500">
              {[
                { label: 'Tipo de Evento', value: delivery.event, code: true },
                { label: 'Endpoint Destino', value: delivery.endpointName },
                { label: 'HTTP Status', value: delivery.httpStatus || 500, status: true },
                { label: 'Latência de Resposta', value: delivery.latencyMs ? `${delivery.latencyMs}ms` : '—' },
                { label: 'Tentativas de Envio', value: `${delivery.attempts} de ${delivery.maxAttempts}` },
                { label: 'Data de Disparo', value: new Date(delivery.createdAt).toLocaleString('pt-BR') },
                { label: 'Data de Entrega', value: delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString('pt-BR') : 'Pendente' }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span>{item.label}</span>
                  <span className={cn(
                    "text-slate-850 font-bold text-right truncate max-w-[180px]",
                    item.code ? 'font-mono text-brand bg-brand/5 px-1.5 py-0.2 rounded border border-brand/10 text-[9px] font-black uppercase' : '',
                    item.status ? (delivery.status === 'delivered' ? 'text-green-600' : 'text-red-650') : ''
                  )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Timeline */}
          <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-4">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">
              Timeline de Tentativas
            </span>
            <div className="space-y-4 relative pl-3 font-semibold text-xs text-slate-655">
              
              {/* Vertical path line */}
              <div className="absolute left-[18.5px] top-2 bottom-2 w-0.5 bg-slate-100" />

              {Array.from({ length: delivery.attempts }).map((_, idx) => {
                const stepNum = idx + 1;
                const isLast = stepNum === delivery.attempts;
                const isSuccessStep = isLast && delivery.status === 'delivered';
                
                return (
                  <div key={idx} className="flex gap-3 items-start relative z-10">
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[8px] font-black border",
                      isSuccessStep ? 'bg-green-500 border-green-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-500'
                    )}>
                      {stepNum}
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block">
                        {isSuccessStep ? 'Tentativa com Sucesso' : `Tentativa #${stepNum} de Envio`}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(delivery.createdAt).toLocaleString('pt-BR')} — {delivery.latencyMs}ms de latência
                      </span>
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.2 rounded border uppercase block mt-1.5 w-fit leading-none",
                        isSuccessStep ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-750'
                      )}>
                        HTTP {isSuccessStep ? '200 OK' : (delivery.httpStatus || 500)}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
