'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      const res = await apiFetch(`/api/v1/dashboard/orders/${params.id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Tem certeza que deseja solicitar o reembolso?')) return;
    
    try {
      await apiFetch(`/api/v1/dashboard/orders/${params.id}/refunds`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(refundAmount) * 100, // converte pra centavos
          reason: refundReason
        })
      });
      alert('Estorno solicitado com sucesso!');
      fetchOrder();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  if (loading) return <div className="text-center py-10 animate-pulse">Carregando...</div>;
  if (!order) return <div className="text-center py-10 text-red-500">Pedido não encontrado.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-ink">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-ink">Pedido #{order.id}</h1>
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
          order.status === 'paid' ? 'bg-green-100 text-green-800' :
          order.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
          order.status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-border">
          <h2 className="font-bold text-lg mb-4 text-ink">Detalhes do Cliente</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-ink-light">Nome:</span> {order.customer_name || 'N/A'}</p>
            <p><span className="text-ink-light">E-mail:</span> {order.customer_email || 'N/A'}</p>
            <p><span className="text-ink-light">Documento:</span> {order.customer_document || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border">
          <h2 className="font-bold text-lg mb-4 text-ink">Financeiro</h2>
          <div className="space-y-2 text-sm">
            <p><span className="text-ink-light">Valor Total:</span> {(order.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: order.currency })}</p>
            <p><span className="text-ink-light">Criado em:</span> {new Date(order.created_at).toLocaleString()}</p>
            {order.checkout && (
              <p><span className="text-ink-light">Checkout Origem:</span> {order.checkout.name}</p>
            )}
          </div>
        </div>
      </div>

      {(order.status === 'paid' || order.status === 'confirmed') && (
        <div className="bg-red-50 p-6 rounded-xl border border-red-200">
          <h2 className="font-bold text-lg mb-4 text-red-800">Estorno / Reembolso</h2>
          <form onSubmit={handleRefund} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-red-800 mb-1">Valor (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                max={order.amount / 100}
                required
                className="w-full bg-white border border-red-300 rounded px-3 py-2 outline-none focus:border-red-500"
                value={refundAmount}
                onChange={e => setRefundAmount(e.target.value)}
              />
            </div>
            <div className="flex-2 w-full">
              <label className="block text-xs font-bold text-red-800 mb-1">Motivo</label>
              <input 
                type="text" 
                required
                className="w-full bg-white border border-red-300 rounded px-3 py-2 outline-none focus:border-red-500"
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded transition">
              Solicitar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
