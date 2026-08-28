type ApiErrorPayload = {
  success: false;
  error: {
    code: string;
    message: string;
    request_id?: string;
    details?: unknown;
  };
};

type ApiSuccessPayload<T> = {
  success: true;
  data: T;
  meta?: {
    request_id?: string;
    [key: string]: unknown;
  };
};

export type ApiResponse<T> = ApiSuccessPayload<T> | ApiErrorPayload;

import { fetchWithTimeout, getCsrfToken, getAccessToken } from '@/lib/api';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const method = (options.method || 'GET').toUpperCase();
  const requestId = crypto.randomUUID();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Request-ID': requestId,
    ...(options.headers as Record<string, string> || {}),
  };

  const bearerToken = getAccessToken();
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }

  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return {
        success: false,
        error: {
          code: payload?.error?.code || 'request_failed',
          message: payload?.error?.message || 'Não foi possível concluir a solicitação.',
          request_id: payload?.error?.request_id || requestId,
          details: payload?.error?.details,
        },
      };
    }

    return payload;
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';
    return {
      success: false,
      error: {
        code: isTimeout ? 'timeout' : 'network_error',
        message: isTimeout ? 'O servidor demorou muito para responder.' : 'Erro de conexão com o servidor.',
        request_id: requestId,
      },
    };
  }
}
