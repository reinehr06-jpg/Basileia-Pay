'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  X, 
  Check, 
  ArrowUpRight, 
  Settings, 
  Loader2, 
  AlertCircle, 
  Lock, 
  Play, 
  Pause,
  Key,
  Layers,
  Network,
  HelpCircle,
  FileText,
  Trash2,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GatewayConnectionWizard } from '@/components/gateways/GatewayConnectionWizard'
import {
  fetchGateways as apiFetchGateways,
  testGatewayConnection,
  updateGateway,
} from '@/lib/api/gateways'

// Helper to render provider logo/icon simulation
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
    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm shrink-0", bg)}>
      {letters}
    </div>
  );
}

const STATUS_MAP: Record<string, string> = {
  active: 'Operacional', inactive: 'Desativado', attention: 'Atenção',
  unstable: 'Instável', testing: 'Teste',
};

const ENV_MAP: Record<string, string> = {
  production: 'Produção', sandbox: 'Sandbox',
};

function apiGatewayToPage(g: any) {
  const env = ENV_MAP[g.environment] || g.environment || 'Produção'
  const status = STATUS_MAP[g.status] || g.status || 'Operacional'
  return {
    id: g.account_uuid || g.id?.toString() || `gw_${Math.random().toString(36).substring(2, 8)}`,
    name: g.name || 'Gateway',
    provider: g.provider || g.name || 'Gateway',
    desc: 'Gateway de Pagamento',
    status,
    ambiente: env,
    aprovacao: '—',
    pp: '—',
    erro: g.last_test_status === 'failed' ? 'Teste de conexão falhou' : '—',
    rotas: 0,
    metodos: [],
    conta: g.name || 'Conta',
    contaId: g.account_uuid?.substring(0, 8) || g.id?.toString() || '—',
    sistemas: [],
    uptime: '—',
    p95: '—',
    reqs: '—',
    uuid: g.account_uuid || '',
    assinaturas: g.active_subscriptions || 0,
  };
}

export default function GatewaysPage() {
  const router = useRouter();
  const [gateways, setGateways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchGateways = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchGateways();
      setGateways(data.map(apiGatewayToPage));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar gateways');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterAmbiente, setFilterAmbiente] = useState('Todos');
  const [filterSistema, setFilterSistema] = useState('Todos');
  const [filterConta, setFilterConta] = useState('Todos');

  // Interactive menu & Modals
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  
  // Test connection modal state
  const [testingGateway, setTestingGateway] = useState<any | null>(null);
  const [testResult, setTestResult] = useState<'testing' | 'success' | 'failed' | null>(null);
  const [testErrorMsg, setTestErrorMsg] = useState<string | null>(null);

  // Disable Warning Modal state
  const [disablingGateway, setDisablingGateway] = useState<any | null>(null);

  // Gateway Connection Wizard state
  const openWizard = () => {
    router.push('/dashboard/gateways/new');
  };

  // Pagination current page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Notification trigger helper
  const triggerSuccessAlert = (message: string) => {
    setSuccessAlert(message);
    setTimeout(() => {
      setSuccessAlert(null);
    }, 4000);
  };

  // Systems and Accounts lists derived
  const systemsList = useMemo(() => ['Todos', 'Sistema Core', 'Eventos', 'Marketplace', 'Assinaturas', 'Church', 'PDV', 'Todos os sistemas'], []);
  const accountsList = useMemo(() => ['Todos', 'Contas Configuradas', 'Sem conta padrão'], []);

  // Filtered gateways logic
  const filteredGateways = useMemo(() => {
    return gateways.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || 
                          g.provider.toLowerCase().includes(search.toLowerCase()) || 
                          g.conta.toLowerCase().includes(search.toLowerCase());
      
      const matchStatus = filterStatus === 'Todos' || g.status === filterStatus;
      const matchAmbiente = filterAmbiente === 'Todos' || g.ambiente === filterAmbiente;
      
      const matchSistema = filterSistema === 'Todos' || (g.sistemas || []).some((sys: string) => sys.includes(filterSistema) || sys === 'Todos os sistemas');
      
      let matchConta = true;
      if (filterConta === 'Contas Configuradas') matchConta = g.conta !== 'Sem conta padrão';
      else if (filterConta === 'Sem conta padrão') matchConta = g.conta === 'Sem conta padrão';

      return matchSearch && matchStatus && matchAmbiente && matchSistema && matchConta;
    });
  }, [gateways, search, filterStatus, filterAmbiente, filterSistema, filterConta]);

  // Paginated elements
  const totalItems = filteredGateways.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentGateways = useMemo(() => {
    return filteredGateways.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGateways, startIndex, itemsPerPage]);

  // Handle individual toggle switches
  const handleToggleActive = async (gateway: any) => {
    const isActivating = gateway.status === 'Desativado';
    
    if (isActivating) {
      try {
        await updateGateway(gateway.uuid, { environment: gateway.ambiente === 'Sandbox' ? 'sandbox' : 'production' })
        setGateways(prev => prev.map(g => 
          g.id === gateway.id ? { ...g, status: 'Operacional' } : g
        ));
        triggerSuccessAlert(`Gateway "${gateway.name}" ativado com sucesso!`);
      } catch {
        triggerSuccessAlert('Erro ao ativar gateway');
      }
    } else {
      setDisablingGateway(gateway);
    }
  };

  // Confirm disable from impact modal
  const confirmDisableGateway = async () => {
    if (!disablingGateway) return;
    try {
      await updateGateway(disablingGateway.uuid, { environment: 'sandbox' })
      setGateways(prev => prev.map(g => 
        g.id === disablingGateway.id ? { ...g, status: 'Desativado' } : g
      ));
      triggerSuccessAlert(`Gateway "${disablingGateway.name}" desativado.`);
    } catch {
      triggerSuccessAlert('Erro ao desativar gateway');
    }
    setDisablingGateway(null);
  };

  // Trigger real connection test
  const runConnectionTest = async (gateway: any) => {
    setTestingGateway(gateway);
    setTestResult('testing');
    try {
      const result = await testGatewayConnection(gateway.uuid)
      setTestResult(result.success ? 'success' : 'failed')
      setTestErrorMsg(result.message)
    } catch (e) {
      setTestResult('failed')
      setTestErrorMsg(e instanceof Error ? e.message : 'Erro ao testar conexão')
    }
  };

  // Bulk actions handling
  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) return;

    if (action === 'ativar') {
      setGateways(prev => prev.map(g => 
        selectedIds.includes(g.id) ? { ...g, status: 'Operacional' } : g
      ));
      triggerSuccessAlert(`${selectedIds.length} gateways ativados com sucesso.`);
    } else if (action === 'desativar') {
      // Check if any selected has active systems
      const affected = gateways.filter(g => selectedIds.includes(g.id) && g.sistemas[0] !== 'Nenhum sistema ativo');
      if (affected.length > 0) {
        setDisablingGateway(affected[0]); // alert on first with active dependency
      } else {
        setGateways(prev => prev.map(g => 
          selectedIds.includes(g.id) ? { ...g, status: 'Desativado', reqs: '0 req/s', uptime: '0%' } : g
        ));
        triggerSuccessAlert(`${selectedIds.length} gateways desativados.`);
      }
    } else if (action === 'sandbox') {
      setGateways(prev => prev.map(g => 
        selectedIds.includes(g.id) ? { ...g, ambiente: 'Sandbox' } : g
      ));
      triggerSuccessAlert(`Ambiente dos gateways alterado para Sandbox.`);
    } else if (action === 'producao') {
      setGateways(prev => prev.map(g => 
        selectedIds.includes(g.id) ? { ...g, ambiente: 'Produção' } : g
      ));
      triggerSuccessAlert(`Ambiente dos gateways alterado para Produção.`);
    } else if (action === 'revalidar') {
      triggerSuccessAlert(`Revalidação de conexão iniciada para ${selectedIds.length} gateways.`);
    }
    
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentGateways.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentGateways.map(g => g.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  return (
    <main className="min-w-0 w-full animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col gap-2 relative pb-2">
      


      {/* 2. Success Alert Notification */}
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

      {/* 3. Gateway Connection Wizard (Moved to page /dashboard/gateways/new) */}

      {/* 4. Connection Test Modal */}
      {testingGateway && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <ProviderLogo name={testingGateway.name} />
              <div>
                <h3 className="text-slate-950 font-black text-sm">{testingGateway.name}</h3>
                <p className="text-slate-400 font-bold text-[10.5px]">ID: {testingGateway.id}</p>
              </div>
            </div>

            {testResult === 'testing' ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-brand w-8 h-8" />
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Autenticando credenciais...</p>
              </div>
            ) : testResult === 'success' ? (
              <div className="py-4 space-y-4">
                <div className="bg-green-50 border border-green-200/50 p-4 rounded-2xl flex items-center gap-3 text-green-700">
                  <ShieldCheck className="w-8 h-8 shrink-0 text-green-600" />
                  <div>
                    <p className="text-[12.5px] font-black leading-tight">Conexão Estabelecida com Sucesso</p>
                    <p className="text-[10px] font-bold text-green-600/80 mt-0.5">Gateway autenticado e operacional.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <div className="bg-red-50 border border-red-200/50 p-4 rounded-2xl flex items-center gap-3 text-red-700">
                  <ShieldAlert className="w-8 h-8 shrink-0 text-red-600" />
                  <div>
                    <p className="text-[12.5px] font-black leading-tight">Conexão Falhou</p>
                    <p className="text-[10px] font-bold text-red-600/80 mt-0.5">{testErrorMsg || 'Erro retornado pelo provedor externo.'}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-[10.5px] font-mono text-red-600 break-words leading-tight">
                  {testErrorMsg || 'Erro desconhecido'}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              {testResult !== 'testing' && (
                <button
                  onClick={() => runConnectionTest(testingGateway)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight"
                >
                  Re-testar
                </button>
              )}
              <button
                disabled={testResult === 'testing'}
                onClick={() => { setTestingGateway(null); setTestResult(null); setTestErrorMsg(null); }}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep transition-all rounded-xl text-[10.5px] font-black uppercase tracking-tight disabled:opacity-50"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Disable Dependency Confirmation Modal */}
      {disablingGateway && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-500 border-b border-slate-100 pb-3 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Alerta de Impacto Técnico</h3>
            </div>

            <div className="space-y-3">
              <p className="text-[12px] font-bold text-slate-700 leading-relaxed">
                Você solicitou a desativação do gateway <span className="font-black text-slate-950">{disablingGateway.name}</span>.
                No entanto, identificamos que existem **sistemas ativos** vinculados que dependem de suas rotas:
              </p>
              
              <div className="bg-red-50/50 border border-red-100 p-3 rounded-2xl space-y-1.5">
                <span className="text-[9px] font-black text-red-700 uppercase tracking-widest leading-none block">Sistemas Afetados:</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {disablingGateway.sistemas.map((s: string) => (
                    <span key={s} className="bg-white text-slate-700 border border-[#E8DDFD] px-2 py-0.5 rounded-lg text-[9.5px] font-black shadow-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[10.5px] font-bold text-slate-400 leading-tight">
                Se você prosseguir com a desativação, novas transações nestes sistemas falharão, a menos que rotas de fallback de contingência estejam ativas no Roteador.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDisablingGateway(null)}
                className="px-4 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 transition-all rounded-xl text-[10.5px] font-black text-slate-700 uppercase tracking-tight h-[32px]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDisableGateway}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white transition-all rounded-xl text-[10.5px] font-black uppercase tracking-tight h-[32px]"
              >
                Confirmar Desativação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Page Header */}
      <header className="flex items-center justify-between w-full px-1 shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[23px] 2xl:text-[25px] font-black tracking-tighter text-slate-950 leading-none">Gateways</h1>
            <Network className="w-4 h-4 text-brand-accent mt-0.5" />
          </div>
          <p className="text-slate/50 font-bold text-[11px] 2xl:text-[12px] tracking-tight">
            Gerencie gateways conectados, rotas de pagamento, contas de recebimento e saúde operacional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => triggerSuccessAlert('Exportação de dados iniciada com sucesso!')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E8DDFD] rounded-xl text-[10px] 2xl:text-[11px] font-black text-slate-700 shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-[34px] 2xl:h-[36px]"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Exportar
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          </button>
          
          <button 
            onClick={openWizard}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand text-white rounded-xl text-[10px] 2xl:text-[11px] font-black shadow-lg shadow-brand/10 hover:shadow-brand/35 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight h-[34px] 2xl:h-[36px]"
          >
            Novo gateway
          </button>
        </div>
      </header>

      {/* RENDER BASED ON REAL STATE */}
      {loading && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-20 flex flex-col items-center justify-center gap-4 shadow-sm h-[400px]">
          <Loader2 className="animate-spin text-brand w-8 h-8" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Carregando provedores...</p>
        </div>
      )}

      {!loading && error && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-16 flex flex-col items-center justify-center text-center gap-4 shadow-sm h-[400px]">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-950 font-black text-base">Não foi possível carregar os gateways</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto font-medium">{error}</p>
          </div>
          <button 
            onClick={fetchGateways}
            className="px-4 py-2 bg-brand hover:bg-brand-deep text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all h-[34px]"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && gateways.length === 0 && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-16 flex flex-col items-center justify-center text-center gap-5 shadow-sm h-[400px]">
          <div className="w-16 h-16 rounded-full bg-[#FAF8FF] border border-[#E8DDFD] flex items-center justify-center text-violet-400">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-slate-950 font-black text-base">Nenhum gateway conectado ainda</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto font-medium leading-relaxed">
              Conecte seu primeiro gateway para começar a processar pagamentos nos sistemas vinculados.
            </p>
          </div>
          <button 
            onClick={openWizard}
            className="px-5 py-2.5 bg-brand hover:bg-brand-deep text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all"
          >
            Conectar gateway
          </button>
        </div>
      )}

      {!loading && !error && gateways.length > 0 && (
        <>
          {/* 6. Advanced Filters Bar */}
          <div className="bg-white px-3 py-1.5 rounded-[20px] border border-[#E8DDFD] flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-sm w-full shrink-0 h-[62px] min-h-[62px] max-h-[62px]">
            <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1 min-w-0">
              <div className="relative w-full md:w-[240px] 2xl:w-[270px] shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar por nome, provedor ou conta"
                  className="w-full pl-9 pr-4 bg-white border border-[#E8DDFD] rounded-xl text-[12px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/35 transition-all h-10 shadow-sm"
                />
              </div>

              {/* Advanced select dropdowns styled beautifully */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { label: 'Status', value: filterStatus, setter: setFilterStatus, options: ['Todos', 'Operacional', 'Atenção', 'Instável', 'Desativado'] },
                  { label: 'Ambiente', value: filterAmbiente, setter: setFilterAmbiente, options: ['Todos', 'Produção', 'Sandbox'] },
                  { label: 'Sistema', value: filterSistema, setter: setFilterSistema, options: systemsList },
                  { label: 'Conta', value: filterConta, setter: setFilterConta, options: accountsList }
                ].map((f) => (
                  <div 
                    key={f.label} 
                    className="relative shrink-0 flex h-10 min-w-[125px] 2xl:min-w-[135px] items-center justify-between rounded-xl border border-[#E8DDFD] bg-white hover:bg-brand-soft/20 transition-all px-3"
                  >
                    <select
                      value={f.value}
                      onChange={(e) => { f.setter(e.target.value); setCurrentPage(1); }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                      {f.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    <div className="flex flex-col leading-none mt-0.5">
                      <span className="mb-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-slate-455">
                        {f.label}
                      </span>
                      <span className="text-[12px] font-black text-slate-950 truncate max-w-[80px] 2xl:max-w-[95px]">
                        {f.value}
                      </span>
                    </div>

                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pl-3 md:border-l border-slate-100 justify-end h-10">
              <p className="text-[12px] font-bold text-slate-400 shrink-0">{totalItems} resultados</p>
            </div>
          </div>

          {/* 7. Bulk Actions Row (Unified max h-[42px] Layout) */}
          <div className="flex items-center justify-between px-1 shrink-0 gap-4 h-[42px] max-h-[42px]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#FAF8FF] border border-[#E8DDFD] px-3 py-1.5 rounded-xl shadow-sm h-[32px]">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === currentGateways.length && currentGateways.length > 0}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer"
                />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{selectedIds.length} selecionados</span>
              </div>

              {/* Bulk operations dropdown */}
              <div className="relative">
                <select
                  disabled={selectedIds.length === 0}
                  onChange={(e) => {
                     handleBulkAction(e.target.value);
                     e.target.value = "";
                  }}
                  className={cn(
                    "appearance-none pl-3 pr-8 py-1.5 bg-white border border-[#E8DDFD] rounded-xl text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer h-[32px] focus:outline-none focus:ring-1 focus:ring-brand shadow-sm",
                    selectedIds.length === 0 ? "opacity-40 cursor-not-allowed pointer-events-none" : "hover:bg-brand-soft"
                  )}
                >
                  <option value="">Ações em lote</option>
                  <option value="ativar">🟢 Ativar gateways</option>
                  <option value="desativar">⚪ Desativar gateways</option>
                  <option value="producao">🚀 Ambiente: Produção</option>
                  <option value="sandbox">🛠️ Ambiente: Sandbox</option>
                  <option value="revalidar">🔄 Revalidar conexões</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Empty search fallback */}
          {totalItems === 0 && (
            <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-12 flex flex-col items-center justify-center text-center gap-3 shadow-sm h-[320px]">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-slate-900 font-black text-sm">Nenhum provedor corresponde à busca</h4>
              <p className="text-slate-400 text-[11px] font-bold">Limpe os filtros de status e ambiente ou redefina o texto de pesquisa.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setFilterStatus('Todos');
                  setFilterAmbiente('Todos');
                  setFilterSistema('Todos');
                  setFilterConta('Todos');
                }}
                className="px-3.5 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 text-[10px] font-black uppercase rounded-lg transition-all text-slate-700 h-[32px] mt-1"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* 8. MAIN GATEWAYS TABLE */}
          {totalItems > 0 && (
            <div className="w-full min-w-0 overflow-hidden rounded-[24px] border border-[#E8DDFD] bg-white/80 shadow-sm shrink-0">
              <div className="w-full overflow-x-auto no-scrollbar">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="border-b border-[#E8DDFD]/60 bg-[#FAF8FF]/60 select-none">
                      <th className="w-[36px] px-2 py-3 text-center"></th>
                      <th className="w-[18%] min-w-0 px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Gateway</th>
                      <th className="w-[14%] min-w-0 px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                      <th className="w-[10%] min-w-0 px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Taxa</th>
                      <th className="w-[10%] min-w-0 px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Último erro</th>
                      <th className="w-[10%] min-w-0 px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Carga</th>
                      <th className="w-[14%] min-w-0 px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Conta</th>
                      <th className="w-[10%] min-w-0 px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Health</th>
                      <th className="w-[14%] min-w-0 pr-4 pl-1 py-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DDFD]/40">
                    {currentGateways.map((g) => {
                      const isHighApro = g.aprovacao !== '—' && parseFloat(g.aprovacao.replace(',', '.')) >= 95;
                      const isLowApro = g.aprovacao !== '—' && parseFloat(g.aprovacao.replace(',', '.')) < 90;
                      const isNegative = g.pp.startsWith('-');
                      
                      return (
                        <tr 
                          key={g.id} 
                          className={cn(
                            "group hover:bg-brand-50/20 transition-colors h-[64px]",
                            selectedIds.includes(g.id) && "bg-brand-soft/20"
                          )}
                        >
                          {/* Selection Checkbox */}
                          <td className="px-2 py-3 text-center w-[36px]">
                            <input 
                              type="checkbox" 
                              checked={selectedIds.includes(g.id)}
                              onChange={() => toggleSelect(g.id)}
                              className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand cursor-pointer"
                            />
                          </td>

                          {/* Gateway identity */}
                          <td className="min-w-0 px-3 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <ProviderLogo name={g.name} />
                              <div className="min-w-0 leading-tight">
                                <Link 
                                  href={`/dashboard/gateways/${g.id}`}
                                  className="block font-black text-slate-950 text-[13.5px] leading-tight hover:text-brand transition-colors whitespace-nowrap"
                                >
                                  {g.name}
                                </Link>
                                <p className="text-[10.5px] font-bold text-slate-400/85 mt-0.5 truncate leading-none">
                                  {g.desc}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Estado (Merged columns) */}
                          <td className="min-w-0 px-3 py-3">
                            <div className="flex flex-col gap-1 items-start leading-none">
                              {g.ambiente === 'Produção' ? (
                                <span className="inline-flex px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-green-50 text-green-700 border border-green-200/50 shadow-sm shadow-green-100 animate-none">
                                  Produção
                                </span>
                              ) : (
                                <span className="inline-flex px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200/50">
                                  Sandbox
                                </span>
                              )}
                              
                              <span className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-black uppercase border",
                                g.status === 'Operacional' && "bg-green-50 border-green-200/50 text-green-700",
                                g.status === 'Atenção' && "bg-amber-50 border-amber-200/50 text-amber-700",
                                g.status === 'Instável' && "bg-red-50 border-red-200/50 text-red-700 animate-pulse",
                                g.status === 'Desativado' && "bg-slate-50 border-slate-200/50 text-slate-500"
                              )}>
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  g.status === 'Operacional' && "bg-green-500",
                                  g.status === 'Atenção' && "bg-amber-500",
                                  g.status === 'Instável' && "bg-red-500 animate-ping",
                                  g.status === 'Desativado' && "bg-slate-400"
                                )} />
                                {g.status}
                              </span>
                            </div>
                          </td>

                          {/* Approval Metric */}
                          <td className="min-w-0 px-3 py-3">
                            {g.aprovacao === '—' ? (
                              <span className="text-sm font-bold text-slate-300">—</span>
                            ) : (
                              <div className="leading-tight">
                                <div className="flex items-center gap-0.5 font-black text-slate-900 text-[13px]">
                                  <span>{g.aprovacao}</span>
                                  <span className={cn("text-[10px] ml-0.5 shrink-0", isNegative ? "text-red-500" : "text-green-500")}>
                                    {isNegative ? '↘' : '↗'}
                                  </span>
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black block uppercase mt-0.5",
                                  isNegative ? "text-red-500" : "text-green-500"
                                )}>
                                  {g.pp}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Last error */}
                          <td className="min-w-0 px-3 py-3">
                            {g.erro && g.erro !== '—' && g.erro !== 'Sem erros recentes' ? (
                              <div>
                                <p className="truncate text-xs font-black text-red-655 leading-tight" title={g.erro}>
                                  {g.erro.includes('Timeout') ? 'Timeout auth' : 
                                   g.erro.includes('p95') ? 'p95 elevated' :
                                   g.erro.includes('500') ? 'Erros 500' :
                                   g.erro.includes('Sem atividade') ? 'Sem atividade' : 
                                   g.erro.split(' — ')[0]}
                                </p>
                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                  {g.erro.split(' — ')[1]?.replace('h ', 'há ') || 'há 14 min'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-slate-300">—</span>
                            )}
                          </td>

                          {/* Active Routes & Subs */}
                          <td className="min-w-0 px-3 py-3">
                            <div className="leading-tight min-w-0 flex flex-col gap-1.5">
                              <div>
                                {g.rotas === 0 ? (
                                  <span className="text-xs font-bold text-slate-400">0 rotas</span>
                                ) : (
                                  <>
                                    <span className="text-[11px] font-black text-slate-900 block truncate">
                                      {g.rotas} {g.rotas === 1 ? 'rota' : 'rotas'}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="bg-brand-soft/30 border border-brand/20 rounded-[4px] px-1 py-0.5 inline-flex items-center gap-1 w-max">
                                <span className="text-[8px] font-black text-slate-500 uppercase">Subs:</span>
                                <span className="text-[9.5px] font-black text-brand leading-none">{g.assinaturas} vivas</span>
                              </div>
                            </div>
                          </td>

                          {/* Default Account Link (Merged with systems/Escolha) */}
                          <td className="min-w-0 px-3 py-3">
                            {g.conta === 'Sem conta padrão' ? (
                              <button 
                                onClick={() => triggerSuccessAlert('Fluxo de vinculação de conta de recebimento iniciado!')}
                                className="text-[8.5px] font-black text-brand bg-brand-soft/40 border border-brand/20 px-2 py-0.5 rounded hover:bg-brand hover:text-white transition-all shadow-sm"
                              >
                                Configurar
                              </button>
                            ) : (
                              <div className="leading-tight min-w-0">
                                <span className="text-[12px] font-black text-slate-955 block truncate" title={g.conta}>
                                  {g.conta}
                                </span>
                                <span className="text-[10.5px] font-semibold text-slate-400 block mt-0.5">
                                  ID: {g.contaId}
                                </span>
                                {g.sistemas && g.sistemas.length > 0 && (
                                  <span className="text-[10.5px] font-bold text-slate-500 block mt-0.5 truncate" title={g.sistemas.join(', ')}>
                                    {g.sistemas[0]}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Health metrics */}
                          <td className="min-w-0 px-3 py-3">
                            {g.uptime === '—' ? (
                              <span className="text-sm font-bold text-slate-350">—</span>
                            ) : (
                              <div className="leading-tight text-[11px] font-bold text-slate-500">
                                <div className="flex items-center gap-1 font-black text-slate-900">
                                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", 
                                    g.status === 'Operacional' && "bg-green-500",
                                    g.status === 'Atenção' && "bg-amber-500",
                                    g.status === 'Instável' && "bg-red-500",
                                    g.status === 'Desativado' && "bg-slate-400"
                                  )} />
                                  <span className="truncate">{g.uptime}</span>
                                </div>
                                <p className="text-slate-400 text-[10px] font-semibold mt-0.5 truncate">
                                  p95 {g.p95}
                                </p>
                                <p className="text-slate-400 text-[10px] font-semibold truncate">
                                  {g.reqs}
                                </p>
                              </div>
                            )}
                          </td>

                          {/* Ações rápidas */}
                          <td className="min-w-0 pr-4 pl-1 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              {/* Integrated Toggle Switch */}
                              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mr-0.5">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={g.status !== 'Desativado'} 
                                  onChange={() => handleToggleActive(g)}
                                />
                                <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand"></div>
                              </label>

                              {/* Pill outline buttons */}
                              <Link 
                                href={`/dashboard/gateways/${g.id}`}
                                className="h-8 rounded-xl border border-[#E8DDFD] bg-white px-3 text-[11px] font-black text-slate-700 shadow-sm flex items-center justify-center transition-all hover:bg-brand-soft/40 hover:text-brand hover:border-brand/35 shrink-0"
                              >
                                Credenciais
                              </Link>

                              <Link 
                                href={`/dashboard/gateways/${g.id}`}
                                className="hidden 2xl:inline-flex h-8 rounded-xl border border-[#E8DDFD] bg-white px-3 text-[11px] font-black text-slate-700 shadow-sm items-center justify-center transition-all hover:bg-brand-soft/40 hover:text-brand hover:border-brand/35 shrink-0"
                              >
                                Health
                              </Link>

                              <Link 
                                href={`/dashboard/gateways/${g.id}`}
                                className="hidden 2xl:inline-flex h-8 rounded-xl border border-[#E8DDFD] bg-white px-3 text-[11px] font-black text-slate-700 shadow-sm items-center justify-center transition-all hover:bg-brand-soft/40 hover:text-brand hover:border-brand/35 shrink-0"
                              >
                                Sistemas
                              </Link>

                              {/* Vertical dots More Options button */}
                              <div className="relative shrink-0">
                                <button 
                                  onClick={() => setActiveMenuId(activeMenuId === g.id ? null : g.id)}
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8DDFD] bg-white shadow-sm hover:bg-slate-50 transition-all text-slate-500 hover:text-brand",
                                    activeMenuId === g.id && "border-brand/40 text-brand bg-slate-50"
                                  )}
                                >
                                  <MoreVertical className="h-4 w-4 text-slate-500" />
                                </button>

                                {activeMenuId === g.id && (
                                  <div className="absolute right-0 bottom-full mb-1 w-[160px] bg-white rounded-2xl border border-[#E8DDFD] shadow-2xl p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
                                    {[
                                      { label: 'Sistemas Vinculados', icon: Network, action: () => triggerSuccessAlert(`Redirecionando para sistemas conectados ao gateway "${g.name}"...`) },
                                      { label: 'Histórico de Health', icon: Activity, action: () => triggerSuccessAlert(`Redirecionando para histórico de health de "${g.name}"...`) },
                                      { label: 'Credenciais', icon: Key, action: () => triggerSuccessAlert('Visualização de credenciais mascaradas ativada!') },
                                      { label: 'Configurar Rotas', icon: Network, action: () => triggerSuccessAlert('Redirecionando para roteamento inteligente...') },
                                      { label: 'Definir como Padrão', icon: ShieldCheck, disabled: g.status === 'Desativado', action: () => triggerSuccessAlert(`Gateway "${g.name}" definido como padrão da empresa!`) },
                                      { label: 'Desativar Provedor', icon: Pause, disabled: g.status === 'Desativado', action: () => handleToggleActive(g) },
                                    ].map((mi) => (
                                      <button
                                        key={mi.label}
                                        disabled={mi.disabled}
                                        onClick={() => {
                                          mi.action();
                                          setActiveMenuId(null);
                                        }}
                                        className="w-full text-left px-2.5 py-1.5 text-[10.5px] font-bold text-slate-700 hover:bg-brand-soft/40 hover:text-brand rounded-lg flex items-center gap-2 transition-all disabled:opacity-40"
                                      >
                                        <mi.icon className="w-3 h-3 text-slate-400 shrink-0" />
                                        {mi.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. Pagination controls */}
          <div className="flex items-center justify-between border-t border-[#E8DDFD]/60 pt-3 px-1 w-full shrink-0 select-none h-[58px]">
            <p className="text-[12.5px] font-bold text-slate-400">
              Mostrando <span className="text-slate-700">{startIndex + 1} a {endIndex}</span> de <span className="text-slate-700">{totalItems}</span> gateways
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="w-8 h-8 rounded-xl border border-[#E8DDFD] bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[12.5px] font-black text-brand bg-brand-soft/40 border border-brand/20 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
                {currentPage}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="w-8 h-8 rounded-xl border border-[#E8DDFD] bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-brand transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-slate-400">
              <span>Itens por página:</span>
              <span className="text-slate-700 font-black bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-lg">5</span>
            </div>
          </div>

          {/* 10. DIAGNOSTICS BOTTOM GRID (The 3 Operational Cards) */}
          <div className="mt-2.5 grid grid-cols-1 gap-3 xl:grid-cols-3 w-full select-none pt-1">
            
            {/* Card 1: Resumo de Status */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 leading-none">Resumo de Status</span>
                
                {/* 4 horizontal columns for each status as in reference screen */}
                <div className="grid grid-cols-4 gap-1 mt-1 shrink-0">
                  {[
                    { label: 'Operacionais', count: gateways.filter(g => g.status === 'Operacional').length, pct: '75%', color: 'bg-green-500', bg: 'bg-green-50/30 border-green-100 text-green-700' },
                    { label: 'Atenção', count: gateways.filter(g => g.status === 'Atenção').length, pct: '12,5%', color: 'bg-amber-500', bg: 'bg-amber-50/30 border-amber-100 text-amber-700' },
                    { label: 'Instáveis', count: gateways.filter(g => g.status === 'Instável').length, pct: '12,5%', color: 'bg-red-500', bg: 'bg-red-50/30 border-red-100 text-red-700' },
                    { label: 'Desativados', count: gateways.filter(g => g.status === 'Desativado').length, pct: '12,5%', color: 'bg-slate-400', bg: 'bg-slate-50 border-slate-200 text-slate-600' },
                  ].map((st) => (
                    <button 
                      key={st.label}
                      onClick={() => {
                        setFilterStatus(filterStatus === st.label ? 'Todos' : st.label);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-between p-1 rounded-xl border text-center transition-all hover:scale-[1.02] shadow-sm h-[60px]",
                        st.bg,
                        filterStatus === st.label ? "ring-2 ring-brand/50 border-brand/50 bg-brand-soft/20" : ""
                      )}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[16px] font-black text-slate-900 leading-none">{st.count}</span>
                        <span className="text-[9px] font-bold text-slate-500 leading-none mt-0.5">{st.label}</span>
                      </div>
                      <span className="text-[8px] font-black text-slate-400 block mt-0.5">{st.pct}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Segmented Color Progress Bar representing distribution */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200/50">
                  <div className="h-full bg-green-500 transition-all" style={{ width: '75%' }} title="Operacionais (75%)" />
                  <div className="h-full bg-amber-500 transition-all" style={{ width: '12.5%' }} title="Atenção (12.5%)" />
                  <div className="h-full bg-red-500 transition-all" style={{ width: '12.5%' }} title="Instáveis (12.5%)" />
                  <div className="h-full bg-slate-400 transition-all" style={{ width: '12.5%' }} title="Desativados (12.5%)" />
                </div>
              </div>
            </div>

            {/* Card 2: Alertas Técnicos Recentes */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2 leading-none">Alertas Técnicos Recentes</span>
                
                <div className="space-y-1 shrink-0">
                  {[
                    { prov: 'Banco do Brasil PIX', msg: 'Erros 500 intermitentes', desc: 'Falhas intermitentes no endpoint de autorização PIX', time: 'há 28 min', level: 'Instável', dotColor: 'bg-red-500', badgeStyle: 'bg-red-50 text-red-600 border border-red-200' },
                    { prov: 'Stripe', msg: 'Timeout na autorização', desc: 'Aumento no tempo de resposta em autorizações cartão', time: 'há 14 min', level: 'Atenção', dotColor: 'bg-amber-500', badgeStyle: 'bg-amber-50 text-amber-600 border border-amber-200' },
                    { prov: 'Pagar.me', msg: 'Latência acima do normal', desc: 'p95 acima de 300ms nas consultas de saldo', time: 'há 2 h', level: 'Atenção', dotColor: 'bg-amber-500', badgeStyle: 'bg-amber-50 text-amber-600 border border-amber-200' },
                    { prov: 'Cielo', msg: 'p95 elevado', desc: 'Aumento de latência nas capturas', time: 'há 5 h', level: 'Atenção', dotColor: 'bg-amber-500', badgeStyle: 'bg-amber-50 text-amber-600 border border-amber-200' },
                  ].map((al, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10.5px] font-bold p-0.5 px-1 hover:bg-slate-50 rounded-xl transition-all border border-transparent">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 animate-pulse", al.dotColor)} />
                        <div className="min-w-0 leading-tight">
                          <span className="font-black text-slate-900 block truncate">
                            {al.prov} — {al.msg}
                          </span>
                          <span className="text-[9.5px] text-slate-450 font-bold block truncate mt-0.5">
                            {al.desc}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className={cn("px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase tracking-wider", al.badgeStyle)}>
                          {al.level}
                        </span>
                        <span className="text-[8.5px] font-bold text-slate-400">{al.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-right">
                <button 
                  onClick={() => triggerSuccessAlert('Redirecionando para central de monitoramento global...')}
                  className="text-[9.5px] font-black text-brand hover:text-brand-deep hover:underline inline-flex items-center gap-1 uppercase tracking-tight"
                >
                  Ver todos os alertas <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Card 3: Pontos de Atenção */}
            <div className="bg-white rounded-2xl border border-[#E8DDFD] p-3 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(76,29,149,0.04)] transition-all duration-300">
              <div>
                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 leading-none">Pontos de Atenção</span>
                
                <div className="space-y-1 shrink-0">
                  {[
                    {
                      title: '1 conta padrão com inconsistências',
                      desc: 'Adyen Sandbox não possui conta padrão configurada',
                      action: 'Ver detalhes',
                      href: '/dashboard/gateways/adyen'
                    },
                    {
                      title: '1 gateway sem rotas ativas',
                      desc: 'Adyen Sandbox não possui rotas configuradas',
                      action: 'Ver rotas',
                      href: '/dashboard/routing'
                    },
                    {
                      title: '2 sistemas precisam de revisão',
                      desc: 'Assinaturas e PDV com dependências de gateway instáveis',
                      action: 'Ver sistemas',
                      href: '/dashboard/systems'
                    },
                    {
                      title: '1 sistema com falhas de roteamento',
                      desc: 'Banco do Brasil PIX apresentando falhas recorrentes',
                      action: 'Ver sistemas',
                      href: '/dashboard/systems'
                    }
                  ].map((at, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10.5px] font-bold p-0.5 px-1 border border-slate-100/50 hover:bg-slate-50 rounded-xl transition-all">
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-brand/35" />
                        <div className="min-w-0 leading-tight">
                          <span className="font-black text-slate-900 block truncate">{at.title}</span>
                          <span className="text-[9.5px] text-slate-400 font-bold block truncate mt-0.5">{at.desc}</span>
                        </div>
                      </div>
                      <Link 
                        href={at.href}
                        className="text-[9px] font-black text-brand hover:underline shrink-0 ml-2 uppercase tracking-tight"
                      >
                        {at.action}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </main>
  );
}
