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
  ChevronDown
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
                <span className="text-[19px] font-black text-slate-850 leading-none">0</span>
                <span className="text-[8px] text-slate-400 font-bold leading-none mt-0.5">/100</span>
              </div>
            </div>

            <div className="space-y-1 pr-1 text-right md:text-left">
              <h4 className="text-xs font-black text-slate-800 leading-none">-</h4>
              <div className="inline-flex items-center gap-0.5 text-[8.5px] font-black text-slate-450 bg-slate-50 border border-slate-100/50 px-1 py-0.2 rounded">
                <span>- pts vs ant.</span>
              </div>
              <span className="text-[8px] font-black text-slate-500 bg-slate-50 border border-slate-200/50 px-1.5 py-0.2 rounded uppercase tracking-wider block text-center leading-none">
                Aguardando dados
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
              <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-200/50 px-1.5 py-0.2 rounded leading-none">
                0%
              </span>
            </div>

            <h4 className="text-xs font-black text-slate-850 mt-3 leading-none">-</h4>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-slate-300 h-full rounded-full" style={{ width: '0%' }} />
            </div>

            <div className="flex justify-between mt-3 text-[9px] font-bold text-slate-450">
              <span>Sinais: <span className="font-extrabold text-slate-600">0</span></span>
              <span>Alertas: <span className="font-extrabold text-slate-600">0</span></span>
            </div>
          </div>
        </div>

        {/* Card 3: Impacto estimado */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[20px] p-4 flex flex-col justify-between shadow-sm h-[132px]">
          <div>
            <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider leading-none">
              Impacto de Conversão
            </span>

            <h4 className="text-sm font-black text-slate-500 mt-3 leading-none">
              0,0% estimado
            </h4>
            <p className="text-[9px] text-slate-400 font-bold mt-1 leading-none">
              Ganho potencial em receita
            </p>

            <div className="mt-2.5 text-[10px] font-black text-slate-500 bg-slate-50/50 border border-slate-200/50 p-1 px-2 rounded-lg flex items-center justify-between">
              <span className="text-[8px] font-bold text-slate-450 uppercase leading-none">Projeção</span>
              <span className="leading-none">R$ 0,00</span>
            </div>
          </div>
        </div>

        {/* Card 4: Risco operacional */}
        <div className="bg-white border border-[#E8DDFD]/65 rounded-[20px] p-4 flex flex-col justify-between shadow-sm h-[132px]">
          <div>
            <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider leading-none">
              Risco Operacional
            </span>

            <h4 className="text-xs font-black text-slate-500 mt-3 leading-none">
              -
            </h4>
            <p className="text-[9px] text-slate-400 font-bold mt-1 leading-none">
              Sem fricções detectadas
            </p>

            <div className="mt-2.5 text-[10px] font-black text-slate-500 bg-slate-50/50 border border-slate-200/50 p-1 px-2 rounded-lg flex items-center justify-between">
              <span className="text-[8px] font-bold uppercase leading-none">Fricções Críticas</span>
              <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[9px] leading-none">0</span>
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
                  <span className="text-[9px] font-black uppercase text-slate-450 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">Top 5 Alertas</span>
                </div>

                <div className="space-y-3 min-h-[150px] flex items-center justify-center">
                  <p className="text-xs font-bold text-slate-400">Sem dados suficientes para análise no período selecionado.</p>
                </div>
              </div>

              {/* Recomendações da IA */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left h-full">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Recomendações da IA
                  </h3>
                  <span className="text-[9px] font-black uppercase text-slate-450 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">Ações Sugeridas</span>
                </div>

                <div className="space-y-3 min-h-[150px] flex items-center justify-center">
                  <p className="text-xs font-bold text-slate-400">Processando recomendações com base no tráfego recente...</p>
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
                        <td colSpan={7} className="px-4 py-8 text-center text-xs font-bold text-slate-400">
                          Nenhum histórico de teste A/B para o período selecionado.
                        </td>
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
                
                <div className="relative w-full h-[180px] bg-slate-50/30 rounded-2xl p-4 border border-slate-100 flex items-center justify-center">
                  <p className="text-xs font-bold text-slate-400">Sem dados suficientes para análise no período selecionado.</p>
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

                <div className="space-y-3 min-h-[150px] flex items-center justify-center">
                  <p className="text-xs font-bold text-slate-400">Sem eventos recentes registrados.</p>
                </div>
              </div>

              {/* Benchmarks internos */}
              <div className="bg-white border border-[#E8DDFD]/65 rounded-[22px] p-5 shadow-sm space-y-4 text-left h-full">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Benchmarks Internos
                  </h3>
                </div>

                <div className="space-y-3 min-h-[150px] flex items-center justify-center">
                  <p className="text-xs font-bold text-slate-400">Processando métricas comparativas...</p>
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
                  { name: 'Identificação', val: '0/100', pct: 0 },
                  { name: 'Entrega', val: '0/100', pct: 0 },
                  { name: 'Pagamento', val: '0/100', pct: 0 },
                  { name: 'Revisão', val: '0/100', pct: 0 }
                ].map((map, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10.5px] font-bold text-slate-600 leading-none">
                      <span>{map.name}</span>
                      <span className="font-extrabold text-slate-850">{map.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-slate-300 h-full rounded-full" style={{ width: `${map.pct}%` }} />
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
                <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 text-left">
                  <span className="text-[8.5px] font-black text-slate-400 block uppercase">Conversão</span>
                  <span className="text-slate-500 font-extrabold text-xs">0,0%</span>
                </div>
                <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 text-left">
                  <span className="text-[8.5px] font-black text-slate-400 block uppercase">Recuperados</span>
                  <span className="text-slate-500 font-extrabold text-xs">0/mês</span>
                </div>
                <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 text-left col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[8.5px] font-black text-slate-400 uppercase">Receita mensal</span>
                    <span className="text-slate-500 font-black block text-xs">R$ 0,00</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase">Tempo impl.</span>
                    <span className="text-slate-500 font-extrabold block text-[10.5px]">-</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom General Score Row */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-855 mt-4">
              <span>Score geral</span>
              <span className="text-slate-500 font-black text-sm bg-slate-50 px-3 py-0.5 rounded-lg border border-slate-200/50 shadow-sm">
                0/100
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Export modal removed, directly downloading PDF */}

    </PageLayout>
  );
}
