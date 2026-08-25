import { API_BASE } from './apiBase.js';

export async function api(path, { method = 'GET', body, params } = {}) {
  const url = new URL(API_BASE + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('unauthenticated');
  }

  if (!json?.success) {
    const err = new Error(json?.error || 'Request failed');
    err.code = json?.code;
    err.details = json?.details;
    err.status = res.status;
    throw err;
  }

  return json.data;
}
