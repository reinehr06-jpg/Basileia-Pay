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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const requestId = crypto.randomUUID();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId,
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
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
}
