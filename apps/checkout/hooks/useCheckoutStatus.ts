import { useState, useEffect } from 'react';
import { fetchPaymentStatus } from '@/lib/api/checkout';

export function useCheckoutStatus(sessionToken: string, enabled: boolean = true) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !sessionToken) return;

    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const data = await fetchPaymentStatus(sessionToken);
        if (data.success) {
          setStatus(data.data);
          
          // Se o status mudou para algo final, paramos o polling
          if (['show_success', 'show_failure', 'expired'].includes(data.data.next_action)) {
            clearInterval(interval);
          }
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    // Primeira execução imediata
    checkStatus();

    // Polling a cada 3 segundos
    interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [sessionToken, enabled]);

  return { status, loading, error };
}
