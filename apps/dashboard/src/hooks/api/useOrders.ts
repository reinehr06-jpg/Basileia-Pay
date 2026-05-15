import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type Order = {
  id: number;
  uuid: string;
  external_order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  status_label: string;
  system_name: string;
  created_at: string;
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    const response = await apiClient<Order[]>(`/api/v1/dashboard/orders?page=${page}`);
    
    if (response.success) {
      setOrders(response.data);
      setMeta(response.meta);
      setError(null);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, loading, error, meta, refetch: fetchOrders };
}
