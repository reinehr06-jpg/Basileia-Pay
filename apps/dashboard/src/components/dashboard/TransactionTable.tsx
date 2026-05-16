'use client';

import { 
  Eye, 
  Download, 
  MoreVertical, 
  Calendar,
  CreditCard,
  Building2,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

const transactions = [
  { id: 'tx_9f71e8ef', date: '18/05 11:42:10', customer: 'João Silva', method: 'Visa **** 4826', payment: 'À vista', origin: 'BR', value: 'R$ 2.450,00', status: 'Falha', risk: 'Alto', latency: '7m 24s' },
  { id: 'tx_7a3b6d42', date: '18/05 11:34:15', customer: 'Maria Oliveira', method: 'Pix', payment: 'Boleto do Brasil', origin: 'BR', value: 'R$ 1.198,20', status: 'Pendente', risk: 'Médio', latency: '6m 15s' },
  { id: 'tx_3c5f7a4b', date: '18/05 11:22:05', customer: 'Empresa XYZ', method: 'Mastercard **** 8596', payment: 'Boleto', origin: 'BR', value: 'R$ 3.890,00', status: 'Falha', risk: 'Baixo', latency: '22m 16s' },
  { id: 'tx_2f87d10b', date: '18/05 11:18:32', customer: 'Lucas Ferreira', method: 'Visa **** 1099', payment: 'Crédito', origin: 'BR', value: 'R$ 890,00', status: 'Pendente', risk: 'Médio', latency: '11m 42s' },
  { id: 'tx_1a79c0c6', date: '18/05 10:28:40', customer: 'Ana Souza', method: 'Pix', payment: 'Boleto do Brasil', origin: 'BR', value: 'R$ 1.450,00', status: 'Falha', risk: 'Alto', latency: '45m 2s' },
  { id: 'tx_5d8ff3b9', date: '18/05 09:31:03', customer: 'Bruno Santos', method: 'Visa **** 9999', payment: 'À vista', origin: 'BR', value: 'R$ 699,00', status: 'Pendente', risk: 'Médio', latency: '1h 13m' },
];

export function TransactionTable() {
  return (
    <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
      {/* Header / Tabs */}
      <div className="px-8 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-background p-1.5 rounded-2xl border border-border">
          {['Todas', 'Falhas', 'Chargebacks', 'Aprovação manual'].map((tab, i) => (
            <button 
              key={tab}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                i === 0 ? "bg-surface text-brand shadow-sm" : "text-muted hover:text-ink"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-background border border-border rounded-xl text-xs font-bold text-muted">
            <Calendar className="w-4 h-4" />
            12/05/2025 - 18/05/2025
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-background border border-border rounded-xl text-xs font-bold text-ink hover:bg-brand-soft transition-all">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <button className="p-2.5 bg-background border border-border rounded-xl text-muted hover:text-ink transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 mt-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {['ID Transação', 'Data', 'Cliente', 'Meio', 'Pagamento', 'Origem', 'Valor', 'Status', 'Risco', 'Ações'].map((h) => (
                <th key={h} className="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted/60">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {transactions.map((tx) => (
              <tr key={tx.id} className="group hover:bg-brand-soft/30 transition-colors">
                <td className="px-4 py-5">
                  <span className="text-xs font-bold text-ink group-hover:text-brand transition-colors">{tx.id}</span>
                </td>
                <td className="px-4 py-5 text-xs font-semibold text-muted whitespace-nowrap">{tx.date}</td>
                <td className="px-4 py-5 text-xs font-bold text-ink">{tx.customer}</td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-2">
                    {tx.method.includes('Visa') ? <CreditCard className="w-3.5 h-3.5 text-info" /> : <Wallet className="w-3.5 h-3.5 text-success" />}
                    <span className="text-[11px] font-bold text-ink">{tx.method}</span>
                  </div>
                </td>
                <td className="px-4 py-5 text-xs font-bold text-muted">{tx.payment}</td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted uppercase tracking-tighter">BR</span>
                  </div>
                </td>
                <td className="px-4 py-5 text-xs font-black text-ink">{tx.value}</td>
                <td className="px-4 py-5">
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    tx.status === 'Falha' ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", tx.status === 'Falha' ? "bg-danger" : "bg-warning")} />
                    {tx.status}
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter",
                    tx.risk === 'Alto' ? "text-danger" : tx.risk === 'Médio' ? "text-warning" : "text-success"
                  )}>
                     <div className={cn("w-1.5 h-1.5 rounded-full", tx.risk === 'Alto' ? "bg-danger" : tx.risk === 'Médio' ? "bg-warning" : "bg-success")} />
                     {tx.risk}
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-muted hover:text-brand transition-colors"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 text-muted hover:text-brand transition-colors"><Download className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-border flex items-center justify-between bg-background/30">
        <p className="text-[11px] font-bold text-muted">Mostrando 1 a 6 de 25 resultados</p>
        <div className="flex items-center gap-1">
           {[1, 2, 3, 4, 5].map((p) => (
             <button key={p} className={cn(
               "w-8 h-8 rounded-lg text-xs font-bold transition-all",
               p === 1 ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-muted hover:bg-brand-soft hover:text-brand"
             )}>{p}</button>
           ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-muted">Itens por página</span>
          <select className="bg-background border border-border rounded-lg px-3 py-1 text-xs font-bold text-ink outline-none focus:border-brand/40">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
