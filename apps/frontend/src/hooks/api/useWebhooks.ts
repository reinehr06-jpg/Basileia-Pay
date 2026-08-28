import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type WebhookEndpoint = {
  id: number;
  url: string;
  status: string;
  events: string[];
  connected_system?: { name: string };
};

export type WebhookDelivery = {
  id: number;
  event: string;
  url: string;
  status_code: number;
  success: boolean;
  created_at: string;
  response_body?: string;
  request_payload?: string;
};

export function useWebhooks() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [endpointsRes, deliveriesRes] = await Promise.all([
        apiClient<WebhookEndpoint[]>('/api/v1/dashboard/webhooks/endpoints'),
        apiClient<WebhookDelivery[]>('/api/v1/dashboard/webhooks/deliveries')
      ]);
      
      if (endpointsRes.success && deliveriesRes.success) {
        setEndpoints(endpointsRes.data || []);
        setDeliveries(deliveriesRes.data || []);
        setError(null);
      } else {
        setEndpoints([]);
        setDeliveries([]);
        const errMsg = !(endpointsRes.success)
          ? (endpointsRes as any).error?.message
          : (deliveriesRes as any).error?.message;
        setError(errMsg || 'Erro ao carregar dados de webhooks');
      }
    } catch (e) {
      setEndpoints([]);
      setDeliveries([]);
      setError('Erro de conexão ao carregar dados de webhooks');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { 
    endpoints, 
    deliveries, 
    loading, 
    error, 
    refetch: fetchData,
    setEndpoints,
    setDeliveries
  };
}
