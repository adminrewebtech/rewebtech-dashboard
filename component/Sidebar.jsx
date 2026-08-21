'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Inbox,
  Mail,
  BarChart3,
  Rocket,
  Star,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Inbox },
  { href: '/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/waitlist', label: 'Waitlist', icon: Rocket },
  { href: '/reviews', label: 'Reviews', icon: Star },
];

export default function Sidebar({ userName }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-900/[0.06] bg-white">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_6px_16px_-6px_rgba(29,78,216,0.6)]">
          <LayoutDashboard size={18} />
        </div>
        <span className="font-semibold tracking-tight text-gray-900">RewebTech</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-900/[0.06] px-3 py-4">
        <div className="mb-2 truncate px-3 text-xs text-gray-400">{userName}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
