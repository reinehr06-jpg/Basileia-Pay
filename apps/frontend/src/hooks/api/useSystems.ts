import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type ConnectedSystem = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  status: string;
  environment: string;
  api_key_preview: string;
  created_at: string;
};

export function useSystems() {
  const [systems, setSystems] = useState<ConnectedSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystems = async () => {
    setLoading(true);
    const response = await apiClient<ConnectedSystem[]>('/api/v1/systems');
    
    if (response.success) {
      setSystems(response.data);
      setError(null);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  return { systems, loading, error, refetch: fetchSystems };
}
