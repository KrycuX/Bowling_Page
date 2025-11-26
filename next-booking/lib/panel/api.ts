import { getCsrfToken, updateCsrfToken } from './session';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.bowlinghub.pl';

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);

  // Don't set Content-Type for FormData - browser will set it with boundary
  if (init.body && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Don't send CSRF token for login endpoint
  if (method !== 'GET' && method !== 'HEAD' && !path.includes('/auth/login')) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers.set('X-CSRF-Token', csrf);
    }
  }

  const response = await fetch(url, {
    ...init,
    method,
    headers,
    credentials: 'include'
  });

  const nextCsrf = response.headers.get('x-csrf-token');
  if (nextCsrf) {
    updateCsrfToken(nextCsrf);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, 'API request failed', data);
  }

  return data as T;
}
