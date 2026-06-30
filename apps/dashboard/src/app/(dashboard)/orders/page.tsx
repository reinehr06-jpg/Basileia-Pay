'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiFetch('/api/v1/dashboard/orders');
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-ink">Pedidos</h1>
      <p className="text-sm text-ink-light">Acompanhe todos os pedidos do seu gateway</p>

      {loading ? (
        <div className="text-center py-10 animate-pulse text-ink-light">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-ink">ID</th>
                <th className="p-4 font-semibold text-ink">Cliente</th>
                <th className="p-4 font-semibold text-ink">Valor</th>
                <th className="p-4 font-semibold text-ink">Status</th>
                <th className="p-4 font-semibold text-ink">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-ink-light">Nenhum pedido encontrado.</td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id} className="border-b border-border hover:bg-gray-50">
                  <td className="p-4">
                    <Link href={`/orders/${order.id}`} className="text-brand hover:underline font-medium">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="p-4">{order.customer_name || 'Anônimo'}</td>
                  <td className="p-4 font-mono">{(order.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: order.currency })}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      order.status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-ink-light">{new Date(order.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
