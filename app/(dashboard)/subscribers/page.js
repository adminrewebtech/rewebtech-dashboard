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

      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-900/[0.06] text-xs uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Subscribed on</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900/[0.06]">
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{s.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      s.status === 'subscribed'
                        ? 'bg-green-50 text-green-700 ring-green-600/20'
                        : 'bg-gray-100 text-gray-500 ring-gray-500/20'
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{formatDate(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {subscribers.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
}
