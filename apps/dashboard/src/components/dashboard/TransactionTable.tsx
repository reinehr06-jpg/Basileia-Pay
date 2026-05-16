'use client';

import { 
  Eye, 
  Download, 
  MoreVertical, 
  Calendar,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

const transactions = [
  { id: 'tx_9f71e8ef', date: '18/05 11:42:10', customer: 'João Silva', method: 'VISA **** 4826', payment: 'À vista', origin: 'BR', value: 'R$ 2.450,00', status: 'Falha', risk: 'Alto', time: '7m 24s' },
  { id: 'tx_7a3b6d42', date: '18/05 11:34:15', customer: 'Maria Oliveira', method: 'Pix', payment: 'Boleto do Brasil', origin: 'BR', value: 'R$ 5.198,20', status: 'Pendente', risk: 'Médio', time: '6m 16s' },
  { id: 'tx_3c5f734b', date: '18/05 11:22:05', customer: 'Empresa XYZ', method: 'mastercard **** 8896', payment: 'Boleto', origin: 'BR', value: 'R$ 3.890,00', status: 'Falha', risk: 'Baixo', time: '22m 16s' },
  { id: 'tx_2f87d10b', date: '18/05 11:18:32', customer: 'Lucas Ferreira', method: 'VISA **** 1099', payment: 'Crédito', origin: 'BR', value: 'R$ 890,00', status: 'Pendente', risk: 'Médio', time: '11m 42s' },
  { id: 'tx_1a79c0c6', date: '18/05 10:28:40', customer: 'Ana Souza', method: 'Pix', payment: 'Boleto do Brasil', origin: 'BR', value: 'R$ 1.450,00', status: 'Falha', risk: 'Alto', time: '45m 2s' },
  { id: 'tx_5d8f3b9e', date: '18/05 09:31:03', customer: 'Bruno Santos', method: 'VISA **** 9999', payment: 'À vista', origin: 'BR', value: 'R$ 699,00', status: 'Pendente', risk: 'Médio', time: '1h 13m' },
];

export function TransactionTable() {
  return (
    <div className="bg-white rounded-[20px] border border-border shadow-sm overflow-hidden flex flex-col">
      {/* Header Area - Compact (72px) */}
      <div className="px-5 h-[64px] border-b border-border/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <h2 className="text-[13px] font-black text-ink uppercase tracking-tight">Transações Críticas</h2>
          <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border">
            {['Todas', 'Falhas', 'Chargebacks', 'Aprovação'].map((tab, i) => (
              <button 
                key={tab}
                className={cn(
                  "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tight transition-all",
                  i === 0 ? "bg-white text-brand shadow-sm" : "text-slate/40 hover:text-ink"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-background border border-border rounded-lg text-[9.5px] font-black text-slate/50 uppercase tracking-tighter">
            <Calendar className="w-3 h-3" />
            12/05 - 18/05
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-[9.5px] font-black text-ink hover:bg-brand-soft transition-all uppercase tracking-tighter">
            <Download className="w-3 h-3 text-slate/40" /> Exportar
          </button>
          <button className="p-1.5 bg-background border border-border rounded-lg text-slate/30 hover:text-ink transition-all">
            <MoreVertical className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Table Area - Dense Rows */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background/20 border-b border-border/20">
              {['ID', 'Data', 'Cliente', 'Meio', 'Pagamento', 'Origem', 'Valor', 'Status', 'Risco', 'Tempo', 'Ações'].map((h) => (
                <th key={h} className="px-5 py-2.5 text-[8.5px] font-black uppercase tracking-widest text-slate/30 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/10">
            {transactions.map((tx) => (
              <tr key={tx.id} className="group hover:bg-brand-soft/10 transition-colors h-[50px]">
                <td className="px-5">
                  <span className="text-[10.5px] font-black text-ink group-hover:text-brand transition-colors">{tx.id}</span>
                </td>
                <td className="px-5 text-[10.5px] font-bold text-slate/40 whitespace-nowrap">{tx.date}</td>
                <td className="px-5 text-[10.5px] font-black text-ink truncate max-w-[120px]">{tx.customer}</td>
                <td className="px-5">
                  <div className="flex items-center gap-1.5">
                    {tx.method.toLowerCase().includes('visa') || tx.method.toLowerCase().includes('master') 
                      ? <CreditCard className="w-3 h-3 text-info/50" /> 
                      : <Wallet className="w-3 h-3 text-success/50" />}
                    <span className="text-[10.5px] font-black text-ink uppercase tracking-tight">{tx.method}</span>
                  </div>
                </td>
                <td className="px-5 text-[10.5px] font-bold text-slate/40">{tx.payment}</td>
                <td className="px-5">
                  <span className="text-[9.5px] font-black text-slate/30 uppercase tracking-tighter">{tx.origin}</span>
                </td>
                <td className="px-5 text-[10.5px] font-black text-ink">{tx.value}</td>
                <td className="px-5">
                  <div className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-tight",
                    tx.status === 'Falha' ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                  )}>
                    <div className={cn("w-0.5 h-0.5 rounded-full", tx.status === 'Falha' ? "bg-danger" : "bg-warning")} />
                    {tx.status}
                  </div>
                </td>
                <td className="px-5">
                  <div className={cn(
                    "flex items-center gap-1 text-[8.5px] font-black uppercase tracking-tighter",
                    tx.risk === 'Alto' ? "text-danger" : tx.risk === 'Médio' ? "text-warning" : "text-success"
                  )}>
                     <div className={cn("w-1 h-1 rounded-full", tx.risk === 'Alto' ? "bg-danger" : tx.risk === 'Médio' ? "bg-warning" : "bg-success")} />
                     {tx.risk}
                  </div>
                </td>
                <td className="px-5 text-[10.5px] font-bold text-slate/40">{tx.time}</td>
                <td className="px-5">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate/30 hover:text-brand transition-colors"><Eye className="w-3 h-3" /></button>
                    <button className="p-1.5 text-slate/30 hover:text-brand transition-colors"><MoreVertical className="w-3 h-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Footer Area */}
      <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-background/30">
        <p className="text-[11px] font-bold text-slate/50">Mostrando 1 a 6 de 25 resultados</p>
        
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-slate/40 hover:text-brand transition-all"><ChevronLeft className="w-4 h-4" /></button>
          {[1, 2, 3, 4, 5].map((p) => (
            <button key={p} className={cn(
              "w-7 h-7 rounded-lg text-[11px] font-black transition-all",
              p === 1 ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-slate/40 hover:bg-brand-soft hover:text-brand"
            )}>{p}</button>
          ))}
          <button className="p-1.5 text-slate/40 hover:text-brand transition-all"><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate/50 tracking-tighter uppercase">Itens por página</span>
          <select className="bg-white border border-border rounded-lg px-2 py-1 text-[11px] font-black text-ink outline-none focus:border-brand/40">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
