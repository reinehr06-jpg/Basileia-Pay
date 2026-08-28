'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { RefreshCcw } from 'lucide-react';

export default function ReconciliationPage() {
  const [discrepancies, setDiscrepancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscrepancies = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/v1/dashboard/reconciliation/discrepancies');
      setDiscrepancies(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscrepancies();
  }, []);

  const handleResync = async (orderId: number) => {
    try {
      await apiFetch(`/api/v1/dashboard/reconciliation/${orderId}/resync`, { method: 'POST' });
      alert('Sincronização agendada!');
      fetchDiscrepancies();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">Conciliação Automática</h1>
          <p className="text-sm text-ink-light">Pedidos aguardando retorno prolongado do gateway</p>
        </div>
        <button 
          onClick={fetchDiscrepancies}
          className="flex items-center gap-2 bg-white border border-border text-ink hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold transition"
        >
          <RefreshCcw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-amber-50 border-b border-border">
            <tr>
              <th className="p-4 font-semibold text-amber-900">ID Pedido</th>
              <th className="p-4 font-semibold text-amber-900">Data</th>
              <th className="p-4 font-semibold text-amber-900">Status</th>
              <th className="p-4 font-semibold text-amber-900">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center animate-pulse">Carregando...</td></tr>
            ) : discrepancies.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-ink-light">Nenhuma discrepância encontrada. Sistema 100% conciliado.</td></tr>
            ) : discrepancies.map(order => (
              <tr key={order.id} className="border-b border-border hover:bg-gray-50">
                <td className="p-4 font-bold">#{order.id}</td>
                <td className="p-4">{new Date(order.updated_at).toLocaleString()}</td>
                <td className="p-4"><span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-bold text-xs uppercase">{order.status}</span></td>
                <td className="p-4">
                  <button 
                    onClick={() => handleResync(order.id)}
                    className="text-xs font-bold text-brand bg-brand-soft px-3 py-1 rounded hover:bg-brand-soft/80"
                  >
                    Forçar Sync
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
