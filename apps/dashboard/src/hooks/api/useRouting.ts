import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type RoutingData = {
  gateways: any[];
  routing: Record<string, any>;
  rules: any[];
  recommended: { recommended_payment_method: string; reason: string; source: string };
  recent_decisions: any[];
};

export type SimulationResult = {
  simulation: any;
  routing: any;
  trust: any;
  recommendation: any;
  alerts: any[];
};

export function useRouting() {
  const [data, setData] = useState<RoutingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await apiClient<RoutingData>('/api/v1/dashboard/routing');
    if (res.success) { setData(res.data); setError(null); }
    else { setError('Falha ao carregar roteamento'); }
    setLoading(false);
  };

  const simulate = async (params: { method: string; amount: number; environment?: string }) => {
    const res = await apiClient<SimulationResult>('/api/v1/dashboard/routing/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res.success ? res.data : null;
  };

  const saveRule = async (rule: any) => {
    const res = await apiClient('/api/v1/dashboard/routing/rules', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
    if (res.success) fetchData();
    return res;
  };

  useEffect(() => { fetchData(); }, []);
  return { data, loading, error, refetch: fetchData, simulate, saveRule };
}
