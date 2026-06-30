'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { 
  Plus, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  List, 
  MoreVertical,
  Activity,
  AlertCircle,
  Copy,
  Play,
  Archive,
  Layers,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  X,
  Monitor,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckoutStatusBadge } from '@/components/checkouts/CheckoutStatusBadge';
import { CheckoutPreviewThumbnail } from '@/components/checkouts/CheckoutPreviewThumbnail';
import { CheckoutsSummary } from '@/components/checkouts/CheckoutsSummary';

const CHECKOUT_STATUS_MAP: Record<string, string> = {
  published: 'Publicado',
  draft: 'Rascunho',
  paused: 'Pausado',
  archived: 'Arquivado',
};

function apiCheckoutToPage(c: any) {
  return {
    id: c.uuid || `chk_${c.id}`,
    name: c.name || 'Checkout',
    system: c.system?.name || '—',
    status: CHECKOUT_STATUS_MAP[c.status] || c.status || 'Rascunho',
    version: c.published_version?.version || 'v1.0.0',
    conversion: '—',
    lastUpdate: c.created_at ? new Date(c.created_at).toLocaleString('pt-BR') : '—',
    slug: c.slug || '',
    canal: '—',
    type: '—',
  };
}

export default function CheckoutsPage() {
  const router = useRouter();
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Table view vs Gallery view toggle
  const [viewMode, setViewMode] = useState<'galeria' | 'lista'>('galeria');

  const fetchCheckouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API bypass for frontend mock:
      setCheckouts([]);
    } catch {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckouts();
  }, [fetchCheckouts]);

  // Active filters
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Todos' | 'Publicados' | 'Rascunhos' | 'Pausados'>('Todos');
  const [filterSystem, setFilterSystem] = useState('Todos');
  const [filterType, setFilterType] = useState('Todos');
  const [filterCanal, setFilterCanal] = useState('Todos');

  // Modals state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [modalPublishItem, setModalPublishItem] = useState<any | null>(null);
  const [modalArchiveItem, setModalArchiveItem] = useState<any | null>(null);

  // Action Success Alerts
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  // Pagination current page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Unique lists for filters
  const systemsList = useMemo(() => ['Todos', ...Array.from(new Set(checkouts.map(c => c.system)))], [checkouts]);
  const typesList = useMemo(() => ['Todos', ...Array.from(new Set(checkouts.map(c => c.type)))], [checkouts]);
  const canaisList = useMemo(() => ['Todos', ...Array.from(new Set(checkouts.map(c => c.canal)))], [checkouts]);

  // Handle modal confirmations
  const handleConfirmPublish = () => {
    if (!modalPublishItem) return;
    setCheckouts(prev => prev.map(c => 
      c.id === modalPublishItem.id 
        ? { ...c, status: 'Publicado', version: 'v2.0.1', lastUpdate: 'agora mesmo', conversion: '80,00%' }
        : c
    ));
    triggerSuccessAlert(`Checkout "${modalPublishItem.name}" foi publicado com sucesso na versão v2.0.1!`);
    setModalPublishItem(null);
  };

  const handleConfirmArchive = () => {
    if (!modalArchiveItem) return;
    setCheckouts(prev => prev.map(c => 
      c.id === modalArchiveItem.id 
        ? { ...c, status: 'Arquivado', lastUpdate: 'agora mesmo' }
        : c
    ));
    triggerSuccessAlert(`Checkout "${modalArchiveItem.name}" foi arquivado com sucesso!`);
    setModalArchiveItem(null);
  };

  const handleCreateCheckout = async () => {
    if (isCreating) return;
    setIsCreating(true);
    // Simulate UI flow without actual backend API
    setTimeout(() => {
      const mockId = `chk_${Math.floor(Math.random() * 10000)}`;
      router.push(`/dashboard/checkouts/${mockId}/studio`);
    }, 500);
  };

  const triggerSuccessAlert = (message: string) => {
    setSuccessAlert(message);
    setTimeout(() => {
      setSuccessAlert(null);
    }, 4500);
  };

  // Filtered checkouts logic
  const filteredCheckouts = useMemo(() => {
    return checkouts.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.slug.toLowerCase().includes(search.toLowerCase()) ||
                          item.system.toLowerCase().includes(search.toLowerCase()) ||
                          item.version.toLowerCase().includes(search.toLowerCase());
      
      // Map Tab to standard status
      let matchStatus = true;
      if (activeTab === 'Publicados') matchStatus = item.status === 'Publicado';
      else if (activeTab === 'Rascunhos') matchStatus = item.status === 'Rascunho';
      else if (activeTab === 'Pausados') matchStatus = item.status === 'Pausado';

      const matchSystem = filterSystem === 'Todos' || item.system === filterSystem;
      const matchType = filterType === 'Todos' || item.type === filterType;
      const matchCanal = filterCanal === 'Todos' || item.canal === filterCanal;

      return matchSearch && matchStatus && matchSystem && matchType && matchCanal;
    });
  }, [checkouts, search, activeTab, filterSystem, filterType, filterCanal]);

  // Paginated checkouts
  const totalItems = filteredCheckouts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentCheckouts = useMemo(() => {
    return filteredCheckouts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCheckouts, startIndex, itemsPerPage]);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col gap-2.5 2xl:gap-3.5 relative min-h-0 select-none pb-4">
      


      {/* Success Notification Alert */}
      {successAlert && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white p-3.5 rounded-2xl shadow-xl shadow-green-900/10 flex items-center justify-between gap-3 max-w-sm animate-in slide-in-from-top-4 duration-300 border border-green-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span className="text-[11.5px] font-bold">{successAlert}</span>
          </div>
          <button onClick={() => setSuccessAlert(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Page Header */}
      <header className="flex items-center justify-between w-full px-1 shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[23px] 2xl:text-[25px] font-black tracking-tighter text-slate-950 leading-none">Checkouts</h1>
            <TrendingUp className="w-4 h-4 text-brand-accent mt-0.5 animate-pulse" />
          </div>
          <p className="text-slate/50 font-bold text-[11px] 2xl:text-[12px] tracking-tight">
            Gerencie checkouts publicados, rascunhos, pausados e versões.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E8DDFD] rounded-xl text-[10px] 2xl:text-[11px] font-black text-slate-700 shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-[34px] 2xl:h-[36px]">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Exportar
            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
          </button>
          
          <button 
            disabled={isCreating}
            onClick={handleCreateCheckout}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-brand text-white rounded-xl text-[10px] 2xl:text-[11px] font-black shadow-lg shadow-brand/10 hover:shadow-brand/35 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight h-[34px] 2xl:h-[36px] disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isCreating ? <Loader2 className="w-3.5 h-3.5 text-white/80 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-white/80" />}
            {isCreating ? 'Criando...' : 'Novo checkout'}
          </button>
        </div>
      </header>

      {/* RENDER BASED ON REAL STATE */}
      {loading && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-20 flex flex-col items-center justify-center gap-4 shadow-sm h-[400px]">
          <Loader2 className="animate-spin text-brand w-8 h-8" />
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Carregando checkouts...</p>
        </div>
      )}

      {!loading && error && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-16 flex flex-col items-center justify-center text-center gap-4 shadow-sm h-[400px]">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-slate-950 font-black text-base">Não foi possível carregar os checkouts</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto font-medium">{error}</p>
          </div>
          <button 
            onClick={fetchCheckouts}
            className="px-4 py-2 bg-brand hover:bg-brand-deep text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all h-[34px]"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && checkouts.length === 0 && (
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-16 flex flex-col items-center justify-center text-center gap-5 shadow-sm h-[400px]">
          <div className="w-16 h-16 rounded-full bg-[#FAF8FF] border border-[#E8DDFD] flex items-center justify-center text-violet-400">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-slate-950 font-black text-base">Nenhum checkout criado ainda</h3>
            <p className="text-slate-500 text-xs mt-1.5 max-w-sm mx-auto font-medium leading-relaxed">
              Crie sua primeira experiência de checkout personalizada para começar a vender.
            </p>
          </div>
          <button 
            disabled={isCreating}
            onClick={handleCreateCheckout}
            className="px-5 py-2.5 bg-brand hover:bg-brand-deep text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider shadow-lg shadow-brand/15 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isCreating && <Loader2 className="w-4 h-4 text-white/80 animate-spin" />}
            {isCreating ? 'Criando...' : 'Criar primeiro checkout'}
          </button>
        </div>
      )}

      {!loading && !error && checkouts.length > 0 && (
        <>
          {/* 2. Advanced Filters Bar */}
          <div className="bg-white p-2.5 rounded-[22px] border border-[#E8DDFD] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm w-full shrink-0 select-none">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5 flex-1 min-w-0">
              {/* Search input with same h-12 height */}
              <div className="relative w-full md:w-[250px] 2xl:w-[280px] shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar por nome, sistema, slug ou versão"
                  className="w-full pl-10 pr-4 bg-white border border-[#E8DDFD] rounded-2xl text-[12.5px] font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/35 transition-all h-12 shadow-sm"
                />
              </div>
              
              {/* Dropdowns */}
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { label: 'Status', value: activeTab, setter: (val: any) => { setActiveTab(val); setCurrentPage(1); }, options: ['Todos', 'Publicados', 'Rascunhos', 'Pausados'] },
                  { label: 'Sistema', value: filterSystem, setter: setFilterSystem, options: systemsList },
                  { label: 'Tipo', value: filterType, setter: setFilterType, options: typesList },
                  { label: 'Canal', value: filterCanal, setter: setFilterCanal, options: canaisList },
                ].map((f) => (
                  <div 
                    key={f.label} 
                    className="relative shrink-0 flex h-12 min-w-[130px] 2xl:min-w-[140px] items-center justify-between rounded-2xl border border-[#E8DDFD] bg-white hover:bg-brand-soft/20 transition-all px-4"
                  >
                    {/* Native invisible select overlays the block for mobile/standard clicks */}
                    <select
                      value={f.value}
                      onChange={(e) => { f.setter(e.target.value); setCurrentPage(1); }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    >
                      {f.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    
                    {/* Custom high fidelity select markup underneath */}
                    <div className="flex flex-col leading-none">
                      <span className="mb-0.5 text-[8.5px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {f.label}
                      </span>
                      <span className="text-[12.5px] font-black text-slate-950 truncate max-w-[85px] 2xl:max-w-[100px]">
                        {f.value}
                      </span>
                    </div>

                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pl-3 md:border-l border-slate-100 justify-end h-12">
              <p className="text-[12.5px] font-bold text-slate-400 shrink-0">{totalItems} resultados</p>
            </div>
          </div>

          {/* 3. Abas & View Toggle row */}
          <div className="flex items-center justify-between border-b border-[#E8DDFD]/60 pb-0 px-1 w-full shrink-0">
            <div className="flex gap-6">
              {(['Todos', 'Publicados', 'Rascunhos', 'Pausados'] as const).map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "pb-2 text-[12.5px] font-black relative transition-all tracking-tight",
                      isActive ? "text-brand" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Toggle visual mode */}
            <div className="flex bg-[#EFE9FF] p-0.5 rounded-xl border border-[#E8DDFD] shadow-sm shrink-0 mb-1">
              <button
                onClick={() => setViewMode('galeria')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-tight transition-all shrink-0 flex items-center gap-1.5",
                  viewMode === 'galeria' ? "bg-brand text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Grid className="w-3.5 h-3.5" />
                Galeria
              </button>
              <button
                onClick={() => setViewMode('lista')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10.5px] font-black uppercase tracking-tight transition-all shrink-0 flex items-center gap-1.5",
                  viewMode === 'lista' ? "bg-brand text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </button>
            </div>
          </div>

          {/* Empty filtered list */}
          {totalItems === 0 && (
            <div className="w-full bg-white/60 backdrop-blur-md rounded-[24px] border border-[#E8DDFD] p-12 flex flex-col items-center justify-center text-center gap-3 shadow-sm h-[320px]">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-slate-900 font-black text-sm">Nenhum checkout corresponde aos filtros</h4>
              <p className="text-slate-400 text-[11px] font-bold">Limpe a busca ou redefina as seleções para encontrar as experiências.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setActiveTab('Todos');
                  setFilterSystem('Todos');
                  setFilterType('Todos');
                  setFilterCanal('Todos');
                }}
                className="px-3.5 py-1.5 border border-[#E8DDFD] hover:bg-slate-50 text-[10px] font-black uppercase rounded-lg transition-all text-slate-700 h-[32px] mt-1"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* 4. MAIN CHECKOUTS RENDER */}
          {totalItems > 0 && viewMode === 'galeria' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
              {currentCheckouts.map((chk) => {
                const isHighConversion = chk.conversion !== '—' && parseFloat(chk.conversion.replace(',', '.')) >= 80;
                const isMediumConversion = chk.conversion !== '—' && parseFloat(chk.conversion.replace(',', '.')) >= 60 && parseFloat(chk.conversion.replace(',', '.')) < 80;
                const isLowConversion = chk.conversion !== '—' && parseFloat(chk.conversion.replace(',', '.')) < 60;

                return (
                  <div 
                    key={chk.id}
                    className="group bg-white rounded-[22px] border border-[#E8DDFD] shadow-[0_4px_20px_rgba(76,29,149,0.02)] p-4 flex flex-col justify-between hover:shadow-[0_10px_35px_rgba(76,29,149,0.08)] hover:border-brand/40 transition-all duration-300 min-w-0"
                  >
                    {/* Top Row: Thumbnail + Textual details side by side */}
                    <div className="flex gap-3.5 items-start">
                      {/* Left: Beautiful mini checkout thumbnail */}
                      <div className="w-[125px] h-[85px] rounded-xl border border-[#E8DDFD] overflow-hidden shrink-0 shadow-sm">
                        <CheckoutPreviewThumbnail slug={chk.slug} />
                      </div>
                      
                      {/* Right: Info columns */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-[13px] 2xl:text-[13.5px] font-black text-slate-950 truncate leading-tight group-hover:text-brand transition-colors" title={chk.name}>
                          {chk.name}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Monitor className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{chk.system}</span>
                        </div>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <CheckoutStatusBadge status={chk.status} />
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50">
                            {chk.version}
                          </span>
                        </div>

                        {/* Conversão / Último Update Grid */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 mt-1 shrink-0">
                          <div className="min-w-0">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none block">Taxa de Conversão</span>
                            <span className={cn(
                              "text-[12px] font-black leading-tight block mt-0.5",
                              isHighConversion && "text-green-600",
                              isMediumConversion && "text-amber-500",
                              isLowConversion && "text-red-500",
                              chk.conversion === '—' && "text-slate-350"
                            )}>
                              {chk.conversion}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none block">Último Update</span>
                            <span className="text-[9.5px] font-bold text-slate-700 leading-tight block mt-0.5 truncate">
                              {chk.lastUpdate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: Action Buttons */}
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-dashed border-[#E8DDFD]/60 justify-between shrink-0">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {chk.status === 'Pausado' ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input type="checkbox" className="sr-only peer" defaultChecked={false} onChange={() => triggerSuccessAlert(`Status do checkout alterado!`)} />
                              <div className="w-7 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-brand"></div>
                              <span className="ml-1 text-[9px] font-black text-slate-500 uppercase tracking-wider">Ativo</span>
                            </label>
                            
                            <button 
                              onClick={() => triggerSuccessAlert(`Checkout duplicado!`)}
                              className="h-[28px] px-2.5 border border-[#E8DDFD] bg-white hover:bg-slate-50 transition-all rounded-lg text-[9.5px] font-black text-slate-700"
                            >
                              Duplicar
                            </button>

                            <button 
                              onClick={() => router.push(`/dashboard/checkouts/${chk.id}/studio`)}
                              className="h-[28px] px-2.5 border border-[#E8DDFD] bg-white hover:bg-slate-50 transition-all rounded-lg text-[9.5px] font-black text-slate-700"
                            >
                              Abrir no Studio
                            </button>
                          </div>
                        ) : chk.status === 'Rascunho' ? (
                          <>
                            <button 
                              onClick={() => router.push(`/dashboard/checkouts/${chk.id}/studio`)}
                              className="h-[28px] px-2.5 border border-[#E8DDFD] bg-white hover:bg-slate-50 transition-all rounded-lg text-[9.5px] font-black text-slate-700"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => triggerSuccessAlert(`Duplicado!`)}
                              className="h-[28px] px-2.5 border border-[#E8DDFD] bg-white hover:bg-slate-50 transition-all rounded-lg text-[9.5px] font-black text-slate-700"
                            >
                              Duplicar
                            </button>
                            <button 
                              onClick={() => setModalPublishItem(chk)}
                              className="h-[28px] px-2.5 bg-brand text-white hover:bg-brand-deep transition-all rounded-lg text-[9.5px] font-black flex items-center gap-1 shadow-sm uppercase tracking-tight"
                            >
                              <Play className="w-2.5 h-2.5 text-white/80" /> Publicar
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => router.push(`/dashboard/checkouts/${chk.id}/studio`)}
                              className="h-[28px] px-2.5 border border-[#E8DDFD] bg-white hover:bg-slate-50 transition-all rounded-lg text-[9.5px] font-black text-slate-700"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => triggerSuccessAlert(`Duplicado!`)}
                              className="h-[28px] px-2.5 border border-[#E8DDFD] bg-white hover:bg-slate-50 transition-all rounded-lg text-[9.5px] font-black text-slate-700"
                            >
                              Duplicar
                            </button>
                            <button 
                              onClick={() => router.push(`/dashboard/checkouts/${chk.id}/studio`)}
                              className="h-[28px] px-3 bg-[#FAF8FF] border border-brand/20 text-brand hover:bg-brand hover:text-white transition-all rounded-lg text-[9.5px] font-black flex items-center gap-1 shadow-sm"
                            >
                              Abrir no Studio
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* Three dot popup */}
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === chk.id ? null : chk.id)}
                          className={cn(
                            "w-[28px] h-[28px] border border-[#E8DDFD] bg-white hover:bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand transition-all",
                            activeMenuId === chk.id && "border-brand/40 text-brand bg-slate-50"
                          )}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </button>

                        {activeMenuId === chk.id && (
                          <div className="absolute right-0 bottom-full mb-1 w-[150px] bg-white rounded-xl border border-[#E8DDFD] shadow-xl p-1 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {[
                              { label: 'Copiar Link', icon: Copy, action: () => triggerSuccessAlert(`Link copiado!`) },
                              { label: 'Ver Métricas', icon: Activity, action: () => triggerSuccessAlert(`Abrindo relatório de métricas...`) },
                              { label: 'Arquivar', icon: Archive, disabled: chk.status === 'Arquivado', action: () => setModalArchiveItem(chk) },
                            ].map((mi) => (
                              <button
                                key={mi.label}
                                disabled={mi.disabled}
                                onClick={() => {
                                  mi.action();
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-brand-soft/40 hover:text-brand rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-40"
                              >
                                <mi.icon className="w-3 h-3" />
                                {mi.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata labels */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-3 text-[9px] text-slate-400 font-bold shrink-0">
                      <span>Slug: {chk.slug}</span>
                      <span>•</span>
                      <span>Canal: {chk.canal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW TABLE MODE */}
          {totalItems > 0 && viewMode === 'lista' && (
            <div className="w-full min-w-0 overflow-hidden rounded-[24px] border border-[#E8DDFD] bg-white/85 shadow-sm shrink-0">
              <div className="w-full overflow-x-hidden">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr className="border-b border-[#E8DDFD]/60 bg-slate-50/50">
                      <th className="w-[42px] px-2 py-2.5"></th>
                      {[
                        { name: 'Checkout / Sistema', width: '25%' },
                        { name: 'Status / Versão', width: '15%' },
                        { name: 'Canal', width: '12%' },
                        { name: 'Conversão', width: '12%' },
                        { name: 'Última Atividade', width: '16%' },
                        { name: 'Ações rápidas', width: '20%' }
                      ].map((h) => (
                        <th key={h.name} style={{ width: h.width }} className={cn("py-2.5 text-[9.5px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap", h.name === 'Ações rápidas' ? 'pl-2 pr-3' : 'px-2')}>
                          {h.name} <ChevronDown className="inline-block w-3 h-3 ml-0.5 opacity-30" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {currentCheckouts.map((chk) => {
                      const isHighConversion = chk.conversion !== '—' && parseFloat(chk.conversion.replace(',', '.')) >= 80;
                      const isMediumConversion = chk.conversion !== '—' && parseFloat(chk.conversion.replace(',', '.')) >= 60 && parseFloat(chk.conversion.replace(',', '.')) < 80;
                      const isLowConversion = chk.conversion !== '—' && parseFloat(chk.conversion.replace(',', '.')) < 60;

                      return (
                        <tr key={chk.id} className="group hover:bg-brand-50/20 transition-all h-[74px]">
                          <td className="px-2 py-3.5">
                            <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand transition-all cursor-pointer animate-in fade-in" />
                          </td>
                          <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                            <div className="min-w-0">
                              <span className="block max-w-full truncate font-black text-slate-950 text-[13.5px] leading-tight">
                                {chk.name}
                              </span>
                              <p className="text-[10.5px] font-bold text-slate-400 truncate tracking-tight mt-0.5">
                                {chk.system} • <span className="font-mono text-[9px]">{chk.slug}</span>
                              </p>
                            </div>
                          </td>
                          <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <CheckoutStatusBadge status={chk.status} />
                              <span className="text-[9.5px] font-bold text-slate-400 px-1 py-0.5 bg-slate-50 rounded border border-slate-200/50">
                                {chk.version}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                            <span className="text-[11.5px] font-black text-slate-700 uppercase tracking-wider">{chk.canal}</span>
                          </td>
                          <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                            <p className={cn(
                              "text-[13px] font-black leading-tight",
                              isHighConversion && "text-green-600",
                              isMediumConversion && "text-amber-500",
                              isLowConversion && "text-red-500",
                              chk.conversion === '—' && "text-slate-300"
                            )}>
                              {chk.conversion}
                            </p>
                          </td>
                          <td className="px-2 py-3.5 min-w-0 overflow-hidden whitespace-nowrap">
                            <div className="space-y-0.5">
                              <p className="text-[12.5px] font-black text-slate-950 leading-none">{chk.lastUpdate}</p>
                              <p className="text-[10px] font-bold text-slate-400 leading-none">{chk.type}</p>
                            </div>
                          </td>
                          <td className="pl-2 pr-3 py-3.5 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-1 relative">
                              <button 
                                onClick={() => router.push(`/dashboard/checkouts/${chk.id}/studio`)}
                                className="h-[34px] px-2.5 border border-[#E8DDFD] bg-white hover:bg-slate-50 hover:border-brand/40 transition-all rounded-xl text-[10px] font-black text-slate-955 shrink-0"
                              >
                                Editar
                              </button>
                              
                              <button 
                                onClick={() => router.push(`/dashboard/checkouts/${chk.id}/studio`)}
                                className="h-[34px] px-2.5 bg-brand/10 border border-brand/20 text-brand hover:bg-brand hover:text-white transition-all rounded-xl text-[10px] font-black shrink-0 flex items-center gap-1 uppercase tracking-tight"
                              >
                                Studio <ArrowUpRight className="w-2.5 h-2.5" />
                              </button>

                              {chk.status === 'Rascunho' && (
                                <button 
                                  onClick={() => setModalPublishItem(chk)}
                                  className="h-[34px] px-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm shrink-0"
                                >
                                  Publicar
                                </button>
                              )}

                              <div className="relative">
                                <button 
                                  onClick={() => setActiveMenuId(activeMenuId === chk.id ? null : chk.id)}
                                  className={cn(
                                    "w-[34px] h-[34px] flex items-center justify-center border border-[#E8DDFD] bg-white hover:bg-slate-50 rounded-xl text-slate-400 hover:text-brand transition-all shrink-0",
                                    activeMenuId === chk.id && "border-brand/40 text-brand bg-slate-50"
                                  )}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {activeMenuId === chk.id && (
                                  <div className="absolute right-0 bottom-full mb-1 w-[160px] bg-white rounded-2xl border border-[#E8DDFD] shadow-xl p-1.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {[
                                      { label: 'Copiar Link', icon: Copy, action: () => triggerSuccessAlert(`Link copiado!`) },
                                      { label: 'Duplicar', icon: Layers, action: () => {
                                        const newName = `${chk.name} (Cópia)`;
                                        setCheckouts(prev => [...prev, { ...chk, id: `chk_copy_${Date.now()}`, name: newName, status: 'Rascunho', version: 'v1.0.0', conversion: '—', lastUpdate: 'agora mesmo', slug: `${chk.slug}-copia` }]);
                                        triggerSuccessAlert(`Duplicado!`);
                                      }},
                                      { label: 'Arquivar', icon: Archive, disabled: chk.status === 'Arquivado', action: () => setModalArchiveItem(chk) },
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
                                        <mi.icon className="w-3.5 h-3.5" />
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

          {/* 5. Paginação Footer - Compact and Unified 60px */}
          <div className="flex h-[60px] items-center justify-between border border-[#E8DDFD] rounded-[24px] px-5 bg-white/80 shadow-sm shrink-0 w-full">
            <p className="text-[12px] 2xl:text-[12.5px] font-bold text-slate-500">
              Mostrando <span className="font-black text-slate-950">{startIndex + 1}</span> a <span className="font-black text-slate-950">{endIndex}</span> de <span className="font-black text-slate-950">{totalItems}</span> resultados
            </p>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8DDFD] text-slate-400 hover:bg-brand-soft/20 hover:text-brand transition-all disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black shadow-sm transition-all",
                    currentPage === page 
                      ? "bg-brand text-white" 
                      : "border border-[#E8DDFD] text-slate-500 hover:bg-brand-soft/20 hover:text-brand"
                  )}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8DDFD] text-slate-400 hover:bg-brand-soft/20 hover:text-brand transition-all disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Itens por página
              </span>

              <button className="flex h-9 items-center gap-2 rounded-xl border border-[#E8DDFD] bg-white px-3 text-xs font-bold text-slate-700">
                {viewMode === 'galeria' ? '9' : '10'}
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* 6. Bottom Summary Section (Status, Activities, Attention) */}
          <section className="w-full mt-0.5 shrink-0">
            <CheckoutsSummary 
              checkouts={checkouts}
              onFilterStatus={(st) => {
                let mappedTab: 'Todos' | 'Publicados' | 'Rascunhos' | 'Pausados' = 'Todos';
                if (st === 'Publicado') mappedTab = 'Publicados';
                else if (st === 'Rascunho') mappedTab = 'Rascunhos';
                else if (st === 'Pausado') mappedTab = 'Pausados';

                setActiveTab(mappedTab);
                setSearch('');
                setCurrentPage(1);
                triggerSuccessAlert(`Filtrando lista por status: ${st}`);
              }}
              onFilterAttention={(key) => {
                if (key === 'no-publish') {
                  setActiveTab('Todos');
                  setSearch('');
                  triggerSuccessAlert('Mostrando checkouts sem publicação recente!');
                } else if (key === 'low-conversion') {
                  setActiveTab('Todos');
                  setSearch('');
                  triggerSuccessAlert('Mostrando checkouts com conversão abaixo da meta!');
                } else if (key === 'no-owner') {
                  setSearch('Marketplace');
                  setActiveTab('Todos');
                  triggerSuccessAlert('Mostrando checkout Marketplace!');
                }
                setCurrentPage(1);
              }}
            />
          </section>
        </>
      )}

      {/* CONFIRM PUBLISH MODAL */}
      {modalPublishItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E8DDFD] pb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-950 font-black text-sm uppercase tracking-wider">Confirmar Publicação</h3>
                <p className="text-slate-400 text-[10px] font-bold">Esta ação criará uma versão ativa permanente.</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>Você está prestes a publicar o checkout <strong>{modalPublishItem.name}</strong>.</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Gera o build de distribuição no CDN global da Basileia Pay.</li>
                <li>Vincula automaticamente a versão à API de produção.</li>
                <li>Cria a assinatura digital auditável de integridade.</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setModalPublishItem(null)}
                className="h-[38px] px-4 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-[11px] font-black text-slate-700 uppercase tracking-tight transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmPublish}
                className="h-[38px] px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[11px] font-black uppercase tracking-tight transition-all shadow-md shadow-green-500/10"
              >
                Confirmar e Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ARCHIVE MODAL */}
      {modalArchiveItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E8DDFD] pb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-950 font-black text-sm uppercase tracking-wider">Confirmar Arquivamento</h3>
                <p className="text-slate-400 text-[10px] font-bold">O histórico de transações será preservado.</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>Tem certeza que deseja arquivar o checkout <strong>{modalArchiveItem.name}</strong>?</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>O checkout será desativado e não aceitará novas transações.</li>
                <li>Qualquer chamada de API receberá o fallback configurado.</li>
                <li>As versões passadas e o relatório de conversão continuarão salvos.</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setModalArchiveItem(null)}
                className="h-[38px] px-4 border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-[11px] font-black text-slate-700 uppercase tracking-tight transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmArchive}
                className="h-[38px] px-4 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-[11px] font-black uppercase tracking-tight transition-all shadow-md shadow-slate-900/10"
              >
                Confirmar e Arquivar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
