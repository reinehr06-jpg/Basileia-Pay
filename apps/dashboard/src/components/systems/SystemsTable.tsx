'use client';

import { 
  MoreVertical, 
  Search,
  ChevronDown,
  Globe,
  Wallet,
  CreditCard,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
  Download,
  Plus,
  PlayCircle,
  Eye,
  RefreshCw,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

const systems = [
  { 
    id: 'sys_001', 
    name: 'Pagar.Me', 
    desc: 'Gateway de Pagamento', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'Pagar.Me Principal', 
    gwId: 'gw_pm_01', 
    checkout: 'Checkout Pagar.Me', 
    chkId: 'chk_pm_default', 
    last: 'há 2 min', 
    time: '11/05 14:36',
    uptime: '99,92%', 
    reqs: '142 req/s',
    color: 'success',
    icon: 'P',
    iconColor: 'bg-success'
  },
  { 
    id: 'sys_002', 
    name: 'Mercado Pago', 
    desc: 'Gateway de Pagamento', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'Mercado Pago Master', 
    gwId: 'gw_mp_01', 
    checkout: 'Checkout Mercado Pago', 
    chkId: 'chk_mp_default', 
    last: 'há 4 min', 
    time: '11/05 14:34',
    uptime: '99,78%', 
    reqs: '118 req/s',
    color: 'success',
    icon: 'M',
    iconColor: 'bg-blue-500'
  },
  { 
    id: 'sys_003', 
    name: 'Stripe', 
    desc: 'Gateway de Pagamento', 
    status: 'Atenção', 
    env: 'Produção', 
    gateway: 'Stripe Global', 
    gwId: 'gw_stripe_01', 
    checkout: 'Checkout Stripe', 
    chkId: 'chk_stripe_default', 
    last: 'há 15 min', 
    time: '11/05 14:23',
    uptime: '98,21%', 
    reqs: '86 req/s',
    color: 'warning',
    icon: '$',
    iconColor: 'bg-indigo-600'
  },
  { 
    id: 'sys_004', 
    name: 'Asaas', 
    desc: 'Gateway de Pagamento', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'Asaas Principal', 
    gwId: 'gw_asaas_01', 
    checkout: 'Checkout Asaas', 
    chkId: 'chk_asaas_default', 
    last: 'há 1 min', 
    time: '11/05 14:37',
    uptime: '99,95%', 
    reqs: '74 req/s',
    color: 'success',
    icon: 'A',
    iconColor: 'bg-blue-400'
  },
  { 
    id: 'sys_005', 
    name: 'Banco do Brasil PIX', 
    desc: 'PIX Direct', 
    status: 'Instável', 
    env: 'Produção', 
    gateway: 'BB PIX Principal', 
    gwId: 'gw_bbpix_01', 
    checkout: 'Checkout PIX BB', 
    chkId: 'chk_pix_bb_default', 
    last: 'há 30 min', 
    time: '11/05 14:07',
    uptime: '95,12%', 
    reqs: '62 req/s',
    color: 'danger',
    icon: 'B',
    iconColor: 'bg-yellow-500'
  },
  { 
    id: 'sys_006', 
    name: 'Cielo', 
    desc: 'Adquirente', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'Cielo Principal', 
    gwId: 'gw_cielo_01', 
    checkout: 'Checkout Cielo', 
    chkId: 'chk_cielo_default', 
    last: 'há 3 min', 
    time: '11/05 14:35',
    uptime: '99,61%', 
    reqs: '91 req/s',
    color: 'success',
    icon: 'C',
    iconColor: 'bg-black'
  },
  { 
    id: 'sys_007', 
    name: 'Adyen', 
    desc: 'Gateway de Pagamento', 
    status: 'Desconectado', 
    env: 'Sandbox', 
    gateway: 'Adyen Sandbox', 
    gwId: 'gw_adyen_sbx', 
    checkout: 'Checkout Adyen SBX', 
    chkId: 'chk_adyen_sbx', 
    last: '---', 
    time: '---',
    uptime: '0%', 
    reqs: '0 req/s',
    color: 'slate/30',
    icon: 'A',
    iconColor: 'bg-emerald-600'
  },
  { 
    id: 'sys_008', 
    name: 'Internal API', 
    desc: 'Integração Interna', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'API Core', 
    gwId: 'gw_core_api', 
    checkout: 'Checkout Interno', 
    chkId: 'chk_internal_default', 
    last: 'há 1 min', 
    time: '11/05 14:37',
    uptime: '100%', 
    reqs: '23 req/s',
    color: 'success',
    icon: '</>',
    iconColor: 'bg-indigo-700'
  },
];

export function SystemsTable() {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header Area - Dense */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1 w-full">
        <div className="space-y-0">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] 2xl:text-[32px] font-black tracking-tighter text-ink leading-none">Sistemas</h1>
            <div className="h-6 w-px bg-border/60 mx-1" />
            <Activity className="w-4 h-4 2xl:w-5 h-5 text-brand opacity-40" />
          </div>
          <p className="text-slate/50 font-bold text-[13px] 2xl:text-[14px] tracking-tight mt-1">
            Gerencie provedores conectados, gateways e integrações técnicas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-[10.5px] 2xl:text-[11.5px] font-black text-ink shadow-sm hover:bg-brand-soft transition-all uppercase tracking-tight h-[40px] 2xl:h-[46px]">
            <Download className="w-3.5 h-3.5 text-slate/40" />
            Exportar
            <ChevronDown className="w-3.5 h-3.5 text-slate/30" />
          </button>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-[10.5px] 2xl:text-[11.5px] font-black shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 transition-all active:translate-y-0 uppercase tracking-tight h-[40px] 2xl:h-[46px]">
            <Plus className="w-3.5 h-3.5 text-white/80" />
            Novo sistema
          </button>
        </div>
      </header>

      {/* 2. Filters Bar */}
      <div className="bg-white/40 backdrop-blur-sm p-3.5 rounded-[22px] border border-border/50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-[380px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/30" />
            <input 
              type="text" 
              placeholder="Buscar por nome, token, gateway ou checkout"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-[12.5px] font-bold text-ink placeholder:text-slate/30 focus:outline-none focus:ring-1 focus:ring-brand/30 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {[
              { label: 'Status', value: 'Todos' },
              { label: 'Ambiente', value: 'Todos' },
              { label: 'Gateway padrinho', value: 'Todos' },
            ].map((f) => (
              <div key={f.label} className="px-3.5 py-2 bg-white border border-border rounded-xl flex flex-col justify-center min-w-[140px] cursor-pointer hover:bg-brand-soft transition-all">
                <span className="text-[8px] font-black text-slate/40 uppercase tracking-widest leading-none mb-1">{f.label}</span>
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-black text-ink">{f.value}</span>
                   <ChevronDown className="w-3.5 h-3.5 text-slate/30" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pl-6 border-l border-border/30">
          <p className="text-[12px] font-black text-ink">8 <span className="text-slate/40">resultados</span></p>
        </div>
      </div>

      {/* 3. Table Header & Batch Actions */}
      <div className="flex items-center gap-4 px-2">
        <input type="checkbox" className="w-4 h-4 rounded border-border text-brand focus:ring-brand transition-all cursor-pointer" />
        <span className="text-[11.5px] font-bold text-slate/40">0 selecionados</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 border border-border rounded-lg text-[10.5px] font-black text-slate/30 uppercase tracking-tight cursor-not-allowed">
          Ações em lote <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 4. Main Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-[24px] border border-border/60 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/40">
              <th className="w-12 px-6 py-4"></th>
              {['Sistema', 'Status', 'Ambiente', 'Gateway padrinho', 'Checkout padrão', 'Última atividade', 'Saúde / uso', 'Ações rápidas'].map((h) => (
                <th key={h} className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate/40 whitespace-nowrap">
                  {h} <ChevronDown className="inline-block w-3 h-3 ml-1 opacity-40" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {systems.map((sys) => (
              <tr key={sys.id} className="group hover:bg-brand-soft/20 transition-all h-[72px]">
                <td className="px-6">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-brand focus:ring-brand transition-all cursor-pointer" />
                </td>
                <td className="px-4 min-w-[220px]">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", sys.iconColor)}>
                      <span className="text-white font-black text-sm">{sys.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[13.5px] font-black text-ink truncate leading-tight">{sys.name}</h4>
                      <p className="text-[10px] font-bold text-brand truncate tracking-tight">{sys.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-black border transition-all",
                    sys.status === 'Operacional' ? "bg-success/5 border-success/10 text-success" : 
                    sys.status === 'Atenção' ? "bg-warning/5 border-warning/10 text-warning" : 
                    sys.status === 'Instável' ? "bg-danger/5 border-danger/10 text-danger" : "bg-slate/5 border-slate/10 text-slate/40"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", `bg-${sys.color}`)} />
                    {sys.status}
                  </div>
                </td>
                <td className="px-4">
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-tight inline-block",
                    sys.env === 'Produção' ? "bg-success/10 text-success" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {sys.env}
                  </div>
                </td>
                <td className="px-4 min-w-[180px]">
                  <div className="space-y-0.5">
                    <p className="text-[12.5px] font-black text-ink">{sys.gateway}</p>
                    <p className="text-[9.5px] font-bold text-slate/30 uppercase tracking-tighter">ID: {sys.gwId}</p>
                  </div>
                </td>
                <td className="px-4 min-w-[180px]">
                   <div className="space-y-0.5">
                    <p className="text-[12.5px] font-black text-ink">{sys.checkout}</p>
                    <p className="text-[9.5px] font-bold text-slate/30 uppercase tracking-tighter">{sys.chkId}</p>
                  </div>
                </td>
                <td className="px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", `bg-${sys.color}`)} />
                    <div className="space-y-0">
                      <p className="text-[12px] font-black text-ink leading-tight">{sys.last}</p>
                      <p className="text-[9px] font-bold text-slate/30">{sys.time}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 whitespace-nowrap">
                  <div className="space-y-0.5">
                    <p className={cn("text-[13px] font-black leading-tight", parseInt(sys.uptime) > 98 ? "text-success" : sys.status === 'Desconectado' ? "text-slate/30" : "text-danger")}>
                      {sys.uptime}
                    </p>
                    <p className="text-[9.5px] font-bold text-slate/30 tracking-tight">{sys.reqs}</p>
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-border rounded-lg text-[10.5px] font-black text-ink hover:bg-brand-soft transition-all">Ver detalhe</button>
                    <button className="px-3 py-1.5 border border-border rounded-lg text-[10.5px] font-black text-ink hover:bg-brand-soft transition-all">{sys.name === 'Internal API' ? 'Sincronizar' : 'Testar'}</button>
                    <button className="p-2 text-slate/30 hover:text-brand transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Pagination Footer */}
      <div className="px-6 py-4 flex items-center justify-between">
        <p className="text-[12px] font-bold text-slate/30">Mostrando 1 a 8 de 8 resultados</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
             <button className="p-2 rounded-lg border border-border text-slate/30 hover:text-ink disabled:opacity-20" disabled>
               <ChevronLeft className="w-4 h-4" />
             </button>
             <button className="w-8 h-8 rounded-lg bg-brand/10 text-brand text-[12px] font-black flex items-center justify-center">1</button>
             <button className="p-2 rounded-lg border border-border text-slate/30 hover:text-ink disabled:opacity-20" disabled>
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate/40 uppercase tracking-tight">Itens por página</span>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl cursor-pointer">
              <span className="text-[12px] font-black text-ink">20</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronLeft(props: any) {
  return <ChevronRight {...props} className={cn(props.className, "rotate-180")} />;
}
