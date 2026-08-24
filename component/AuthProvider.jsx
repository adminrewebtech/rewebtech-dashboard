'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser || null);
  const [checked, setChecked] = useState(!!initialUser);
  const router = useRouter();

  useEffect(() => {
    if (initialUser) return;
    let cancelled = false;
    api('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user ?? data);
      })
      .catch(() => {
        // api() already redirects to /login on 401 — nothing else to do
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const can = useCallback((permission) => !!user?.permissions?.includes(permission), [user]);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // ignore — we're navigating to /login regardless
    }
    setUser(null);
    router.push('/login');
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, checked, can, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
