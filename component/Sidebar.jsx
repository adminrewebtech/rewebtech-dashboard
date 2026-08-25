'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, Star, Users, LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from '@/component/AuthProvider';

const NAV_ITEMS = [
  { href: '/leads', label: 'Lead Generation', icon: Inbox },
  { href: '/reviews', label: 'Reviews', icon: Star },
];

/**
 * Sidebar.
 *
 * Rang website se liye hain (rewebtech.in ka `styles/theme.js`): dark panel
 * `#060f21` aur uske upar wahi blue radial glow jo site ke dark sections par
 * hai. Content light rehta hai — dark rail plus light canvas.
 *
 * `sticky top-0 h-screen` isliye ki scroll par nav apni jagah rahe. Pehle woh
 * page ke saath upar chali jaati thi.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  const initials = user?.initials || (user?.name || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden bg-[#060f21] transition-[width] duration-200 ease-out ${
        open ? 'w-[248px]' : 'w-[76px]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_45%_at_50%_0%,rgba(37,99,235,0.28),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="relative flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_6px_16px_-6px_rgba(29,78,216,0.6)]">
          <LayoutDashboard size={18} />
        </div>
        {open && (
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-tight text-white">RewebTech</div>
            <div className="truncate text-[11px] text-blue-300/70">Admin dashboard</div>
          </div>
        )}
      </div>

      <nav className="relative flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={!open ? label : undefined}
              className={`group relative flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-500/15 text-white ring-1 ring-inset ring-blue-400/25'
                  : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-400 shadow-[0_0_12px_2px_rgba(59,130,246,0.55)]" />
              )}
              <Icon size={18} className={`shrink-0 ${active ? 'text-blue-300' : 'text-gray-500'}`} />
              {open && label}
            </Link>
          );
        })}

        <div
          title={!open ? 'Clients — coming soon' : undefined}
          className="flex cursor-not-allowed items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600"
        >
          <Users size={18} className="shrink-0" />
          {open && (
            <span className="flex items-center gap-2">
              Clients
              <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-gray-500">
                SOON
              </span>
            </span>
          )}
        </div>
      </nav>

      <div className="relative px-3 py-4">
        <div className="mb-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {user && (
          <div className={`mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2 ${open ? 'bg-white/[0.04]' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-[11px] font-semibold text-blue-300 ring-1 ring-inset ring-blue-400/20">
              {initials}
            </div>
            {open && (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-gray-200">{user.name}</div>
                <div className="truncate text-[10px] uppercase tracking-wide text-gray-500">{user.role}</div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={logout}
          title={!open ? 'Sign out' : undefined}
          className="flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <LogOut size={18} className="shrink-0 text-gray-500" />
          {open && 'Sign out'}
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          title={!open ? 'Expand' : undefined}
          className="mt-0.5 flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
        >
          {open ? <ChevronsLeft size={18} className="shrink-0" /> : <ChevronsRight size={18} className="shrink-0" />}
          {open && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
