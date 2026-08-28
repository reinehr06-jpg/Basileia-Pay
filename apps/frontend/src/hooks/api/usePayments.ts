import { useState, useEffect } from 'react';
import { apiClient, ApiResponse } from '@/lib/api/client';

export type Payment = {
  id: string | number;
  uuid: string;
  method: string;
  gateway: string;
  amount: number;
  status: string;
  status_label: string;
  created_at: string;
};

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient<Payment[]>('/api/v1/dashboard/payments');
      
      if (response.success) {
        setPayments(response.data);
        setRequestId(response.meta?.request_id || null);
      } else {
        setError(response.error.message);
        setRequestId(response.error.request_id || null);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado ao carregar os pagamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, loading, error, requestId, refetch: fetchPayments };
}
