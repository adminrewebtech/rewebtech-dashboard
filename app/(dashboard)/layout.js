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
        <main className="relative min-h-screen flex-1 overflow-x-hidden bg-[#060f21] px-8 py-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_45%_at_50%_0%,rgba(37,99,235,0.12),transparent_70%)]" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </AuthProvider>
  );
}
