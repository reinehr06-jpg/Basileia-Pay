import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type DashboardStats = {
  approved_today: number;
  orders_today: number;
  pending_payments: number;
  failed_payments: number;
  latest_events: Array<{
    event: string;
    time_ago: string;
  }>;
};

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    const response = await apiClient<DashboardStats>('/api/v1/dashboard/stats');
    
    if (response.success) {
      setStats(response.data);
      setError(null);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
