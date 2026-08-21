import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Sidebar from '@/component/Sidebar';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex">
      <Sidebar userName={session?.user?.name || session?.user?.email} />
      <main className="min-h-screen flex-1 overflow-x-hidden px-8 py-8">{children}</main>
    </div>
  );
}
