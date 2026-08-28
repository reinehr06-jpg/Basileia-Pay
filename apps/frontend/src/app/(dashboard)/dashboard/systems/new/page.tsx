'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronRight, 
  Play, 
  Save, 
  Check, 
  Info, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Shield, 
  Activity, 
  Globe, 
  Terminal, 
  CheckCircle2, 
  X, 
  Loader2, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type MappingRow = {
  external: string;
  internal: string;
  required: boolean;
  example: string;
};

export default function NewSystemConnectionPage() {
  const router = useRouter();
  
  // Navigation step state
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Card 1 — Identificação
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [company, setCompany] = useState('Empresa Demonstração LTDA');
  const [systemType, setSystemType] = useState('E-commerce');
  const [baseUrl, setBaseUrl] = useState('');
  const [responsible, setResponsible] = useState('');
  const [techEmail, setTechEmail] = useState('');
  const [statusActive, setStatusActive] = useState(false);
  const [observations, setObservations] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    const slugified = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(slugified);
  }, [name]);

  // Card 2 — Ambiente e tipo de conexão
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [connModel, setConnModel] = useState('API + Webhooks');
  const [txSource, setTxSource] = useState('Checkout Basileia');
  const [domainInput, setDomainInput] = useState('');
  const [domains, setDomains] = useState<string[]>(['meuecommerce.com.br']);
  const [ipInput, setIpInput] = useState('');
  const [ips, setIps] = useState<string[]>(['192.168.1.10']);

  // Card 3 — Autenticação da API
  const [authMethod, setAuthMethod] = useState('API Key');
  const [keyExpiration, setKeyExpiration] = useState('1 ano');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [clientId, setClientId] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [apiPermissions, setApiPermissions] = useState<string[]>([
    'Criar pagamentos',
    'Consultar pagamentos'
  ]);

  // Card 5 — Webhooks de saída
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookMethod, setWebhookMethod] = useState('POST');
  const [webhookContentType, setWebhookContentType] = useState('application/json');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [webhookTimeout, setWebhookTimeout] = useState('10s');
  const [webhookRetries, setWebhookRetries] = useState('3');
  const [webhookRetryStrategy, setWebhookRetryStrategy] = useState('Exponencial');
  const [webhookStatus, setWebhookStatus] = useState(false);
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['payment.created', 'payment.approved']);

  // Card 6 — Webhooks de entrada
  const [inputToken, setInputToken] = useState('');
  const [inputValidateSignature, setInputValidateSignature] = useState(true);
  const [inputIdempotency, setInputIdempotency] = useState(true);
  const [inputPayloadType, setInputPayloadType] = useState('Pedido');

  // Card 7 — Mapeamento de payload
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([
    { external: 'order_id', internal: 'external_reference', required: true, example: 'PED-1029' },
    { external: 'amount', internal: 'value', required: true, example: '149.90' },
    { external: 'currency', internal: 'currency', required: true, example: 'BRL' },
    { external: 'customer.name', internal: 'customer_name', required: true, example: 'João Silva' },
    { external: 'customer.email', internal: 'customer_email', required: true, example: 'joao@email.com' },
    { external: 'customer.document', internal: 'customer_document', required: false, example: '000.000.000-00' },
    { external: 'status', internal: 'external_status', required: true, example: 'approved' },
  ]);

  // Card 8 — Recursos habilitados
  const [enabledResources, setEnabledResources] = useState<string[]>([
    'Pagamentos',
    'Checkouts',
    'Clientes',
    'Webhooks'
  ]);

  // Card 9 — Teste de conexão simulation
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, 'Pendente' | 'Executando' | 'Sucesso' | 'Erro'>>({
    'API Key válida': 'Pendente',
    'Secret configurado': 'Pendente',
    'Permissões configuradas': 'Pendente',
    'URL base responde': 'Pendente',
    'Webhook de saída aceita POST': 'Pendente',
    'Assinatura HMAC validada': 'Pendente',
    'Webhook de entrada configurado': 'Pendente',
    'Mapeamento de payload válido': 'Pendente',
    'Evento de teste entregue': 'Pendente',
  });
  const [testOutput, setTestOutput] = useState<any>(null);

  // Card 10 — Logs recentes (mock)
  const [logFilter, setLogFilter] = useState('Todos');
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Generate tokens on demand
  const handleGenerateCredentials = () => {
    setApiKey(`bp_${environment === 'production' ? 'live' : 'test'}_${crypto.randomUUID().replace(/-/g, '')}`);
    setSecretKey(crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''));
    setClientId(`cl_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`);
    showToast('Credenciais de API geradas com sucesso!');
  };

  const handleGenerateWebhookSecret = () => {
    setWebhookSecret(`whsec_${crypto.randomUUID().replace(/-/g, '').substring(0, 24)}`);
    showToast('Secret do webhook gerado!');
  };

  const handleGenerateInputToken = () => {
    setInputToken(`in_${crypto.randomUUID().replace(/-/g, '')}`);
    showToast('Token de entrada gerado!');
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Simulated Test Runner
  const runConnectionTests = async () => {
    setTesting(true);
    setTestOutput(null);
    const keys = Object.keys(testResults);
    
    // Set all to executing
    const initialRunState = { ...testResults };
    keys.forEach(k => { initialRunState[k] = 'Executando'; });
    setTestResults(initialRunState);

    for (let i = 0; i < keys.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      const key = keys[i];
      
      // Simulate success/error depending on inputs
      let status: 'Sucesso' | 'Erro' = 'Sucesso';
      if (key === 'API Key válida' && !apiKey) status = 'Erro';
      if (key === 'Secret configurado' && !secretKey) status = 'Erro';
      if (key === 'URL base responde' && !baseUrl) status = 'Erro';
      if (key === 'Webhook de saída aceita POST' && !webhookUrl) status = 'Erro';

      setTestResults(prev => ({
        ...prev,
        [key]: status
      }));
    }

    setTesting(false);
    
    const hasErrors = !apiKey || !secretKey || !baseUrl || !webhookUrl;
    if (hasErrors) {
      setTestOutput({
        httpCode: 400,
        message: 'Falha na validação técnica. Verifique se as credenciais foram geradas, se a URL base responde e se a URL de webhook está configurada.',
        responseTime: '185ms',
        payloadSent: { test: 'ping' },
        payloadReceived: { error: 'validation_error', fields: ['api_key', 'secret_key', 'base_url', 'webhook_url'] },
        timestamp: new Date().toLocaleString()
      });
      showToast('Ocorreram erros no teste de conexão.');
    } else {
      setTestOutput({
        httpCode: 200,
        message: 'Todos os testes passaram com sucesso! Conexão de sistema homologada.',
        responseTime: '240ms',
        payloadSent: { test: 'ping', api_key: 'VALID', webhook_url: 'REACHABLE' },
        payloadReceived: { success: true, status: 'connected' },
        timestamp: new Date().toLocaleString()
      });
      showToast('Teste completo concluído com sucesso!');
    }
  };

  // Submit System Save to Backend DB
  const handleSaveSystem = async (isActiveActivation: boolean = false) => {
    if (!name.trim()) {
      setError('O nome do sistema é obrigatório.');
      setActiveStep(1);
      return;
    }

    if (isActiveActivation && (!apiKey || !baseUrl || !webhookUrl)) {
      setError('Para ativar o sistema, você deve preencher as credenciais de API, URL base e webhook e executar os testes obrigatórios.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await apiFetch('/api/v1/dashboard/systems', {
        method: 'POST',
        body: JSON.stringify({
          name,
          environment,
          status: isActiveActivation ? 'active' : 'inactive'
        })
      }) as any;

      if (res && res.success) {
        showToast(`Sistema "${name}" salvo com sucesso!`);
        setTimeout(() => {
          router.push('/dashboard/systems');
        }, 1000);
      } else {
        setError(res?.error?.message || 'Falha ao salvar sistema no banco.');
      }
    } catch (err) {
      setError('Erro de conexão ao salvar sistema.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast('Copiado para a área de transferência!');
  };

  // Tags add logic
  const handleAddDomain = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && domainInput.trim()) {
      e.preventDefault();
      if (!domains.includes(domainInput.trim())) {
        setDomains([...domains, domainInput.trim()]);
      }
      setDomainInput('');
    }
  };

  const handleAddIp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ipInput.trim()) {
      e.preventDefault();
      if (!ips.includes(ipInput.trim())) {
        setIps([...ips, ipInput.trim()]);
      }
      setIpInput('');
    }
  };

  // Step names list
  const stepsList = [
    { id: 1, label: 'Identificação' },
    { id: 2, label: 'Ambiente' },
    { id: 3, label: 'API & Credenciais' },
    { id: 4, label: 'Endpoints' },
    { id: 5, label: 'Webhooks saída' },
    { id: 6, label: 'Webhooks entrada' },
    { id: 7, label: 'Mapeamento' },
    { id: 8, label: 'Recursos' },
    { id: 9, label: 'Testes' },
    { id: 10, label: 'Logs' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative text-left pb-24">
      {/* Toast Alert Indicator */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2.5 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <span className="w-2.5 h-2.5 bg-brand rounded-full shrink-0 animate-ping" />
          <span className="text-[11.5px] font-black">{successToast}</span>
        </div>
      )}

      {/* Header da Página */}
      <header className="flex items-start justify-between w-full px-4 pt-4 shrink-0 pb-3 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[10.5px] font-black text-slate uppercase tracking-wider">
            <span>Sistemas</span>
            <ChevronRight className="w-3 h-3 text-border" />
            <span className="text-brand">Nova conexão de sistema</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl 2xl:text-2xl font-black text-ink tracking-tight leading-none">
              Nova Conexão de Sistema
            </h1>
            <span className="text-[9px] font-black text-slate bg-surface-raised border border-border px-2 py-0.5 rounded-full uppercase tracking-wider">
              Status: Rascunho
            </span>
          </div>
          <p className="text-slate/60 text-[11px] font-medium max-w-xl leading-snug">
            Configure API, credenciais, webhooks e eventos para conectar um sistema externo à Basileia Pay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleSaveSystem(false)}
            disabled={saving}
            className="h-8.5 px-3.5 bg-surface border border-border hover:bg-surface-raised text-slate font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Salvar rascunho
          </button>
          
          <button 
            onClick={runConnectionTests}
            disabled={testing}
            className="h-8.5 px-3.5 bg-surface border border-border hover:bg-surface-raised text-slate font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Executar teste
          </button>

          <button 
            onClick={() => handleSaveSystem(true)}
            disabled={saving}
            className="h-8.5 px-4 bg-brand hover:bg-brand-deep text-white font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand/10 transition-all"
          >
            Ativar sistema
          </button>
        </div>
      </header>

      {/* Navegação por etapas */}
      <div className="px-4 py-2 border-b border-border bg-surface-raised overflow-x-auto no-scrollbar shrink-0 select-none">
        <div className="flex items-center gap-1 min-w-[900px]">
          {stepsList.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id as StepId)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                  isActive 
                    ? "bg-brand text-white border-brand shadow-sm shadow-brand/20" 
                    : "bg-surface text-slate border-border hover:bg-brand-soft hover:text-brand"
                )}
              >
                <span className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black",
                  isActive ? "bg-white text-brand" : "bg-border text-slate"
                )}>
                  {step.id}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] 2xl:grid-cols-[1fr_360px] gap-6 p-4 items-start w-full">
        {/* Coluna Principal: Cards do Formulário */}
        <div className="flex flex-col gap-6 min-w-0 w-full">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/25 rounded-2xl flex items-start gap-3 text-danger animate-in fade-in duration-300">
              <span className="text-lg mt-0.5">⚠️</span>
              <div>
                <h4 className="text-xs font-black uppercase">Erro de validação</h4>
                <p className="text-xs font-bold leading-tight mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* STEP 1: Identificação do sistema */}
          {activeStep === 1 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-sm font-black text-ink uppercase tracking-wider">1. Identificação do sistema</h2>
                <p className="text-[11px] font-bold text-slate/50 mt-0.5">Defina quem é o sistema que será conectado à Basileia Pay.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Nome do sistema *</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex.: E-commerce Central, Plataforma EAD" 
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Identificador interno / slug *</label>
                  <input 
                    type="text" 
                    required
                    readOnly
                    value={slug}
                    placeholder="Ex.: ecommerce-central" 
                    className="w-full h-11 px-3 bg-surface-raised border border-border rounded-xl text-xs font-bold text-slate focus:outline-none cursor-not-allowed shadow-sm"
                  />
                  <p className="text-[8.5px] font-bold text-slate/40">Gerado automaticamente em letras minúsculas, números e traços.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Empresa vinculada *</label>
                  <select 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>Empresa Demonstração LTDA</option>
                    <option>Basileia Global Adm</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Tipo de sistema *</label>
                  <select 
                    value={systemType}
                    onChange={(e) => setSystemType(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>E-commerce</option>
                    <option>ERP</option>
                    <option>CRM</option>
                    <option>Plataforma EAD</option>
                    <option>Checkout externo</option>
                    <option>Sistema interno</option>
                    <option>Outro</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">URL base do sistema *</label>
                  <input 
                    type="url" 
                    required
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="Ex.: https://meusistema.com" 
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Responsável técnico</label>
                  <input 
                    type="text" 
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Ex.: João Silva" 
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">E-mail técnico</label>
                  <input 
                    type="email" 
                    value={techEmail}
                    onChange={(e) => setTechEmail(e.target.value)}
                    placeholder="Ex.: dev@empresa.com" 
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center justify-between col-span-1 md:col-span-2 p-3 bg-background rounded-xl border border-border mt-2">
                  <div className="leading-none text-left">
                    <span className="text-xs font-black text-ink">Status inicial ativo</span>
                    <p className="text-[9.5px] font-bold text-slate/50 mt-0.5">Define se o sistema já nasce pronto para transacionar.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setStatusActive(!statusActive)}
                    className={cn(
                      "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0",
                      statusActive ? "bg-brand" : "bg-slate-300"
                    )}
                  >
                    <div className={cn("w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-200", statusActive && "translate-x-4.5")} />
                  </button>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Observações</label>
                  <textarea 
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={3}
                    placeholder="Informações adicionais sobre este sistema..."
                    className="w-full p-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand transition-all leading-normal"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Ambiente e tipo de conexão */}
          {activeStep === 2 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-sm font-black text-ink uppercase tracking-wider">2. Ambiente e tipo de conexão</h2>
                <p className="text-[11px] font-bold text-slate/50 mt-0.5">Configure como esse sistema irá se comunicar com a Basileia Pay.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Ambiente padrão *</label>
                  <select 
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option value="sandbox">Sandbox / Teste</option>
                    <option value="production">Produção</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Modelo de conexão *</label>
                  <select 
                    value={connModel}
                    onChange={(e) => setConnModel(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>API + Webhooks</option>
                    <option>Apenas API</option>
                    <option>Apenas Webhooks</option>
                    <option>Checkout externo</option>
                    <option>Integração manual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Origem das transações *</label>
                  <select 
                    value={txSource}
                    onChange={(e) => setTxSource(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>Checkout Basileia</option>
                    <option>Checkout externo</option>
                    <option>API externa</option>
                    <option>ERP</option>
                    <option>CRM</option>
                    <option>Outro</option>
                  </select>
                </div>

                {/* Domínios permitidos (Tag input) */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Domínios permitidos</label>
                  <div className="flex flex-wrap gap-2 p-2 bg-background border border-border rounded-xl min-h-[44px]">
                    {domains.map((dom) => (
                      <span key={dom} className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-soft border border-brand/10 text-brand text-[10.5px] font-bold rounded-lg uppercase">
                        {dom}
                        <button 
                          type="button" 
                          onClick={() => setDomains(domains.filter(d => d !== dom))}
                          className="hover:text-danger ml-1"
                        >✕</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      onKeyDown={handleAddDomain}
                      placeholder="Adicionar domínio e pressionar Enter"
                      className="flex-1 bg-transparent text-xs font-bold text-ink placeholder:text-slate-350 focus:outline-none min-w-[200px]"
                    />
                  </div>
                </div>

                {/* IPs permitidos (Tag input) */}
                <div className="col-span-1 md:col-span-3 space-y-1.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">IPs permitidos</label>
                  <div className="flex flex-wrap gap-2 p-2 bg-background border border-border rounded-xl min-h-[44px]">
                    {ips.map((ip) => (
                      <span key={ip} className="flex items-center gap-1 px-2.5 py-0.5 bg-brand-soft border border-brand/10 text-brand text-[10.5px] font-bold rounded-lg uppercase">
                        {ip}
                        <button 
                          type="button" 
                          onClick={() => setIps(ips.filter(i => i !== ip))}
                          className="hover:text-danger ml-1"
                        >✕</button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      onKeyDown={handleAddIp}
                      placeholder="Adicionar IP e pressionar Enter"
                      className="flex-1 bg-transparent text-xs font-bold text-ink placeholder:text-slate-350 focus:outline-none min-w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: API & Credenciais */}
          {activeStep === 3 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-ink uppercase tracking-wider">3. Autenticação da API</h2>
                  <p className="text-[11px] font-bold text-slate/50 mt-0.5">Configure como as credenciais usadas pelo sistema externo irão acessar a Basileia Pay.</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateCredentials}
                  className="px-3.5 py-1.5 bg-brand-soft border border-brand/10 text-brand rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-brand hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Gerar credenciais
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Método de autenticação *</label>
                  <select 
                    value={authMethod}
                    onChange={(e) => setAuthMethod(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>API Key</option>
                    <option>Bearer Token</option>
                    <option>OAuth2</option>
                    <option>Basic Auth</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Expiração da chave *</label>
                  <select 
                    value={keyExpiration}
                    onChange={(e) => setKeyExpiration(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>Nunca</option>
                    <option>30 dias</option>
                    <option>90 dias</option>
                    <option>1 ano</option>
                  </select>
                </div>

                {/* API Key */}
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">API Key *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly
                      value={apiKey || 'Nenhuma API Key gerada'}
                      className="w-full h-11 pl-3 pr-10 bg-surface-raised border border-border rounded-xl text-xs font-mono font-bold text-slate focus:outline-none shadow-sm cursor-text"
                    />
                    {apiKey && (
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(apiKey)}
                        className="absolute right-3 top-3 text-slate hover:text-brand"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Secret Key */}
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Secret Key *</label>
                  <div className="relative">
                    <input 
                      type={showSecret ? 'text' : 'password'}
                      readOnly
                      value={secretKey || 'Nenhum Secret gerado'}
                      className="w-full h-11 pl-3 pr-20 bg-surface-raised border border-border rounded-xl text-xs font-mono font-bold text-slate focus:outline-none shadow-sm cursor-text"
                    />
                    <div className="absolute right-3 top-3 flex items-center gap-2 text-slate">
                      {secretKey && (
                        <>
                          <button 
                            type="button" 
                            onClick={() => setShowSecret(!showSecret)}
                            className="hover:text-brand"
                          >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => copyToClipboard(secretKey)}
                            className="hover:text-brand"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client ID */}
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Client ID</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly
                      value={clientId || 'Nenhum Client ID gerado'}
                      className="w-full h-11 pl-3 pr-10 bg-surface-raised border border-border rounded-xl text-xs font-mono font-bold text-slate focus:outline-none shadow-sm cursor-text"
                    />
                    {clientId && (
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(clientId)}
                        className="absolute right-3 top-3 text-slate hover:text-brand"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {apiKey && (
                  <div className="col-span-1 md:col-span-2 flex justify-start">
                    <button
                      type="button"
                      onClick={handleGenerateCredentials}
                      className="text-xs font-black uppercase text-brand hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Regenerar Secret e API Key
                    </button>
                  </div>
                )}

                {/* Permissões checkboxes */}
                <div className="col-span-1 md:col-span-2 space-y-3 pt-2">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest block border-b border-border pb-1">Permissões da API *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Criar pagamentos',
                      'Consultar pagamentos',
                      'Criar checkouts',
                      'Consultar vendas',
                      'Estornar pagamentos',
                      'Gerenciar clientes',
                      'Gerenciar assinaturas',
                      'Receber webhooks'
                    ].map((perm) => {
                      const isChecked = apiPermissions.includes(perm);
                      return (
                        <label key={perm} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setApiPermissions([...apiPermissions, perm]);
                              } else {
                                setApiPermissions(apiPermissions.filter(p => p !== perm));
                              }
                            }}
                            className="rounded border-border text-brand focus:ring-brand cursor-pointer w-4 h-4"
                          />
                          {perm}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Endpoints disponíveis */}
          {activeStep === 4 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-sm font-black text-ink uppercase tracking-wider">4. Endpoints disponíveis para integração</h2>
                <p className="text-[11px] font-bold text-slate/50 mt-0.5">Esses são os endpoints que o sistema externo poderá consumir usando as credenciais geradas.</p>
              </div>

              <div className="overflow-x-auto border border-border rounded-2xl bg-background">
                <table className="w-full text-left border-collapse text-xs font-bold">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised text-[10px] font-black text-slate uppercase tracking-wider">
                      <th className="p-3">Recurso</th>
                      <th className="p-3">Método</th>
                      <th className="p-3">Endpoint</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { resource: 'Criar pagamento', method: 'POST', endpoint: '/api/v1/payments', status: 'Ativo' },
                      { resource: 'Consultar pagamento', method: 'GET', endpoint: '/api/v1/payments/{id}', status: 'Ativo' },
                      { resource: 'Criar checkout', method: 'POST', endpoint: '/api/v1/checkouts', status: 'Ativo' },
                      { resource: 'Consultar venda', method: 'GET', endpoint: '/api/v1/orders/{id}', status: 'Ativo' },
                      { resource: 'Status da API', method: 'GET', endpoint: '/api/v1/status', status: 'Ativo' },
                      { resource: 'Reenviar webhook', method: 'POST', endpoint: '/api/v1/webhooks/retry', status: 'Restrito' },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                        <td className="p-3 text-ink">{row.resource}</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tight",
                            row.method === 'POST' ? 'bg-brand/10 text-brand' : 'bg-info/10 text-info'
                          )}>
                            {row.method}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-800 dark:text-slate-350">{row.endpoint}</td>
                        <td className="p-3">
                          <span className={cn(
                            "w-2 h-2 rounded-full inline-block mr-1.5",
                            row.status === 'Ativo' ? 'bg-success shadow-[0_0_6px_rgba(22,163,74,0.3)]' : 'bg-slate-400'
                          )} />
                          {row.status}
                        </td>
                        <td className="p-3 flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => copyToClipboard(`https://api.basileia.global${row.endpoint}`)}
                            className="text-brand hover:underline flex items-center gap-0.5"
                          >
                            Copiar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: Webhooks de saída */}
          {activeStep === 5 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-ink uppercase tracking-wider">5. Webhooks de saída</h2>
                  <p className="text-[11px] font-bold text-slate/50 mt-0.5">Configure para onde a Basileia Pay enviará notificações quando eventos acontecerem.</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWebhookSecret}
                  className="px-3 py-1.5 bg-brand-soft border border-brand/10 text-brand rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-brand hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Gerar secret do webhook
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-3 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">URL do webhook *</label>
                  <input 
                    type="url" 
                    required
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="Ex.: https://meusistema.com/webhooks/basileia" 
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Método *</label>
                  <select 
                    value={webhookMethod}
                    onChange={(e) => setWebhookMethod(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Content-Type *</label>
                  <select 
                    value={webhookContentType}
                    onChange={(e) => setWebhookContentType(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>application/json</option>
                    <option>application/x-www-form-urlencoded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Timeout *</label>
                  <select 
                    value={webhookTimeout}
                    onChange={(e) => setWebhookTimeout(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>5s</option>
                    <option>10s</option>
                    <option>30s</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-3 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Secret de assinatura *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly
                      value={webhookSecret || 'Nenhum secret do webhook gerado'}
                      className="w-full h-11 pl-3 pr-10 bg-surface-raised border border-border rounded-xl text-xs font-mono font-bold text-slate focus:outline-none shadow-sm cursor-text"
                    />
                    {webhookSecret && (
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(webhookSecret)}
                        className="absolute right-3 top-3 text-slate hover:text-brand"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Tentativas de reenvio *</label>
                  <select 
                    value={webhookRetries}
                    onChange={(e) => setWebhookRetries(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>3</option>
                    <option>5</option>
                    <option>10</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Estratégia de retry *</label>
                  <select 
                    value={webhookRetryStrategy}
                    onChange={(e) => setWebhookRetryStrategy(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>Linear</option>
                    <option>Exponencial</option>
                    <option>Manual</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border col-span-1 md:col-span-3 mt-2">
                  <div className="leading-none text-left">
                    <span className="text-xs font-black text-ink">Status do webhook</span>
                    <p className="text-[9.5px] font-bold text-slate/50 mt-0.5">Habilita ou desabilita o envio automático de eventos.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setWebhookStatus(!webhookStatus)}
                    className={cn(
                      "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0",
                      webhookStatus ? "bg-brand" : "bg-slate-300"
                    )}
                  >
                    <div className={cn("w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-200", webhookStatus && "translate-x-4.5")} />
                  </button>
                </div>

                {/* Eventos do webhook */}
                <div className="col-span-1 md:col-span-3 space-y-3 pt-2">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest block border-b border-border pb-1">Eventos enviados *</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      'payment.created',
                      'payment.approved',
                      'payment.failed',
                      'payment.refunded',
                      'checkout.started',
                      'checkout.abandoned',
                      'checkout.completed',
                      'customer.created',
                      'subscription.created',
                      'subscription.renewed',
                      'subscription.canceled'
                    ].map((evt) => {
                      const isChecked = webhookEvents.includes(evt);
                      return (
                        <label key={evt} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setWebhookEvents([...webhookEvents, evt]);
                              } else {
                                setWebhookEvents(webhookEvents.filter(ev => ev !== evt));
                              }
                            }}
                            className="rounded border-border text-brand focus:ring-brand cursor-pointer w-4 h-4"
                          />
                          {evt}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3 flex justify-start pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      if (!webhookUrl) {
                        setError('A URL do webhook é obrigatória para simular um envio.');
                        return;
                      }
                      showToast('Payload de teste enviado para a URL de webhook com sucesso!');
                    }}
                    className="h-8 px-4 bg-surface border border-border hover:bg-surface-raised text-slate font-black rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm"
                  >
                    Enviar webhook de teste
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Webhooks de entrada */}
          {activeStep === 6 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-ink uppercase tracking-wider">6. Webhooks de entrada</h2>
                  <p className="text-[11px] font-bold text-slate/50 mt-0.5">Configure como a Basileia Pay receberá eventos enviados pelo sistema conectado.</p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateInputToken}
                  className="px-3 py-1.5 bg-brand-soft border border-brand/10 text-brand rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-brand hover:text-white transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Gerar token de entrada
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Endpoint de recebimento (Endpoint API)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly
                      value={slug ? `/api/v1/integrations/${slug}/webhook` : 'Preencha o nome do sistema na etapa 1'}
                      className="w-full h-11 pl-3 pr-10 bg-surface-raised border border-border rounded-xl text-xs font-mono font-bold text-slate focus:outline-none shadow-sm cursor-text"
                    />
                    {slug && (
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(`https://api.basileia.global/api/v1/integrations/${slug}/webhook`)}
                        className="absolute right-3 top-3 text-slate hover:text-brand"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Token de entrada *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly
                      value={inputToken || 'Nenhum token de entrada gerado'}
                      className="w-full h-11 pl-3 pr-10 bg-surface-raised border border-border rounded-xl text-xs font-mono font-bold text-slate focus:outline-none shadow-sm cursor-text"
                    />
                    {inputToken && (
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(inputToken)}
                        className="absolute right-3 top-3 text-slate hover:text-brand"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                  <div className="leading-none text-left">
                    <span className="text-xs font-black text-ink">Validação por assinatura</span>
                    <p className="text-[9.5px] font-bold text-slate/50 mt-0.5">Obriga o sistema externo a assinar com HMAC/SHA256.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setInputValidateSignature(!inputValidateSignature)}
                    className={cn(
                      "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0",
                      inputValidateSignature ? "bg-brand" : "bg-slate-300"
                    )}
                  >
                    <div className={cn("w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-200", inputValidateSignature && "translate-x-4.5")} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                  <div className="leading-none text-left">
                    <span className="text-xs font-black text-ink">Chave de idempotência</span>
                    <p className="text-[9.5px] font-bold text-slate/50 mt-0.5">Evita transações ou eventos duplicados na plataforma.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setInputIdempotency(!inputIdempotency)}
                    className={cn(
                      "w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none shrink-0",
                      inputIdempotency ? "bg-brand" : "bg-slate-300"
                    )}
                  >
                    <div className={cn("w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-200", inputIdempotency && "translate-x-4.5")} />
                  </button>
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest">Tipo de payload aceito *</label>
                  <select 
                    value={inputPayloadType}
                    onChange={(e) => setInputPayloadType(e.target.value)}
                    className="w-full h-11 px-3 bg-background border border-border rounded-xl text-xs font-bold text-ink focus:outline-none focus:border-brand cursor-pointer shadow-sm appearance-none"
                  >
                    <option>Pedido</option>
                    <option>Cliente</option>
                    <option>Pagamento externo</option>
                    <option>Checkout</option>
                    <option>Assinatura</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Mapeamento de payload */}
          {activeStep === 7 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-sm font-black text-ink uppercase tracking-wider">7. Mapeamento de payload</h2>
                <p className="text-[11px] font-bold text-slate/50 mt-0.5">Relacione os campos enviados pelo sistema externo com os campos internos da Basileia Pay.</p>
              </div>

              <div className="overflow-x-auto border border-border rounded-2xl bg-background">
                <table className="w-full text-left border-collapse text-xs font-bold">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised text-[10px] font-black text-slate uppercase tracking-wider">
                      <th className="p-3">Campo externo</th>
                      <th className="p-3">Campo Basileia</th>
                      <th className="p-3 text-center">Obrigatório</th>
                      <th className="p-3">Exemplo</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappingRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                        <td className="p-3">
                          <input 
                            type="text" 
                            value={row.external}
                            onChange={(e) => {
                              const newRows = [...mappingRows];
                              newRows[idx].external = e.target.value;
                              setMappingRows(newRows);
                            }}
                            className="bg-transparent border border-transparent hover:border-border focus:border-brand p-1 rounded font-mono text-[11px] font-bold text-ink w-full focus:outline-none focus:bg-surface"
                          />
                        </td>
                        <td className="p-3">
                          <input 
                            type="text" 
                            value={row.internal}
                            onChange={(e) => {
                              const newRows = [...mappingRows];
                              newRows[idx].internal = e.target.value;
                              setMappingRows(newRows);
                            }}
                            className="bg-transparent border border-transparent hover:border-border focus:border-brand p-1 rounded font-mono text-[11px] font-bold text-ink w-full focus:outline-none focus:bg-surface"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input 
                            type="checkbox"
                            checked={row.required}
                            onChange={(e) => {
                              const newRows = [...mappingRows];
                              newRows[idx].required = e.target.checked;
                              setMappingRows(newRows);
                            }}
                            className="rounded border-border text-brand focus:ring-brand w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-slate/50">
                          <input 
                            type="text" 
                            value={row.example}
                            onChange={(e) => {
                              const newRows = [...mappingRows];
                              newRows[idx].example = e.target.value;
                              setMappingRows(newRows);
                            }}
                            className="bg-transparent border border-transparent hover:border-border focus:border-brand p-1 rounded text-xs font-bold text-slate w-full focus:outline-none focus:bg-surface"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            type="button" 
                            onClick={() => setMappingRows(mappingRows.filter((_, i) => i !== idx))}
                            className="text-slate hover:text-danger"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMappingRows([...mappingRows, { external: 'novo_campo', internal: 'novo_campo', required: false, example: 'Exemplo' }])}
                  className="px-3.5 py-1.5 bg-surface border border-border text-slate hover:bg-surface-raised text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar campo
                </button>
                <button
                  type="button"
                  onClick={() => showToast('JSON de exemplo importado!')}
                  className="px-3.5 py-1.5 bg-surface border border-border text-slate hover:bg-surface-raised text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-sm"
                >
                  Importar JSON de exemplo
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Mapeamento validado com sucesso!')}
                  className="px-3.5 py-1.5 bg-brand-soft border border-brand/10 text-brand hover:bg-brand hover:text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1 shadow-sm transition-all"
                >
                  Validar mapeamento
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Recursos habilitados */}
          {activeStep === 8 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-sm font-black text-ink uppercase tracking-wider">8. Recursos habilitados para este sistema</h2>
                <p className="text-[11px] font-bold text-slate/50 mt-0.5">Defina quais módulos da Basileia Pay esse sistema poderá utilizar.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  'Pagamentos',
                  'Checkouts',
                  'Clientes',
                  'Assinaturas',
                  'Webhooks',
                  'Recovery',
                  'Split',
                  'Relatórios',
                  'Auditoria'
                ].map((resource) => {
                  const isChecked = enabledResources.includes(resource);
                  return (
                    <div 
                      key={resource}
                      onClick={() => {
                        if (isChecked) {
                          setEnabledResources(enabledResources.filter(r => r !== resource));
                        } else {
                          setEnabledResources([...enabledResources, resource]);
                        }
                      }}
                      className={cn(
                        "p-4 border rounded-2xl flex flex-col justify-between h-20 text-left cursor-pointer transition-all shadow-sm select-none",
                        isChecked 
                          ? "bg-brand-soft/20 border-brand/35 text-brand" 
                          : "bg-background border-border text-slate hover:bg-surface-raised"
                      )}
                    >
                      <span className="text-xs font-black uppercase tracking-wider leading-none">{resource}</span>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] font-bold text-slate/40">Habilitado</span>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="rounded border-border text-brand focus:ring-brand w-4 h-4"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 9: Teste de conexão */}
          {activeStep === 9 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-sm font-black text-ink uppercase tracking-wider">9. Teste de conexão</h2>
                <p className="text-[11px] font-bold text-slate/50 mt-0.5">Execute testes técnicos para validar se a integração está pronta para uso.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Checklist de testes */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest block border-b border-border pb-1">Checklist de testes</label>
                  <div className="space-y-2">
                    {Object.entries(testResults).map(([testName, status]) => (
                      <div key={testName} className="flex items-center justify-between p-2.5 bg-background border border-border rounded-xl">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-300">{testName}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight flex items-center gap-1",
                          status === 'Pendente' && 'bg-slate-100 text-slate-400',
                          status === 'Executando' && 'bg-amber-100 text-amber-600 animate-pulse',
                          status === 'Sucesso' && 'bg-success/15 text-success',
                          status === 'Erro' && 'bg-danger/15 text-danger'
                        )}>
                          {status === 'Executando' && <Loader2 className="w-2.5 h-2.5 animate-spin inline" />}
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resultados técnicos do teste */}
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate uppercase tracking-widest block border-b border-border pb-1">Resultados técnicos</label>
                  {testOutput ? (
                    <div className="p-4 bg-background border border-border rounded-2xl font-mono text-[10.5px] text-slate-700 dark:text-slate-350 space-y-2 leading-relaxed">
                      <div>
                        <span className="text-slate/40 block">Código HTTP</span>
                        <span className={cn("font-black", testOutput.httpCode === 200 ? 'text-success' : 'text-danger')}>
                          {testOutput.httpCode} {testOutput.httpCode === 200 ? 'OK' : 'Bad Request'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate/40 block">Mensagem retornada</span>
                        <span className="font-bold text-ink">{testOutput.message}</span>
                      </div>
                      <div>
                        <span className="text-slate/40 block">Tempo de resposta</span>
                        <span className="font-bold text-ink">{testOutput.responseTime}</span>
                      </div>
                      <div>
                        <span className="text-slate/40 block">Data/hora do teste</span>
                        <span>{testOutput.timestamp}</span>
                      </div>
                      <div className="border-t border-border/60 pt-2">
                        <span className="text-slate/40 block">Payload enviado</span>
                        <pre className="bg-surface p-1.5 rounded border border-border mt-1 overflow-x-auto text-[9.5px]">
                          {JSON.stringify(testOutput.payloadSent, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate/40 block">Payload recebido</span>
                        <pre className="bg-surface p-1.5 rounded border border-border mt-1 overflow-x-auto text-[9.5px]">
                          {JSON.stringify(testOutput.payloadReceived, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[250px] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-4">
                      <Info className="w-7 h-7 text-slate/45 mb-1" />
                      <p className="text-xs font-bold text-slate/50">Nenhum teste executado ainda.</p>
                      <p className="text-[10px] font-bold text-slate/40 mt-0.5">Preencha as etapas obrigatórias e clique em "Executar teste completo".</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={runConnectionTests}
                  disabled={testing}
                  className="h-10 px-5 bg-brand hover:bg-brand-deep text-white font-black uppercase tracking-wider rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand/10 transition-all"
                >
                  {testing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Play className="w-4 h-4 text-white" />}
                  Executar teste completo
                </button>
              </div>
            </div>
          )}

          {/* STEP 10: Logs recentes da integração */}
          {activeStep === 10 && (
            <div className="bg-surface rounded-3xl border border-border p-6.5 shadow-sm space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-ink uppercase tracking-wider">10. Logs recentes da integração</h2>
                  <p className="text-[11px] font-bold text-slate/50 mt-0.5">Acompanhe os últimos eventos enviados e recebidos por este sistema.</p>
                </div>
              </div>

              {/* Chips filtros */}
              <div className="flex flex-wrap gap-1.5 select-none">
                {['Todos', 'Sucesso', 'Erro', 'Entrada', 'Saída', 'Últimas 24h', 'Últimos 7 dias'].map((filter) => {
                  const isActive = logFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setLogFilter(filter)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all",
                        isActive ? "bg-brand text-white" : "bg-background text-slate border border-border hover:bg-surface-raised"
                      )}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {/* Tabela de logs */}
              <div className="overflow-x-auto border border-border rounded-2xl bg-background mt-4">
                <table className="w-full text-left border-collapse text-xs font-bold">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised text-[10px] font-black text-slate uppercase tracking-wider">
                      <th className="p-3">Data</th>
                      <th className="p-3">Evento</th>
                      <th className="p-3">Direção</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Tempo</th>
                      <th className="p-3">Resposta</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                        <td className="p-3 text-slate-500">{log.date}</td>
                        <td className="p-3 text-ink font-bold">{log.event}</td>
                        <td className="p-3">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase tracking-tight",
                            log.direction === 'Saída' ? 'bg-violet-50 text-brand border border-brand/10' : 'bg-blue-50 text-info border border-info/10'
                          )}>
                            {log.direction}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "font-black text-[10px]",
                            log.status === '200 OK' ? 'text-success' : 'text-danger'
                          )}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{log.latency}</td>
                        <td className="p-3 text-ink">{log.response}</td>
                        <td className="p-3">
                          <button 
                            type="button"
                            onClick={() => showToast('Exibindo payload no console (simulado)...')}
                            className="text-brand hover:underline"
                          >
                            Ver payload
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Resumo da conexão lateral */}
        <aside className="space-y-5 min-w-0 w-[310px] 2xl:w-[360px] sticky top-4 select-none text-left">
          {/* Card Resumo */}
          <div className="bg-surface border border-border p-5 rounded-[22px] shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-950 dark:text-ink pb-2 border-b border-border">
              Resumo da conexão
            </h3>
            
            <div className="space-y-3.5 text-xs font-bold">
              <div>
                <span className="text-[9.5px] text-slate uppercase block leading-none">Sistema</span>
                <span className="text-ink text-[12.5px] block font-black mt-1 leading-none">
                  {name || 'Novo Sistema'}
                </span>
              </div>

              <div>
                <span className="text-[9.5px] text-slate uppercase block leading-none">Empresa</span>
                <span className="text-ink block mt-1 leading-none">{company}</span>
              </div>

              <div className="flex gap-4">
                <div>
                  <span className="text-[9.5px] text-slate uppercase block leading-none">Ambiente</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide block mt-1 leading-tight",
                    environment === 'production' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {environment}
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate uppercase block leading-none">Status atual</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wide block mt-1 leading-tight">
                    RASCUNHO
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9.5px] text-slate uppercase block leading-none">Modelo de conexão</span>
                <span className="text-ink block mt-1 leading-none">{connModel}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
                <div>
                  <span className="text-[8.5px] text-slate uppercase block leading-none">Criado em</span>
                  <span className="text-slate-500 text-[10px] block mt-1">26/05/2026 22:15</span>
                </div>
                <div>
                  <span className="text-[8.5px] text-slate uppercase block leading-none">Atualizado em</span>
                  <span className="text-slate-500 text-[10px] block mt-1">26/05/2026 22:15</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist para ativação */}
          <div className="bg-surface border border-border p-5 rounded-[22px] shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-950 dark:text-ink pb-2 border-b border-border">
              Checklist para ativação
            </h3>

            <div className="space-y-2.5">
              {[
                { name: 'Identificação do sistema', done: !!name },
                { name: 'Credenciais da API', done: !!apiKey },
                { name: 'Webhook de saída', done: !!webhookUrl },
                { name: 'Webhook de entrada', done: !!inputToken },
                { name: 'Teste de conexão', done: Object.values(testResults).includes('Sucesso') },
                { name: 'Sistema ativado', done: statusActive }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shadow-sm",
                    item.done ? 'bg-success/15 text-success' : 'bg-slate-100 text-slate-350'
                  )}>
                    {item.done ? '✓' : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status da integração */}
          <div className="bg-surface border border-border p-5 rounded-[22px] shadow-sm space-y-3.5 font-bold text-xs">
            <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-950 dark:text-ink pb-1">
              Status da integração
            </h3>
            
            <div className="space-y-2 text-slate-500">
              <div className="flex items-center justify-between">
                <span>API:</span>
                <span className={apiKey ? 'text-success' : 'text-slate-450'}>{apiKey ? 'Chave ativa' : 'Não testado'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Webhook de saída:</span>
                <span className={webhookUrl ? 'text-success' : 'text-slate-450'}>{webhookUrl ? 'Configurado' : 'Não testado'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Webhook de entrada:</span>
                <span className={inputToken ? 'text-success' : 'text-slate-450'}>{inputToken ? 'Gerado' : 'Não testado'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[11px]">
                <span>Último teste:</span>
                <span className="text-slate-450">{testOutput ? 'Executado' : 'Nunca executado'}</span>
              </div>
            </div>
          </div>

          {/* Últimos eventos */}
          <div className="bg-surface border border-border p-5 rounded-[22px] shadow-sm space-y-3 font-bold text-xs">
            <h3 className="text-xs font-black uppercase tracking-[0.1em] text-slate-950 dark:text-ink pb-1">
              Últimos eventos
            </h3>
            <div className="text-center py-6 text-slate-450">
              <span>Nenhum evento ainda</span>
            </div>
          </div>

          {/* Alerta lateral inferior */}
          <div className="bg-brand-soft/20 border border-brand/20 p-4 rounded-2xl flex gap-3 text-brand shadow-sm">
            <Info className="w-5 h-5 shrink-0 text-brand" />
            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
              Antes de ativar o sistema, configure pelo menos uma credencial de API, uma URL de webhook e execute o teste de conexão.
            </p>
          </div>
        </aside>
      </div>

      {/* Footer fixo */}
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-t border-border z-30 flex items-center justify-between px-6 shadow-2xl">
        <button
          type="button"
          onClick={() => router.push('/dashboard/systems')}
          className="h-10 px-5 bg-surface border border-border hover:bg-surface-raised text-slate font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm"
        >
          Cancelar
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveSystem(false)}
            disabled={saving}
            className="h-10 px-5 bg-surface border border-border hover:bg-surface-raised text-slate font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Salvar rascunho
          </button>
          
          <button
            type="button"
            onClick={runConnectionTests}
            disabled={testing}
            className="h-10 px-5 bg-surface border border-border hover:bg-surface-raised text-slate font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-slate-400" />}
            Executar teste
          </button>

          <button
            type="button"
            onClick={() => handleSaveSystem(true)}
            disabled={saving}
            className="h-10 px-6 bg-brand hover:bg-brand-deep text-white font-black uppercase tracking-wider rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-brand/10 transition-all"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
            Ativar sistema
          </button>
        </div>
      </footer>
    </div>
  );
}
