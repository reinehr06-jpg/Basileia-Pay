import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type GatewayAccount = {
  id: number;
  uuid: string;
  name: string;
  provider: string;
  environment: string;
  status: string;
  last_tested_at: string | null;
  last_test_status: string | null;
};

export function useGateways() {
  const [gateways, setGateways] = useState<GatewayAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGateways = async () => {
    setLoading(true);
    const response = await apiClient<GatewayAccount[]>('/api/v1/gateways');
    
    if (response.success) {
      setGateways(response.data);
      setError(null);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  return { gateways, loading, error, refetch: fetchGateways };
}
