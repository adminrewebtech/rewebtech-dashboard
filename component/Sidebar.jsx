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

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  const initials = user?.initials || (user?.name || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <aside
      className={`relative flex h-screen shrink-0 flex-col overflow-hidden border-r border-[#e6ecf6] bg-white transition-[width] duration-200 ease-out ${
        open ? 'w-[248px]' : 'w-[76px]'
      }`}
    >
      {/* Halka blue wash — sidebar ko plain white slab ke bajaye thodi jaan deta hai. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(59,130,246,0.06),rgba(59,130,246,0)_38%)]" />

      <div className="relative flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_8px_18px_-8px_rgba(37,99,235,0.8)]">
          <LayoutDashboard size={18} />
        </div>
        {open && (
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold tracking-tight text-slate-900">RewebTech</div>
            <div className="truncate text-[11px] text-slate-400">Admin dashboard</div>
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
                  ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {/* Active item ka left accent — nazar turant yahan jaati hai. */}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-600" />
              )}
              <Icon size={18} className={`shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
              {open && label}
            </Link>
          );
        })}

        <div
          title={!open ? 'Clients — coming soon' : undefined}
          className="flex cursor-not-allowed items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300"
        >
          <Users size={18} className="shrink-0" />
          {open && (
            <span className="flex items-center gap-2">
              Clients
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-slate-400">
                SOON
              </span>
            </span>
          )}
        </div>
      </nav>

      <div className="relative border-t border-[#eef2f8] px-3 py-4">
        {user && (
          <div className={`mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2 ${open ? 'bg-slate-50' : ''}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-100">
              {initials}
            </div>
            {open && (
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-700">{user.name}</div>
                <div className="truncate text-[10px] uppercase tracking-wide text-slate-400">{user.role}</div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={logout}
          title={!open ? 'Sign out' : undefined}
          className="flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut size={18} className="shrink-0 text-slate-400" />
          {open && 'Sign out'}
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          title={!open ? 'Expand' : undefined}
          className="mt-0.5 flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          {open ? <ChevronsLeft size={18} className="shrink-0" /> : <ChevronsRight size={18} className="shrink-0" />}
          {open && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
