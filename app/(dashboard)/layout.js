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
      {/*
        Sidebar apni jagah par tika rehta hai aur sirf content scroll hota hai.
        Pehle poora page ek saath scroll karta tha, toh neeche jaate hi nav
        upar nikal jaati thi — jabki wahi ek cheez hai jo hamesha pahunch me
        honi chahiye. `min-w-0` zaroori hai: uske bina flex child apne content
        se choti nahi hoti aur chaudi table poore page ko khiska deti hai.
      */}
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
