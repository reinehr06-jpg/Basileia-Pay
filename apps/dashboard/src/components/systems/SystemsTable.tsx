'use client';

import { 
  MoreVertical, 
  Eye, 
  Play, 
  RefreshCw,
  Search,
  Filter as FilterIcon,
  Download,
  Plus,
  ChevronDown,
  Globe,
  Wallet,
  CreditCard,
  ShieldCheck,
  Layout,
  Zap,
  Activity,
  ChevronRight
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
    gwId: 'gw_pagarme_001', 
    checkout: 'Checkout Padrão', 
    chkId: 'chk_default_001', 
    last: 'há 4 min', 
    time: '16/05/2026 11:42',
    uptime: '99,92%', 
    reqs: '142 req/s',
    color: 'success'
  },
  { 
    id: 'sys_002', 
    name: 'Mercado Pago', 
    desc: 'Sistema de Eventos', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'Mercado Pago BR', 
    gwId: 'gw_mp_002', 
    checkout: 'Checkout Mercado Pago', 
    chkId: 'chk_mp_002', 
    last: 'há 7 min', 
    time: '16/05/2026 11:39',
    uptime: '99,78%', 
    reqs: '118 req/s',
    color: 'success'
  },
  { 
    id: 'sys_003', 
    name: 'Stripe', 
    desc: 'Vendas Internacionais', 
    status: 'Atenção', 
    env: 'Produção', 
    gateway: 'Stripe Global', 
    gwId: 'gw_stripe_003', 
    checkout: 'Checkout Internacional', 
    chkId: 'chk_global_003', 
    last: 'há 12 min', 
    time: '16/05/2026 11:34',
    uptime: '98,21%', 
    reqs: '86 req/s',
    color: 'warning'
  },
  { 
    id: 'sys_004', 
    name: 'Asaas', 
    desc: 'Assinaturas e Cursos', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'Asaas Principal', 
    gwId: 'gw_asaas_004', 
    checkout: 'Checkout Asaas', 
    chkId: 'chk_asaas_004', 
    last: 'há 3 min', 
    time: '16/05/2026 11:43',
    uptime: '99,95%', 
    reqs: '74 req/s',
    color: 'success'
  },
  { 
    id: 'sys_005', 
    name: 'Banco do Brasil PIX', 
    desc: 'Recebimento Instantâneo', 
    status: 'Instável', 
    env: 'Produção', 
    gateway: 'BB PIX', 
    gwId: 'gw_bb_pix_005', 
    checkout: 'Checkout PIX', 
    chkId: 'chk_pix_005', 
    last: 'há 18 min', 
    time: '16/05/2026 11:28',
    uptime: '95,12%', 
    reqs: '62 req/s',
    color: 'danger'
  },
  { 
    id: 'sys_006', 
    name: 'Cielo', 
    desc: 'Maquineta e E-commerce', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'Cielo Principal', 
    gwId: 'gw_cielo_006', 
    checkout: 'Checkout Cartão', 
    chkId: 'chk_card_006', 
    last: 'há 21 min', 
    time: '16/05/2026 11:25',
    uptime: '99,61%', 
    reqs: '91 req/s',
    color: 'success'
  },
  { 
    id: 'sys_007', 
    name: 'Adyen', 
    desc: 'Enterprise Payments', 
    status: 'Desconectado', 
    env: 'Sandbox', 
    gateway: 'Adyen Sandbox', 
    gwId: 'gw_adyen_007', 
    checkout: 'Sem checkout padrão', 
    chkId: '---', 
    last: 'sem atividade', 
    time: '---',
    uptime: '0%', 
    reqs: '0 req/s',
    color: 'slate/30'
  },
  { 
    id: 'sys_008', 
    name: 'Internal API', 
    desc: 'Core Integration', 
    status: 'Operacional', 
    env: 'Produção', 
    gateway: 'Internal Router', 
    gwId: 'gw_internal_008', 
    checkout: 'Checkout Core', 
    chkId: 'chk_core_008', 
    last: 'há 1 min', 
    time: '16/05/2026 11:45',
    uptime: '100%', 
    reqs: '23 req/s',
    color: 'success'
  },
];

export function SystemsTable() {
  return (
    <div className="bg-white rounded-[20px] border border-border shadow-sm overflow-hidden flex flex-col">
      {/* 1. Header Area - Dense */}
      <div className="px-5 h-[64px] border-b border-border/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <h2 className="text-[13px] font-black text-ink uppercase tracking-tight">Sistemas Conectados</h2>
          <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
             <button className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tight bg-white text-brand shadow-sm">Todos</button>
             <button className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tight text-slate/40 hover:text-ink">Ativos</button>
             <button className="px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tight text-slate/40 hover:text-ink">Erros</button>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-lg text-[9.5px] font-black text-slate/40 uppercase tracking-tighter cursor-pointer hover:bg-brand-soft transition-all">
            <FilterIcon className="w-3 h-3" /> Filtrar
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="relative w-[280px]">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate/30" />
             <input 
               type="text" 
               placeholder="Buscar por nome, token ou gateway..."
               className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-[10.5px] font-bold focus:outline-none focus:ring-1 focus:ring-brand/30 transition-all"
             />
           </div>
           <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-[9.5px] font-black text-ink hover:bg-brand-soft transition-all uppercase tracking-tighter">
            <Download className="w-3 h-3 text-slate/40" /> Exportar
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-brand to-brand-accent text-white rounded-lg text-[9.5px] font-black uppercase tracking-tighter shadow-md shadow-brand/20">
            <Plus className="w-3 h-3" /> Novo Sistema
          </button>
        </div>
      </div>

      {/* 2. Table Area - High Density */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background/20 border-b border-border/20">
              <th className="px-5 py-2.5 w-10">
                <input type="checkbox" className="rounded border-border text-brand focus:ring-brand" />
              </th>
              {['Sistema', 'Status', 'Ambiente', 'Gateway Padrão', 'Checkout Padrão', 'Última Atividade', 'Saúde / Uso', 'Ações'].map((h) => (
                <th key={h} className="px-5 py-2.5 text-[8.5px] font-black uppercase tracking-widest text-slate/30 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {systems.map((sys) => (
              <tr key={sys.id} className="group hover:bg-brand-soft/10 transition-colors h-[54px]">
                <td className="px-5">
                  <input type="checkbox" className="rounded border-border text-brand focus:ring-brand" />
                </td>
                <td className="px-5 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                      <span className="text-[12px] font-black text-brand/60">{sys.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-black text-ink truncate group-hover:text-brand transition-colors">{sys.name}</h4>
                      <p className="text-[8.5px] font-bold text-slate/40 truncate">{sys.desc}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight",
                    sys.status === 'Operacional' ? "bg-success/10 text-success" : 
                    sys.status === 'Atenção' ? "bg-warning/10 text-warning" : 
                    sys.status === 'Instável' ? "bg-danger/10 text-danger" : "bg-slate/10 text-slate/40"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full", `bg-${sys.color}`)} />
                    {sys.status}
                  </div>
                </td>
                <td className="px-5">
                  <div className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                    sys.env === 'Produção' ? "bg-ink text-white" : "bg-brand/10 text-brand"
                  )}>
                    {sys.env}
                  </div>
                </td>
                <td className="px-5 min-w-[160px]">
                  <div className="space-y-0.5">
                    <p className="text-[10.5px] font-black text-ink">{sys.gateway}</p>
                    <p className="text-[8.5px] font-bold text-slate/30 uppercase tracking-tighter">{sys.gwId}</p>
                  </div>
                </td>
                <td className="px-5 min-w-[160px]">
                   <div className="space-y-0.5">
                    <p className="text-[10.5px] font-black text-ink">{sys.checkout}</p>
                    <p className={cn("text-[8.5px] font-bold uppercase tracking-tighter", sys.chkId === '---' ? "text-danger" : "text-slate/30")}>
                      {sys.chkId}
                    </p>
                  </div>
                </td>
                <td className="px-5 whitespace-nowrap">
                  <div className="space-y-0.5">
                    <p className="text-[10.5px] font-black text-ink">{sys.last}</p>
                    <p className="text-[8.5px] font-bold text-slate/30">{sys.time}</p>
                  </div>
                </td>
                <td className="px-5 whitespace-nowrap">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                       <span className={cn("text-[10.5px] font-black", parseInt(sys.uptime) > 98 ? "text-success" : sys.status === 'Off' ? "text-slate/30" : "text-danger")}>
                        {sys.uptime}
                       </span>
                       <span className="text-[9px] font-bold text-slate/20">uptime</span>
                    </div>
                    <p className="text-[9px] font-black text-slate/40 uppercase tracking-tighter">{sys.reqs}</p>
                  </div>
                </td>
                <td className="px-5">
                  <div className="flex items-center gap-0.5">
                    <button className="p-1.5 text-slate/30 hover:text-brand transition-all" title="Ver detalhe"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-slate/30 hover:text-brand transition-all" title="Testar"><Play className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-slate/30 hover:text-brand transition-all" title="Mais opções"><MoreVertical className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Footer Area */}
      <div className="px-5 h-[54px] border-t border-border/50 flex items-center justify-between bg-background/20 shrink-0">
        <p className="text-[10px] font-bold text-slate/40">Mostrando 1 a 8 de 8 resultados</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate/30 uppercase tracking-tighter">Itens por página:</span>
            <select className="bg-transparent text-[10px] font-black text-ink border-none focus:ring-0 cursor-pointer">
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
             <button className="p-1.5 rounded-lg border border-border text-slate/30 hover:text-ink disabled:opacity-30" disabled>
               <ChevronRight className="w-3.5 h-3.5 rotate-180" />
             </button>
             <button className="w-7 h-7 rounded-lg bg-brand text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-brand/20">1</button>
             <button className="p-1.5 rounded-lg border border-border text-slate/30 hover:text-ink disabled:opacity-30" disabled>
               <ChevronRight className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
