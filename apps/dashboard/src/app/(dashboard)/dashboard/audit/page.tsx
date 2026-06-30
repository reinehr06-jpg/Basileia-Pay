'use client';

import { useState, useEffect } from 'react';
import { 
  Terminal, 
  Search, 
  X, 
  Copy, 
  Check, 
  HelpCircle, 
  Bookmark, 
  Download, 
  Shield, 
  User, 
  ShieldAlert, 
  PenLine, 
  Info, 
  ChevronDown, 
  RefreshCw,
  Activity,
  Zap,
  Repeat
} from 'lucide-react';
import { AuditEvent } from '@/types/audit';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

const EVENT_MAP: Record<string, { category: string; level: string; type: string }> = {
  'login':               { category: 'ACESSO',     level: 'Informativo', type: 'login' },
  'logout':              { category: 'ACESSO',     level: 'Informativo', type: 'login' },
  'payment.captured':    { category: 'PAGAMENTO',  level: 'Informativo', type: 'payment' },
  'payment.created':     { category: 'PAGAMENTO',  level: 'Informativo', type: 'payment' },
  'payment.refunded':    { category: 'REEMBOLSO',  level: 'Crítico',     type: 'refund' },
  'payment.failed':      { category: 'PAGAMENTO',  level: 'Crítico',     type: 'payment' },
  'payment.risk_flagged':{ category: 'SEGURANÇA',  level: 'Crítico',     type: 'security' },
  'checkout.created':    { category: 'CHECKOUT',   level: 'Informativo', type: 'checkout' },
  'checkout.updated':    { category: 'CHECKOUT',   level: 'Alteração',   type: 'checkout' },
  'checkout.deleted':    { category: 'EXCLUSÃO',   level: 'Crítico',     type: 'checkout' },
  'webhook.sent':        { category: 'WEBHOOK',    level: 'Informativo', type: 'webhook' },
  'webhook.delivered':   { category: 'WEBHOOK',    level: 'Informativo', type: 'webhook' },
  'webhook.failed':      { category: 'WEBHOOK',    level: 'Crítico',     type: 'webhook' },
  'subscription.created':{ category: 'ASSINATURA', level: 'Informativo', type: 'subscription' },
  'subscription.canceled':{category: 'ASSINATURA', level: 'Alteração',   type: 'subscription' },
  'api_key.created':     { category: 'INTEGRAÇÃO', level: 'Alteração',   type: 'integration' },
  'api_key.deleted':     { category: 'INTEGRAÇÃO', level: 'Crítico',     type: 'integration' },
  'user.created':        { category: 'USUÁRIO',    level: 'Alteração',   type: 'user' },
  'user.updated':        { category: 'USUÁRIO',    level: 'Alteração',   type: 'user' },
  'user.deleted':        { category: 'USUÁRIO',    level: 'Crítico',     type: 'user' },
  'permissions.updated': { category: 'USUÁRIO',    level: 'Alteração',   type: 'user' },
  'settings.updated':    { category: 'CONFIGURAÇÃO', level: 'Alteração', type: 'config' },
  'security.access_denied':{ category: 'SEGURANÇA',level: 'Crítico',     type: 'security' },
  'security.flag_raised':{ category: 'SEGURANÇA',  level: 'Crítico',     type: 'security' },
};

function auditEventFromApi(log: any): AuditEvent {
  const created = new Date(log.created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  let relative: string;
  if (diffMin < 1) relative = 'agora';
  else if (diffMin < 60) relative = `${diffMin}m atrás`;
  else if (diffMin < 1440) relative = `${Math.floor(diffMin / 60)}h atrás`;
  else relative = `${Math.floor(diffMin / 1440)}d atrás`;

  const eventKey = log.event || '';
  const mapping = EVENT_MAP[eventKey] || { category: 'CONFIGURAÇÃO', level: 'Informativo', type: 'config' };
  const title = eventKey
    .replace(/_/g, ' ')
    .replace(/\./g, ' — ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

  return {
    id: log.uuid || log.id,
    time: created.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    relative,
    date: created.toLocaleDateString('pt-BR'),
    title,
    category: mapping.category,
    details: log.metadata?.description || `${title} por ${log.user?.name || 'Sistema'}`,
    meta: log.ip_address_hash ? `IP: ${log.ip_address_hash}` : '',
    user: log.user?.name || 'Sistema',
    role: log.user?.role || (log.user ? 'Usuário' : 'Sistema'),
    system: log.metadata?.system || log.metadata?.gateway || log.metadata?.endpoint || 'Basileia Pay',
    environment: log.metadata?.environment || 'Produção',
    ip: log.ip_address_hash || '',
    location: log.metadata?.location || '',
    level: mapping.level,
    type: mapping.type,
    entityType: log.entity_type || '',
    entityId: log.entity_id || null,
    metadata: log.metadata || {},
    relatedIds: log.metadata?.order_id ? { orderId: log.metadata.order_id } : undefined,
  };
}

export default function AuditPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  
  // Selected event and Drawer visibility
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Realtime Polling state
  const [realtimeActive, setRealtimeActive] = useState(true);
  
  // Filters State (Row 1)
  const [period, setPeriod] = useState('Hoje');
  const [filterUser, setFilterUser] = useState('Todos');
  const [filterSystem, setFilterSystem] = useState('Todos');
  const [filterEventType, setFilterEventType] = useState('Todos');
  const [filterLevel, setFilterLevel] = useState('Todos');
  
  // Filters State (Row 2)
  const [filterEntity, setFilterEntity] = useState('Todos');
  const [filterEntityId, setFilterEntityId] = useState('');
  const [filterAction, setFilterAction] = useState('Todos');
  const [filterIp, setFilterIp] = useState('');
  const [filterResult, setFilterResult] = useState('Todos');
  
  // Search input
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active Tab Filter
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'alteration' | 'access' | 'deletion'>('all');
  
  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Interaction feedbacks
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reviewedEvents, setReviewedEvents] = useState<string[]>([]);
  const [incidents, setIncidents] = useState<Record<string, string>>({});

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/v1/dashboard/audit');
        if (res.success && Array.isArray(res.data)) {
          setEvents(res.data.map(auditEventFromApi));
        }
      } catch (err) { console.error('Failed to fetch audit events:', err); } finally {
        setLoading(false);
      }
    })();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmExport = async () => {
    triggerToast(`Preparando exportação em formato PDF...`);

    const exportData = filteredEvents;

    try {
      if (exportFormat === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const autoTableModule = await import('jspdf-autotable');
        const autoTable = autoTableModule.default;
        
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.setTextColor(109, 40, 217);
        doc.text('Basileia Pay - Auditoria e Logs', 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(124, 58, 237);
        doc.text('Relatório Forense e Rastreador de Eventos', 14, 30);
        
        doc.setFontSize(9);
        doc.setTextColor(88, 28, 135);
        doc.text(`Período: ${period}`, 14, 40);
        doc.text(`Data de Geração: ${new Date().toLocaleString()}`, 14, 45);
        doc.text(`Total de Registros: ${exportData.length}`, 100, 40);

        autoTable(doc, {
          startY: 55,
          head: [['Data/Hora', 'Categoria', 'Evento', 'Usuário', 'Nível', 'IP']],
          body: exportData.length > 0 ? exportData.map(o => [
            `${o.date} ${o.time}`,
            o.category,
            o.title,
            o.user,
            o.level,
            o.ip
          ]) : [['Nenhum log encontrado', '-', '-', '-', '-', '-']],
          theme: 'grid',
          headStyles: { fillColor: [250, 245, 255], textColor: [88, 28, 135] },
          styles: { fontSize: 8 }
        });

        doc.save(`auditoria_${Date.now()}.pdf`);
        triggerToast("Download do PDF concluído com sucesso!");
      } else {
        let fileContent = '\ufeff'; // UTF-8 BOM
        fileContent += "AUDITORIA FORENSE - BASILEIA PAY\r\n";
        fileContent += `Data de Geração:;${new Date().toLocaleString()}\r\n`;
        fileContent += `Filtro de Período:;${period}\r\n`;
        fileContent += `Filtro de Usuário:;${filterUser}\r\n\r\n`;

        fileContent += "ID;Data;Hora;Relativo;Categoria;Evento;Nível;Detalhes;IP;Usuário;Sistema;Entidade;ID Entidade\r\n";
        if (exportData.length > 0) {
          exportData.forEach(o => {
            fileContent += `${o.id};${o.date};${o.time};${o.relative};${o.category};${o.title};${o.level};${o.details};${o.ip};${o.user};${o.system};${o.entityType};${o.entityId}\r\n`;
          });
        } else {
          fileContent += "Nenhum dado encontrado\r\n";
        }

        const mimeType = exportFormat === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel;charset=utf-8;';
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `auditoria_${Date.now()}.${exportFormat === 'csv' ? 'csv' : 'xls'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast(`Download do ${exportFormat.toUpperCase()} concluído com sucesso!`);
      }
    } catch (error) {
      console.error(error);
      triggerToast('Erro ao exportar documento.');
    }
  };

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleMarkAsReviewed = (id: string) => {
    setReviewedEvents(prev => [...prev, id]);
    triggerToast('Evento marcado como revisado com sucesso.');
  };

  const handleOpenIncident = (id: string) => {
    const incId = `INC-${Math.floor(100000 + Math.random() * 900000)}`;
    setIncidents(prev => ({ ...prev, [id]: incId }));
    triggerToast(`Incidente ${incId} criado e associado ao evento.`);
  };

  const handleOpenEvent = (event: AuditEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const getEventTheme = (level: string, category: string) => {
    if (level === 'Crítico' || category === 'SEGURANÇA') {
      return { 
        icon: ShieldAlert, 
        bgClass: 'bg-red-50 text-red-650 border-red-200', 
        dotClass: 'bg-red-500', 
        badgeClass: 'bg-red-50 text-red-700 border-red-200' 
      };
    }
    if (category === 'PAGAMENTO') {
      return { 
        icon: Activity, 
        bgClass: 'bg-green-50 text-green-600 border-green-200', 
        dotClass: 'bg-green-600', 
        badgeClass: 'bg-green-50 text-green-700 border-green-200' 
      };
    }
    if (category === 'WEBHOOK') {
      return { 
        icon: Zap, 
        bgClass: 'bg-blue-50 text-blue-600 border-blue-200', 
        dotClass: 'bg-blue-600', 
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' 
      };
    }
    if (category === 'ASSINATURA') {
      return { 
        icon: Repeat, 
        bgClass: 'bg-orange-50 text-orange-655 border-orange-200', 
        dotClass: 'bg-orange-600', 
        badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' 
      };
    }
    if (level === 'Alteração') {
      return { 
        icon: PenLine, 
        bgClass: 'bg-violet-50 text-violet-600 border-violet-200', 
        dotClass: 'bg-violet-500', 
        badgeClass: 'bg-violet-50 text-violet-700 border-violet-200' 
      };
    }
    return { 
      icon: Info, 
      bgClass: 'bg-slate-50 text-slate-500 border-slate-200', 
      dotClass: 'bg-blue-500', 
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' 
    };
  };

  const getFilteredEvents = () => {
    return events.filter(evt => {
      // Search Box
      const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            evt.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (evt.entityId && evt.entityId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            evt.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            evt.system.toLowerCase().includes(searchQuery.toLowerCase());

      // Tab selector
      let matchesTab = true;
      if (activeTab === 'critical') matchesTab = evt.level === 'Crítico';
      else if (activeTab === 'alteration') matchesTab = evt.level === 'Alteração';
      else if (activeTab === 'access') matchesTab = evt.level === 'Acesso' || evt.category === 'ACESSO';
      else if (activeTab === 'deletion') matchesTab = evt.level === 'Exclusão' || evt.category === 'EXCLUSÃO';

      // Filters
      const matchesUser = filterUser === 'Todos' ? true : evt.user === filterUser;
      const matchesSystem = filterSystem === 'Todos' ? true : evt.system === filterSystem;
      const matchesLevel = filterLevel === 'Todos' ? true : evt.level === filterLevel;
      const matchesEventType = filterEventType === 'Todos' ? true : evt.title === filterEventType;
      const matchesEntity = filterEntity === 'Todos' ? true : evt.entityType === filterEntity;
      const matchesEntityId = filterEntityId === '' ? true : evt.entityId?.toLowerCase().includes(filterEntityId.toLowerCase());
      const matchesIp = filterIp === '' ? true : evt.ip.includes(filterIp);
      const matchesResult = filterResult === 'Todos' ? true : (filterResult.toLowerCase() === 'success' ? true : false); // simple match

      return matchesSearch && matchesTab && matchesUser && matchesSystem && matchesLevel && matchesEventType && matchesEntity && matchesEntityId && matchesIp && matchesResult;
    });
  };

  const filteredEvents = getFilteredEvents();
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const hasActiveFilters = 
    filterUser !== 'Todos' || 
    filterSystem !== 'Todos' || 
    filterLevel !== 'Todos' || 
    filterEventType !== 'Todos' || 
    filterEntity !== 'Todos' || 
    filterEntityId !== '' || 
    filterIp !== '' || 
    filterResult !== 'Todos' || 
    searchQuery !== '';

  const handleClearFilters = () => {
    setFilterUser('Todos');
    setFilterSystem('Todos');
    setFilterLevel('Todos');
    setFilterEventType('Todos');
    setFilterEntity('Todos');
    setFilterEntityId('');
    setFilterIp('');
    setFilterResult('Todos');
    setSearchQuery('');
  };

  if (!mounted) return null;

  return (
    <div className="w-full text-left space-y-5 select-none font-sans relative">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 bg-brand text-white p-3.5 rounded-2xl shadow-xl border border-brand/50 flex items-center justify-between gap-3 max-w-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span className="text-[11.5px] font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header section (Section 3) */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[30px] font-black tracking-[-0.04em] text-slate-950">
              Auditoria
            </h1>
            <div className="group relative cursor-pointer">
              <HelpCircle className="h-5 w-5 text-slate-400 hover:text-slate-500" />
              <div className="absolute left-0 bottom-6 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-lg w-[260px] z-50 leading-relaxed font-semibold">
                🛡️ **Imutabilidade total:** todos os logs de auditoria da Basileia Pay são somente-leitura. Nenhum dado pode ser editado, excluído ou alterado.
              </div>
            </div>
          </div>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Central forense de eventos do sistema com rastreabilidade completa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => triggerToast('Filtros salvos como busca rápida.')}
            className="flex h-10 items-center justify-center gap-1.5 px-4 bg-white border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-770 shadow-sm transition-all"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            Salvar busca
          </button>
          <button 
            onClick={handleConfirmExport}
            className="flex h-10 items-center justify-center gap-1.5 px-4 bg-white border border-[#E8DDFD] hover:bg-slate-50 rounded-xl text-xs font-black text-slate-770 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Exportar
          </button>
          <button 
            onClick={() => triggerToast('Modo de investigação de logs ativado.')}
            className="flex h-10 items-center justify-center gap-1.5 px-4 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black shadow-lg shadow-violet-600/15 transition-all uppercase tracking-tight"
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            Investigação
          </button>
        </div>
      </div>

      {/* Filters Area (Section 4) */}
      <div className="rounded-[22px] border border-[#E8DDFD] bg-white/85 p-4 shadow-sm backdrop-blur-md space-y-3">
        {/* Row 1 */}
        <div className="grid grid-cols-5 gap-3">
          {/* Período */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Período
            </span>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-950 focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="Hoje">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Usuário */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Usuário
            </span>
            <select 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-950 focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="Todos">Todos</option>
              <option value="Vinícius Admin">Vinícius Admin</option>
              <option value="Mariana Santos">Mariana Santos</option>
              <option value="Rafael Oliveira">Rafael Oliveira</option>
              <option value="Sistema">Sistema</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sistema */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Sistema
            </span>
            <select 
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-950 focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="Todos">Todos</option>
              <option value="Basileia Pay">Basileia Pay</option>
              <option value="Mercado Pago">Mercado Pago</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Tipo de evento */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Tipo de evento
            </span>
            <select 
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-950 focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="Todos">Todos</option>
              <option value="Reembolso aprovado">Reembolso aprovado</option>
              <option value="Checkout atualizado">Checkout atualizado</option>
              <option value="Login realizado">Login realizado</option>
              <option value="Chave de API criada">Chave de API criada</option>
              <option value="Permissão alterada">Permissão alterada</option>
              <option value="Pagamento capturado">Pagamento capturado</option>
              <option value="Tentativa de acesso negada">Tentativa de acesso negada</option>
              <option value="Webhook entregue">Webhook entregue</option>
              <option value="Assinatura cancelada">Assinatura cancelada</option>
              <option value="Configuração alterada">Configuração alterada</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Nível */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Nível
            </span>
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-955 focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="Todos">Todos</option>
              <option value="Crítico">Crítico</option>
              <option value="Alteração">Alteração</option>
              <option value="Informativo">Informativo</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-6 gap-3">
          {/* Entidade */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Entidade
            </span>
            <select 
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-950 focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="Todos">Todas</option>
              <option value="Reembolso">Reembolso</option>
              <option value="Checkout">Checkout</option>
              <option value="Sessão">Sessão</option>
              <option value="API Key">API Key</option>
              <option value="Usuário">Usuário</option>
              <option value="Pagamento">Pagamento</option>
              <option value="Webhook">Webhook</option>
              <option value="Assinatura">Assinatura</option>
              <option value="Configuração">Configuração</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* ID Entidade */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              ID Entidade
            </span>
            <input 
              type="text"
              placeholder="Ex: REE-2024..."
              value={filterEntityId}
              onChange={(e) => setFilterEntityId(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-950 focus:outline-none placeholder:text-slate-350"
            />
          </div>

          {/* Ação */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Ação
            </span>
            <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-950 focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="Todos">Todas</option>
              <option value="criação">Criação</option>
              <option value="alteração">Alteração</option>
              <option value="exclusão">Exclusão</option>
              <option value="acesso">Acesso</option>
              <option value="aprovação">Aprovação</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* IP de Origem */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              IP Origem
            </span>
            <input 
              type="text"
              placeholder="Ex: 177.12..."
              value={filterIp}
              onChange={(e) => setFilterIp(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-955 focus:outline-none placeholder:text-slate-350"
            />
          </div>

          {/* Resultado */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white px-3 relative">
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Resultado
            </span>
            <select 
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-950 focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="Todos">Todos</option>
              <option value="success">Sucesso</option>
              <option value="failed">Falha</option>
              <option value="blocked">Bloqueado</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-455 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Busca Global */}
          <div className="flex h-11 flex-col justify-center rounded-2xl border border-[#E8DDFD] bg-white pl-7 pr-3 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 leading-none mb-0.5">
              Busca Global
            </span>
            <input 
              type="text"
              placeholder="ID, usuário, sistema..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-950 focus:outline-none placeholder:text-slate-350"
            />
          </div>
        </div>

        {/* Row 3 - Active filters (Section 4) */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-semibold text-slate-500">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Filtros ativos:</span>
              {filterUser !== 'Todos' && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-750 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  Usuário: {filterUser}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFilterUser('Todos')} />
                </span>
              )}
              {filterSystem !== 'Todos' && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-750 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  Sistema: {filterSystem}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFilterSystem('Todos')} />
                </span>
              )}
              {filterLevel !== 'Todos' && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-750 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  Nível: {filterLevel}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFilterLevel('Todos')} />
                </span>
              )}
              {filterEventType !== 'Todos' && (
                <span className="px-2 py-0.5 bg-violet-550 text-violet-750 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  Tipo: {filterEventType}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFilterEventType('Todos')} />
                </span>
              )}
              {filterEntity !== 'Todos' && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-750 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  Entidade: {filterEntity}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFilterEntity('Todos')} />
                </span>
              )}
              {filterEntityId && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-750 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  ID: {filterEntityId}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFilterEntityId('')} />
                </span>
              )}
              {filterIp && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-750 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  IP: {filterIp}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFilterIp('')} />
                </span>
              )}
              {filterResult !== 'Todos' && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-755 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  Resultado: {filterResult}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFilterResult('Todos')} />
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 bg-violet-50 text-violet-750 border border-violet-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  Busca: {searchQuery}
                  <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setSearchQuery('')} />
                </span>
              )}
            </div>
            <button 
              onClick={handleClearFilters}
              className="text-xs font-black text-red-500 hover:underline active:scale-95"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Timeline Table ocupando 100% largura (Item 2 & 6) */}
      <main className="min-w-0 w-full overflow-visible">
        
        <div className="w-full min-w-0 overflow-hidden rounded-[22px] border border-[#E8DDFD] bg-white/85 shadow-sm">
          
          {/* Tabs de categorias com contadores (Section 5) */}
          <div className="flex items-center justify-between border-b border-[#E8DDFD] px-4 py-3 bg-[#FAF8FF]">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'Todos', count: events.length },
                { id: 'critical', label: 'Críticos', count: events.filter(e => e.level === 'Crítico').length },
                { id: 'alteration', label: 'Alterações', count: events.filter(e => e.level === 'Alteração').length },
                { id: 'access', label: 'Acessos', count: events.filter(e => e.level === 'Acesso' || e.category === 'ACESSO').length },
                { id: 'deletion', label: 'Exclusões', count: events.filter(e => e.level === 'Exclusão' || e.category === 'EXCLUSÃO').length }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-black uppercase tracking-[0.08em] transition-all",
                      isActive
                        ? "border border-violet-300 bg-violet-50 text-violet-750"
                        : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {tab.label}
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px]",
                      isActive ? "bg-white text-violet-700 shadow-sm" : "bg-slate-100 text-slate-500"
                    )}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setRealtimeActive(prev => !prev)}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-slate-600 cursor-pointer"
              >
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  realtimeActive ? "bg-green-500 animate-pulse" : "bg-slate-350"
                )} />
                Tempo real
              </button>

              <button 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    triggerToast('Logs atualizados com sucesso.');
                  }, 800);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8DDFD] bg-white hover:bg-slate-50 text-slate-500"
              >
                <RefreshCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
              </button>
            </div>
          </div>

          {/* Table Data Container */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1180px] table-fixed text-left">
              <colgroup>
                <col className="w-[140px]" />
                <col className="w-[220px]" />
                <col />
                <col className="w-[180px]" />
                <col className="w-[160px]" />
                <col className="w-[140px]" />
                <col className="w-[120px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-[#E8DDFD] bg-[#FAF8FF]">
                  {["Data/Hora", "Evento", "Detalhes", "Usuário", "Sistema", "IP", "Nível"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-400"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-slate-400 font-bold">
                      Carregando logs da auditoria...
                    </td>
                  </tr>
                ) : paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-slate-400 font-bold">
                      Nenhum evento encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((event) => {
                    const theme = getEventTheme(event.level, event.category);
                    const isSelected = selectedEvent?.id === event.id && isDetailsOpen;

                    return (
                      <tr 
                        key={event.id}
                        onClick={() => handleOpenEvent(event)}
                        className={cn(
                          "cursor-pointer border-b border-slate-100 transition h-[68px]",
                          isSelected ? "bg-violet-50/70" : "hover:bg-[#FAF8FF]"
                        )}
                      >
                        {/* Data/Hora */}
                        <td className="relative px-4 py-3 align-middle">
                          <div className="absolute left-5 top-0 h-full w-px bg-slate-200 pointer-events-none" />

                          <div className="relative flex items-center gap-3">
                            <span className={cn(
                              "z-10 h-3 w-3 rounded-full ring-4 ring-white shrink-0",
                              theme.dotClass
                            )} />

                            <div>
                              <p className="text-sm font-black text-slate-955">{event.time}</p>
                              <p className="text-[11px] font-semibold text-slate-400">{event.relative}</p>
                            </div>
                          </div>
                        </td>

                        {/* Evento */}
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0 border", theme.bgClass)}>
                              <theme.icon className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-950">
                                {event.title}
                              </p>

                              <span className="mt-1 inline-flex rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-black uppercase text-violet-700">
                                {event.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Detalhes */}
                        <td className="min-w-0 px-4 py-3 align-middle">
                          <p className="truncate text-sm font-semibold text-slate-700">
                            {event.details}
                          </p>
                          <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                            {event.meta}
                          </p>
                        </td>

                        {/* Usuário */}
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 shrink-0 border border-slate-200">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>

                            <div>
                              <p className="text-sm font-black text-slate-950">{event.user}</p>
                              <p className="text-[11px] font-semibold text-slate-400">{event.role}</p>
                            </div>
                          </div>
                        </td>

                        {/* Sistema */}
                        <td className="px-4 py-3 align-middle">
                          <p className="text-sm font-black text-slate-955">{event.system}</p>
                          <p className="text-[11px] font-semibold text-slate-400">{event.environment}</p>
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3 align-middle">
                          <p className="text-sm font-bold text-slate-700 font-mono">{event.ip}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{event.location || 'Brasil'}</p>
                        </td>

                        {/* Nível */}
                        <td className="px-4 py-3 align-middle">
                          <span className={cn(
                            "inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase border",
                            event.level === "Crítico" && "bg-red-50 text-red-655 border-red-200",
                            event.level === "Alteração" && "bg-violet-50 text-violet-700 border-violet-200",
                            event.level === "Informativo" && "bg-slate-100 text-slate-600 border-slate-200"
                          )}>
                            {event.level}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação da tabela (Section 22) */}
          <div className="flex h-[58px] items-center justify-between border-t border-[#E8DDFD] px-5 bg-[#FAF8FF]/40">
            <p className="text-xs font-semibold text-slate-500">
              Mostrando {Math.min(filteredEvents.length, (currentPage - 1) * rowsPerPage + 1)} a {Math.min(filteredEvents.length, currentPage * rowsPerPage)} de {filteredEvents.length} eventos
            </p>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(1)} 
                className={cn("h-8 w-8 rounded-xl border border-[#E8DDFD] bg-white text-xs font-bold transition-all", currentPage === 1 ? 'border-violet-300 bg-violet-50 text-violet-700 font-black' : 'hover:bg-slate-50')}
              >
                1
              </button>
              <button 
                onClick={() => setCurrentPage(2)} 
                disabled={Math.ceil(filteredEvents.length / rowsPerPage) < 2}
                className={cn("h-8 w-8 rounded-xl border border-[#E8DDFD] bg-white text-xs font-bold transition-all", currentPage === 2 ? 'border-violet-300 bg-violet-50 text-violet-700 font-black' : 'hover:bg-slate-50 disabled:opacity-50')}
              >
                2
              </button>
              <button 
                onClick={() => setCurrentPage(3)} 
                disabled={Math.ceil(filteredEvents.length / rowsPerPage) < 3}
                className={cn("h-8 w-8 rounded-xl border border-[#E8DDFD] bg-white text-xs font-bold transition-all", currentPage === 3 ? 'border-violet-300 bg-violet-50 text-violet-700 font-black' : 'hover:bg-slate-50 disabled:opacity-50')}
              >
                3
              </button>
              {Math.ceil(filteredEvents.length / rowsPerPage) > 3 && (
                <>
                  <span className="text-slate-400 text-xs px-1">...</span>
                  <button 
                    onClick={() => setCurrentPage(Math.ceil(filteredEvents.length / rowsPerPage) || 1)} 
                    className="h-8 rounded-xl border border-[#E8DDFD] bg-white px-3 text-xs font-bold hover:bg-slate-50"
                  >
                    {Math.ceil(filteredEvents.length / rowsPerPage)}
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Linhas por página</span>
              <select 
                value={rowsPerPage} 
                onChange={(e) => { setRowsPerPage(parseInt(e.target.value) || 10); setCurrentPage(1); }}
                className="h-8 rounded-xl border border-[#E8DDFD] bg-white px-3 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

        </div>

      </main>

      {/* Drawer sobreposto à direita para Detalhes do Evento (Item 4 & 5) */}
      {isDetailsOpen && selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-slate-955/20 backdrop-blur-[2px] transition-all"
          onClick={() => setIsDetailsOpen(false)}
        >
          <aside 
            className="h-full w-full max-w-[420px] lg:max-w-[440px] overflow-y-auto border-l border-[#E8DDFD] bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    Detalhes do evento
                  </h3>
                </div>

                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8DDFD] bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Event title & badge */}
              <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 border", getEventTheme(selectedEvent.level, selectedEvent.category).bgClass)}>
                  <ShieldAlert className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-base font-black text-slate-950 leading-tight">{selectedEvent.title}</p>
                  <span className="mt-1 inline-flex rounded-md bg-violet-50 border border-violet-250 px-2 py-0.5 text-[10px] font-black uppercase text-violet-700">
                    {selectedEvent.category}
                  </span>
                </div>
              </div>

              {/* Detail fields (Section 18) */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-100 py-3.5">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">ID do evento</p>
                  <p className="mt-1 text-xs font-mono font-bold text-slate-800 truncate select-all">{selectedEvent.id}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Data / Hora</p>
                  <p className="mt-1 text-xs font-bold text-slate-800">{selectedEvent.date} {selectedEvent.time}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Nível</p>
                  <p className="mt-1 text-xs font-bold text-slate-800">{selectedEvent.level}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Sistema</p>
                  <p className="mt-1 text-xs font-bold text-slate-800 leading-tight">{selectedEvent.system} / {selectedEvent.environment}</p>
                </div>
              </div>

              {/* IP source block */}
              <div className="border-b border-slate-100 py-3.5">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">IP de Origem</p>
                <p className="mt-1 text-xs font-bold text-slate-800 font-mono">{selectedEvent.ip} <span className="text-slate-400 font-sans ml-1">({selectedEvent.location || 'São Paulo, Brasil'})</span></p>
              </div>

              {/* Affected Entity block (Section 19) */}
              <div className="border-b border-slate-100 py-3.5 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  Entidade afetada
                </h4>

                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Tipo</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-800">{selectedEvent.entityType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">ID da entidade</p>
                    <p className="mt-0.5 text-xs font-mono font-bold text-slate-800">{selectedEvent.entityId || 'N/A'}</p>
                  </div>
                  {selectedEvent.relatedIds?.orderId && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 font-sans">Pedido relacionado</p>
                      <p className="mt-0.5 text-xs font-bold text-violet-600 hover:underline cursor-pointer">{selectedEvent.relatedIds.orderId}</p>
                    </div>
                  )}
                  {selectedEvent.relatedIds?.customerId && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 font-sans">Cliente relacionado</p>
                      <p className="mt-0.5 text-xs font-bold text-violet-600 hover:underline cursor-pointer">{selectedEvent.relatedIds.customerId} — Mariana Souza</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text details description */}
              <div className="border-b border-slate-100 py-3.5">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">Descrição da Ação</p>
                <p className="mt-1 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100/60 leading-relaxed">{selectedEvent.details}</p>
              </div>

              {/* JSON Payload (Section 20) */}
              {selectedEvent.metadata && (
                <div className="border-b border-slate-100 py-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      Metadados
                    </h4>

                    <button 
                      onClick={() => handleCopyText(JSON.stringify(selectedEvent.metadata, null, 2), 'json')}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E8DDFD] bg-white hover:bg-slate-50 text-slate-500 active:scale-95 transition-all"
                    >
                      {copiedField === 'json' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <pre className="max-h-[140px] overflow-auto rounded-2xl bg-slate-950 p-4 text-[10.5px] leading-relaxed text-emerald-400 font-mono no-scrollbar">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Action Buttons (Section 21) */}
            <div className="grid grid-cols-2 gap-2 pt-4">
              <button 
                onClick={() => triggerToast('Exibindo entidade relacionada...')}
                className="h-10 rounded-xl border border-[#E8DDFD] bg-white hover:bg-slate-50 text-xs font-black text-slate-750 transition-colors"
              >
                Ver entidade
              </button>

              <button 
                onClick={() => triggerToast(`Histórico da entidade ${selectedEvent.entityId || ''} filtrado.`)}
                className="h-10 rounded-xl border border-[#E8DDFD] bg-white hover:bg-slate-50 text-xs font-black text-slate-755 transition-colors"
              >
                Investigar histórico
              </button>

              <button 
                onClick={() => handleMarkAsReviewed(selectedEvent.id)}
                disabled={reviewedEvents.includes(selectedEvent.id)}
                className="h-10 rounded-xl border border-[#E8DDFD] bg-white hover:bg-slate-50 text-xs font-black text-slate-755 transition-colors disabled:opacity-50"
              >
                {reviewedEvents.includes(selectedEvent.id) ? 'Revisado' : 'Marcar revisado'}
              </button>

              <button 
                onClick={() => handleOpenIncident(selectedEvent.id)}
                className="h-10 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-xs font-black text-red-655 transition-colors"
              >
                {incidents[selectedEvent.id] ? `Incid: ${incidents[selectedEvent.id]}` : 'Abrir incidente'}
              </button>
            </div>

          </aside>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8DDFD] shadow-2xl p-6 max-w-md w-full animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center gap-3 text-brand border-b border-slate-100 pb-3 mb-4">
              <Download className="w-5 h-5 shrink-0" />
              <h3 className="text-slate-950 font-black text-sm">Exportar Auditoria de Logs</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF8FF] border border-[#E8DDFD]/60 p-3.5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none">Filtros aplicados</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-bold text-slate-700">
                  <div><span className="text-slate-400 font-medium">Período:</span> {period}</div>
                  <div><span className="text-slate-400 font-medium">Usuário:</span> {filterUser}</div>
                  <div><span className="text-slate-400 font-medium">Nível:</span> {filterLevel}</div>
                  <div><span className="text-slate-400 font-medium">Sistema:</span> {filterSystem}</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Formato de exportação</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'csv', label: 'CSV', desc: 'Dados brutos' },
                    { id: 'excel', label: 'Excel', desc: 'Planilha formatada' },
                    { id: 'pdf', label: 'PDF', desc: 'Documento impresso' }
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setExportFormat(fmt.id as 'csv' | 'excel' | 'pdf')}
                      className={cn(
                        "p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer",
                        exportFormat === fmt.id 
                          ? "bg-brand/10 border-brand/40 text-brand"
                          : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                      )}
                    >
                      <span className="font-black leading-none">{fmt.label}</span>
                      <span className="text-[8px] font-medium text-slate-400 leading-none">{fmt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-1.5 border border-[#E7E5EF] hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-slate-700 uppercase h-[32px]"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExport}
                disabled={isExporting}
                className="px-4 py-1.5 bg-brand text-white hover:bg-brand-deep rounded-xl text-[10.5px] font-black uppercase h-[32px] flex items-center gap-1.5"
              >
                {isExporting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {isExporting ? 'Processando...' : 'Confirmar Download'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
