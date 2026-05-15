import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/Card';
import { Shield, Search, Download } from 'lucide-react';

export default function AuditPage() {
  const auditEvents = [
    { date: '15/05/2026 10:45:22', event: '🔐 Login', user: 'vinicius@basileia.pay', entity: 'User', ip: '[mascarado]', details: 'Login efetuado com sucesso (2FA)' },
    { date: '15/05/2026 10:30:05', event: '💳 Gateway criado', user: 'vinicius@basileia.pay', entity: 'GatewayAccount', ip: '[mascarado]', details: 'Adicionado Asaas - Produção' },
    { date: '15/05/2026 10:12:14', event: '🔑 API Key criada', user: 'vinicius@basileia.pay', entity: 'ApiKey', ip: '[mascarado]', details: 'Nova chave para Site Principal' },
    { date: '15/05/2026 09:45:33', event: '🚀 Checkout publicado', user: 'vinicius@basileia.pay', entity: 'CheckoutSession', ip: '[mascarado]', details: 'Checkout Principal v2.4' },
    { date: '15/05/2026 09:12:00', event: '✅ Pagamento aprovado', user: 'Sistema', entity: 'Payment', ip: '[mascarado]', details: 'PAY_1a2b3c (R$ 197,00)' },
  ];

  return (
    <PageLayout 
      title="Auditoria"
      action={
        <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border text-ink rounded-md text-sm font-medium hover:bg-surface-raised transition-colors">
          <Download size={16} /> Exportar Logs
        </button>
      }
    >
      <div className="flex gap-4 mb-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por evento, usuário ou entidade..." 
            className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex bg-surface border border-border rounded-md p-0.5">
          <button className="px-3 py-1.5 text-xs font-medium bg-surface shadow-sm text-ink rounded">Hoje</button>
          <button className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink rounded">7 dias</button>
          <button className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink rounded">30 dias</button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="border-b border-border bg-surface-raised text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Data/hora</th>
                <th className="px-4 py-3 font-medium">Evento</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Entidade</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((item, i) => (
                <tr key={i} className="border-b border-border hover:bg-surface-raised/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-ink-subtle font-mono text-xs">{item.date}</td>
                  <td className="px-4 py-3 font-medium">{item.event}</td>
                  <td className="px-4 py-3 text-ink-muted">{item.user}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wider text-ink-subtle">{item.entity}</td>
                  <td className="px-4 py-3 text-ink-subtle italic">{item.ip}</td>
                  <td className="px-4 py-3">
                    <button className="text-brand hover:underline font-medium">Ver detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageLayout>
  );
}
