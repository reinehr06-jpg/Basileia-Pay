import { Topbar } from "@/components/layout/Topbar";
import { Plus, MoreVertical, Copy, Server } from "lucide-react";
import Link from "next/link";

const mockSystems = [
  {
    id: "sys_church",
    name: "Church",
    slug: "church",
    status: "active",
    environment: "production",
    defaultGateway: "Asaas",
    defaultCheckout: "Classic",
    monthlySales: 845,
    monthlyVolume: "R$ 145.200,00",
    lastActivity: "Há 2 min"
  },
  {
    id: "sys_vendor",
    name: "Vendor",
    slug: "vendor",
    status: "active",
    environment: "sandbox",
    defaultGateway: "Itaú",
    defaultCheckout: "Modern Dark",
    monthlySales: 12,
    monthlyVolume: "R$ 4.500,00",
    lastActivity: "Há 1 hora"
  }
];

export default function SystemsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Topbar 
        title="Sistemas" 
        description="Gerencie os sistemas conectados que vendem pela Basileia." 
      />
      
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Buscar sistema..." 
              className="px-4 py-2 border border-line rounded-lg text-sm w-64 bg-surface focus:outline-none focus:border-brand-primary"
            />
            <select className="px-4 py-2 border border-line rounded-lg text-sm bg-surface focus:outline-none focus:border-brand-primary">
              <option>Todos os Status</option>
              <option>Ativos</option>
              <option>Inativos</option>
            </select>
          </div>
          
          <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-deep transition-colors shadow-sm shadow-brand-primary/20">
            <Plus className="w-4 h-4" />
            Criar Sistema
          </button>
        </div>

        {/* Systems Table */}
        <div className="bg-surface border border-line rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background border-b border-line text-slate-custom font-medium">
              <tr>
                <th className="px-6 py-4">Sistema</th>
                <th className="px-6 py-4">Status / Amb</th>
                <th className="px-6 py-4">Gateway Padrão</th>
                <th className="px-6 py-4">Checkout Padrão</th>
                <th className="px-6 py-4 text-right">Vendas (Mês)</th>
                <th className="px-6 py-4 text-right">Volume (Mês)</th>
                <th className="px-6 py-4">Última Atividade</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {mockSystems.map((sys) => (
                <tr key={sys.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-brand-soft text-brand-primary flex items-center justify-center">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <Link href={`/dashboard/systems/${sys.id}`} className="font-semibold text-ink hover:text-brand-primary transition-colors">
                          {sys.name}
                        </Link>
                        <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          {sys.slug} 
                          <button className="hover:text-ink"><Copy className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-medium ${
                        sys.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {sys.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs text-muted capitalize">{sys.environment}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-ink font-medium">{sys.defaultGateway}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-custom">
                    {sys.defaultCheckout}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-ink">
                    {sys.monthlySales}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-ink">
                    {sys.monthlyVolume}
                  </td>
                  <td className="px-6 py-4 text-slate-custom text-xs">
                    {sys.lastActivity}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted hover:text-ink p-1 rounded hover:bg-line transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {mockSystems.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-brand-soft text-brand-primary rounded-full flex items-center justify-center mb-4">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">Nenhum sistema conectado ainda.</h3>
              <p className="text-slate-custom mb-6 max-w-sm">
                Conecte seu primeiro sistema para criar vendas, gerar checkouts e processar pagamentos.
              </p>
              <button className="bg-brand-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-deep transition-colors">
                Criar Primeiro Sistema
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
