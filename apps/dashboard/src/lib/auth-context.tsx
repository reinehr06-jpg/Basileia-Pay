'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  fetchWithTimeout,
  getCsrfToken,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  getTokenExpiresAt,
  apiFetch,
} from '@/lib/api';

type User = {
  id: string;
  uuid?: string;
  name: string;
  email: string;
  role: string;
  two_factor_enabled?: boolean;
  needs_2fa_setup?: boolean;
  company_id?: number | null;
  is_master?: boolean;
};

type Company = {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  status: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ needs_2fa_setup?: boolean }>;
  logout: () => void;
  isLoading: boolean;
  isMaster: boolean;
  isAuthenticated: boolean;
  availableCompanies: Company[];
  switchCompany: (companyId: number) => void;
  activeCompanyId: number | null;
  checkSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Refresh 10 minutos antes de expirar
const REFRESH_BUFFER_MS = 10 * 60 * 1000;

const DEV_BYPASS = process.env.NODE_ENV === 'development';

const DEV_MOCK_USER: User = {
  id: 'dev-1',
  uuid: 'dev-uuid-0001',
  name: 'Admin Dev',
  email: 'admin@basileia.dev',
  role: 'super_admin',
  two_factor_enabled: false,
  needs_2fa_setup: false,
  company_id: 1,
  is_master: true,
};

const DEV_MOCK_COMPANIES: Company[] = [
  { id: 1, uuid: 'comp-uuid-1', name: 'Basileia Pay Dev', slug: 'basileia-pay-dev', status: 'active' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_BYPASS ? DEV_MOCK_USER : null);
  const [isLoading, setIsLoading] = useState(DEV_BYPASS ? false : true);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>(DEV_BYPASS ? DEV_MOCK_COMPANIES : []);
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(DEV_BYPASS ? 1 : null);
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Schedule auto-refresh ──────────────────────────────────────
  const scheduleRefresh = useCallback(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const expiresAt = getTokenExpiresAt();
    if (!expiresAt) return;

    const now = Date.now();
    const expiresMs = expiresAt.getTime();
    // Renew 10 minutes before expiration, minimum 30 seconds
    const delayMs = Math.max(expiresMs - now - REFRESH_BUFFER_MS, 30_000);

    refreshTimerRef.current = setTimeout(async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return;

      try {
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
          setUser(null);
          router.push('/login?reason=expired');
          return;
        }

        const data = await res.json();
        const newAccess = data.access_token || data.data?.access_token || data.token || data.data?.token;
        const newRefresh = data.refresh_token || data.data?.refresh_token;
        const newExpiresAt = data.expires_at || data.data?.expires_at;

        if (newAccess && newRefresh) {
          setTokens(newAccess, newRefresh, newExpiresAt);
          // Reschedule with new expiration
          scheduleRefresh();
        }
      } catch {
        // Silent failure — the interceptor in api.ts will handle 401s on the next request
        console.warn('[Auth] Background refresh failed, will retry on next API call.');
      }
    }, delayMs);
  }, [router]);

  // ── Check session on mount ────────────────────────────────────
  const checkSession = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }

      const headers: Record<string, string> = { 'Accept': 'application/json' };
      headers['Authorization'] = `Bearer ${token}`;

      const res = await fetchWithTimeout(`${API_URL}/api/v2/auth/me`, {
        headers,
      });

      // If 401, try to refresh the token before giving up
      if (res.status === 401) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          clearTokens();
          setUser(null);
          return;
        }

        try {
          const refreshRes = await fetchWithTimeout(`${API_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${refreshToken}`,
            },
          });

          if (!refreshRes.ok) {
            clearTokens();
            setUser(null);
            return;
          }

          const refreshData = await refreshRes.json();
          const newAccess = refreshData.access_token || refreshData.data?.access_token || refreshData.token || refreshData.data?.token;
          const newRefresh = refreshData.refresh_token || refreshData.data?.refresh_token;
          const expiresAt = refreshData.expires_at || refreshData.data?.expires_at;

          if (newAccess && newRefresh) {
            setTokens(newAccess, newRefresh, expiresAt);
            // Retry /me with new token
            const newHeaders: Record<string, string> = { 'Accept': 'application/json' };
            newHeaders['Authorization'] = `Bearer ${newAccess}`;

            const meRes = await fetchWithTimeout(`${API_URL}/api/v2/auth/me`, {
              headers: newHeaders,
            });

            if (!meRes.ok) {
              clearTokens();
              setUser(null);
              return;
            }

            const meData = await meRes.json();
            const userData = meData.success ? meData.data : meData;
            setUser(userData);
            scheduleRefresh();
            return;
          }
        } catch {
          clearTokens();
          setUser(null);
          return;
        }
      }

      if (!res.ok) {
        clearTokens();
        setUser(null);
        return;
      }

      const data = await res.json();
      const userData = data.success ? data.data : data;

      setUser(userData);

      // Load active company from cookie
      const match = document.cookie.match(/(?:^|;\s*)basileia_active_company=(\d+)/);
      if (match) setActiveCompanyId(Number(match[1]));

      // Schedule token auto-refresh
      scheduleRefresh();

      // Fetch companies list for users to populate switcher on refresh
      try {
        const route = userData.role === 'super_admin' 
          ? '/api/v1/auth/master/companies'
          : '/api/v1/dashboard/companies';

        const companiesRes = await fetchWithTimeout(`${API_URL}${route}`, {
          headers: {
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });
        const companiesData = await companiesRes.json();
        if (companiesData.success) {
          setAvailableCompanies(companiesData.data);
        }
      } catch (err) {
        console.error('Failed to load companies in checkSession:', err);
      }
    } catch {
      // Network error or timeout - don't clear user state,
      // let the API interceptors handle 401s on subsequent requests
      console.warn('[Auth] checkSession failed, will retry on next API call');
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    checkSession().finally(() => setIsLoading(false));

    // Cleanup timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [checkSession]);

  const login = useCallback(async (email: string, password: string) => {
    // Initialize CSRF token
    await fetchWithTimeout(`${API_URL}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
    });

    const csrfToken = getCsrfToken();
    const res = await fetchWithTimeout(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || data.error?.message || 'Credenciais inválidas');
    }

    // Store tokens in sessionStorage
    const accessToken = data.access_token || data.data?.access_token || data.token || data.data?.token;
    const refreshToken = data.refresh_token || data.data?.refresh_token;
    const expiresAt = data.expires_at || data.data?.expires_at;

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken, expiresAt);
    }

    const userData = data.data?.user || data.user || data.data;
    setUser(userData);

    // Schedule auto-refresh now that we have tokens
    scheduleRefresh();

    try {
      const route = userData.role === 'super_admin' 
        ? '/api/v1/auth/master/companies'
        : '/api/v1/dashboard/companies';
        
      const companiesRes = await fetchWithTimeout(`${API_URL}${route}`, {
        headers: {
          'Accept': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
      });
      const companiesData = await companiesRes.json();
      if (companiesData.success) {
        setAvailableCompanies(companiesData.data);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    }

    return { needs_2fa_setup: userData.needs_2fa_setup ?? data.needs_2fa_setup ?? false };
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    try {
      const token = getAccessToken();
      const csrfToken = getCsrfToken();
      await fetchWithTimeout(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
        },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    }

    // Clear local state
    clearTokens();

    // Clear refresh timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    setUser(null);
    setAvailableCompanies([]);
    setActiveCompanyId(null);
    router.push('/login');
  }, [router]);

  const isMaster = user?.role === 'super_admin';
  const isAuthenticated = !!user;

  const switchCompany = useCallback(async (companyId: number) => {
    setActiveCompanyId(companyId);
    document.cookie = `basileia_active_company=${companyId}; path=/; SameSite=Lax; Secure; Max-Age=86400`;

    if (companyId !== 0) {
      try {
        const token = getAccessToken();
        const csrfToken = getCsrfToken();
        await fetchWithTimeout(`${API_URL}/api/v1/dashboard/companies/select`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ company_id: companyId }),
        });
      } catch (err) {
        console.error('Failed to sync company context with server', err);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, login, logout, isLoading,
      isMaster, isAuthenticated, availableCompanies, switchCompany, activeCompanyId,
      checkSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
