'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Mail, 
  MessageCircle, 
  BarChart2, 
  Search, 
  SlidersHorizontal,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Settings,
  MoreHorizontal,
  Clock,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Percent,
  CheckCircle2,
  Calendar,
  Filter,
  UserCheck,
  Send,
  Download,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function RecoveryPage() {
  const [activeSubTab, setActiveSubTab] = useState<'sessions' | 'campaigns' | 'flows' | 'triggers' | 'reports' | 'settings'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('Todos');
  const [selectedDevice, setSelectedDevice] = useState('Todos');
  const [selectedState, setSelectedState] = useState('Todos');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // KPI States
  const kpis = [
    { label: 'Sessões abandonadas', val: '0', change: '0,00%', color: 'text-violet-600', icon: ShoppingCart },
    { label: 'Taxa de recuperação', val: '0,00%', change: '0,00%', color: 'text-emerald-650', icon: Percent },
    { label: 'Receita recuperada', val: 'R$ 0,00', change: '0,00%', color: 'text-emerald-600', icon: DollarSign },
    { label: 'Pedidos recuperados', val: '0', change: '0,00%', color: 'text-indigo-600', icon: UserCheck },
    { label: 'Ticket médio recuperado', val: 'R$ 0,00', change: '0,00%', color: 'text-slate-700', icon: TrendingUp },
    { label: 'ROI do recovery', val: '0,00x', change: '0,00%', color: 'text-violet-750', icon: ArrowUpRight }
  ];

  const [sessions, setSessions] = useState<any[]>([]);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulando fetch limpo (sem dados fantasmas)
  useEffect(() => {
    const fetchRecoveryData = async () => {
      setLoading(true);
      try {
        // Exemplo: const res = await apiFetch('/api/v1/recovery');
        // Por hora, mantemos vazio pois não temos a API pronta
        setSessions([]);
        setTriggers([]);
      } catch (error) {
        console.error("Erro ao carregar dados de recovery:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecoveryData();
  }, []);

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(r => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAllRows = () => {
    if (selectedRows.length === sessions.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sessions.map(s => s.id));
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.client.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin = selectedOrigin === 'Todos' || s.origin === selectedOrigin;
    const matchesState = selectedState === 'Todos' || (selectedState === 'Recuperado' ? s.status === 'Recuperado' : s.status === 'Não recuperado');
    return matchesSearch && matchesOrigin && matchesState;
  });

  return (
    <PageLayout 
      title="Recovery" 
    >
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-60 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <span className="w-2.5 h-2.5 bg-brand rounded-full shrink-0 animate-ping" />
          <span className="text-[11.5px] font-black text-left">{toastMsg}</span>
        </div>
      )}

      {/* Header Buttons exactly in position */}
      <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
        <span className="text-xs font-semibold text-slate-400">O módulo de Recovery resgata vendas perdidas através de campanhas automáticas de remarketing (e-mail, SMS, WhatsApp) para clientes que abandonaram o carrinho.</span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setShowConfigModal(true);
              triggerToast("Abrindo definições globais de abandono de checkout...");
            }}
            className="h-9 px-4 border border-[#E8DDFD] bg-white text-slate-700 hover:bg-slate-50 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Configurações
          </button>
          
          <button 
            onClick={() => {
              setShowCampaignModal(true);
              triggerToast("Iniciando assistente de nova campanha de remarketing...");
            }}
            className="h-9 px-4 bg-brand hover:bg-brand-dark text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand/15"
          >
            <Plus className="w-4 h-4 text-white shrink-0" />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* KPI Cards Grid of 6 */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white border border-[#E8DDFD]/65 rounded-2xl p-4 space-y-2 shadow-sm hover:border-[#E8DDFD] transition-colors text-left relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none">{kpi.label}</span>
                <div className="w-5 h-5 bg-[#FAF8FF] border border-[#E8DDFD]/55 rounded-lg flex items-center justify-center shrink-0 text-brand">
                  <Icon className="w-3 h-3" />
                </div>
              </div>
              <div className="space-y-0.5">
                <span className={cn("text-[17px] font-black block leading-none tracking-tight", kpi.color)}>{kpi.val}</span>
                <span className="text-[9px] font-black text-emerald-600 block flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 inline" /> {kpi.change} <span className="text-slate-350 font-normal">7d ant.</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main split dashboard section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left main area (col-span-3) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Sub-tabs bar matching design */}
          <div className="border-b border-[#E8DDFD]/60 flex items-center justify-between pb-0 overflow-x-auto no-scrollbar">
            <div className="flex gap-6">
              {[
                { id: 'sessions', label: 'Sessões abandonadas' },
                { id: 'campaigns', label: 'Campanhas' },
                { id: 'flows', label: 'Fluxos de comunicação' },
                { id: 'triggers', label: 'Gatilhos' },
                { id: 'reports', label: 'Relatórios' },
                { id: 'settings', label: 'Configurações' }
              ].map((tab) => {
                const isActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveSubTab(tab.id as any);
                      triggerToast(`Sub-aba carregada: ${tab.label}`);
                    }}
                    className={cn(
                      "pb-2.5 text-[12px] font-black relative transition-all tracking-tight whitespace-nowrap cursor-pointer",
                      isActive ? "text-brand" : "text-slate-400 hover:text-slate-650"
                    )}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand rounded-t-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {activeSubTab === 'sessions' && (
            <div className="space-y-4">
              
              {/* Filter bar */}
              <div className="bg-slate-50/40 border border-slate-100 rounded-2xl p-3 flex flex-wrap items-center gap-3.5">
                
                {/* Period selector */}
                <div className="flex items-center gap-2 bg-white border border-[#E8DDFD]/65 rounded-xl px-3 py-1.5 text-xs font-black text-slate-700 h-9.5 cursor-pointer">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>09/05/2024 → 16/05/2024</span>
                </div>

                {/* State select dropdown */}
                <div className="flex-1 min-w-[130px]">
                  <select 
                    value={selectedState} 
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-white border border-[#E8DDFD]/65 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none h-9.5 cursor-pointer"
                  >
                    <option value="Todos">States da sessão (Todos)</option>
                    <option value="Recuperado">Recuperado</option>
                    <option value="Não recuperado">Não recuperado</option>
                  </select>
                </div>

                {/* Origin select dropdown */}
                <div className="flex-1 min-w-[130px]">
                  <select 
                    value={selectedOrigin} 
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    className="w-full bg-white border border-[#E8DDFD]/65 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none h-9.5 cursor-pointer"
                  >
                    <option value="Todos">Origem (Todos)</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Site">Site</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                {/* Search query input */}
                <div className="flex-1 min-w-[160px] relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar sessão, cliente..."
                    className="w-full bg-white border border-[#E8DDFD]/65 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none h-9.5"
                  />
                </div>

                {/* Clear / reload */}
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedOrigin('Todos');
                    setSelectedState('Todos');
                    triggerToast("Filtros redefinidos!");
                  }}
                  className="w-9.5 h-9.5 bg-white border border-[#E8DDFD]/65 rounded-xl flex items-center justify-center text-slate-450 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Main Session table grid */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm text-left">
                <div className="w-full overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="border-b border-[#E8DDFD]/40 bg-slate-50/50">
                        <th className="py-2.5 px-3.5 w-[5%]">
                          <input 
                            type="checkbox" 
                            checked={selectedRows.length === filteredSessions.length && filteredSessions.length > 0} 
                            onChange={handleSelectAllRows}
                            className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4 h-4"
                          />
                        </th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Sessão</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">Cliente</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[18%]">E-mail / Fone</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[14%]">Valor do Carrinho</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[14%]">Etapa abandonada</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Tempo desde abandono</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Origem</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[12%]">Tentativas</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[14%]">Recuperação</th>
                        <th className="py-2.5 px-2 text-[9px] font-black uppercase text-slate-400 tracking-wider w-[8%] text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10.5px] font-bold text-slate-700">
                      {filteredSessions.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/30 h-[52px]">
                          <td className="py-2 px-3.5">
                            <input 
                              type="checkbox" 
                              checked={selectedRows.includes(s.id)}
                              onChange={() => handleSelectRow(s.id)}
                              className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4 h-4"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <div className="font-mono text-[9px] text-brand">{s.id}</div>
                            <span className="text-[8px] text-slate-350 block mt-0.5">16/05/2024 10:18</span>
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6.5 h-6.5 bg-brand/10 text-brand font-black rounded-full flex items-center justify-center text-[9px]">
                                {s.avatar}
                              </div>
                              <div className="leading-tight">
                                <span className="text-slate-800 font-extrabold block truncate max-w-[100px]">{s.client}</span>
                                <span className="text-[8.5px] font-black text-slate-400 block">{s.cliId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 truncate leading-tight">
                            <span className="text-slate-800 block truncate">{s.email}</span>
                            <span className="text-[9px] text-slate-400 block font-normal mt-0.5">{s.phone}</span>
                          </td>
                          <td className="py-2 px-2 text-slate-800 font-extrabold">
                            R$ {s.cartValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            <span className="text-[8.5px] font-bold text-slate-350 block mt-0.5">{s.itemsCount} {s.itemsCount === 1 ? 'item' : 'itens'}</span>
                          </td>
                          <td className="py-2 px-2">
                            <span className="bg-indigo-50/70 text-indigo-750 border border-indigo-100/40 px-2 py-0.5 rounded-lg text-[8.5px] font-black block w-fit truncate">
                              {s.step}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-slate-550 font-semibold">{s.timeSince}</td>
                          <td className="py-2 px-2">
                            <span className="bg-slate-50 text-slate-600 px-2 py-0.5 border border-slate-100 rounded-lg text-[8.5px] font-black block w-fit">
                              {s.origin}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-slate-455 font-mono text-[9px]">{s.attempts}</td>
                          <td className="py-2 px-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider block w-fit",
                              s.status === 'Recuperado' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-650"
                            )}>
                              {s.status === 'Recuperado' ? `✓ R$ ${s.cartValue.toFixed(2)}` : 'Não recuperado'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button 
                              onClick={() => triggerToast(`Ações para sessão ${s.id}`)}
                              className="w-7 h-7 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors mx-auto cursor-pointer"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer bar */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-4.5">
                  <span className="text-[10px] font-black text-slate-400">Mostrando 1 a {filteredSessions.length} de {sessions.length} sessões</span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 mr-2">Linhas por página 10</span>
                    <button className="w-7 h-7 bg-white border border-[#E8DDFD] rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-7 h-7 bg-brand text-white border border-transparent rounded-lg flex items-center justify-center text-[10.5px] font-black">
                      1
                    </button>
                    <button className="w-7 h-7 bg-white border border-[#E8DDFD] rounded-lg flex items-center justify-center text-[10.5px] font-black text-slate-455 hover:bg-slate-50 cursor-pointer">
                      2
                    </button>
                    <button className="w-7 h-7 bg-white border border-[#E8DDFD] rounded-lg flex items-center justify-center text-slate-450 hover:text-slate-650 cursor-pointer">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'campaigns' && (
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-black text-slate-850 uppercase tracking-wider block">Campanhas de Remarketing Ativas</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Configure fluxos sequenciais de disparos automáticos para carrinhos abandonados.</span>
                </div>
              </div>
              
              <div className="py-12 bg-slate-50/50 border border-slate-100 rounded-xl flex flex-col items-center justify-center space-y-3">
                <span className="text-3xl">📭</span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Nenhuma campanha encontrada</span>
                <span className="text-[10px] text-slate-400 font-semibold text-center max-w-xs">Você ainda não tem nenhuma campanha de remarketing ativa. Clique em "Nova Campanha" para começar a recuperar vendas.</span>
              </div>
            </div>
          )}

          {activeSubTab === 'flows' && (
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2.5">
                <h4 className="text-[11px] font-black text-slate-850 uppercase tracking-wider block">Fluxos de Comunicação Inteligente</h4>
                <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Visualize e crie regras lógicas de fallback de multicanais (E-mail &rarr; WhatsApp &rarr; SMS).</span>
              </div>
              
              <div className="font-mono text-[9px] bg-slate-950 border border-slate-900 rounded-xl p-4 leading-relaxed text-slate-350 overflow-x-auto relative">
                <div className="absolute right-3.5 top-3.5 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[8px] font-black uppercase text-slate-400 pointer-events-none select-none">
                  cognitive_flow_rules.json
                </div>
                <pre className="text-left font-mono">
                  {`{
  "flow_name": "Recuperação Inteligente Multicanal",
  "triggers": ["payment_pending", "cart_abandoned"],
  "pipeline": [
    {
      "step": 1,
      "delay": "15m",
      "channel": "WhatsApp",
      "template": "Aviso de carrinho com desconto de 5% no Pix",
      "fallback": {
        "channel": "E-mail",
        "delay": "5m"
      }
    },
    {
      "step": 2,
      "delay": "24h",
      "channel": "E-mail",
      "template": "Última chance de concluir compra",
      "fallback": {
        "channel": "SMS",
        "delay": "30m"
      }
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeSubTab === 'triggers' && (
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-black text-slate-850 uppercase tracking-wider block">Gatilhos de Eventos Activos</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Ative regras automáticas baseadas em eventos ocorridos nas páginas de checkout do lojista.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {triggers.map((t, idx) => (
                  <div key={idx} className="border border-slate-50 rounded-xl p-4 bg-slate-50/10 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-xs font-black text-slate-850 block">{t.name}</span>
                      <span className="text-[9.5px] font-black text-brand block">{t.val}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const updated = triggers.map((item, i) => i === idx ? { ...item, active: !item.active } : item);
                        setTriggers(updated);
                        triggerToast(`${t.name} ${!t.active ? 'Ativado' : 'Inativado'}`);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border shrink-0 transition-all cursor-pointer",
                        t.active ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"
                      )}
                    >
                      {t.active ? 'Ativo' : 'Pausado'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'reports' && (
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2.5">
                <h4 className="text-[11px] font-black text-slate-850 uppercase tracking-wider block">Relatórios de Desempenho e Eficácia</h4>
                <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Análises gráficas e estatísticas detalhadas de taxas de conversão de leads por remessa.</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 italic">Módulo completo de Business Intelligence integrado.</p>
            </div>
          )}

          {activeSubTab === 'settings' && (
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-2.5">
                <h4 className="text-[11px] font-black text-slate-850 uppercase tracking-wider block">Definições Globais do Motor de Recovery</h4>
                <span className="text-[8.5px] font-bold text-slate-400 block mt-1">Gerencie chaves de API, webhook listeners de abandono e thresholds de disparo automático.</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 italic">Configure as integrações com Twilio, Z-API, Sendgrid e SMTP local de maneira ágil.</p>
            </div>
          )}

          {/* Bottom visual charts exactly in position */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Abandoned sessions over time chart card */}
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 text-left">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block border-b border-slate-50 pb-2">Sessões abandonadas ao longo do tempo</span>
              
              <div className="space-y-4">
                {/* Horizontal graph simulator */}
                <div className="space-y-2 pt-1">
                  {[
                    { day: '16/05 (Qui)', val: 0, percent: 0 },
                    { day: '15/05 (Qua)', val: 0, percent: 0 },
                    { day: '14/05 (Ter)', val: 0, percent: 0 },
                    { day: '13/05 (Seg)', val: 0, percent: 0 },
                    { day: '12/05 (Dom)', val: 0, percent: 0 },
                    { day: '11/05 (Sáb)', val: 0, percent: 0 },
                    { day: '10/05 (Sex)', val: 0, percent: 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-[10px] font-bold text-slate-500">
                      <span className="w-[70px] truncate shrink-0">{item.day}</span>
                      <div className="flex-1 h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 rounded-full transition-all" 
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="w-10 font-extrabold text-slate-800 text-right">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recovered revenue over time chart card */}
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 text-left">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block border-b border-slate-50 pb-2">Receita recuperada ao longo do tempo</span>
              
              <div className="space-y-4">
                {/* Horizontal graph simulator */}
                <div className="space-y-2 pt-1">
                  {[
                    { day: '16/05 (Qui)', val: 'R$ 0', percent: 0 },
                    { day: '15/05 (Qua)', val: 'R$ 0', percent: 0 },
                    { day: '14/05 (Ter)', val: 'R$ 0', percent: 0 },
                    { day: '13/05 (Seg)', val: 'R$ 0', percent: 0 },
                    { day: '12/05 (Dom)', val: 'R$ 0', percent: 0 },
                    { day: '11/05 (Sáb)', val: 'R$ 0', percent: 0 },
                    { day: '10/05 (Sex)', val: 'R$ 0', percent: 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-[10px] font-bold text-slate-500">
                      <span className="w-[70px] truncate shrink-0">{item.day}</span>
                      <div className="flex-1 h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all" 
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="w-16 font-extrabold text-slate-800 text-right shrink-0">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Abandons reason card */}
            <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm space-y-4 text-left">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider block border-b border-slate-50 pb-2">Principais motivos de abandono</span>
              
              <div className="space-y-4">
                <div className="space-y-3 pt-1">
                  {[
                    { motive: 'Sem dados suficientes', percent: 0, color: 'bg-slate-300' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1 text-[10.5px] font-semibold text-slate-650">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{item.motive}</span>
                        <span className="font-extrabold">{item.percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all", item.color)} 
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-1">
                  <a 
                    onClick={() => triggerToast("Redirecionando para análise total de abandonos...")}
                    className="text-[9.5px] font-black text-brand uppercase tracking-wider cursor-pointer hover:underline"
                  >
                    Ver relatório completo
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar Widgets area (col-span-1) */}
        <div className="xl:col-span-1 space-y-5">
          
          {/* Funil de Abandono */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm text-left space-y-4">
            <div className="border-b border-slate-50 pb-2.5">
              <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider leading-none">Funil de abandono</h4>
              <span className="text-[8px] font-bold text-slate-400 block mt-1 leading-none">Últimos 7 dias</span>
            </div>

            <div className="space-y-3.5">
              {[
                { name: 'Carrinho iniciado', val: '0', percent: '0%' },
                { name: 'Identificação', val: '0', percent: '0%' },
                { name: 'Entrega', val: '0', percent: '0%' },
                { name: 'Pagamento', val: '0', percent: '0%' },
                { name: 'Recuperados', val: '0', percent: '0%' }
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-50 pb-2">
                  <div>
                    <span className="block text-slate-700 font-extrabold">{step.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{step.val} visitas</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-850 font-black text-xs">{step.percent}</span>
                    <div className="w-16 h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden mt-1 ml-auto">
                      <div className="h-full bg-violet-600 rounded-full" style={{ width: step.percent }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gatilhos Activos */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm text-left space-y-4">
            <div className="border-b border-slate-50 pb-2.5 flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider leading-none">Gatilhos ativos</h4>
                <span className="text-[8px] font-bold text-slate-400 block mt-1 leading-none">Total: 4 gatilhos</span>
              </div>
              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-mono text-[8px] font-black uppercase">Ativos</span>
            </div>

            <div className="space-y-3">
              {triggers.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-2 text-[10.5px] font-bold text-slate-500">
                  <div>
                    <span className="block text-slate-800 font-extrabold leading-tight">{t.name}</span>
                    <span className="text-[9px] text-slate-400 font-normal leading-none block mt-0.5">{t.val}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                </div>
              ))}
              
              <div className="text-center pt-2">
                <a 
                  onClick={() => {
                    setActiveSubTab('triggers');
                    triggerToast("Carregando aba de gatilhos...");
                  }}
                  className="text-[9px] font-black text-brand uppercase tracking-wider hover:underline cursor-pointer"
                >
                  Ver todos os gatilhos
                </a>
              </div>
            </div>
          </div>

          {/* Desempenho por Canal */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm text-left space-y-4">
            <div className="border-b border-slate-50 pb-2.5">
              <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider leading-none">Desempenho por canal</h4>
              <span className="text-[8px] font-bold text-slate-400 block mt-1 leading-none">Taxa de recuperação</span>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { channel: 'E-mail', rate: '0,00%', percent: 0, color: 'bg-indigo-500' },
                { channel: 'SMS', rate: '0,00%', percent: 0, color: 'bg-indigo-400' },
                { channel: 'WhatsApp', rate: '0,00%', percent: 0, color: 'bg-violet-600' },
                { channel: 'Push', rate: '0,00%', percent: 0, color: 'bg-slate-400' }
              ].map((ch, idx) => (
                <div key={idx} className="space-y-1 text-[10.5px] font-semibold text-slate-650">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{ch.channel}</span>
                    <span className="font-extrabold">{ch.rate}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", ch.color)} 
                      style={{ width: `${ch.percent * 3.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm text-left space-y-4">
            <div className="border-b border-slate-50 pb-2.5">
              <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-wider leading-none">Ações rápidas</h4>
              <span className="text-[8px] font-bold text-slate-400 block mt-1 leading-none">Operações imediatas</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              <button 
                onClick={() => {
                  if (selectedRows.length === 0) {
                    triggerToast("Selecione pelo menos uma sessão para disparar remarketing!");
                    return;
                  }
                  triggerToast(`Disparando campanha de remarketing para ${selectedRows.length} sessões!`);
                }}
                className="h-8 border border-[#E8DDFD]/60 hover:bg-slate-50 font-black text-slate-750 uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3 h-3 text-slate-450 shrink-0" />
                Campanha
              </button>
              
              <button 
                onClick={() => triggerToast("Carregando logs analíticos de fluxos de checkout...")}
                className="h-8 border border-[#E8DDFD]/60 hover:bg-slate-50 font-black text-slate-750 uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3 h-3 text-slate-450 shrink-0" />
                Fluxos
              </button>

              <button 
                onClick={() => triggerToast("Carregando histórico de remarketing...")}
                className="h-8 border border-[#E8DDFD]/60 hover:bg-slate-50 font-black text-slate-750 uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3 h-3 text-slate-450 shrink-0" />
                Contatos
              </button>

              <button 
                onClick={() => triggerToast(`Exportando lista de ${filteredSessions.length} sessões abandonadas em XLS...`)}
                className="h-8 border border-[#E8DDFD]/60 hover:bg-slate-50 font-black text-slate-750 uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3 text-slate-450 shrink-0" />
                Exportar
              </button>
            </div>
          </div>

          {/* Left Sidebar Widget representation exact values */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-[22px] p-5 text-left text-white space-y-3.5 shadow-xl">
            <div>
              <span className="text-[9.5px] font-black text-violet-400 uppercase tracking-widest block leading-none">Resumo do recovery</span>
              <span className="text-[8px] text-slate-500 font-bold block mt-1 leading-none">Últimos 7 dias</span>
            </div>

            <div className="space-y-2.5 pt-1 text-[11px] font-bold text-slate-350">
              {[
                { label: 'Sessões abandonadas', val: '0' },
                { label: 'Recuperadas', val: '0' },
                { label: 'Taxa de recuperação', val: '0,00%', highlight: 'text-emerald-450' },
                { label: 'Receita', val: 'R$ 0,00', highlight: 'text-emerald-400' },
                { label: 'Ticket médio recuperado', val: 'R$ 0,00' },
                { label: 'SMS enviados', val: '0' },
                { label: 'Conversão por e-mail', val: '0,00%' },
                { label: 'Conversão por SMS', val: '0,00%' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-800/40 pb-1.5">
                  <span>{item.label}</span>
                  <span className={cn("font-black text-white", item.highlight)}>{item.val}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 pt-1.5">
              <span>Última atualização</span>
              <span>16/05/2024 10:21:19</span>
            </div>
          </div>

        </div>

      </div>

      {/* New Campaign Dialog Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center select-none animate-in fade-in duration-200">
          <div className="bg-white border border-[#E8DDFD] w-[450px] rounded-[24px] p-5.5 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <span className="text-xs font-black text-slate-850 uppercase tracking-wider">Criar Nova Campanha de Recovery</span>
              <button 
                onClick={() => setShowCampaignModal(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer h-6 w-6 rounded-lg flex items-center justify-center hover:bg-slate-50"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3.5 text-xs font-semibold text-slate-650">
              <div className="space-y-1">
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Nome da Campanha</label>
                <input type="text" placeholder="Ex: Abandono Pix High Ticket" className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Gatilho de Disparo</label>
                  <select className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer">
                    <option>Abandono imediato</option>
                    <option>Pix expirado</option>
                    <option>Cartão recusado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Canal Principal</label>
                  <select className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer">
                    <option>WhatsApp</option>
                    <option>E-mail</option>
                    <option>SMS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Valor Mínimo do Carrinho ($)</label>
                <input type="number" defaultValue={100} className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-50">
              <button 
                onClick={() => setShowCampaignModal(false)}
                className="flex-1 h-10 border border-[#E8DDFD] rounded-xl text-[10px] font-black uppercase text-slate-650 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowCampaignModal(false);
                  triggerToast("Nova campanha de remarketing criada com sucesso!");
                }}
                className="flex-1 h-10 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-brand/15"
              >
                Confirmar Criação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm z-50 flex items-center justify-center select-none animate-in fade-in duration-200">
          <div className="bg-white border border-[#E8DDFD] w-[450px] rounded-[24px] p-5.5 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <span className="text-xs font-black text-slate-850 uppercase tracking-wider">Definições Globais de Abandono</span>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-650 cursor-pointer h-6 w-6 rounded-lg flex items-center justify-center hover:bg-slate-50"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-xs font-semibold text-slate-650">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span>Capturar e-mail na digitação (Smart Capture)</span>
                  <input type="checkbox" defaultChecked className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5" />
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span>Disparo de multicanais ativo (Sequencial)</span>
                  <input type="checkbox" defaultChecked className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5" />
                </div>
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span>Aplicar desconto cupom automático</span>
                  <input type="checkbox" className="rounded border-[#E8DDFD] text-brand focus:ring-brand cursor-pointer w-4.5 h-4.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Janela de Tempo para Abandono (Minutos)</label>
                <input type="number" defaultValue={15} className="w-full bg-slate-50 border border-[#E8DDFD] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-50">
              <button 
                onClick={() => setShowConfigModal(false)}
                className="flex-1 h-10 border border-[#E8DDFD] rounded-xl text-[10px] font-black uppercase text-slate-650 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowConfigModal(false);
                  triggerToast("Parâmetros do motor de Recovery atualizados!");
                }}
                className="flex-1 h-10 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-brand/15"
              >
                Salvar Definições
              </button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
}
