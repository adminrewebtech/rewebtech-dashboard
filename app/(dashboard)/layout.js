import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/serverAuth';
import { AuthProvider } from '@/component/AuthProvider';
import Sidebar from '@/component/Sidebar';

export default async function DashboardLayout({ children }) {
  // May come back null in local dev even for a logged-in user — see the
  // comment in proxy.js. Only hard-redirect server-side in production,
  // where the cookie (and therefore this check) is reliable; in dev,
  // AuthProvider re-checks client-side and redirects itself if needed.
  const user = await getServerUser();
  if (!user && process.env.NODE_ENV === 'production') redirect('/login');

  return (
    <AuthProvider initialUser={user}>
      <div className="flex">
        <Sidebar />
        <main className="min-h-screen flex-1 overflow-x-hidden px-8 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
