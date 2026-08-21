import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Sidebar from '@/component/Sidebar';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex">
      <Sidebar userName={session?.user?.name || session?.user?.email} />
      <main className="relative min-h-screen flex-1 overflow-x-hidden bg-[#060f21] px-8 py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_45%_at_50%_0%,rgba(37,99,235,0.12),transparent_70%)]" />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
