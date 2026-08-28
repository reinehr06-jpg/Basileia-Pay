'use client';

import { useEffect, useState } from 'react';
import { 
  MoreVertical, 
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

type System = {
  id: number;
  uuid: string;
  name: string;
  description: string;
  logo_url: string | null;
  status: string;
  environment: string;
  gateway_default: string | null;
  checkout_default: string | null;
  last_activity: string | null;
  uptime: string;
  reqs: string;
  created_at: string;
};

export function SystemsTable() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    async function loadSystems() {
      try {
        const result = await apiFetch('/api/v1/dashboard/systems');
        if (result.success && result.data) {
          const data = result.data as any;
          setSystems(data.data || data.systems || []);
        } else {
          setSystems([]);
        }
      } catch {
        setSystems([]);
      } finally {
        setLoading(false);
      }
    }
    loadSystems();
  }, []);

  const filteredSystems = systems.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSystems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSystems = filteredSystems.slice(startIndex, startIndex + itemsPerPage);

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Operacional';
      case 'inactive': return 'Desconectado';
      case 'attention': return 'Atencao';
      case 'unstable': return 'Instavel';
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50/60 border-green-100 text-green-700';
      case 'inactive': return 'bg-slate-50/60 border-slate-200 text-slate-400';
      case 'attention': return 'bg-amber-50/60 border-amber-100 text-amber-700';
      case 'unstable': return 'bg-red-50/60 border-red-100 text-red-700';
      default: return 'bg-slate-50/60 border-slate-200 text-slate-400';
    }
  };

  const envColor = (env: string) => {
    return env === 'production' 
      ? 'bg-green-50/60 text-green-700 border-green-100/30' 
      : 'bg-blue-50/60 text-blue-600 border-blue-100/30';
  };

  const envLabel = (env: string) => {
    return env === 'production' ? 'Producao' : env === 'sandbox' ? 'Sandbox' : env;
  };

  const dotColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'attention': return 'bg-amber-500';
      case 'unstable': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const iconColor = (name: string) => {
    const colors = ['bg-success', 'bg-blue-500', 'bg-indigo-600', 'bg-blue-400', 'bg-yellow-500', 'bg-black', 'bg-emerald-600', 'bg-indigo-700'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2.5 w-full">
        <div className="bg-white/60 backdrop-blur-md p-2.5 rounded-xl border border-border/50 h-[46px]" />
        <div className="bg-white/80 rounded-[24px] border border-[#E8DDFD] h-[300px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-slate/30 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-md p-2.5 rounded-xl border border-border/50 flex items-center justify-between shadow-sm w-full">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative w-[280px] 2xl:w-[340px] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate/30" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Buscar por nome, gateway ou checkout"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-border rounded-lg text-[12px] font-bold text-ink placeholder:text-slate/30 focus:outline-none focus:ring-1 focus:ring-brand/30 transition-all h-[34px]"
            />
          </div>
        </div>
        <div className="pl-4 border-l border-border/30 shrink-0">
          <p className="text-[12px] font-black text-ink">{filteredSystems.length} <span className="text-slate/40">resultados</span></p>
        </div>
      </div>

      {systems.length === 0 ? (
        <div className="bg-white/80 rounded-[24px] border border-[#E8DDFD] p-12 text-center">
          <p className="text-base font-black text-slate-700">Nenhum sistema conectado ainda</p>
          <p className="text-sm font-bold text-slate-400 mt-2">Crie seu primeiro sistema para gerar checkouts e receber pagamentos.</p>
        </div>
      ) : (
        <div className="w-full min-w-0 overflow-hidden rounded-[24px] border border-[#E8DDFD] bg-white/80 shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="border-b border-border/40 bg-slate-50/50">
                  <th className="w-[42px] px-2 py-2.5"></th>
                  {[
                    { name: 'Sistema', width: '19%' },
                    { name: 'Status', width: '11%' },
                    { name: 'Ambiente', width: '10%' },
                    { name: 'Gateway padrinho', width: '14%' },
                    { name: 'Checkout padrao', width: '14%' },
                    { name: 'Ultima atividade', width: '11%' },
                    { name: 'Acoes rapidas', width: '21%' }
                  ].map((h) => (
                    <th key={h.name} style={{ width: h.width }} className={cn("py-2.5 text-[9.5px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap", h.name === 'Acoes rapidas' ? 'pl-2 pr-3' : 'px-2')}>
                      {h.name} <ChevronDown className="inline-block w-3 h-3 ml-0.5 opacity-30" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {currentSystems.map((sys) => (
                  <tr key={sys.id} className="group hover:bg-brand-50/20 transition-all h-[74px]">
                    <td className="px-2 py-3.5">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-border text-brand focus:ring-brand transition-all cursor-pointer" />
                    </td>
                    <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/20", iconColor(sys.name))}>
                          <span className="text-white font-black text-sm">{sys.logo_url ? <img src={sys.logo_url} className="w-6 h-6 object-contain" alt="" /> : getInitial(sys.name)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block max-w-full truncate font-black text-slate-950 text-[13.5px] 2xl:text-[14px] leading-tight">{sys.name}</span>
                          <p className="text-[11px] 2xl:text-[11.5px] font-bold text-brand/80 truncate tracking-tight mt-0.5">{sys.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-black border transition-all h-7 shadow-sm", statusColor(sys.status))}>
                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", dotColor(sys.status))} />
                        {statusLabel(sys.status)}
                      </div>
                    </td>
                    <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                      <div className={cn("px-2.5 py-1 rounded-md text-[9.5px] font-black uppercase tracking-tight inline-block border", envColor(sys.environment))}>
                        {envLabel(sys.environment)}
                      </div>
                    </td>
                    <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                      <p className="text-[13px] 2xl:text-[13.5px] font-black text-slate-950 leading-tight truncate">{sys.gateway_default || 'N/A'}</p>
                    </td>
                    <td className="px-2 py-3.5 min-w-0 overflow-hidden">
                      <p className="text-[13px] 2xl:text-[13.5px] font-black text-slate-950 leading-tight truncate">{sys.checkout_default || 'N/A'}</p>
                    </td>
                    <td className="px-2 py-3.5 min-w-0 overflow-hidden whitespace-nowrap">
                      <p className="text-[12.5px] font-black text-slate-950 leading-none">{sys.last_activity || '---'}</p>
                    </td>
                    <td className="pl-2 pr-3 py-3.5 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-1">
                        <button className="h-[34px] px-3 border border-[#E8DDFD] bg-white/80 hover:bg-slate-50 hover:border-brand/40 transition-all rounded-xl text-[10.5px] font-black text-slate-950 shrink-0">Detalhe</button>
                        <button className="h-[34px] px-3 border border-[#E8DDFD] bg-white/80 hover:bg-slate-50 hover:border-brand/40 transition-all rounded-xl text-[10.5px] font-black text-slate-950 shrink-0">Testar</button>
                        <button className="w-[34px] h-[34px] flex items-center justify-center border border-[#E8DDFD] bg-white/80 hover:bg-slate-50 hover:border-brand/40 transition-all rounded-xl text-slate-400 hover:text-brand shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex h-[60px] items-center justify-between border-t border-[#E8DDFD] px-5 bg-white/40 shadow-sm shrink-0">
              <p className="text-[12.5px] font-bold text-slate-600">
                Mostrando <span className="font-black text-slate-950">{startIndex + 1}</span> a <span className="font-black text-slate-950">{Math.min(startIndex + itemsPerPage, filteredSystems.length)}</span> de <span className="font-black text-slate-950">{filteredSystems.length}</span> resultados
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8DDFD] text-slate-400 hover:bg-brand-soft/20 hover:text-brand transition-all disabled:opacity-40 disabled:hover:bg-transparent">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={cn("flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black shadow-sm transition-all", currentPage === page ? "bg-brand text-white" : "border border-[#E8DDFD] text-slate-500 hover:bg-brand-soft/20 hover:text-brand")}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8DDFD] text-slate-400 hover:bg-brand-soft/20 hover:text-brand transition-all disabled:opacity-40 disabled:hover:bg-transparent">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
