import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type ApiKey = {
  id: number;
  uuid: string;
  name: string;
  key_preview: string;
  environment: string;
  system_name: string;
  last_used_at: string;
  created_at: string;
};

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = async () => {
    setLoading(true);
    const response = await apiClient<ApiKey[]>('/api/v1/dashboard/api-keys');
    
    if (response.success) {
      setKeys(response.data);
      setError(null);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return { keys, loading, error, refetch: fetchKeys };
}
