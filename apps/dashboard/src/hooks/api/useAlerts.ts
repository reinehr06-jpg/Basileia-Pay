import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

export type Alert = {
  id: number;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  category: string;
  type: string;
  title: string;
  message: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'muted';
  recommended_action: string | null;
  entity_type: string | null;
  entity_id: string | null;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at: string | null;
};

export type AlertSummary = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
};

export function useAlerts(filters?: { severity?: string; category?: string; status?: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AlertSummary>({ critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.severity) params.set('severity', filters.severity);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient<any>(`/api/v1/dashboard/alerts${qs}`);
    if (res.success) {
      setAlerts(res.data);
      if ((res as any).summary) setSummary((res as any).summary);
      setError(null);
    } else {
      setError('Falha ao carregar alertas');
    }
    setLoading(false);
  }, [filters?.severity, filters?.category, filters?.status]);

  const acknowledgeAlert = async (id: number) => {
    await apiClient(`/api/v1/dashboard/alerts/${id}/acknowledge`, { method: 'POST' });
    fetchData();
  };

  const resolveAlert = async (id: number) => {
    await apiClient(`/api/v1/dashboard/alerts/${id}/resolve`, { method: 'POST' });
    fetchData();
  };

  const muteAlert = async (id: number) => {
    await apiClient(`/api/v1/dashboard/alerts/${id}/mute`, { method: 'POST' });
    fetchData();
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  return { alerts, summary, loading, error, refetch: fetchData, acknowledgeAlert, resolveAlert, muteAlert };
}
