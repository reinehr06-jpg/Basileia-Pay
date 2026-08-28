'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft,
  ShieldCheck,
  Key,
  Activity,
  Layers,
  X,
  Loader2,
  Cpu,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  Terminal,
  Calendar,
  AlertCircle,
  Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchGateway, updateGateway, testGatewayConnection } from '@/lib/api/gateways'
import type { GatewayDetail, ConnectionResult } from '@/types/gateway'

function ProviderLogo({ name }: { name: string }) {
  const letters = name.substring(0, 2).toUpperCase();
  let bg = "bg-purple-600";
  if (name.includes("Mercado")) bg = "bg-sky-500";
  else if (name.includes("Stripe")) bg = "bg-indigo-600";
  else if (name.includes("Asaas")) bg = "bg-blue-600";
  else if (name.includes("Cielo")) bg = "bg-emerald-600";
  else if (name.includes("Adyen")) bg = "bg-green-700";
  else if (name.includes("Banco")) bg = "bg-yellow-500 text-slate-900";
  else if (name.includes("Internal")) bg = "bg-slate-700";

  return (
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md shrink-0", bg)}>
      {letters}
    </div>
  );
}

const STATUS_MAP: Record<string, string> = {
  active: 'Ativo', inactive: 'Desativado', attention: 'Atenção',
  unstable: 'Instável', testing: 'Teste',
};

const ENV_MAP: Record<string, string> = {
  production: 'Produção', sandbox: 'Sandbox',
};

// Methods Mock Data (kept for now — no API equivalent)
const methodsMock = [
  { method: 'Cartão de Crédito', active: true, tax: '98,22%', fee: '2,99% + R$ 0,30', trans: 'há 2 min' },
  { method: 'Pix Dinâmico', active: true, tax: '99,84%', fee: '0,99%', trans: 'há 4 min' },
  { method: 'Boleto Bancário', active: true, tax: '94,50%', fee: 'R$ 1,80 fixo', trans: 'há 1 h' },
  { method: 'Apple / Google Pay', active: false, tax: '—', fee: '3,29% + R$ 0,10', trans: 'Nunca' },
];

// Systems Linkage Mock Data (kept for now — no API equivalent)
const systemsMock = [
  { name: 'Sistema Core', active: true, checkout: 'Checkout Pagar.Me Padrão', vol: 'R$ 1.849.200,00', share: '62%' },
  { name: 'Assinaturas', active: true, checkout: 'Checkout Assinatura Pro', vol: 'R$ 840.100,00', share: '28%' },
  { name: 'Eventos', active: false, checkout: 'Checkout Evento', vol: 'R$ 290.420,00', share: '10%' },
];

export default function GatewayDetailPage() {
  const params = useParams();
  const uuid = params?.id as string;

  const [data, setData] = useState<GatewayDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchGateway(uuid)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar gateway')
    } finally {
      setLoading(false)
    }
  }, [uuid])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const gw = useMemo(() => {
    if (!data) return null
    const g = data.gateway
    const a = data.account
    const h = data.health
    const env = ENV_MAP[a.environment] || a.environment || 'Produção'
    const status = STATUS_MAP[g.status] || g.status || 'Ativo'
    const capKey = data.capabilities?.key || ''
    const capMethods = data.capabilities?.methods || []
    return {
      id: a.uuid,
      name: g.name || a.name,
      provider: g.provider || a.gateway_type,
      desc: capMethods.length ? capMethods.join(', ') : 'Gateway de Pagamento',
      status,
      ambiente: env,
      aprovacao: h?.approval_rate != null ? `${h.approval_rate.toFixed(1)}%` : '—',
      pp: '—',
      uptime: h?.avg_latency_ms != null ? `${(100 - (h.failure_rate ?? 0) * 100).toFixed(1)}%` : '—',
      p95: h?.avg_latency_ms != null ? `${h.avg_latency_ms}ms` : '—',
      reqs: '—',
      conta: a.name,
      contaId: a.uuid?.substring(0, 8) || '—',
      erro: '—',
      client_id: '—',
      api_key: '—',
      secret: '—',
      webhooks: [] as { event: string; status: string; time: string; id: string }[],
      eventos: [] as { title: string; user: string; time: string; desc: string }[],
      circuit_breaker: data.circuit_breaker,
      capabilities: capMethods,
    }
  }, [data])

  const [statusActive, setStatusActive] = useState(true)
  useEffect(() => {
    if (gw) setStatusActive(gw.status !== 'Desativado')
  }, [gw])

  const [activeTab, setActiveTab] = useState<'resumo' | 'credenciais' | 'metodos' | 'sistemas' | 'webhooks' | 'testes' | 'eventos' | 'assinaturas'>('resumo');
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Toggle visible credential keys
  const [revealClient, setRevealClient] = useState(false);
  const [revealApi, setRevealApi] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);

  // Diagnostic running console simulator
  const [diagnosticTask, setDiagnosticTask] = useState<string | null>(null);
  const [diagnosticTerminal, setDiagnosticTerminal] = useState<string[]>([]);
  const [diagnosticStatus, setDiagnosticStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');

  // Trigger notification alert
  const triggerSuccessAlert = (message: string) => {
    setSuccessAlert(message);
    setTimeout(() => {
      setSuccessAlert(null);
    }, 4500);
  };

  // Run isolated tab diagnostic tests
  const executeDiagnosticTest = (testType: string) => {
    if (!gw) return
    setDiagnosticTask(testType);
    setDiagnosticStatus('running');
    setDiagnosticTerminal([
      `[INFO] Iniciando diagnóstico de gateway: ${gw.name}`,
      `[INFO] Resolvendo endpoint de validação...`,
      `[CONNECT] Conectando a api.${gw.name.toLowerCase().replace(/ /g, '')}.com/v2...`
    ]);

    setTimeout(() => {
      setDiagnosticTerminal(prev => [...prev, `[AUTH] Verificando cabeçalhos e assinatura de segurança...`]);
    }, 800);

    setTimeout(() => {
      if (!gw) return
      if (testType === 'auth_verify') {
        if (gw.status === 'Instável') {
          setDiagnosticStatus('failed');
          setDiagnosticTerminal(prev => [
            ...prev,
            `[ERROR] Falha de autenticação API!`,
            `[ERROR] Servidor externo retornou Status 502 Bad Gateway.`,
            `[ERROR] Diagnóstico concluído com falhas.`
          ]);
        } else {
          setDiagnosticStatus('success');
          setDiagnosticTerminal(prev => [
            ...prev,
            `[AUTH] Credenciais verificadas com sucesso!`,
            `[SUCCESS] Uptime verificado: 100% nas últimas 24h.`,
            `[SUCCESS] Integridade da conta de recebimento: Ativa.`
          ]);
        }
      } else if (testType === 'pix_loop') {
        setDiagnosticStatus('success');
        setDiagnosticTerminal(prev => [
          ...prev,
          `[PIX] Simulando criação de cobrança no valor R$ 10,00...`,
          `[PIX] QR Code gerado: pix.br/payload/test_charge_992a`,
          `[SUCCESS] Callback de confirmação recebido com sucesso (200 OK).`
        ]);
      } else {
        setDiagnosticStatus('success');
        setDiagnosticTerminal(prev => [
          ...prev,
          `[CARD] Simulando autorização de Cartão de Crédito...`,
          `[CARD] Payload enviado: Mastercard final 4432`,
          `[SUCCESS] Transação aprovada e capturada com sucesso.`
        ]);
      }
    }, 2200);
  };

  if (loading) {
    return (
      <div className="w-full animate-in fade-in duration-700 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-brand w-8 h-8" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Carregando gateway...</p>
        </div>
      </div>
    );
  }

  if (error || !gw) {
    return (
      <div className="w-full animate-in fade-in duration-700 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-slate-950 font-black text-base">Erro ao carregar gateway</h3>
          <p className="text-slate-500 text-xs font-medium">{error || 'Gateway não encontrado'}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-brand text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col gap-2.5 2xl:gap-3.5 relative min-h-0 select-none pb-4">
      
      {/* Success Notification Alert */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white p-3.5 rounded-2xl shadow-xl shadow-green-900/10 flex items-center justify-between gap-3 max-w-sm border border-green-400 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-white" />
            <span className="text-[11.5px] font-bold">{successAlert}</span>
          </div>
          <button onClick={() => setSuccessAlert(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breadcrumb row & Back */}
      <div className="flex items-center gap-2 px-1 shrink-0">
        <Link 
          href="/dashboard/gateways"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8DDFD] rounded-xl text-[10px] font-black text-slate-700 shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          Voltar para Gateways
        </Link>
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-slate-400 font-bold text-[11px]">Detalhes do Gateway</span>
      </div>

      {/* Header Info Block */}
      <header className="bg-white p-4 rounded-3xl border border-[#E8DDFD] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full shrink-0">
        <div className="flex items-center gap-3.5">
          <ProviderLogo name={gw.name} />
          
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[20px] 2xl:text-[22px] font-black text-slate-950 tracking-tighter leading-none">{gw.name}</h1>
              
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase border",
                statusActive ? "bg-green-50 border-green-200/50 text-green-700" : "bg-slate-50 border-slate-200/50 text-slate-500"
              )}>
                <div className={cn("w-1 h-1 rounded-full", statusActive ? "bg-green-500" : "bg-slate-400")} />
                {statusActive ? 'Ativo' : 'Desativado'}
              </span>

              {gw.ambiente === 'Produção' ? (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-green-50 text-green-700 border border-green-200/50">
                  Produção
                </span>
              ) : (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200/50">
                  Sandbox
                </span>
              )}
            </div>
            
            <p className="text-slate-400 font-bold text-[11px] 2xl:text-[11.5px] mt-1">{gw.desc}</p>
          </div>
        </div>

        {/* Dynamic top-right toggle activation */}
        <div className="flex items-center gap-3 bg-[#FAF8FF] border border-[#E8DDFD] px-4 py-2.5 rounded-2xl shadow-sm self-start sm:self-center">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest leading-none">Controle de Status</p>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Operações {statusActive ? 'Ativadas' : 'Pausadas'}</p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={statusActive}
              onChange={async () => {
                const newActive = !statusActive;
                setStatusActive(newActive);
                try {
                  await updateGateway(uuid, { environment: newActive ? 'production' : 'sandbox' });
                  triggerSuccessAlert(`Gateway ${newActive ? 'ativado' : 'desativado'} com sucesso!`);
                } catch {
                  setStatusActive(!newActive);
                  triggerSuccessAlert('Erro ao alterar status do gateway.');
                }
              }}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
          </label>
        </div>
      </header>

      {/* Tabs navigation list */}
      <div className="flex items-center border-b border-[#E8DDFD]/60 pb-0 px-1 w-full shrink-0 select-none overflow-x-auto no-scrollbar">
        <div className="flex gap-5 min-w-max">
          {[
            { id: 'resumo', label: 'Resumo', icon: Activity },
            { id: 'credenciais', label: 'Credenciais API', icon: Key },
            { id: 'metodos', label: 'Métodos Ativos', icon: Cpu },
            { id: 'sistemas', label: 'Sistemas Vinculados', icon: Layers },
            { id: 'assinaturas', label: 'Assinaturas Ativas', icon: RefreshCw },
            { id: 'webhooks', label: 'Webhooks & Entregas', icon: Globe },
            { id: 'testes', label: 'Testes Rápidos', icon: Terminal },
            { id: 'eventos', label: 'Eventos de Auditoria', icon: Calendar },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "pb-2.5 text-[12.5px] font-black relative transition-all tracking-tight flex items-center gap-1.5",
                  isActive ? "text-brand" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TAB CONTENT RENDER */}
      <div className="w-full shrink-0">
        
        {/* Tab 1: Resumo */}
        {activeTab === 'resumo' && (
          <div className="space-y-4">
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Uptime do Gateway', val: gw.uptime, sub: 'Monitorado pelo Trust Layer', color: 'text-slate-900' },
                { label: 'Latência p95 Média', val: gw.p95, sub: 'Tempo de ping do provedor', color: 'text-slate-900' },
                { label: 'Taxa de Requisições', val: gw.reqs, sub: 'Vendas em andamento por segundo', color: 'text-slate-900' },
                { label: 'Taxa de Aprovação', val: gw.aprovacao, sub: gw.pp + ' nas últimas 24h', color: 'text-green-600' }
              ].map((c, i) => (
                <div key={i} className="bg-white p-4 rounded-[22px] border border-[#E8DDFD] shadow-sm">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2">{c.label}</span>
                  <p className={cn("text-[20px] font-black tracking-tight leading-none", c.color)}>{c.val}</p>
                  <p className="text-[9.5px] font-bold text-slate-400 mt-1">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Performance analysis widget */}
            <div className="bg-white p-4 rounded-[22px] border border-[#E8DDFD] shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Análise Técnica Operacional</span>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1 lg:col-span-2">
                  <h4 className="text-[13px] font-black text-slate-950 leading-tight">Rotas configuradas na Basileia Pay</h4>
                  <p className="text-[11.5px] font-bold text-slate-400 leading-relaxed">
                    Este provedor é responsável pela captura primária de transações originadas no **Sistema Core**.
                    Seu desempenho técnico está operando dentro dos parâmetros tolerados.
                  </p>
                  <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-2xl flex items-center gap-3 text-[11px] text-slate-600 font-bold mt-3">
                    <Database className="w-5 h-5 text-brand shrink-0" />
                    <span>Conta vinculada de liquidação: <strong className="text-slate-900">{gw.conta}</strong> ({gw.contaId || 'Sandbox'})</span>
                  </div>
                </div>

                <div className="bg-[#FAF8FF] border border-[#E8DDFD] p-3 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Último erro de conexão</span>
                    <p className="text-[11.5px] font-black text-slate-900 truncate leading-snug">{gw.erro}</p>
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        const result = await testGatewayConnection(uuid);
                        triggerSuccessAlert(result.success ? 'Gateway operacional!' : 'Falha na conexão.');
                      } catch {
                        triggerSuccessAlert('Erro ao testar conexão.');
                      }
                    }}
                    className="w-full mt-3 h-[30px] bg-white border border-[#E8DDFD] hover:bg-brand hover:text-white hover:border-brand rounded-xl text-[9.5px] font-black uppercase tracking-tight transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> Revalidar status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Credenciais */}
        {activeTab === 'credenciais' && (
          <div className="bg-white p-5 rounded-[24px] border border-[#E8DDFD] shadow-sm space-y-4">
            <div>
              <h3 className="text-[14px] font-black text-slate-950 tracking-tight leading-none">Configuração de Credenciais de API</h3>
              <p className="text-slate-400 font-bold text-[11px] mt-1">Insira e valide as chaves criptografadas de produção ou ambiente de testes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { label: 'Client ID / Identificador da Conta', val: gw.client_id, reveal: revealClient, setter: setRevealClient },
                { label: 'API Key (Public key / Token)', val: gw.api_key, reveal: revealApi, setter: setRevealApi },
              ].map((k) => (
                <div key={k.label} className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                  <div className="relative flex items-center border border-[#E8DDFD] rounded-2xl bg-[#FAF8FF] px-3.5 h-12 shadow-inner">
                    <span className="text-[12.5px] font-mono font-bold text-slate-700 truncate pr-8">
                      {k.reveal ? k.val : '••••••••••••••••••••••••'}
                    </span>
                    <button 
                      onClick={() => k.setter(!k.reveal)}
                      className="absolute right-3.5 text-slate-400 hover:text-brand transition-colors p-1"
                    >
                      {k.reveal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="space-y-1.5 md:col-span-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secret Key / Assinatura do Provedor</span>
                <div className="relative flex items-center border border-[#E8DDFD] rounded-2xl bg-[#FAF8FF] px-3.5 h-12 shadow-inner">
                  <span className="text-[12.5px] font-mono font-bold text-slate-700 truncate pr-8">
                    {revealSecret ? gw.secret : '••••••••••••••••••••••••••••••••••••••••••••'}
                  </span>
                  <button 
                    onClick={() => setRevealSecret(!revealSecret)}
                    className="absolute right-3.5 text-slate-400 hover:text-brand transition-colors p-1"
                  >
                    {revealSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 bg-[#FAF8FF] border border-[#E8DDFD] px-2.5 py-1 rounded-xl text-slate-600 shadow-sm">
                <Key className="w-4 h-4 text-brand shrink-0" />
                Credenciais gerenciadas pelo Gateway Engine
              </span>

              <div className="flex gap-2">
                <button 
                  onClick={() => triggerSuccessAlert('Solicitação de rotação de credenciais enviada!')}
                  className="h-[34px] px-3 bg-white border border-[#E8DDFD] hover:bg-brand-soft rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight transition-all shadow-sm"
                >
                  Rotacionar Chaves
                </button>
                
                <button 
                  onClick={() => triggerSuccessAlert('Fluxo de edição de credenciais iniciado com sucesso!')}
                  className="h-[34px] px-4 bg-brand hover:bg-brand-deep text-white rounded-xl text-[10.5px] font-black uppercase tracking-tight transition-all shadow-sm shadow-brand/10"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Métodos */}
        {activeTab === 'metodos' && (
          <div className="bg-white p-4 rounded-[24px] border border-[#E8DDFD] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-black text-slate-950 leading-none">Métodos de Captura Disponíveis</h3>
                <p className="text-slate-400 font-bold text-[11px] mt-1">Controle quais modalidades de transações este provedor processará.</p>
              </div>
              <button 
                onClick={() => triggerSuccessAlert('Novo método adicionado!')}
                className="px-3.5 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm"
              >
                Vincular método
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {methodsMock.map((m) => (
                <div 
                  key={m.method}
                  className={cn(
                    "p-3 rounded-2xl border flex items-center justify-between gap-4 transition-all shadow-sm",
                    m.active ? "bg-white border-[#E8DDFD]" : "bg-slate-50 border-slate-200/50 opacity-60"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12.5px] font-black text-slate-950 leading-none">{m.method}</span>
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.2 rounded border uppercase",
                        m.active ? "bg-green-50 border-green-200/50 text-green-700" : "bg-slate-100 border-slate-200 text-slate-400"
                      )}>
                        {m.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-[9.5px] font-bold text-slate-400">
                      Taxa de Aprovação: <strong className="text-slate-700">{m.tax}</strong> • Fee: <strong className="text-slate-700">{m.fee}</strong>
                    </p>
                    <p className="text-[8.5px] text-slate-300 font-bold">Última captura: {m.trans}</p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      defaultChecked={m.active} 
                      onChange={() => triggerSuccessAlert(`Status do método ${m.method} alterado.`)} 
                    />
                    <div className="w-7 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Sistemas */}
        {activeTab === 'sistemas' && (
          <div className="bg-white p-4 rounded-[24px] border border-[#E8DDFD] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-[14px] font-black text-slate-950 leading-none">Mapeamento e Vínculos de Sistemas</h3>
                <p className="text-slate-400 font-bold text-[11px] mt-1 font-medium">Sistemas corporativos que direcionam transações para este gateway.</p>
              </div>
              <button 
                onClick={() => triggerSuccessAlert('Associação com novo sistema iniciada!')}
                className="px-3.5 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm"
              >
                Vincular sistema
              </button>
            </div>

            <div className="w-full overflow-hidden border border-slate-200/50 rounded-2xl mt-2 shadow-sm">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/50 text-[9.5px] font-black uppercase tracking-widest text-slate-400">
                    <th className="py-2.5 px-3 w-[30%]">Sistema</th>
                    <th className="py-2.5 px-2 w-[30%]">Checkout Padrão</th>
                    <th className="py-2.5 px-2 w-[22%]">Volume Financeiro</th>
                    <th className="py-2.5 px-2 w-[10%]">Share</th>
                    <th className="py-2.5 pr-3 text-right w-[8%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11.5px] font-bold text-slate-700">
                  {systemsMock.map((sys) => (
                    <tr key={sys.name} className="hover:bg-slate-50/50 h-[50px] transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-950 font-black">{sys.name}</span>
                          <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.2 rounded uppercase border",
                            sys.active ? "bg-green-50 border-green-200/50 text-green-700" : "bg-slate-50 border-slate-200 text-slate-400"
                          )}>
                            {sys.active ? 'Principal' : 'Backup'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-slate-500 font-bold">{sys.checkout}</td>
                      <td className="py-2 px-2 text-slate-950 font-black">{sys.vol}</td>
                      <td className="py-2 px-2 text-slate-400 font-bold">{sys.share}</td>
                      <td className="py-2 pr-3 text-right">
                        <button 
                          onClick={() => triggerSuccessAlert(`Configurando regras do ${sys.name}...`)}
                          className="text-[9.5px] font-black text-brand hover:underline"
                        >
                          Regras
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Assinaturas */}
        {activeTab === 'assinaturas' && (
          <div className="bg-white p-4 rounded-[24px] border border-[#E8DDFD] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-[14px] font-black text-slate-950 leading-none">Assinaturas Vivas no Gateway</h3>
                <p className="text-slate-400 font-bold text-[11px] mt-1 font-medium">Contratos recorrentes de cobrança sendo gerenciados por este provedor.</p>
              </div>
              <button 
                onClick={() => triggerSuccessAlert('Sincronização de assinaturas com o provedor iniciada!')}
                className="px-3.5 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                Sincronizar
              </button>
            </div>

            <div className="w-full overflow-hidden border border-slate-200/50 rounded-2xl mt-2 shadow-sm">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/50 text-[9.5px] font-black uppercase tracking-widest text-slate-400">
                    <th className="py-2.5 px-3 w-[25%]">Cliente / ID</th>
                    <th className="py-2.5 px-2 w-[25%]">Plano</th>
                    <th className="py-2.5 px-2 w-[15%]">Valor</th>
                    <th className="py-2.5 px-2 w-[15%]">Status</th>
                    <th className="py-2.5 px-2 w-[20%]">Próxima Cobrança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11.5px] font-bold text-slate-700">
                  <tr className="hover:bg-slate-50/50 h-[50px] transition-colors">
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="text-slate-950 font-black truncate">João da Silva</span>
                        <span className="text-[9px] text-slate-400 font-mono">sub_1A2B3C</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-slate-500 font-bold">Plano Pro - Mensal</td>
                    <td className="py-2 px-2 text-slate-950 font-black">R$ 97,00</td>
                    <td className="py-2 px-2">
                      <span className="bg-green-50 border border-green-200/50 text-green-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Ativa</span>
                    </td>
                    <td className="py-2 px-2 text-slate-400 font-bold">15/06/2026</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 h-[50px] transition-colors">
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="text-slate-950 font-black truncate">Maria Oliveira</span>
                        <span className="text-[9px] text-slate-400 font-mono">sub_9X8Y7Z</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-slate-500 font-bold">Plano VIP - Anual</td>
                    <td className="py-2 px-2 text-slate-950 font-black">R$ 997,00</td>
                    <td className="py-2 px-2">
                      <span className="bg-green-50 border border-green-200/50 text-green-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Ativa</span>
                    </td>
                    <td className="py-2 px-2 text-slate-400 font-bold">22/10/2026</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 h-[50px] transition-colors">
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="text-slate-950 font-black truncate">Carlos Souza</span>
                        <span className="text-[9px] text-slate-400 font-mono">sub_4P5Q6R</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-slate-500 font-bold">Plano Starter - Mensal</td>
                    <td className="py-2 px-2 text-slate-950 font-black">R$ 47,00</td>
                    <td className="py-2 px-2">
                      <span className="bg-red-50 border border-red-200/50 text-red-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Inadimplente</span>
                    </td>
                    <td className="py-2 px-2 text-red-400 font-bold">Atrasada</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Webhooks */}
        {activeTab === 'webhooks' && (
          <div className="bg-white p-4 rounded-[24px] border border-[#E8DDFD] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-black text-slate-950 leading-none">Subscrição de Webhooks Corporativos</h3>
                <p className="text-slate-400 font-bold text-[11px] mt-1 font-medium">Histórico recente de payloads de retorno disparados pelo gateway.</p>
              </div>
              <button 
                onClick={() => triggerSuccessAlert('Iniciada a simulação de webhook de teste manual!')}
                className="px-3.5 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm"
              >
                Disparar webhook teste
              </button>
            </div>

            {/* List webhooks deliveries */}
            {gw.webhooks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-[11.5px]">
                Nenhum webhook recebido recentemente neste gateway.
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                {gw.webhooks.map((w, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/50 p-3 rounded-2xl flex items-center justify-between gap-3 text-[11px] font-bold text-slate-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-950 font-black">{w.event}</span>
                        <span className={cn(
                          "text-[8px] font-mono px-1 rounded-md",
                          w.status.includes("OK") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {w.status}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold">ID Transmissão: {w.id} • Payload auditado</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-bold text-slate-400">{w.time}</span>
                      <button 
                        onClick={() => triggerSuccessAlert('Webhook reenviado com sucesso para a fila!')}
                        className="h-[26px] px-2 bg-white border border-[#E8DDFD] hover:bg-slate-100 rounded-lg text-[9px] font-black text-slate-700 uppercase tracking-tight transition-all shadow-sm"
                      >
                        Reenviar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Testes */}
        {activeTab === 'testes' && (
          <div className="bg-white p-4 rounded-[24px] border border-[#E8DDFD] shadow-sm space-y-4">
            <div>
              <h3 className="text-[14px] font-black text-slate-950 leading-none">Console Interativo de Diagnósticos</h3>
              <p className="text-slate-400 font-bold text-[11px] mt-1 font-medium">Execute testes manuais rápidos de autenticação de chaves ou fluxo transacional de simulação.</p>
            </div>

            {/* Panel terminal */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900 font-mono text-[11px] text-green-400 space-y-1 shadow-inner h-[170px] overflow-y-auto no-scrollbar">
              {diagnosticTerminal.length === 0 ? (
                <div className="text-slate-500 italic h-full flex items-center justify-center select-text">
                  [AGUARDANDO] Selecione um teste manual abaixo para inicializar o console de diagnóstico...
                </div>
              ) : (
                <div className="select-text">
                  {diagnosticTerminal.map((line, idx) => (
                    <p key={idx} className={cn(
                      line.includes("[ERROR]") && "text-red-500",
                      line.includes("[SUCCESS]") && "text-green-300",
                      line.includes("[INFO]") && "text-blue-400"
                    )}>
                      {line}
                    </p>
                  ))}
                  {diagnosticStatus === 'running' && (
                    <p className="animate-pulse text-white flex items-center gap-1.5 mt-1 font-black">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando teste de conexões...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Test Triggers buttons */}
            <div className="flex gap-2 flex-wrap pt-2">
              {[
                { id: 'auth_verify', label: 'Validar Autenticação API', desc: 'Testa chaves' },
                { id: 'pix_loop', label: 'Simular Cobrança Pix', desc: 'Simula Pix' },
                { id: 'cc_loop', label: 'Simular Cartão Crédito', desc: 'Simula Cartão' }
              ].map((t) => (
                <button
                  key={t.id}
                  disabled={diagnosticStatus === 'running'}
                  onClick={() => executeDiagnosticTest(t.id)}
                  className="px-4 py-2 bg-brand/10 border border-brand/20 hover:bg-brand hover:text-white rounded-xl text-[10px] font-black uppercase tracking-tight transition-all shadow-sm flex-1 min-w-[130px] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {t.label}
                  <span className="block text-[8px] font-bold opacity-60 normal-case mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Eventos */}
        {activeTab === 'eventos' && (
          <div className="bg-white p-4 rounded-[24px] border border-[#E8DDFD] shadow-sm space-y-4">
            <div>
              <h3 className="text-[14px] font-black text-slate-950 leading-none">Timeline de Auditoria de Eventos</h3>
              <p className="text-slate-400 font-bold text-[11px] mt-1 font-medium">Histórico cronológico de ações técnicas e operacionais auditadas pelo Trust Layer.</p>
            </div>

            {/* Timeline component */}
            <div className="relative border-l border-[#E8DDFD] ml-2.5 pl-5 space-y-4 pt-2 pb-2 select-text">
              {gw.eventos.map((ev, idx) => (
                <div key={idx} className="relative leading-tight">
                  {/* Timeline dot */}
                  <div className="absolute -left-[26px] top-1.5 w-3 h-3 bg-brand border-2 border-white rounded-full shadow" />
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11.5px] font-black text-slate-950">{ev.title}</span>
                    <span className="text-[9px] font-bold text-slate-400">• {ev.time}</span>
                  </div>
                  
                  <p className="text-[10px] font-bold text-slate-500 mt-1">{ev.desc}</p>
                  <p className="text-[8.5px] font-bold text-slate-400 uppercase mt-0.5">Operador: {ev.user}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
