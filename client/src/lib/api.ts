const API_BASE = '/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  currentUserId?: string
): Promise<{ success: boolean; data: T; error?: any; unread_count?: number }> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

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
