import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export type AuditLog = {
  id: number;
  uuid: string;
  event: string;
  user_name: string;
  entity_type: string;
  ip_address: string;
  metadata: any;
  created_at: string;
};

export function useAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    const response = await apiClient<AuditLog[]>(`/api/v1/dashboard/audit?page=${page}`);
    
    if (response.success) {
      setLogs(response.data);
      setMeta(response.meta);
      setError(null);
    } else {
      setError(response.error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, error, meta, refetch: fetchLogs };
}
