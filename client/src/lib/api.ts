const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/$/, '')}/api/v1` : '/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  currentUserId?: string
): Promise<{ success: boolean; data: T; error?: any; unread_count?: number; token?: string; user?: any; message?: string }> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  // Automatically attach stored JWT token if present
  const storedToken = localStorage.getItem('fixnear_token');
  if (storedToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${storedToken}`);
  }

  if (currentUserId) {
    headers.set('x-demo-user-id', currentUserId);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = body?.error?.message || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg) as any;
    error.statusCode = res.status;
    error.code = body?.error?.code;
    error.details = body?.error?.details;
    throw error;
  }

  return body;
}
