const DEFAULT_TIMEOUT = 15_000;

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// ── Token helpers ──────────────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('basileia_access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('basileia_refresh_token');
}

export function setTokens(access: string, refresh: string, expiresAt?: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('basileia_access_token', access);
  sessionStorage.setItem('basileia_refresh_token', refresh);
  if (expiresAt) {
    sessionStorage.setItem('basileia_token_expires_at', expiresAt);
  }
  document.cookie = `basileia_access_token=${access}; path=/; SameSite=Lax; Max-Age=86400`;
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('basileia_access_token');
  sessionStorage.removeItem('basileia_refresh_token');
  sessionStorage.removeItem('basileia_token_expires_at');
  document.cookie = `basileia_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getTokenExpiresAt(): Date | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('basileia_token_expires_at');
  return raw ? new Date(raw) : null;
}

// ── CSRF ───────────────────────────────────────────────────────────
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ── Fetch with timeout ─────────────────────────────────────────────
export function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ── Refresh token machinery ────────────────────────────────────────
const API_URL = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : '';

let isRefreshing = false;
type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const csrfToken = getCsrfToken();
  const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${refreshToken}`,
      ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    clearTokens();
    throw new Error('Refresh failed');
  }

  const data = await res.json();
  const newAccessToken = data.access_token || data.data?.access_token || data.token || data.data?.token;
  const newRefreshToken = data.refresh_token || data.data?.refresh_token;
  const expiresAt = data.expires_at || data.data?.expires_at;

  if (!newAccessToken || !newRefreshToken) {
    clearTokens();
    throw new Error('Invalid refresh response');
  }

  setTokens(newAccessToken, newRefreshToken, expiresAt);
  return newAccessToken;
}

// ── Main API fetch with auto-refresh ───────────────────────────────
export function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string } }> {
  const method = (options.method || 'GET').toUpperCase();
  const requestId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  const buildHeaders = (token?: string | null): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId,
      ...(options.headers as Record<string, string> || {}),
    };

    // Inject Bearer token if available
    const bearerToken = token ?? getAccessToken();
    if (bearerToken) {
      headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    if (MUTATING_METHODS.has(method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return headers;
  };

  const doFetch = (headers: Record<string, string>) =>
    fetchWithTimeout(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

  return doFetch(buildHeaders())
    .then(async (res) => {
      // ── If 401 → try to refresh and retry the original request ──
      if (res.status === 401 && typeof window !== 'undefined') {
        const body = await res.json().catch(() => null);
        const errorCode = body?.error?.code || '';

        // Only attempt refresh for token_expired or generic unauthenticated
        if (errorCode === 'token_expired' || !path.includes('/auth/refresh')) {
          if (isRefreshing) {
            // Another refresh is already in flight — enqueue and wait
            return new Promise<{ success: boolean; data?: T; error?: { code: string; message: string } }>(
              (resolve, reject) => {
                failedQueue.push({
                  resolve: (newToken: string) => {
                    doFetch(buildHeaders(newToken))
                      .then(async (retryRes) => {
                        const retryJson = await retryRes.json().catch(() => null);
                        if (!retryRes.ok) {
                          resolve({
                            success: false,
                            error: retryJson?.error || { code: 'request_failed', message: 'Falha ao processar.' },
                          });
                        } else {
                          resolve(retryJson || { success: true, data: null });
                        }
                      })
                      .catch(() => {
                        resolve({
                          success: false,
                          error: { code: 'network_error', message: 'Erro de conexão.' },
                        });
                      });
                  },
                  reject,
                });
              }
            );
          }

          isRefreshing = true;

          try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);

            // Retry the original request with the new token
            const retryRes = await doFetch(buildHeaders(newToken));
            const retryJson = await retryRes.json().catch(() => null);

            if (!retryRes.ok) {
              return {
                success: false,
                error: retryJson?.error || { code: 'request_failed', message: 'Falha ao processar.' },
              };
            }

            return retryJson || { success: true, data: null };
          } catch (refreshError) {
            processQueue(refreshError, null);
            clearTokens();
            window.location.href = '/login?reason=expired';
            return {
              success: false,
              error: { code: 'session_expired', message: 'Sua sessão expirou.' },
            };
          } finally {
            isRefreshing = false;
          }
        }

        // Auth-related endpoint failed → go to login
        clearTokens();
        window.location.href = '/login?reason=expired';
        return {
          success: false,
          error: body?.error || { code: 'unauthenticated', message: 'Não autenticado.' },
        };
      }

      // ── Normal response handling ──
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          success: false,
          error: json?.error || { code: 'request_failed', message: 'Não foi possível concluir a solicitação.' },
        };
      }

      return json || { success: true, data: null };
    })
    .catch((err) => {
      const isTimeout = err?.name === 'AbortError';
      return {
        success: false,
        error: {
          code: isTimeout ? 'timeout' : 'network_error',
          message: isTimeout ? 'O servidor demorou muito para responder.' : 'Erro de conexão com o servidor.',
        },
      };
    });
}
