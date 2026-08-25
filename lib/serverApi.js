import { cookies } from 'next/headers';
import { API_BASE } from './apiBase.js';

/**
 * Server-side API call.
 *
 * Session ek httpOnly cookie me hai jo API set karti hai (`rwt_session`), toh
 * server components ke paas woh apne aap nahi jaati — incoming request se
 * uthakar aage forward karni padti hai.
 *
 * Fail hone par `null` lautata hai, throw nahi: page ko crash karne se behtar
 * hai empty state dikhana. Local dev me cookie is server ko dikhti hi nahi
 * (dashboard localhost par hai, cookie `.rewebtech.in` par) — dekho proxy.js.
 */
export async function serverApi(path, { params } = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  const url = new URL(API_BASE + path);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    }
  }

  try {
    const res = await fetch(url, {
      headers: { Cookie: cookieHeader },
      // Dashboard hamesha taaza data dikhata hai — cache yahan galat hoga.
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;
    return json.data ?? null;
  } catch {
    return null;
  }
}
