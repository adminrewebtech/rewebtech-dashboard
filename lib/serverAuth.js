import { cookies } from 'next/headers';

const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getServerUser() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;
    return json.data?.user ?? json.data ?? null;
  } catch {
    return null;
  }
}
