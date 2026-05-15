import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type CheckoutExperience = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  status: string;
  published_version: string | null;
  created_at: string;
};

export function useCheckouts() {
  const [checkouts, setCheckouts] = useState<CheckoutExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckouts = async () => {
    setLoading(true);
    const response = await apiClient<CheckoutExperience[]>('/api/v1/checkouts');
    
    if (response.success) {
      setCheckouts(response.data);
      setError(null);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCheckouts();
  }, []);

  return { checkouts, loading, error, refetch: fetchCheckouts };
}
