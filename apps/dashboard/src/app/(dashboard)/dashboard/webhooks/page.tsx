'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Webhook, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Globe, 
  Settings, 
  ChevronRight, 
  Trash2, 
  Copy, 
  ExternalLink, 
  SlidersHorizontal, 
  Search, 
  Zap, 
  Check, 
  Send, 
  Sparkles, 
  Info, 
  Calendar, 
  X,
  FileText,
  Clock,
  RefreshCw,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Share2,
  Lock,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

import { 
  WebhookEndpoint, 
  WebhookDelivery, 
  WebhookKpi, 
  WebhookFlowPoint, 
  WebhookTestResult, 
  WebhookEndpointStatus, 
  WebhookDeliveryStatus,
  WebhookEnvironment 
} from '@/types/webhook';



import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

function mapApiEndpoint(ep: any): WebhookEndpoint {
  const sys = ep.system || {};
  return {
    id: ep.uuid || ep.id?.toString(),
    name: ep.description || ep.url || 'Webhook',
    url: ep.url || '',
    systemId: sys.uuid || ep.system_id?.toString() || '',
    systemName: sys.name || '—',
    environment: 'production',
    status: (ep.status === 'active' ? 'active' : 'disabled') as WebhookEndpointStatus,
    deliveryRate24h: ep.last_delivery_status === 'delivered' ? 100 : 0,
    lastDeliveryAt: ep.last_delivery_at || null,
    events24h: 0,
    recentErrors: [],
    subscribedEvents: ep.events || [],
    avgLatencyMs: null,
    p95LatencyMs: null,
    hmacEnabled: !!ep.secret_hash,
    sslVerified: true,
    timeoutSeconds: 30,
    maxRetries: 5,
    retryStrategy: 'exponential',
    createdAt: ep.created_at || '',
    updatedAt: ep.updated_at || '',
  };
}

function mapApiDelivery(d: any): WebhookDelivery {
  return {
    id: d.uuid || d.id?.toString(),
    endpointId: d.endpoint?.uuid || d.endpoint_id?.toString() || '',
    endpointName: d.endpoint?.url || d.endpoint?.description || '—',
    event: d.event_type || '',
    systemId: '',
    status: (d.status === 'delivered' ? 'delivered' : d.status === 'failed' ? 'failed' : 'pending') as WebhookDeliveryStatus,
    httpStatus: d.http_status,
    latencyMs: undefined,
    attempts: d.attempts || 1,
    maxAttempts: 5,
    payload: d.payload_masked || {},
    responseBody: d.response_body || '',
    createdAt: d.created_at || '',
    deliveredAt: d.delivered_at || null,
  };
}

export default function WebhooksPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false); // Can trigger to show state

  // Core lists state
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        setLoading(true);
        const [epRes, delRes] = await Promise.all([
          apiFetch('/api/v1/dashboard/webhooks/endpoints'),
          apiFetch('/api/v1/dashboard/webhooks/deliveries'),
        ]);
        if (epRes.success && Array.isArray(epRes.data)) {
          setEndpoints(epRes.data.map(mapApiEndpoint));
        }
        if (delRes.success && Array.isArray(delRes.data)) {
          setDeliveries(delRes.data.map(mapApiDelivery));
        }
      } catch (err) { console.error('Failed to fetch webhooks data:', err); } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState<'endpoints' | 'events' | 'deliveries' | 'failures' | 'retries' | 'logs'>('endpoints');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [filterSystem, setFilterSystem] = useState<string>('Todos');
  const [filterEnv, setFilterEnv] = useState<string>('Todos');
  const [filterEvent, setFilterEvent] = useState<string>('Todos');
  const [filterPeriod, setFilterPeriod] = useState<string>('7d');

  // Row selection
  const [selectedEndpointIds, setSelectedEndpointIds] = useState<string[]>([]);
  
  // Drawer & Dialog State
  const [selectedEndpoint, setSelectedEndpoint] = useState<WebhookEndpoint | null>(null);
  const [drawerTab, setDrawerTab] = useState<'resumo' | 'entregas' | 'eventos' | 'configuracao' | 'logs'>('resumo');
  const [showNewEndpointModal, setShowNewEndpointModal] = useState(false);
  const [newEndpointStep, setNewEndpointStep] = useState<1 | 2>(1);

  // New endpoint form values
  const [newEpName, setNewEpName] = useState('');
  const [newEpUrl, setNewEpUrl] = useState('');
  const [newEpSystem, setNewEpSystem] = useState('Church');
  const [newEpEnv, setNewEpEnv] = useState<WebhookEnvironment>('production');
  const [newEpEvents, setNewEpEvents] = useState<string[]>(['payment.approved']);
  const [newEpHmac, setNewEpHmac] = useState('');
  const [newEpTimeout, setNewEpTimeout] = useState(30);
  const [newEpRetries, setNewEpRetries] = useState(5);
  const [newEpStrategy, setNewEpStrategy] = useState<'exponential' | 'linear' | 'fixed'>('exponential');

  // Test Dialog state
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEndpointUrl, setTestEndpointUrl] = useState('');
  const [testEventType, setTestEventType] = useState('payment.approved');
  const [testPayload, setTestPayload] = useState('{\n  "event": "payment.approved",\n  "payment_id": "pay_test_992381",\n  "amount": 29900,\n  "currency": "BRL",\n  "method": "pix"\n}');
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null);

  // Retry Dialog state
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryTargetDelivery, setRetryTargetDelivery] = useState<WebhookDelivery | null>(null);
  const [retryingInProgress, setRetryingInProgress] = useState(false);

  // Live real-time feed simulation
  const [liveFeed, setLiveFeed] = useState<WebhookDelivery[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Docs Modal State
  const [showDocsModal, setShowDocsModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const triggerSuccessAlert = (message: string) => {
    setSuccessAlert(message);
    setTimeout(() => setSuccessAlert(null), 4000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Toggle single endpoint status
  const handleToggleStatus = (id: string, current: WebhookEndpointStatus) => {
    const next: WebhookEndpointStatus = current === 'active' ? 'disabled' : 'active';
    setEndpoints(prev => prev.map(ep => ep.id === id ? { ...ep, status: next } : ep));
    triggerSuccessAlert(`Status do endpoint alterado para ${next === 'active' ? 'Ativo' : 'Desativado'}.`);
  };

  // Delete single endpoint
  const handleDeleteEndpoint = (id: string) => {
    if (!confirm('Deseja excluir permanentemente este endpoint de webhook?')) return;
    setEndpoints(prev => prev.filter(ep => ep.id !== id));
    setSelectedEndpoint(null);
    triggerSuccessAlert('Endpoint excluído com sucesso.');
  };

  // Create endpoint step 1 logic
  const handleNewEndpointNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpName || !newEpUrl) {
      alert('Nome e URL são obrigatórios.');
      return;
    }
    // Generate simulated HMAC key
    const generatedHmac = 'whsec_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setNewEpHmac(generatedHmac);
    setNewEndpointStep(2);
  };

  // Create endpoint final logic
  const handleCreateEndpointSubmit = () => {
    const newEp: WebhookEndpoint = {
      id: `ep_00${endpoints.length + 1}`,
      name: newEpName,
      url: newEpUrl,
      systemId: `sys_${newEpSystem.toLowerCase()}`,
      systemName: newEpSystem,
      environment: newEpEnv,
      status: 'active',
      deliveryRate24h: 100,
      lastDeliveryAt: null,
      events24h: 0,
      recentErrors: [],
      subscribedEvents: newEpEvents,
      avgLatencyMs: null,
      p95LatencyMs: null,
      hmacEnabled: true,
      sslVerified: true,
      timeoutSeconds: newEpTimeout,
      maxRetries: newEpRetries,
      retryStrategy: newEpStrategy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEndpoints(prev => [newEp, ...prev]);
    setShowNewEndpointModal(false);
    setNewEndpointStep(1);
    setNewEpName('');
    setNewEpUrl('');
    triggerSuccessAlert(`Endpoint ${newEp.name} criado com sucesso.`);
  };

  // Run single delivery retry
  const handleTriggerRetry = (dlv: WebhookDelivery) => {
    setRetryTargetDelivery(dlv);
    setShowRetryModal(true);
  };

  const handleConfirmRetry = () => {
    if (!retryTargetDelivery) return;
    setRetryingInProgress(true);
    setTimeout(() => {
      setDeliveries(prev => prev.map(d => {
        if (d.id === retryTargetDelivery.id) {
          return { ...d, status: 'delivered', httpStatus: 200, latencyMs: 140, attempts: d.attempts + 1 };
        }
        return d;
      }));
      setRetryingInProgress(false);
      setShowRetryModal(false);
      triggerSuccessAlert(`Reenvio do evento #${retryTargetDelivery.id} concluído com status 200.`);
    }, 1500);
  };

  // Run test endpoint request
  const handleTriggerTest = (epUrl: string) => {
    setTestEndpointUrl(epUrl);
    setTestResult(null);
    setShowTestModal(true);
  };

  const handleRunTestSubmit = () => {
    setTestingInProgress(true);
    setTimeout(() => {
      const isOk = Math.random() > 0.15;
      setTestResult({
        success: isOk,
        httpStatus: isOk ? 200 : 500,
        latencyMs: 110 + Math.floor(Math.random() * 200),
        responseBody: isOk ? '{"status":"ok","received":true}' : '{"error":"Internal Server Error","code":500}',
        responseHeaders: {
          'content-type': 'application/json',
          'server': 'cloudflare',
          'date': new Date().toUTCString()
        },
        hmacValid: true
      });
      setTestingInProgress(false);
      triggerSuccessAlert(`Teste enviado! Resposta: ${isOk ? '200 OK' : '500 Server Error'}`);
    }, 2000);
  };

  // Batch actions
  const handleBatchTest = () => {
    triggerSuccessAlert(`Disparando webhooks de teste para ${selectedEndpointIds.length} endpoints selecionados.`);
    setSelectedEndpointIds([]);
  };

  const handleBatchDisable = () => {
    setEndpoints(prev => prev.map(ep => selectedEndpointIds.includes(ep.id) ? { ...ep, status: 'disabled' } : ep));
    triggerSuccessAlert(`Desativando ${selectedEndpointIds.length} endpoints selecionados.`);
    setSelectedEndpointIds([]);
  };

  // Filters logic
  const filteredEndpoints = endpoints.filter(ep => {
    const matchesSearch = ep.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ep.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' ? true : ep.status === filterStatus.toLowerCase();
    const matchesSystem = filterSystem === 'Todos' ? true : ep.systemName === filterSystem;
    const matchesEnv = filterEnv === 'Todos' ? true : ep.environment === filterEnv.toLowerCase();
    return matchesSearch && matchesStatus && matchesSystem && matchesEnv;
  });

  const getFilteredDeliveries = () => {
    return deliveries.filter(d => {
      const matchesSearch = d.endpointName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            d.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesEvent = filterEvent === 'Todos' ? true : d.event === filterEvent;
      
      let matchesTab = true;
      if (activeTab === 'failures') matchesTab = d.status === 'failed';
      else if (activeTab === 'retries') matchesTab = d.status === 'retrying';
      
      return matchesSearch && matchesEvent && matchesTab;
    });
  };

  const currentDeliveries = getFilteredDeliveries();

  return (
    <div className="w-full select-none text-left pt-1 pb-10 bg-[#F7F7FA] min-h-screen">
      
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

      {/* Modal: Novo Endpoint (2 Etapas) */}
      {showNewEndpointModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E5EF] shadow-2xl p-6 max-w-lg w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-brand">
                <Webhook className="w-5 h-5 shrink-0" />
                <h3 className="text-slate-950 font-black text-sm">
                  {newEndpointStep === 1 ? 'Cadastrar Novo Endpoint Webhook' : 'Segurança & Estratégias de Retry'}
                </h3>
              </div>
              <button onClick={() => setShowNewEndpointModal(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {newEndpointStep === 1 ? (
              <form onSubmit={handleNewEndpointNext} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Nome Identificador</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Church - Integração Vendas"
                    value={newEpName}
                    onChange={(e) => setNewEpName(e.target.value)}
                    className="w-full bg-white border border-[#E7E5EF] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">URL de Destino (Receptor HTTP POST)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.seusistema.com/webhooks"
                    value={newEpUrl}
                    onChange={(e) => setNewEpUrl(e.target.value)}
                    className="w-full bg-white border border-[#E7E5EF] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Sistema Vinculado</label>
                    <select
                      value={newEpSystem}
                      onChange={(e) => setNewEpSystem(e.target.value)}
                      className="w-full bg-white border border-[#E7E5EF] rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="Church">Church</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Loja X">Loja X</option>
                      <option value="Outro Externo">Outro Externo</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Ambiente</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="env"
                          checked={newEpEnv === 'production'}
                          onChange={() => setNewEpEnv('production')}
                          className="text-brand focus:ring-brand"
                        />
                        Produção
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="env"
                          checked={newEpEnv === 'sandbox'}
                          onChange={() => setNewEpEnv('sandbox')}
                          className="text-brand focus:ring-brand"
                        />
                        Sandbox
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Eventos para Assinar</label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {['payment.approved', 'payment.failed', 'subscription.renewed', 'subscription.cancelled'].map(ev => {
                      const isSelected = newEpEvents.includes(ev);
                      return (
                        <button
                          key={ev}
                          type="button"
                          onClick={() => {
                            setNewEpEvents(prev => prev.includes(ev) ? prev.filter(x => x !== ev) : [...prev, ev]);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold text-left transition-all",
                            isSelected ? "bg-brand/5 border-brand text-brand" : "bg-white border-[#E7E5EF] text-slate-600 hover:bg-slate-55/30"
                          )}
                        >
                          <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0", isSelected ? "bg-brand border-brand text-white" : "border-slate-300")}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          {ev}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewEndpointModal(false)}
                    className="px-4 py-1.5 border border-[#E7E5EF] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase h-[32px]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase h-[32px]"
                  >
                    Avançar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 font-semibold text-xs text-slate-700">
                
                {/* Warning HMAC banner */}
                <div className="bg-[#FAF8FF] border border-[#E7E5EF] p-3.5 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black text-brand uppercase tracking-wider block">Assinatura HMAC (Chave Secreta)</span>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    Copie a chave secreta gerada abaixo para autenticar as requisições POST em seu servidor receptor. Por motivos de segurança, **esta chave não será exibida novamente**.
                  </p>
                  
                  <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-2.5 font-mono text-[11px] text-green-400 mt-2">
                    <span className="truncate flex-1">{newEpHmac}</span>
                    <button 
                      onClick={() => handleCopy(newEpHmac, 'hmac')}
                      className="p-1 hover:bg-slate-800 rounded text-white transition-colors"
                    >
                      {copiedField === 'hmac' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Timeout de Entrega (segundos)</label>
                    <input
                      type="number"
                      value={newEpTimeout}
                      onChange={(e) => setNewEpTimeout(parseInt(e.target.value) || 30)}
                      className="w-full bg-white border border-[#E7E5EF] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Máx. Tentativas (Retries)</label>
                    <select
                      value={newEpRetries}
                      onChange={(e) => setNewEpRetries(parseInt(e.target.value) || 5)}
                      className="w-full bg-white border border-[#E7E5EF] rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      {[1, 2, 3, 5, 8, 10].map(n => (
                        <option key={n} value={n}>{n} tentativas</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Estratégia de Delay de Retry</label>
                  <select
                    value={newEpStrategy}
                    onChange={(e) => setNewEpStrategy(e.target.value as any)}
                    className="w-full bg-white border border-[#E7E5EF] rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="exponential">Exponencial (Recomendado)</option>
                    <option value="linear">Linear (Fixo)</option>
                    <option value="fixed">Intervalos Fixos Curtos</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setNewEndpointStep(1)}
                    className="px-4 py-1.5 border border-[#E7E5EF] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase h-[32px]"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCreateEndpointSubmit}
                    className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase h-[32px]"
                  >
                    Salvar & Ativar
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Testar Endpoint */}
      {showTestModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E5EF] shadow-2xl p-6 max-w-xl w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-brand">
                <Send className="w-5 h-5 shrink-0" />
                <h3 className="text-slate-950 font-black text-sm">Disparar Evento de Teste Sandbox</h3>
              </div>
              <button onClick={() => setShowTestModal(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Endpoint Alvo</label>
                <input
                  type="text"
                  disabled
                  value={testEndpointUrl}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Tipo de Evento</label>
                  <select
                    value={testEventType}
                    onChange={(e) => setTestEventType(e.target.value)}
                    className="w-full bg-white border border-[#E7E5EF] rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="payment.approved">payment.approved</option>
                    <option value="payment.failed">payment.failed</option>
                    <option value="subscription.renewed">subscription.renewed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Payload JSON de Requisição</label>
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 text-green-400 font-mono text-[11px] rounded-xl p-3.5 focus:outline-none"
                />
              </div>

              {testResult && (
                <div className="border border-slate-150 rounded-2xl overflow-hidden mt-3 animate-in fade-in duration-200">
                  <div className="bg-slate-50/50 p-2.5 border-b border-slate-150 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado do Disparo</span>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black border",
                      testResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-650'
                    )}>
                      HTTP {testResult.httpStatus} ({testResult.latencyMs}ms)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 font-mono text-[10px] text-slate-200 space-y-2">
                    <div>
                      <span className="text-slate-450 block font-bold text-[9px] uppercase">Headers de Resposta:</span>
                      <pre className="text-slate-300 mt-0.5 truncate">{JSON.stringify(testResult.responseHeaders)}</pre>
                    </div>
                    <div>
                      <span className="text-slate-450 block font-bold text-[9px] uppercase">Corpo retornado:</span>
                      <pre className="text-green-400 mt-0.5 bg-slate-950 p-2 rounded-lg">{testResult.responseBody}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-1.5 border border-[#E7E5EF] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase h-[32px]"
              >
                Fechar
              </button>
              <button
                onClick={handleRunTestSubmit}
                disabled={testingInProgress}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase h-[32px] flex items-center gap-1.5"
              >
                {testingInProgress && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {testingInProgress ? 'Processando...' : 'Confirmar Envio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Retry */}
      {showRetryModal && retryTargetDelivery && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E5EF] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <RefreshCw className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Forçar Reenvio de Evento</h3>
            </div>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-4">
              Deseja reenviar imediatamente o evento <span className="font-bold text-slate-800">{retryTargetDelivery.event}</span> (ID: <span className="font-mono">{retryTargetDelivery.id}</span>) para o endpoint <span className="font-mono text-slate-800">{retryTargetDelivery.endpointName}</span>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowRetryModal(false)}
                className="px-4 py-1.5 border border-[#E7E5EF] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase h-[32px]"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmRetry}
                disabled={retryingInProgress}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase h-[32px] flex items-center gap-1"
              >
                {retryingInProgress && <RefreshCw className="w-3 h-3 animate-spin" />}
                Confirmar Reenvio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E5EF] pb-4 mb-4 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-brand" />
              <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">Webhooks</h1>
            </div>
            <p className="text-slate-400 font-semibold text-[10.5px] 2xl:text-[11px] tracking-tight">
              Monitore todos os endpoints, entregas e eventos em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowDocsModal(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1 bg-white border border-[#E7E5EF] hover:bg-brand-soft rounded-xl text-[10px] font-black text-slate-700 shadow-sm transition-all h-[30px]"
            >
              Documentação
            </button>
            <button
              onClick={() => setShowNewEndpointModal(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1 bg-brand hover:bg-brand-deep text-white rounded-xl text-[10px] font-black shadow-sm transition-all h-[30px] uppercase tracking-tight"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Novo endpoint
            </button>
          </div>
        </div>

        {/* 6 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-4 shrink-0">
          {[
            { label: 'Endpoints ativos', value: endpoints.filter(e => e.status === 'active').length.toString(), delta: 'total', color: 'text-brand', bg: 'bg-brand/5' },
            { label: 'Taxa de entrega 24h', value: deliveries.length > 0 ? ((deliveries.filter(d => d.status === 'delivered').length / deliveries.length) * 100).toFixed(1) + '%' : '100%', delta: 'média', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Eventos enviados 24h', value: deliveries.length.toString(), delta: 'total', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Falhas 24h', value: deliveries.filter(d => d.status === 'failed').length.toString(), delta: 'total', color: 'text-red-500', bg: 'bg-red-50', attention: true },
            { label: 'Retries 24h', value: deliveries.filter(d => d.attempts > 1).length.toString(), delta: 'total', color: 'text-amber-500', bg: 'bg-amber-50', attention: true },
            { label: 'Tempo médio entrega', value: '—', delta: 'tempo', color: 'text-emerald-600', bg: 'bg-emerald-50' }
          ].map((c) => (
            <div key={c.label} className="bg-white border border-[#E7E5EF] rounded-2xl p-3 shadow-sm flex flex-col justify-between h-[75px] transition-all">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">{c.label}</span>
              <div className="flex items-baseline justify-between leading-none mt-1">
                <span className="text-[14px] 2xl:text-[16px] font-black text-slate-900 leading-none">{c.value}</span>
                <span className={cn(
                  "font-black px-1 py-0.2 rounded text-[7.5px] leading-none shrink-0",
                  c.attention ? 'bg-red-55/15 text-red-500' : 'bg-green-55/15 text-green-600'
                )}>
                  {c.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Core Layout: Sidebar details + main columns */}
        <div className="flex flex-col lg:flex-row gap-4 items-start w-full relative">

          {/* MAIN LEFT AREA */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            
            {/* Table Container Card */}
            <div className="bg-white rounded-2xl border border-[#E7E5EF] shadow-sm overflow-hidden flex flex-col transition-all">
              
              {/* Tabs list */}
              <div className="border-b border-slate-100 bg-[#FAF9FF]/40 px-3 py-0 flex items-center gap-1 overflow-x-auto no-scrollbar">
                {[
                  { id: 'endpoints', label: 'Endpoints', count: endpoints.length },
                  { id: 'events', label: 'Eventos' },
                  { id: 'deliveries', label: 'Entregas', count: deliveries.length },
                  { id: 'failures', label: 'Falhas', count: deliveries.filter(d => d.status === 'failed').length },
                  { id: 'retries', label: 'Retries', count: deliveries.filter(d => d.status === 'retrying').length },
                  { id: 'logs', label: 'Logs' }
                ].map((t) => {
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={cn(
                        "px-3 py-2 text-[9.5px] font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5",
                        isActive ? "border-brand text-brand font-black" : "border-transparent text-slate-500 hover:text-brand"
                      )}
                    >
                      {t.label}
                      {t.count !== undefined && (
                        <span className={cn(
                          "px-1.5 py-0.2 rounded-full text-[8px] font-black leading-none",
                          isActive ? "bg-brand/10 text-brand" : "bg-slate-100 text-slate-500"
                        )}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filters Panel */}
              <div className="px-3 py-2 border-b border-slate-100 flex flex-wrap items-center gap-2 bg-white">
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-[#E7E5EF] rounded-lg px-2 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:border-brand h-[30px]"
                >
                  <option value="Todos">Status: Todos</option>
                  <option value="Active">Ativo</option>
                  <option value="Attention">Atenção</option>
                  <option value="Disabled">Desativado</option>
                  <option value="Failed">Falha</option>
                </select>

                <select
                  value={filterSystem}
                  onChange={(e) => setFilterSystem(e.target.value)}
                  className="bg-slate-50 border border-[#E7E5EF] rounded-lg px-2 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:border-brand h-[30px]"
                >
                  <option value="Todos">Sistema: Todos</option>
                  <option value="Church">Church</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Loja X">Loja X</option>
                </select>

                <select
                  value={filterEnv}
                  onChange={(e) => setFilterEnv(e.target.value)}
                  className="bg-slate-50 border border-[#E7E5EF] rounded-lg px-2 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:border-brand h-[30px]"
                >
                  <option value="Todos">Ambiente: Todos</option>
                  <option value="Production">Produção</option>
                  <option value="Sandbox">Sandbox</option>
                </select>

                {activeTab !== 'endpoints' && (
                  <select
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                    className="bg-slate-50 border border-[#E7E5EF] rounded-lg px-2 py-0.5 text-[11px] font-bold text-slate-750 focus:outline-none focus:border-brand h-[30px]"
                  >
                    <option value="Todos">Evento: Todos</option>
                    <option value="payment.approved">payment.approved</option>
                    <option value="payment.failed">payment.failed</option>
                    <option value="subscription.renewed">subscription.renewed</option>
                  </select>
                )}

                {/* Text query search */}
                <div className="relative flex-1 min-w-[140px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar URL, ID ou sistema..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-[#E7E5EF] rounded-lg pl-8 pr-3 py-1 h-[30px] text-[11px] font-semibold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex gap-1">
                  <button className="h-[30px] px-2 bg-white border border-[#E7E5EF] hover:bg-slate-50 rounded-lg text-slate-655 text-[11px] font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Últimos 7d</span>
                  </button>
                  <button className="h-[30px] w-[30px] flex items-center justify-center border border-[#E7E5EF] hover:bg-slate-50 rounded-lg text-slate-455 transition-colors">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Batch Action Bar if rows are checked */}
              {selectedEndpointIds.length > 0 && (
                <div className="bg-[#FAF8FF] px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-150">
                  <span className="font-bold text-brand">{selectedEndpointIds.length} endpoints selecionados</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleBatchTest}
                      className="px-2.5 py-1 bg-white border border-[#E7E5EF] rounded-lg text-[10.5px] font-black text-slate-700 hover:bg-slate-50"
                    >
                      Testar todos
                    </button>
                    <button 
                      onClick={handleBatchDisable}
                      className="px-2.5 py-1 bg-white border border-red-200 rounded-lg text-[10.5px] font-black text-red-600 hover:bg-red-50"
                    >
                      Desativar todos
                    </button>
                    <button 
                      onClick={() => setSelectedEndpointIds([])}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="w-full overflow-x-auto no-scrollbar">
                {activeTab === 'endpoints' ? (
                  <table className="w-full min-w-[1000px] text-left text-xs table-fixed">
                    <colgroup>
                      <col className="w-[4%]"/>   {/* Checkbox */}
                      <col className="w-[30%]"/>  {/* Endpoint */}
                      <col className="w-[12%]"/>  {/* Sistema */}
                      <col className="w-[10%]"/>  {/* Status */}
                      <col className="w-[18%]"/>  {/* Taxa de entrega */}
                      <col className="w-[12%]"/>  {/* Última entrega */}
                      <col className="w-[12%]"/>  {/* Erros recentes */}
                      <col className="w-[120px]"/> {/* Ações */}
                    </colgroup>
                    <thead>
                      <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/40">
                        <th className="px-3 py-2">
                          <input 
                            type="checkbox"
                            checked={selectedEndpointIds.length === filteredEndpoints.length && filteredEndpoints.length > 0}
                            onChange={(e) => {
                              setSelectedEndpointIds(e.target.checked ? filteredEndpoints.map(x => x.id) : []);
                            }}
                            className="rounded text-brand focus:ring-brand"
                          />
                        </th>
                        <th className="px-3 py-2">Endpoint</th>
                        <th className="px-3 py-2">Sistema</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Taxa entrega 24h</th>
                        <th className="px-3 py-2">Última entrega</th>
                        <th className="px-3 py-2">Erros recentes</th>
                        <th className="px-3 py-2 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-655">
                      {filteredEndpoints.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-slate-400 font-bold">
                            Nenhum endpoint webhook encontrado.
                          </td>
                        </tr>
                      ) : (
                        filteredEndpoints.slice(0, 5).map((ep) => {
                          const isChecked = selectedEndpointIds.includes(ep.id);
                          return (
                            <tr 
                              key={ep.id}
                              onClick={() => { setSelectedEndpoint(ep); setDrawerTab('resumo'); }}
                              className={cn(
                                "hover:bg-slate-50/40 cursor-pointer h-[50px]",
                                selectedEndpoint?.id === ep.id ? "bg-[#FAF9FF]" : ""
                              )}
                            >
                              <td className="px-3 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setSelectedEndpointIds(prev => prev.includes(ep.id) ? prev.filter(x => x !== ep.id) : [...prev, ep.id]);
                                  }}
                                  className="rounded text-brand focus:ring-brand"
                                />
                              </td>
                              <td className="px-3 py-1.5 align-middle">
                                <span className="font-bold text-slate-900 block truncate max-w-[280px]">{ep.name}</span>
                                <span className="text-[10px] text-slate-400 block font-mono mt-0.5 truncate max-w-[280px]">{ep.url}</span>
                              </td>
                              <td className="px-3 py-1.5 align-middle">
                                <span className="text-slate-800 font-bold block">{ep.systemName}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-black block mt-0.5">{ep.environment}</span>
                              </td>
                              <td className="px-3 py-1.5 align-middle">
                                <span className={cn(
                                  "inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase border shrink-0",
                                  ep.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                  ep.status === 'attention' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  ep.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-slate-50 text-slate-450 border-slate-200'
                                )}>
                                  <div className={cn(
                                    "w-1 h-1 rounded-full",
                                    ep.status === 'active' ? 'bg-green-500' :
                                    ep.status === 'attention' ? 'bg-amber-500' :
                                    ep.status === 'failed' ? 'bg-red-500' :
                                    'bg-slate-400'
                                  )} />
                                  {ep.status}
                                </span>
                              </td>
                              <td className="px-3 py-1.5 align-middle">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-900 font-bold w-[45px]">{ep.deliveryRate24h}%</span>
                                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-[100px]">
                                    <div 
                                      className={cn(
                                        "h-full rounded-full",
                                        ep.deliveryRate24h > 98 ? 'bg-green-500' : ep.deliveryRate24h > 95 ? 'bg-amber-500' : 'bg-red-500'
                                      )}
                                      style={{ width: `${ep.deliveryRate24h}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-1.5 align-middle">
                                <span className="text-slate-655">{ep.lastDeliveryAt ? 'há 2 minutos' : '—'}</span>
                              </td>
                              <td className="px-3 py-1.5 align-middle">
                                <div className="flex gap-1 flex-wrap">
                                  {ep.recentErrors.length === 0 ? (
                                    <span className="text-slate-400 text-[10.5px]">Nenhum</span>
                                  ) : (
                                    ep.recentErrors.map((err, i) => (
                                      <span key={i} className="px-1.5 py-0.2 bg-red-50 text-red-700 rounded text-[8px] font-black uppercase border border-red-150">
                                        {err}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-1.5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => handleTriggerTest(ep.url)}
                                    className="px-2.5 py-1 border border-[#E7E5EF] bg-white hover:bg-slate-50 rounded-lg text-[10.5px] font-black text-slate-700"
                                  >
                                    Testar
                                  </button>
                                  <button 
                                    onClick={() => { setSelectedEndpoint(ep); setDrawerTab('configuracao'); }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                                  >
                                    <Settings className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                ) : (
                  // Log and Deliveries view
                  <table className="w-full min-w-[1000px] text-left text-xs table-fixed">
                    <colgroup>
                      <col className="w-[16%]"/>  {/* ID */}
                      <col className="w-[16%]"/>  {/* Evento */}
                      <col className="w-[28%]"/>  {/* Endpoint */}
                      <col className="w-[10%]"/>  {/* HTTP Code */}
                      <col className="w-[15%]"/>  {/* Latência */}
                      <col className="w-[15%]"/>  {/* Data */}
                    </colgroup>
                    <thead>
                      <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/40">
                        <th className="px-3 py-2">ID da Entrega</th>
                        <th className="px-3 py-2">Evento</th>
                        <th className="px-3 py-2">Endpoint de Destino</th>
                        <th className="px-3 py-2">HTTP Status</th>
                        <th className="px-3 py-2">Latência</th>
                        <th className="px-3 py-2">Criado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60 font-semibold text-slate-655">
                      {currentDeliveries.slice(0, 6).map((dlv) => (
                        <tr 
                          key={dlv.id}
                          className="hover:bg-slate-50/40 cursor-pointer h-[48px]"
                          onClick={() => {
                            // Find endpoint
                            const foundEp = endpoints.find(e => e.id === dlv.endpointId);
                            if (foundEp) {
                              setSelectedEndpoint(foundEp);
                              setDrawerTab('entregas');
                            }
                          }}
                        >
                          <td className="px-3 py-1.5 align-middle">
                            <span className="font-mono text-slate-900 font-bold block">{dlv.id}</span>
                          </td>
                          <td className="px-3 py-1.5 align-middle">
                            <span className="px-2 py-0.5 rounded bg-brand/5 border border-brand/20 text-[9px] font-black text-brand uppercase">
                              {dlv.event}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 align-middle truncate text-slate-550 font-mono">
                            {dlv.endpointName}
                          </td>
                          <td className="px-3 py-1.5 align-middle">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black border",
                              dlv.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                              dlv.status === 'retrying' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              'bg-red-50 border-red-200 text-red-700'
                            )}>
                              {dlv.httpStatus || 500}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 align-middle text-slate-700">
                            {dlv.latencyMs ? `${dlv.latencyMs}ms` : '—'}
                          </td>
                          <td className="px-3 py-1.5 align-middle text-slate-500">
                            {new Date(dlv.createdAt).toLocaleDateString('pt-BR')} {new Date(dlv.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Simple Paginate footer */}
              <div className="p-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-550 bg-[#FAF9FF]/40 h-[38px]">
                <span>Exibindo 1 a 5 de {activeTab === 'endpoints' ? filteredEndpoints.length : currentDeliveries.length} resultados</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">5 por página</span>
                  <div className="flex gap-0.5">
                    {['1', '2'].map((n) => (
                      <button 
                        key={n} 
                        className={cn(
                          "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center",
                          n === '1' ? 'bg-brand/10 text-brand font-black' : 'hover:bg-slate-100 text-slate-655'
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom 4 Operational Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
              
              {/* Card 1: Live Real-Time feed */}
              <div className="bg-white border border-[#E7E5EF] rounded-2xl p-3 shadow-sm flex flex-col justify-between h-[280px]">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Entregas em tempo real</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 py-2 text-[11px] font-semibold">
                  {liveFeed.map((lf) => (
                    <div key={lf.id} className="flex items-center justify-between p-1.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate max-w-[130px]">{lf.endpointName}</span>
                        <span className="text-[9.5px] text-slate-400 block font-mono">{lf.event}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-slate-400 font-mono text-[9px]">{lf.latencyMs}ms</span>
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          lf.status === 'delivered' ? 'bg-green-500' : lf.status === 'retrying' ? 'bg-amber-500' : 'bg-red-500'
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Recharts top events bar chart */}
              <div className="bg-white border border-[#E7E5EF] rounded-2xl p-3 shadow-sm flex flex-col justify-between h-[280px]">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Eventos mais disparados</span>
                </div>
                <div className="h-[210px] w-full mt-2">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        layout="vertical"
                        data={[
                          { name: 'payment.approved', val: 3812 },
                          { name: 'payment.failed', val: 892 },
                          { name: 'sub.renewed', val: 718 },
                          { name: 'checkout.done', val: 641 },
                          { name: 'refunded', val: 201 }
                        ]}
                        margin={{ top: 0, right: 10, left: -25, bottom: 0 }}
                      >
                        <XAxis type="number" stroke="#94A3B8" fontSize={8} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={8} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '9px' }} />
                        <Bar dataKey="val" fill="#7C3AED" radius={[0, 3, 3, 0]} barSize={10} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
                  )}
                </div>
              </div>

              {/* Card 3: Latency by Endpoint */}
              <div className="bg-white border border-[#E7E5EF] rounded-2xl p-3 shadow-sm flex flex-col justify-between h-[280px]">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Latência por Endpoint (ms)</span>
                </div>
                <div className="h-[210px] w-full mt-2">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { name: 'Church', ms: 118, color: '#16A34A' },
                          { name: 'Vendor', ms: 342, color: '#F59E0B' },
                          { name: 'Loja X', ms: 1840, color: '#DC2626' }
                        ]}
                        margin={{ top: 10, right: 0, left: -25, bottom: 0 }}
                      >
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={8} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={8} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '9px' }} />
                        <Bar dataKey="ms" fill="#3B82F6" radius={[3, 3, 0, 0]} barSize={25}>
                          {[
                            { color: '#16A34A' },
                            { color: '#F59E0B' },
                            { color: '#DC2626' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
                  )}
                </div>
              </div>

              {/* Card 4: Quick Actions */}
              <div className="bg-white border border-[#E7E5EF] rounded-2xl p-3 shadow-sm flex flex-col justify-between h-[280px]">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Ações Rápidas</span>
                </div>
                <div className="flex-1 grid grid-cols-1 gap-2.5 py-4 font-semibold text-[10.5px]">
                  <button 
                    onClick={() => handleTriggerTest('https://church.basileia.app/webhooks/payments')}
                    className="w-full py-2 bg-slate-50 hover:bg-brand-soft border border-slate-200 text-slate-700 hover:text-brand transition-colors rounded-xl flex items-center justify-center gap-2 h-[42px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Testar todos endpoints
                  </button>
                  <button 
                    onClick={() => {
                      triggerSuccessAlert('Iniciando retry em lote de 47 falhas pendentes...');
                    }}
                    className="w-full py-2 bg-slate-50 hover:bg-brand-soft border border-slate-200 text-slate-700 hover:text-brand transition-colors rounded-xl flex items-center justify-center gap-2 h-[42px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reenviar falhas pendentes
                  </button>
                  <button 
                    onClick={() => triggerSuccessAlert('Logs exportados em CSV.')}
                    className="w-full py-2 bg-slate-50 hover:bg-brand-soft border border-slate-200 text-slate-700 hover:text-brand transition-colors rounded-xl flex items-center justify-center gap-2 h-[42px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar logs de hoje
                  </button>
                  <button 
                    onClick={() => {
                      setEndpoints(prev => prev.map(ep => ep.id === 'ep_003' ? { ...ep, status: 'disabled' } : ep));
                      triggerSuccessAlert('Endpoint Loja X pausado temporariamente.');
                    }}
                    className="w-full py-2 bg-red-50 hover:bg-red-100/60 border border-red-100 text-red-700 transition-colors rounded-xl flex items-center justify-center gap-2 h-[42px]"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pausar endpoint problemático
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT SIDE PANEL: event flow + recent errors + health status */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-4">
            
            {/* Bloco 1: Flow analytic graph */}
            <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <div className="flex flex-col">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none">Fluxo de Eventos (24h)</span>
                  <span className="text-[13px] font-black text-slate-900 mt-1">{deliveries.length} Disparos</span>
                </div>
              </div>
              <div className="h-[120px]">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[]}>
                      <XAxis dataKey="hour" stroke="#94A3B8" fontSize={7.5} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={7.5} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '9px' }} />
                      <Area type="monotone" dataKey="sent" stroke="#6D3FF3" strokeWidth={1.5} fillOpacity={0.05} fill="#6D3FF3" />
                      <Area type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={1.5} fillOpacity={0.0} fill="#EF4444" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
                )}
              </div>
            </div>

            {/* Bloco 2: Recent errors */}
            <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Erros mais recentes</span>
              </div>
              <div className="space-y-2 text-[11px] font-semibold">
                {[
                  { ep: 'Loja X - Checkout', error: '500 Server Error', time: 'há 4 min', dlvId: 'wh_dlv_01JTK8XA1D0829C' },
                  { ep: 'Vendor - Pedidos', error: '504 Gateway Timeout', time: 'há 8 min', dlvId: 'wh_dlv_01JTK8XA1D0829D' }
                ].map((err, i) => (
                  <div key={i} className="p-2 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <span className="text-slate-800 font-bold block truncate max-w-[140px]">{err.ep}</span>
                      <span className="text-red-600 text-[10px] block mt-0.5">{err.error}</span>
                      <span className="text-slate-400 text-[9.5px] block mt-0.5">{err.time}</span>
                    </div>
                    <button 
                      onClick={() => handleTriggerRetry(deliveries.find(d => d.id === err.dlvId) || deliveries[2])}
                      className="h-6 px-2 border border-slate-200 hover:bg-brand-soft hover:text-brand transition-colors rounded-lg text-[9.5px] font-black text-slate-655 shrink-0"
                    >
                      Retry
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco 3: Health metrics grid */}
            <div className="bg-white border border-[#E7E5EF] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Saúde Geral API</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-left">
                  <span className="text-[8.5px] text-slate-400 uppercase block font-black leading-none">Uptime API</span>
                  <span className="text-slate-850 font-black text-xs mt-1 block">99,95%</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-left">
                  <span className="text-[8.5px] text-slate-400 uppercase block font-black leading-none">Latência P95</span>
                  <span className="text-slate-850 font-black text-xs mt-1 block">198ms</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-left">
                  <span className="text-[8.5px] text-slate-400 uppercase block font-black leading-none">Erro P95</span>
                  <span className="text-slate-850 font-black text-xs mt-1 block">0,02%</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-left">
                  <span className="text-[8.5px] text-slate-400 uppercase block font-black leading-none">Fila de Retries</span>
                  <span className="text-slate-850 font-black text-xs mt-1 block">47</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* DRAWER LATERAL DO ENDPOINT SELECIONADO */}
      {selectedEndpoint && (
        <>
          <div 
            onClick={() => setSelectedEndpoint(null)}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-30"
          />
          <div className="fixed inset-y-0 right-0 z-40 w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAF9FF]">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-black text-slate-900 truncate">{selectedEndpoint.name}</h2>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded border bg-slate-50 border-slate-200 text-slate-500">
                    {selectedEndpoint.environment}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate max-w-[380px]">{selectedEndpoint.url}</span>
              </div>
              <button 
                onClick={() => setSelectedEndpoint(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs inside drawer */}
            <div className="border-b border-slate-150 flex items-center gap-0.5 px-3 overflow-x-auto no-scrollbar bg-slate-50/50">
              {(['resumo', 'entregas', 'eventos', 'configuracao', 'logs'] as const).map(tab => {
                const isActive = drawerTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setDrawerTab(tab)}
                    className={cn(
                      "px-3 py-2.5 text-[9px] font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap",
                      isActive ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-brand"
                    )}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Content box of drawer */}
            <div className="p-4 flex-1 overflow-y-auto no-scrollbar space-y-4 text-xs font-semibold">
              
              {drawerTab === 'resumo' && (
                <div className="space-y-4">
                  <div className="bg-[#FAF9FF] border border-[#E7E5EF] p-3 rounded-2xl space-y-2.5">
                    {[
                      { l: 'Taxa de entrega (7 dias)', v: `${selectedEndpoint.deliveryRate24h}%` },
                      { l: 'Total de eventos (7 dias)', v: selectedEndpoint.events24h.toLocaleString('pt-BR') },
                      { l: 'Tempo médio de latência', v: selectedEndpoint.avgLatencyMs ? `${selectedEndpoint.avgLatencyMs}ms` : '—' },
                      { l: 'Latência P95', v: selectedEndpoint.p95LatencyMs ? `${selectedEndpoint.p95LatencyMs}ms` : '—' },
                      { l: 'SSL verificado', v: selectedEndpoint.sslVerified ? 'Sim' : 'Não' },
                      { l: 'Timeout configurado', v: `${selectedEndpoint.timeoutSeconds} segundos` },
                      { l: 'Máx. tentativas de retry', v: selectedEndpoint.maxRetries.toString() },
                      { l: 'Estratégia de Retry', v: selectedEndpoint.retryStrategy === 'exponential' ? 'Exponencial' : 'Linear' }
                    ].map((item) => (
                      <div key={item.l} className="flex justify-between items-center">
                        <span className="text-slate-400">{item.l}</span>
                        <span className="text-slate-900 font-bold">{item.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Uptime analítico (Últimos 14 dias)</span>
                    <div className="h-[80px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                      <span className="text-slate-400 text-[10.5px]">Histórico de estabilidade normal (100% de sucesso)</span>
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'entregas' && (
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Histórico de entregas desse endpoint</span>
                  <div className="space-y-2">
                    {deliveries.filter(d => d.endpointId === selectedEndpoint.id).map(dlv => (
                      <Link 
                        key={dlv.id}
                        href={`/dashboard/webhooks/deliveries/${dlv.id}`}
                        className="p-2 border border-slate-100 bg-slate-50/50 hover:bg-brand-soft/20 transition-all rounded-xl flex items-center justify-between gap-1 cursor-pointer block"
                      >
                        <div>
                          <span className="font-mono text-slate-900 font-bold block">{dlv.id}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{dlv.event}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] text-slate-800">{dlv.latencyMs}ms</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black border",
                            dlv.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                          )}>
                            {dlv.httpStatus || 500}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'eventos' && (
                <div className="space-y-2.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tipos de evento configurados para este endpoint</span>
                  <div className="space-y-2">
                    {selectedEndpoint.subscribedEvents.map((ev) => (
                      <div key={ev} className="p-2 bg-slate-55/40 border border-slate-100 rounded-xl flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800">{ev}</span>
                        <span className="px-1.5 py-0.2 bg-brand/5 border border-brand/20 rounded text-[9px] font-black text-brand uppercase">Assinado</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {drawerTab === 'configuracao' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Nome do Endpoint</label>
                    <input
                      type="text"
                      value={selectedEndpoint.name}
                      onChange={(e) => setEndpoints(prev => prev.map(ep => ep.id === selectedEndpoint.id ? { ...ep, name: e.target.value } : ep))}
                      className="w-full bg-white border border-[#E7E5EF] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">URL de Destino</label>
                    <input
                      type="url"
                      value={selectedEndpoint.url}
                      onChange={(e) => setEndpoints(prev => prev.map(ep => ep.id === selectedEndpoint.id ? { ...ep, url: e.target.value } : ep))}
                      className="w-full bg-white border border-[#E7E5EF] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Timeout (s)</label>
                      <input
                        type="number"
                        value={selectedEndpoint.timeoutSeconds}
                        onChange={(e) => setEndpoints(prev => prev.map(ep => ep.id === selectedEndpoint.id ? { ...ep, timeoutSeconds: parseInt(e.target.value) || 30 } : ep))}
                        className="w-full bg-white border border-[#E7E5EF] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Máx. Tentativas</label>
                      <input
                        type="number"
                        value={selectedEndpoint.maxRetries}
                        onChange={(e) => setEndpoints(prev => prev.map(ep => ep.id === selectedEndpoint.id ? { ...ep, maxRetries: parseInt(e.target.value) || 5 } : ep))}
                        className="w-full bg-white border border-[#E7E5EF] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'logs' && (
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">Log técnico bruto do endpoint</span>
                  <div className="bg-slate-950 text-slate-200 font-mono text-[10px] p-3 rounded-2xl space-y-2 overflow-x-auto no-scrollbar max-h-[300px]">
                    <p className="text-slate-450">[2026-05-19 10:52:14] whsec handshake initiated successfully.</p>
                    <p className="text-slate-450">[2026-05-19 10:52:14] POST https://church.basileia.app/webhooks/payments status: 200 latency: 118ms</p>
                    <p className="text-slate-450">[2026-05-19 10:44:00] retry_worker #1 scheduled for ep_002.</p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer drawer fixed actions */}
            <div className="p-4 border-t border-slate-100 bg-[#FAF9FF] flex items-center justify-end gap-2.5 shrink-0">
              <button 
                onClick={() => handleTriggerTest(selectedEndpoint.url)}
                className="px-3 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[34px]"
              >
                Testar endpoint
              </button>
              <button 
                onClick={() => handleToggleStatus(selectedEndpoint.id, selectedEndpoint.status)}
                className="px-3 py-1.5 border border-[#E7E5EF] bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[34px]"
              >
                {selectedEndpoint.status === 'active' ? 'Pausar' : 'Ativar'}
              </button>
              <button 
                onClick={() => handleDeleteEndpoint(selectedEndpoint.id)}
                className="p-2 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal: Documentação de Webhooks */}
      {showDocsModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E5EF] shadow-2xl p-6 max-w-2xl w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-brand">
                <FileText className="w-5 h-5 shrink-0" />
                <h3 className="text-slate-950 font-black text-sm">Documentação de Integração - Webhooks</h3>
              </div>
              <button onClick={() => setShowDocsModal(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-xs text-slate-700 leading-relaxed font-semibold">
              <p>
                Os Webhooks do Basileia-Pay permitem que o seu sistema seja notificado em tempo real sobre eventos ocorridos na plataforma.
                Para receber os webhooks, você precisa cadastrar um endpoint HTTP que possa receber requisições POST.
              </p>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <h4 className="font-black text-slate-900 mb-2 uppercase tracking-wider text-[10px]">Autenticação via HMAC</h4>
                <p className="mb-2 text-slate-600">
                  Todas as requisições de webhook possuem um cabeçalho <code className="bg-slate-200 px-1 rounded">X-Basileia-Signature</code> com uma assinatura HMAC SHA-256 do corpo da requisição usando a sua chave secreta.
                </p>
                <p className="text-slate-600">
                  Valide esta assinatura no seu backend para confirmar que a requisição veio de fato do Basileia-Pay.
                </p>
              </div>

              <div>
                <h4 className="font-black text-slate-900 mb-2 uppercase tracking-wider text-[10px]">Eventos Disponíveis</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li><code className="text-brand">payment.approved</code> - Pagamento confirmado e saldo disponível.</li>
                  <li><code className="text-brand">payment.failed</code> - Pagamento recusado ou falhou.</li>
                  <li><code className="text-brand">subscription.renewed</code> - Assinatura renovada com sucesso.</li>
                  <li><code className="text-brand">subscription.cancelled</code> - Assinatura cancelada.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-black text-slate-900 mb-2 uppercase tracking-wider text-[10px]">Exemplo de Payload</h4>
                <pre className="bg-slate-900 text-green-400 font-mono text-[10px] p-3 rounded-xl overflow-x-auto">
{`{
  "event": "payment.approved",
  "id": "evt_01JTK8XA1D0829C",
  "created_at": "2026-05-19T10:52:14Z",
  "data": {
    "payment_id": "pay_992381",
    "amount": 29900,
    "currency": "BRL",
    "status": "approved"
  }
}`}
                </pre>
              </div>
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
