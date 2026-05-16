'use client';

import { 
  MoreVertical, 
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  PlayCircle,
  Eye,
  Activity,
  RefreshCw
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
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Filters Card */}
      <div className="bg-white/60 backdrop-blur-md p-4 rounded-[22px] border border-border/50 flex items-center justify-between shadow-sm w-full">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative w-[420px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/30" />
            <input 
              type="text" 
              placeholder="Buscar por nome, token, gateway ou checkout"
              className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-[13px] font-bold text-ink placeholder:text-slate/30 focus:outline-none focus:ring-1 focus:ring-brand/30 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {[
              { label: 'Status', value: 'Todos' },
              { label: 'Ambiente', value: 'Todos' },
              { label: 'Gateway padrinho', value: 'Todos' },
            ].map((f) => (
              <div key={f.label} className="px-4 py-2 bg-white border border-border rounded-xl flex flex-col justify-center min-w-[150px] cursor-pointer hover:bg-brand-soft transition-all">
                <span className="text-[8px] font-black text-slate/40 uppercase tracking-widest leading-none mb-1">{f.label}</span>
                <div className="flex items-center justify-between">
                   <span className="text-[12px] font-black text-ink">{f.value}</span>
                   <ChevronDown className="w-4 h-4 text-slate/30" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pl-6 border-l border-border/30">
          <p className="text-[13px] font-black text-ink">8 <span className="text-slate/40">resultados</span></p>
        </div>
      </div>

      {/* 2. Bulk Actions */}
      <div className="flex items-center gap-4 px-2">
        <input type="checkbox" className="w-4 h-4 rounded border-border text-brand focus:ring-brand transition-all cursor-pointer" />
        <span className="text-[12px] font-bold text-slate/40">0 selecionados</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 border border-border rounded-lg text-[11px] font-black text-slate/30 uppercase tracking-tight cursor-not-allowed">
          Ações em lote <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Main Table Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[24px] border border-border/60 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border/40">
                <th className="w-12 px-6 py-5"></th>
                {[
                  'Sistema', 'Status', 'Ambiente', 'Gateway padrinho', 'Checkout padrão', 'Última atividade', 'Saúde / uso', 'Ações rápidas'
                ].map((h) => (
                  <th key={h} className="px-4 py-5 text-[10.5px] font-black uppercase tracking-widest text-slate/40 whitespace-nowrap">
                    {h} <ChevronDown className="inline-block w-3.5 h-3.5 ml-1 opacity-30" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {systems.map((sys) => (
                <tr key={sys.id} className="group hover:bg-brand-soft/20 transition-all h-[82px]">
                  <td className="px-6">
                    <input type="checkbox" className="w-4 h-4 rounded border-border text-brand focus:ring-brand transition-all cursor-pointer" />
                  </td>
                  <td className="px-4 min-w-[240px]">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/20", sys.iconColor)}>
                        <span className="text-white font-black text-[15px]">{sys.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[14.5px] font-black text-ink truncate leading-tight">{sys.name}</h4>
                        <p className="text-[11px] font-bold text-brand truncate tracking-tight">{sys.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-black border transition-all shadow-sm",
                      sys.status === 'Operacional' ? "bg-success/5 border-success/10 text-success" : 
                      sys.status === 'Atenção' ? "bg-warning/5 border-warning/10 text-warning" : 
                      sys.status === 'Instável' ? "bg-danger/5 border-danger/10 text-danger" : "bg-slate/5 border-slate/10 text-slate/40"
                    )}>
                      <div className={cn("w-2 h-2 rounded-full", `bg-${sys.color}`)} />
                      {sys.status}
                    </div>
                  </td>
                  <td className="px-4">
                    <div className={cn(
                      "px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tight inline-block",
                      sys.env === 'Produção' ? "bg-success/10 text-success" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {sys.env}
                    </div>
                  </td>
                  <td className="px-4 min-w-[200px]">
                    <div className="space-y-1">
                      <p className="text-[13.5px] font-black text-ink leading-none">{sys.gateway}</p>
                      <p className="text-[10px] font-bold text-slate/30 uppercase tracking-tighter">ID: {sys.gwId}</p>
                    </div>
                  </td>
                  <td className="px-4 min-w-[200px]">
                     <div className="space-y-1">
                      <p className="text-[13.5px] font-black text-ink leading-none">{sys.checkout}</p>
                      <p className="text-[10px] font-bold text-slate/30 uppercase tracking-tighter">ID: {sys.chkId}</p>
                    </div>
                  </td>
                  <td className="px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-2 h-2 rounded-full", `bg-${sys.color}`)} />
                      <div className="space-y-0">
                        <p className="text-[13px] font-black text-ink leading-tight">{sys.last}</p>
                        <p className="text-[10px] font-bold text-slate/30">{sys.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <p className={cn("text-[14px] font-black leading-none", parseInt(sys.uptime) > 98 ? "text-success" : sys.status === 'Desconectado' ? "text-slate/30" : "text-danger")}>
                        {sys.uptime}
                      </p>
                      <p className="text-[10.5px] font-bold text-slate/30 tracking-tight">{sys.reqs}</p>
                    </div>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2.5">
                      <button className="px-3.5 py-2 border border-border rounded-xl text-[11.5px] font-black text-ink hover:bg-brand-soft transition-all shadow-sm">Ver detalhe</button>
                      <button 
                        className={cn(
                          "px-3.5 py-2 border border-border rounded-xl text-[11.5px] font-black text-ink hover:bg-brand-soft transition-all shadow-sm",
                          sys.status === 'Desconectado' && "opacity-30 cursor-not-allowed"
                        )}
                        disabled={sys.status === 'Desconectado'}
                      >
                        {sys.name === 'Internal API' ? 'Sincronizar' : 'Testar'}
                      </button>
                      <button className="p-2 text-slate/30 hover:text-brand transition-all">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Pagination Footer */}
      <div className="px-8 py-5 flex items-center justify-between bg-white/40 border border-border/40 rounded-[22px] w-full shadow-sm">
        <p className="text-[13px] font-bold text-slate/30">Mostrando 1 a 8 de 8 resultados</p>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
             <button className="p-2.5 rounded-xl border border-border text-slate/30 hover:text-ink disabled:opacity-20" disabled>
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button className="w-10 h-10 rounded-xl bg-brand text-white text-[13px] font-black flex items-center justify-center shadow-lg shadow-brand/20">1</button>
             <button className="p-2.5 rounded-xl border border-border text-slate/30 hover:text-ink disabled:opacity-20" disabled>
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-bold text-slate/40 uppercase tracking-tight">Itens por página</span>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-border rounded-xl cursor-pointer">
              <span className="text-[13px] font-black text-ink">20</span>
              <ChevronDown className="w-4 h-4 text-slate/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
