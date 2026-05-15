import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type Company = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  settings: any;
  created_at: string;
};

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
    setLoading(true);
    const response = await apiClient<Company>('/api/v1/dashboard/company');
    
    if (response.success) {
      setCompany(response.data);
      setError(null);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  return { company, loading, error, refetch: fetchCompany };
}
