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

export default async function WaitlistPage() {
  const entries = await prisma.launchJoin.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader title="Waitlist" subtitle={`${entries.length} people want in on the launch`} />

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl bg-white p-5 ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{entry.name}</p>
                <p className="text-sm text-gray-500">{entry.email}</p>
              </div>
              <p className="text-xs text-gray-400">{formatDate(entry.createdAt)}</p>
            </div>
            <p className="mt-3 text-sm text-gray-600">{entry.whyJoin}</p>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-400 ring-1 ring-gray-900/[0.06]">
            No waitlist signups yet.
          </div>
        )}
      </div>
    </div>
  );
}
