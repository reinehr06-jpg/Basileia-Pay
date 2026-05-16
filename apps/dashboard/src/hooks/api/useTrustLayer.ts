import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type TrustLayerData = {
  score: number;
  status: string;
  decision: string;
  signals: Array<{ type: string; severity: string; message: string; value: string }>;
  recommended_action: string;
  alerts: any[];
  recent_decisions: any[];
  explanation: string;
};

export function useTrustLayer() {
  const [data, setData] = useState<TrustLayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await apiClient<TrustLayerData>('/api/v1/dashboard/trust-layer');
    if (res.success) { setData(res.data); setError(null); }
    else { setError('Falha ao carregar Trust Layer'); }
    setLoading(false);
  };

  const evaluate = async (entityType: string, entityId: string) => {
    const res = await apiClient<any>('/api/v1/dashboard/trust-layer/evaluate', {
      method: 'POST',
      body: JSON.stringify({ entity_type: entityType, entity_id: entityId }),
    });
    return res.success ? res.data : null;
  };

  useEffect(() => { fetchData(); }, []);
  return { data, loading, error, refetch: fetchData, evaluate };
}
