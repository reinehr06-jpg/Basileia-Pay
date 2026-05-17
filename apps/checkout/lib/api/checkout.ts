const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchCheckoutSession(sessionToken: string) {
  const response = await fetch(`${BASE_URL}/api/v1/public/checkout-sessions/${sessionToken}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Erro ao carregar checkout');
  }
  
  return response.json();
}

export async function processPayment(sessionToken: string, data: any, idempotencyKey: string) {
  const response = await fetch(`${BASE_URL}/api/v1/public/checkout-sessions/${sessionToken}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
      'X-Request-ID': crypto.randomUUID(),
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || 'Erro ao processar pagamento');
  }

  return json;
}

export async function fetchPaymentStatus(sessionToken: string) {
  const response = await fetch(`${BASE_URL}/api/v1/public/checkout-sessions/${sessionToken}/status`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Erro ao consultar status');
  }

  return response.json();
}

export async function fetchReceiptData(sessionToken: string) {
  const response = await fetch(`${BASE_URL}/api/v1/public/checkout-sessions/${sessionToken}/receipt`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Recibo não disponível');
  }

  return response.json();
}
