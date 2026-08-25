'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  Star,
  Users,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuth } from '@/component/AuthProvider';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
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
      className={`flex h-screen shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#0a1220] transition-[width] duration-200 ${
        open ? 'w-64' : 'w-[76px]'
      }`}
    >
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.6)]">
          <LayoutDashboard size={18} />
        </div>
        {open && <span className="whitespace-nowrap font-semibold tracking-tight text-white">RewebTech</span>}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={!open ? label : undefined}
              className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {open && label}
            </Link>
          );
        })}

        <div
          title={!open ? 'Clients — coming soon' : undefined}
          className="flex cursor-not-allowed items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600"
        >
          <Users size={18} className="shrink-0" />
          {open && (
            <span className="flex items-center gap-2">
              Clients
              <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-gray-500">
                SOON
              </span>
            </span>
          )}
        </div>
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        {open && user && (
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-gray-200">{user.name}</div>
              <div className="truncate text-[11px] text-gray-500">{user.role}</div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} className="shrink-0" />
          {open && 'Sign out'}
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-1 flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          {open ? <ChevronsLeft size={18} className="shrink-0" /> : <ChevronsRight size={18} className="shrink-0" />}
          {open && 'Collapse'}
        </button>
      </div>
    </aside>
  );
}
