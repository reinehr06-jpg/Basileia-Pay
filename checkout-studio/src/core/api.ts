import { getToken, getApiUrl } from './session';

function getAuthHeaders(method: string = 'GET') {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Remove CSRF since we use stateless token in iframe
  return headers;
}

export interface CheckoutScene {
  id?: string;
  name: string;
  system_id?: string;
  status: 'draft' | 'published' | 'archived';
  version?: number;
  config: Record<string, unknown>;
  trust_score?: number;
  conversion_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export async function fetchCheckouts(): Promise<CheckoutScene[]> {
  const res = await fetch(getApiUrl('/checkouts'), {
    headers: getAuthHeaders('GET'),
    credentials: 'omit', // iframes generally omit credentials when using tokens
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.data || []);
}

export async function fetchCheckout(id: string): Promise<CheckoutScene | null> {
  const res = await fetch(getApiUrl(`/checkouts/${id}`), {
    headers: getAuthHeaders('GET'),
    credentials: 'omit',
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id ? data : (data.data || null);
}

export async function saveCheckout(scene: CheckoutScene): Promise<CheckoutScene | null> {
  const method = scene.id ? 'PATCH' : 'POST';
  const url = getApiUrl(scene.id ? `/checkouts/${scene.id}` : `/checkouts`);
  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(method),
    credentials: 'omit',
    body: JSON.stringify({ name: scene.name, config: scene.config, system_id: scene.system_id }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id ? data : (data.data || null);
}

export async function publishCheckout(id: string): Promise<boolean> {
  const res = await fetch(getApiUrl(`/checkouts/${id}/publish`), {
    method: 'POST',
    headers: getAuthHeaders('POST'),
    credentials: 'omit',
  });
  return res.ok;
}

export async function deleteCheckout(id: string): Promise<boolean> {
  const res = await fetch(getApiUrl(`/checkouts/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders('DELETE'),
    credentials: 'omit',
  });
  return res.ok;
}
