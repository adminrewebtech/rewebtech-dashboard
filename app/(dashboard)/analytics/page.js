import { Users, Eye, Link2 } from 'lucide-react';
import prisma from '@/lib/prisma';
import PageHeader from '@/component/PageHeader';
import StatCard from '@/component/StatCard';
import VisitsChart from '@/component/VisitsChart';

export const dynamic = 'force-dynamic';

const DAYS_BACK = 14;

function dayLabel(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export default async function AnalyticsPage() {
  const since = new Date(Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000);

  const [totalVisitors, totalPageviews, recentEvents, recentVisits] = await Promise.all([
    prisma.visitor.count(),
    prisma.visitEvent.count(),
    prisma.visitEvent.findMany({
      where: { visitedAt: { gte: since } },
      select: { path: true, referrer: true, visitedAt: true },
      orderBy: { visitedAt: 'desc' },
      take: 2000,
    }),
    prisma.visitEvent.findMany({
      orderBy: { visitedAt: 'desc' },
      take: 10,
      select: { path: true, referrer: true, userAgent: true, visitedAt: true },
    }),
  ]);

  // Build a day-by-day visit count for the last DAYS_BACK days.
  const buckets = new Map();
  for (let i = DAYS_BACK - 1; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    buckets.set(dayKey(d), { label: dayLabel(d), visits: 0 });
  }
  for (const event of recentEvents) {
    const key = dayKey(new Date(event.visitedAt));
    if (buckets.has(key)) buckets.get(key).visits += 1;
  }
  const chartData = Array.from(buckets.values());

  // Top pages and referrers within the same window.
  const pageCounts = new Map();
  const referrerCounts = new Map();
  for (const event of recentEvents) {
    pageCounts.set(event.path, (pageCounts.get(event.path) || 0) + 1);
    if (event.referrer) {
      referrerCounts.set(event.referrer, (referrerCounts.get(event.referrer) || 0) + 1);
    }
  }
  const topPages = [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topReferrers = [...referrerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div>
      <PageHeader title="Analytics" subtitle={`Traffic over the last ${DAYS_BACK} days`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Unique visitors" value={totalVisitors} icon={Users} hint="All time" />
        <StatCard label="Page views" value={totalPageviews} icon={Eye} hint="All time" />
        <StatCard
          label="Views (last 14d)"
          value={recentEvents.length}
          icon={Link2}
          hint={`Since ${dayLabel(since)}`}
        />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h2 className="mb-4 font-semibold tracking-tight text-gray-900">Visits per day</h2>
        <VisitsChart data={chartData} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <h2 className="mb-4 font-semibold tracking-tight text-gray-900">Top pages</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <ul className="space-y-3">
              {topPages.map(([path, count]) => (
                <li key={path} className="flex items-center justify-between text-sm">
                  <span className="truncate text-gray-700">{path}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <h2 className="mb-4 font-semibold tracking-tight text-gray-900">Top referrers</h2>
          {topReferrers.length === 0 ? (
            <p className="text-sm text-gray-400">No referrer data yet.</p>
          ) : (
            <ul className="space-y-3">
              {topReferrers.map(([ref, count]) => (
                <li key={ref} className="flex items-center justify-between text-sm">
                  <span className="truncate text-gray-700">{ref}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="border-b border-gray-900/[0.06] px-6 py-4">
          <h2 className="font-semibold tracking-tight text-gray-900">Recent activity</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-900/[0.06] text-xs uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 font-medium">Path</th>
              <th className="px-6 py-3 font-medium">Referrer</th>
              <th className="px-6 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900/[0.06]">
            {recentVisits.map((v, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-900">{v.path}</td>
                <td className="max-w-[240px] truncate px-6 py-3 text-gray-500">{v.referrer || '—'}</td>
                <td className="px-6 py-3 whitespace-nowrap text-gray-400">
                  {new Date(v.visitedAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
