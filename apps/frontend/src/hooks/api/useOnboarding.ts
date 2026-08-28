import { useState, useEffect, useCallback } from 'react';
import { fetchWithTimeout, getCsrfToken } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type OnboardingStatus = {
  has_system: boolean;
  has_gateway: boolean;
  has_gateway_tested: boolean;
  has_checkout: boolean;
  has_published: boolean;
  has_test_transaction: boolean;
  current_step: number;
};

export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithTimeout(`${API_URL}/api/v1/dashboard/onboarding/status`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      } else {
        setStatus({
          has_system: false,
          has_gateway: false,
          has_gateway_tested: false,
          has_checkout: false,
          has_published: false,
          has_test_transaction: false,
          current_step: 1,
        });
      }
    } catch {
      setStatus({
        has_system: false,
        has_gateway: false,
        has_gateway_tested: false,
        has_checkout: false,
        has_published: false,
        has_test_transaction: false,
        current_step: 1,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const createSystem = async (name: string, environment: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const csrfToken = getCsrfToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/dashboard/systems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}) },
        credentials: 'include',
        body: JSON.stringify({ name, environment }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Erro ao criar sistema');
      await fetchStatus();
      return data.data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const createGateway = async (payload: {
    name: string;
    provider: string;
    environment: string;
    credentials: Record<string, string>;
  }) => {
    setSubmitting(true);
    setError(null);
    try {
      const csrfToken = getCsrfToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/dashboard/gateways`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}) },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Erro ao conectar gateway');
      await fetchStatus();
      return data.data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const testGateway = async (uuid: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const csrfToken = getCsrfToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/dashboard/gateways/${uuid}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}) },
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Erro ao testar gateway');
      await fetchStatus();
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const createCheckout = async (payload: {
    name: string;
    theme_color?: string;
    allow_pix?: boolean;
    allow_card?: boolean;
  }) => {
    setSubmitting(true);
    setError(null);
    try {
      const csrfToken = getCsrfToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/checkouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}) },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Erro ao criar checkout');
      await fetchStatus();
      return data.data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const publishCheckout = async (configJson?: Record<string, any>) => {
    setSubmitting(true);
    setError(null);
    try {
      const csrfToken = getCsrfToken();
      const res = await fetchWithTimeout(`${API_URL}/api/v1/dashboard/onboarding/publish-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}) },
        credentials: 'include',
        body: JSON.stringify({ config_json: configJson ?? {} }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Erro ao publicar checkout');
      await fetchStatus();
      return data.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    status,
    loading,
    submitting,
    error,
    refetch: fetchStatus,
    createSystem,
    createGateway,
    testGateway,
    createCheckout,
    publishCheckout,
  };
}
