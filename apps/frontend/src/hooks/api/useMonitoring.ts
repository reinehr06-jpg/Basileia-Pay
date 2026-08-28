import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type HealthEndpoint = {
  endpoint_id: number;
  url: string;
  status: string;
  health: {
    success_rate: number | null;
    failure_rate: number | null;
    failure_streak: number;
    total_deliveries: number;
  };
};

export type HealthGateway = {
  gateway_id: number;
  provider: string;
  name: string;
  environment: string;
  status: string;
  health: {
    approval_rate: number | null;
    failure_rate: number | null;
    timeout_count: number;
    total_transactions: number;
    methods: Record<string, any>;
  };
};

export type HealthCheckout = {
  checkout_id: number;
  uuid: string;
  name: string;
  status: string;
  health: {
    total_sessions: number;
    conversion_rate: number | null;
    abandonment_rate: number | null;
    payment_approved: number;
    payment_failed: number;
    method_breakdown: Record<string, any>;
  };
};

export function useMonitoring() {
  const [webhooks, setWebhooks] = useState<HealthEndpoint[]>([]);
  const [gateways, setGateways] = useState<HealthGateway[]>([]);
  const [checkouts, setCheckouts] = useState<HealthCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await apiClient<any>('/api/v1/dashboard/monitoring');
    if (res.success) {
      setWebhooks(res.data.webhooks || []);
      setGateways(res.data.gateways || []);
      setCheckouts(res.data.checkouts || []);
      setError(null);
    } else {
      setError('Falha ao carregar monitoramento');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  return { webhooks, gateways, checkouts, loading, error, refetch: fetchData };
}
