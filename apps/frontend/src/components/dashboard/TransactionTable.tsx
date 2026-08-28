'use client';

import { useEffect, useState } from 'react';
import { 
  Eye, 
  Download, 
  MoreVertical, 
  Calendar,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

type Transaction = {
  id: string;
  uuid: string;
  customer: string;
  method: string;
  gateway: string;
  value: string;
  status: string;
  risk: string;
  created_at: string;
};

export function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const result = await apiFetch(`/api/v1/dashboard/payments?page=${currentPage}`);
        if (result.success && result.data) {
          const data = result.data as any;
          setTransactions(data.data || data.payments || []);
        } else {
          setTransactions([]);
        }
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, [currentPage]);

  const formatStatus = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falha';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'failed': return 'bg-danger/10 text-danger';
      case 'refunded': return 'bg-info/10 text-info';
      default: return 'bg-slate/10 text-slate';
    }
  };

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-slate';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[20px] border border-border shadow-sm flex items-center justify-center h-[300px]">
        <Loader2 className="w-6 h-6 text-slate/30 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-border shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 h-[64px] border-b border-border/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <h2 className="text-[13px] font-black text-ink uppercase tracking-tight">Transacoes Criticas</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-background border border-border rounded-lg text-[9.5px] font-black text-slate/50 uppercase tracking-tighter">
            <Calendar className="w-3 h-3" />
            Ultimos 7 dias
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-lg text-[9.5px] font-black text-ink hover:bg-brand-soft transition-all uppercase tracking-tighter">
            <Download className="w-3 h-3 text-slate/40" /> Exportar
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm font-bold text-slate/50">Nenhuma transacao encontrada.</p>
          <p className="text-xs font-bold text-slate/30 mt-1">Conecte um sistema e faca sua primeira venda.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-background/20 border-b border-border/20">
                  {['ID', 'Data', 'Cliente', 'Metodo', 'Gateway', 'Valor', 'Status', 'Risco', 'Acoes'].map((h) => (
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
                      <span className="text-[10.5px] font-black text-ink group-hover:text-brand transition-colors">{tx.uuid}</span>
                    </td>
                    <td className="px-5 text-[10.5px] font-bold text-slate/40 whitespace-nowrap">{tx.created_at}</td>
                    <td className="px-5 text-[10.5px] font-black text-ink truncate max-w-[120px]">{tx.customer}</td>
                    <td className="px-5">
                      <div className="flex items-center gap-1.5">
                        {tx.method.toLowerCase().includes('card') ? <CreditCard className="w-3 h-3 text-info/50" /> : <Wallet className="w-3 h-3 text-success/50" />}
                        <span className="text-[10.5px] font-black text-ink uppercase tracking-tight">{tx.method}</span>
                      </div>
                    </td>
                    <td className="px-5 text-[10.5px] font-bold text-slate/40">{tx.gateway}</td>
                    <td className="px-5 text-[10.5px] font-black text-ink">{tx.value}</td>
                    <td className="px-5">
                      <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-tight", statusColor(tx.status))}>
                        <div className={cn("w-0.5 h-0.5 rounded-full", tx.status === 'failed' ? "bg-danger" : tx.status === 'pending' ? "bg-warning" : "bg-success")} />
                        {formatStatus(tx.status)}
                      </div>
                    </td>
                    <td className="px-5">
                      <div className={cn("flex items-center gap-1 text-[8.5px] font-black uppercase tracking-tighter", riskColor(tx.risk))}>
                        <div className={cn("w-1 h-1 rounded-full", tx.risk === 'high' ? "bg-danger" : tx.risk === 'medium' ? "bg-warning" : "bg-success")} />
                        {tx.risk}
                      </div>
                    </td>
                    <td className="px-5">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate/30 hover:text-brand transition-colors" aria-label="Ver transação"><Eye className="w-3 h-3" /></button>
                        <button className="p-1.5 text-slate/30 hover:text-brand transition-colors" aria-label="Mais ações"><MoreVertical className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-background/30">
            <p className="text-[11px] font-bold text-slate/50">{transactions.length} resultados</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-1.5 text-slate/40 hover:text-brand transition-all disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentPage(currentPage + 1)} className="p-1.5 text-slate/40 hover:text-brand transition-all"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
