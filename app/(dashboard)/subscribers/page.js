import prisma from '@/lib/prisma';
import PageHeader from '@/component/PageHeader';

export const dynamic = 'force-dynamic';

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function SubscribersPage() {
  const subscribers = await prisma.subscribe.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const activeCount = subscribers.filter((s) => s.status === 'subscribed').length;

  return (
    <div>
      <PageHeader
        title="Subscribers"
        subtitle={`${activeCount} active of ${subscribers.length} total`}
      />

      <div className="overflow-x-auto rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Subscribed on</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-6 py-4 text-white">{s.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      s.status === 'subscribed'
                        ? 'bg-green-500/15 text-green-300 ring-green-400/25'
                        : 'bg-white/10 text-gray-400 ring-white/15'
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{formatDate(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {subscribers.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-500">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
}
