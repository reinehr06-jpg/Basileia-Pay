'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  BrainCircuit, 
  Sparkles, 
  Settings2, 
  Plus, 
  Info, 
  TrendingUp, 
  ChevronRight,
  Zap,
  Flame,
  CheckCircle2,
  Trophy,
  RefreshCw,
  Layers,
  ClipboardList,
  Download,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

type BciTabValue = 'friction' | 'performance' | 'activity';

export default function BciPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<BciTabValue>('friction');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State
  const [filterPeriod, setFilterPeriod] = useState('7d');
  const [filterSystem, setFilterSystem] = useState('Todos');
  const [filterCheckout, setFilterCheckout] = useState('Todos');
  const [filterMethod, setFilterMethod] = useState('Todos');

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('excel');
  const [exportSections, setExportSections] = useState<string[]>(['friction', 'performance', 'activity']);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRunAnalysis = () => {
    setLoading(true);
    triggerToast("Iniciando varredura preditiva auxiliada pela IA da Basileia...");
    setTimeout(() => {
      setLoading(false);
      triggerToast("Análise de checkout concluída! Score geral recalculado: 84/100 (Bom).");
    }, 1500);
  };  const handleConfirmExport = async () => {
    triggerToast(`Preparando exportação em formato PDF...`);

    try {
      setLoading(true);
      // Fetch real data
      const res = await apiFetch('/api/v1/dashboard/bci/export');
      const realData: any = res.success && res.data ? res.data : {
        friction: [],
        performance: [],
        activity: []
      };

      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(109, 40, 217); // brand color
      doc.text('Basileia Pay - Relatório BCI', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(124, 58, 237);
      doc.text('Business Intelligence & Otimização do Checkout', 14, 30);
      
      doc.setFontSize(9);
      doc.setTextColor(88, 28, 135);
      doc.text(`Período: ${filterPeriod}`, 14, 40);
      doc.text(`Data de Geração: ${new Date().toLocaleString()}`, 14, 45);
      doc.text(`Filtro de Sistema: ${filterSystem}`, 100, 40);
      doc.text(`Filtro de Checkout: ${filterCheckout}`, 100, 45);

      let startY = 55;

      doc.setFontSize(12);
      doc.text('Fricções Detectadas pela IA', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Ponto de Fricção', 'Fase', 'Severidade', 'Impacto Estimado']],
        body: realData.friction.length > 0 ? realData.friction.map((f: any) => [f.title, f.stage, f.severity, f.impact]) : [['Nenhum dado encontrado', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [250, 245, 255], textColor: [88, 28, 135] },
        styles: { fontSize: 8 }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(12);
      doc.text('Histórico e Comparativo de Versões', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Versão', 'Status', 'Conversão', 'Tempo Médio', 'Score BCI', 'Receita Mensal']],
        body: realData.performance.length > 0 ? realData.performance.map((p: any) => [p.version, p.status, p.conversion, p.time, p.score, p.revenue]) : [['Nenhum dado encontrado', '-', '-', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [250, 245, 255], textColor: [88, 28, 135] },
        styles: { fontSize: 8 }
      });
      startY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(12);
      doc.text('Benchmarks e Auditoria', 14, startY);
      autoTable(doc, {
        startY: startY + 5,
        head: [['Checkout', 'Score', 'Conversão', 'Posição']],
        body: realData.activity.length > 0 ? realData.activity.map((a: any) => [a.name, a.score, a.conversion, a.position]) : [['Nenhum dado encontrado', '-', '-', '-']],
        theme: 'grid',
        headStyles: { fillColor: [250, 245, 255], textColor: [88, 28, 135] },
        styles: { fontSize: 8 }
      });

      doc.save(`relatorio_bci_${filterPeriod}_${Date.now()}.pdf`);
      triggerToast("Download do PDF concluído com sucesso!");

    } catch (error) {
      console.error('Export error', error);
      triggerToast('Erro ao exportar dados da API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="BCI">
      
      {/* Toast alert indicator */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-60 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-2 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
          <span className="w-2 h-2 bg-brand rounded-full shrink-0 animate-ping" />
          <span className="text-[11px] font-black text-left">{toastMessage}</span>
        </div>
      )}

      {/* Header section - Clean & Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DDFD]/60 pb-3 text-left">
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-[18px] 2xl:text-[20px] font-black tracking-tight text-slate-950">
              BCI
            </h1>
            <div className="w-4 h-4 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200">
              <Info className="w-2.5 h-2.5" />
            </div>
          </div>
          <p className="text-slate-455 font-semibold text-[11px] 2xl:text-[11.5px] tracking-tight mt-0.5">
            Centro de inteligência do checkout com análise preditiva e otimização assistida por IA.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleConfirmExport}
            disabled={loading}
            className="h-8 px-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm shadow-brand/10 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Exportar relatório PDF
          </button>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-white border border-[#E8DDFD] p-3.5 rounded-2xl shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
        <div className="flex flex-col min-w-0">
          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Período</span>
          <div className="relative">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
            >
              <option value="Hoje">Hoje</option>
              <option value="Ontem">Ontem</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Sistema</span>
          <div className="relative">
            <select
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value)}
              className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
            >
              <option value="Todos">Todos os Sistemas</option>
              <option value="E-commerce">E-commerce Central</option>
              <option value="ERP">ERP Conectado</option>
              <option value="CRM">CRM Vendas</option>
              <option value="Plataforma EAD">Plataforma EAD</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Checkout</span>
          <div className="relative">
            <select
              value={filterCheckout}
              onChange={(e) => setFilterCheckout(e.target.value)}
              className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
            >
              <option value="Todos">Todos os Checkouts</option>
              <option value="Basileia Checkout Pro">Basileia Checkout Pro</option>
              <option value="Mercado Pago Checkout">Mercado Pago Checkout</option>
              <option value="Checkout Básico">Checkout Básico</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider pl-1 mb-1 block leading-none">Método</span>
          <div className="relative">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="appearance-none w-full bg-[#FAF8FF] border border-[#E8DDFD] rounded-xl pl-3 pr-8 py-1.5 text-xs font-black text-slate-700 focus:outline-none focus:border-brand cursor-pointer h-[34px]"
            >
              <option value="Todos">Todos os Métodos</option>
              <option value="PIX">PIX</option>
              <option value="Cartão">Cartão de Crédito</option>
              <option value="Boleto">Boleto Bancário</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid Superior de Diagnósticos */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        
        {/* Card 1: Score do checkout */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[20px] p-4 flex flex-col justify-between shadow-sm relative overflow-hidden h-[132px]">
          <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider leading-none">
            Score do checkout
          </span>

          <div className="flex items-center justify-between mt-1">
            {/* SVG Circular Gauge */}
            <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  className="stroke-slate-100"
                  strokeWidth="5.5"
                  fill="transparent"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  className="stroke-brand"
                  strokeWidth="5.5"
                  fill="transparent"
                  strokeDasharray={188}
                  strokeDashoffset={188}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[19px] font-black text-slate-850 leading-none">84</span>
                <span className="text-[8px] text-slate-400 font-bold leading-none mt-0.5">/100</span>
              </div>
            </div>

            <div className="space-y-1 pr-1 text-right md:text-left">
              <h4 className="text-xs font-black text-slate-800 leading-none">Saudável</h4>
              <div className="inline-flex items-center gap-0.5 text-[8.5px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1 py-0.2 rounded">
                <span>+12 pts vs ant.</span>
              </div>
              <span className="text-[8px] font-black text-slate-500 bg-slate-50 border border-slate-200/50 px-1.5 py-0.2 rounded uppercase tracking-wider block text-center leading-none">
                Score Ativo
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Diagnóstico de confiança */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[20px] p-4 flex flex-col justify-between shadow-sm h-[132px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider leading-none">
                Confiança da IA
              </span>
              <span className="text-[9px] font-black text-brand bg-brand/10 border border-brand/20 px-1.5 py-0.2 rounded leading-none">
                92%
              </span>
            </div>

            <h4 className="text-xs font-black text-slate-850 mt-3 leading-none">Análise Preditiva Estável</h4>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-brand h-full rounded-full" style={{ width: '92%' }} />
            </div>

            <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-450">
              <span>Sinais: <span className="font-extrabold text-slate-600">24</span></span>
              <span>Alertas: <span className="font-extrabold text-slate-600">2</span></span>
            </div>
          </div>
        </div>

        {/* Card 3: Impacto estimado */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[20px] p-4 flex flex-col justify-between shadow-sm h-[132px]">
          <div>
            <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider leading-none">
              Impacto de Conversão
            </span>

            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <h4 className="text-sm font-black text-emerald-600 leading-none">
                +12,5% estimado
              </h4>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1.5 leading-none">
              Ganho potencial em receita
            </p>

            <div className="mt-2.5 text-[10px] font-black text-slate-500 bg-emerald-50/50 border border-emerald-100/50 p-1 px-2 rounded-lg flex items-center justify-between">
              <span className="text-[8px] font-bold text-emerald-600/70 uppercase leading-none">Projeção Mensal</span>
              <span className="leading-none text-emerald-600">R$ 45.230,00</span>
            </div>
          </div>
        </div>

        {/* Card 4: Risco operacional */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[20px] p-4 flex flex-col justify-between shadow-sm h-[132px]">
          <div>
            <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider leading-none">
              Risco Operacional
            </span>

            <div className="flex items-center gap-1.5 mt-3">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <h4 className="text-xs font-black text-amber-600 leading-none">
                Moderado
              </h4>
            </div>
            <p className="text-[9px] text-slate-400 font-bold mt-1.5 leading-none">
              Algumas fricções nos gateways
            </p>

            <div className="mt-2.5 text-[10px] font-black text-slate-500 bg-amber-50/50 border border-amber-200/50 p-1 px-2 rounded-lg flex items-center justify-between">
              <span className="text-[8px] font-bold text-amber-700 uppercase leading-none">Fricções Críticas</span>
              <span className="bg-amber-100/50 text-amber-600 px-1.5 py-0.2 rounded text-[9px] leading-none">3</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-[#E8DDFD]/50 pb-0.5 mt-2 text-left">
        <button
          onClick={() => setActiveTab('friction')}
          className={cn(
            "pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer",
            activeTab === 'friction' 
              ? "border-brand text-brand" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <Flame className="w-3.5 h-3.5" />
          Fricções & Otimização
        </button>
        
        <button
          onClick={() => setActiveTab('performance')}
          className={cn(
            "pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer",
            activeTab === 'performance' 
              ? "border-brand text-brand" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          Desempenho A/B & Histórico
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={cn(
            "pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer",
            activeTab === 'activity' 
              ? "border-brand text-brand" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Auditoria & Benchmarks
        </button>
      </div>

      {/* Split layout: Left Tab Content (75%), Right detailed sidepanel (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* Left Column (col-span-3) - Spaced for larger reading, fitting screen */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: FRICÇÃO & OTIMIZAÇÃO (Side-by-side grids) */}
          {activeTab === 'friction' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              
              {/* Pontos de Fricção */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left h-full">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Pontos de fricção
                  </h3>
                  <span className="text-[9px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">Top 3 Alertas</span>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {[
                    { title: "Taxa de rejeição no Cartão", stage: "Pagamento", impact: "-4,2% conversão", color: "text-red-500", bg: "bg-red-50" },
                    { title: "Formulário de endereço longo", stage: "Identificação", impact: "-2,1% conversão", color: "text-amber-500", bg: "bg-amber-50" },
                    { title: "Lentidão no cálculo de frete", stage: "Entrega", impact: "-1,5% conversão", color: "text-amber-500", bg: "bg-amber-50" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <div className={`w-7 h-7 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800 leading-tight">{item.title}</h4>
                        <p className="text-[9px] text-slate-500 font-bold mt-0.5">Fase: {item.stage}</p>
                        <span className={`inline-block mt-1 text-[9px] font-black ${item.color}`}>{item.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recomendações da IA */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left h-full">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Recomendações da IA
                  </h3>
                  <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Ações Sugeridas</span>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {[
                    { title: "Habilitar retentativa automática", desc: "Recupera falhas de cartão em D+1.", gain: "+R$ 12k/mês" },
                    { title: "Autocompletar CEP nativo", desc: "Reduz tempo de preenchimento em 4s.", gain: "+R$ 5k/mês" },
                    { title: "Ativar Pix Copy & Paste 1-Click", desc: "Aumenta conversão mobile.", gain: "+R$ 8k/mês" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-800 leading-tight">{item.title}</h4>
                        <p className="text-[9px] text-slate-500 font-bold mt-0.5">{item.desc}</p>
                        <span className="inline-block mt-1 text-[9px] font-black text-emerald-600">{item.gain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ANÁLISE A/B & HISTÓRICO */}
          {activeTab === 'performance' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Comparativo de Versões */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm text-left">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 mb-3.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Comparativo de Versões do Checkout
                  </h3>
                  <span className="bg-violet-50 text-brand border border-brand/20 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-brand" />
                    Melhor Performance
                  </span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-xs font-semibold text-slate-600">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                      <tr>
                        <th className="px-4 py-2 text-left">Versão</th>
                        <th className="px-4 py-2 text-center">Status</th>
                        <th className="px-4 py-2 text-center">Conversão</th>
                        <th className="px-4 py-2 text-center">Tempo Pag.</th>
                        <th className="px-4 py-2 text-center">Abandono Ident.</th>
                        <th className="px-4 py-2 text-center">Score BCI</th>
                        <th className="px-4 py-2 text-center">Receita/mês</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-800">v2.4.1 (Atual)</td>
                        <td className="px-4 py-3 text-center"><span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Vencedora</span></td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800">84,5%</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-600">1m 12s</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-600">3,1%</td>
                        <td className="px-4 py-3 text-center font-black text-brand">84</td>
                        <td className="px-4 py-3 text-center font-black text-emerald-600">R$ 145k</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-500">v2.4.0 (A)</td>
                        <td className="px-4 py-3 text-center"><span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">Arquivada</span></td>
                        <td className="px-4 py-3 text-center font-bold text-slate-500">78,2%</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-500">1m 45s</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-500">5,8%</td>
                        <td className="px-4 py-3 text-center font-black text-slate-500">72</td>
                        <td className="px-4 py-3 text-center font-black text-slate-500">R$ 112k</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart Line */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm text-left">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2 mb-3.5">
                  Score e conversão ao longo do tempo
                </h3>
                
                <div className="relative w-full h-[180px] bg-slate-50/50 rounded-2xl p-4 border border-[#E8DDFD]/60 flex items-center justify-center">
                  {/* Mock Chart Visualization */}
                  <div className="flex h-full w-full items-end gap-2 justify-between pt-4">
                    {[30, 45, 40, 60, 55, 70, 85].map((h, i) => (
                      <div key={i} className="w-full bg-brand/10 hover:bg-brand/20 transition-colors rounded-t-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded">
                          {h}% conv.
                        </div>
                        <div className="absolute top-0 w-full h-1 bg-brand rounded-t-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: AUDITORIA & BENCHMARKS */}
          {activeTab === 'activity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              
              {/* Eventos e achados recentes */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left h-full">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Eventos recentes
                  </h3>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  {[
                    { date: "Hoje, 10:45", event: "Alerta de rejeição Mercado Pago resolvido automaticamente pela IA" },
                    { date: "Ontem, 16:30", event: "Nova versão BCI Checkout Pro implantada com sucesso" },
                    { date: "Ontem, 09:15", event: "Pico de acesso detectado (+145%) com estabilidade no checkout" }
                  ].map((e, i) => (
                    <div key={i} className="text-[10.5px] font-bold text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100/80">
                      <span className="block text-[9px] font-black text-slate-400 mb-1">{e.date}</span>
                      {e.event}
                    </div>
                  ))}
                </div>
              </div>

              {/* Benchmarks internos */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left h-full">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Benchmarks Internos
                  </h3>
                </div>

                <div className="space-y-3 min-h-[150px]">
                  <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10 flex items-center justify-between mt-2">
                    <div>
                      <h4 className="text-[13px] font-black text-brand">Sua Conversão (84,5%)</h4>
                      <p className="text-[10px] text-brand/70 font-bold mt-1 max-w-[200px] leading-tight">Você está no Top 5% dos nossos lojistas de E-commerce.</p>
                    </div>
                    <Trophy className="w-10 h-10 text-brand opacity-40" />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column (col-span-1) - Combined ultra-compact Confidence & Impact card */}
        <div className="h-full">
          
          {/* Unified Confidence & Impact Card */}
          <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-4.5 shadow-sm flex flex-col justify-between h-full text-left">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2 mb-3">
                Mapa de confiança
              </h3>

              <div className="space-y-3.5">
                {[
                  { name: 'Identificação', val: '94/100', pct: 94, color: 'bg-emerald-500' },
                  { name: 'Entrega', val: '88/100', pct: 88, color: 'bg-emerald-500' },
                  { name: 'Pagamento', val: '72/100', pct: 72, color: 'bg-amber-500' },
                  { name: 'Revisão', val: '98/100', pct: 98, color: 'bg-brand' }
                ].map((map, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10.5px] font-bold text-slate-600 leading-none">
                      <span>{map.name}</span>
                      <span className="font-extrabold text-slate-850">{map.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`${map.color} h-full rounded-full`} style={{ width: `${map.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impacto Estimado Section - Integrated directly */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
                Impacto Estimado
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-bold text-slate-500">
                <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50 text-left">
                  <span className="text-[8.5px] font-black text-emerald-600/70 block uppercase">Conversão</span>
                  <span className="text-emerald-600 font-extrabold text-xs">+12,5%</span>
                </div>
                <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50 text-left">
                  <span className="text-[8.5px] font-black text-emerald-600/70 block uppercase">Recuperados</span>
                  <span className="text-emerald-600 font-extrabold text-xs">152/mês</span>
                </div>
                <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50 text-left col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[8.5px] font-black text-emerald-600/70 uppercase">Receita mensal</span>
                    <span className="text-emerald-600 font-black block text-xs">R$ 45.230,00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8.5px] font-black text-emerald-600/70 uppercase">Tempo impl.</span>
                    <span className="text-emerald-600 font-extrabold block text-[10.5px]">2h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom General Score Row */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-855 mt-4">
              <span>Score BCI geral</span>
              <span className="text-brand font-black text-sm bg-brand/10 px-3 py-0.5 rounded-lg border border-brand/20 shadow-sm">
                84/100
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Export modal removed, directly downloading PDF */}

    </PageLayout>
  );
}
