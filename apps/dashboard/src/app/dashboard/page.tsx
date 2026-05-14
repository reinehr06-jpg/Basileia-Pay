import { Topbar } from "@/components/layout/Topbar";
import { 
  TrendingUp, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Server, 
  Activity 
} from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar 
        title="Visão Geral" 
        description="Acompanhe a saúde financeira e operacional da empresa." 
      />
      
      <main className="flex-1 overflow-y-auto p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-surface p-6 rounded-xl border border-line shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-custom">Aprovado Hoje</p>
                <h3 className="text-2xl font-bold text-ink mt-1">R$ 45.230,00</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium text-status-success">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>+12.5% em relação a ontem</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-line shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-custom">Vendas Hoje</p>
                <h3 className="text-2xl font-bold text-ink mt-1">124</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-status-info">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium text-slate-custom">
              <span className="text-status-success font-bold mr-1">94%</span> taxa de conversão
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-line shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-custom">Falhas de Gateway</p>
                <h3 className="text-2xl font-bold text-ink mt-1">3</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-status-danger">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium text-status-danger">
              <span>Atenção: Asaas reportou instabilidade</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-line shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-custom">Sistemas Ativos</p>
                <h3 className="text-2xl font-bold text-ink mt-1">2</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-brand-accent">
                <Server className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center text-xs font-medium text-slate-custom">
              Church, Vendor
            </div>
          </div>

        </div>

        {/* Charts & Tables Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-line shadow-sm min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-ink">Volume de Vendas (Últimos 7 dias)</h3>
              <select className="text-sm border border-line rounded-md px-3 py-1 bg-background text-ink outline-none">
                <option>Todos os sistemas</option>
                <option>Church</option>
                <option>Vendor</option>
              </select>
            </div>
            <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-line rounded-lg bg-background">
              <span className="text-muted text-sm font-medium">Gráfico de barras (Recharts/Chart.js)</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-line shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-ink mb-6">Últimos Eventos</h3>
            
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                
                <div className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 className="w-5 h-5 text-status-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Pagamento aprovado</p>
                    <p className="text-xs text-slate-custom">R$ 1.500,00 via PIX (Church)</p>
                    <p className="text-[10px] text-muted mt-1">Há 2 minutos</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1">
                    <Activity className="w-5 h-5 text-status-info" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Webhook processado</p>
                    <p className="text-xs text-slate-custom">Notificação enviada p/ Vendor</p>
                    <p className="text-[10px] text-muted mt-1">Há 15 minutos</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1">
                    <AlertCircle className="w-5 h-5 text-status-danger" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">Falha de Autorização</p>
                    <p className="text-xs text-slate-custom">Cartão recusado (Vendor)</p>
                    <p className="text-[10px] text-muted mt-1">Há 1 hora</p>
                  </div>
                </div>

              </div>
            </div>
            
            <button className="mt-4 w-full py-2 text-sm font-medium text-brand-primary border border-line rounded-lg hover:bg-brand-soft transition-colors">
              Ver todos os eventos
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
