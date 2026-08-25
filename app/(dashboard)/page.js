import Link from 'next/link';
import { Inbox, TrendingUp, Star, Sparkles, ArrowUpRight } from 'lucide-react';
import { serverApi } from '@/lib/serverApi';
import PageHeader from '@/component/PageHeader';
import StatCard from '@/component/StatCard';

export const dynamic = 'force-dynamic';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export default async function OverviewPage() {
  // Ek call me saare counts — pehle yeh alag-alag DB queries thi is page ke
  // andar. Ab poora data API se aata hai. Dekho API.md §3
  const data = await serverApi('/overview');
  const cards = data?.cards ?? {};
  const recentLeads = data?.recentLeads ?? [];

  return (
    <div>
      <PageHeader title="Overview" subtitle="Snapshot of everything coming through rewebtech.in" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total leads" value={cards.totalLeads ?? 0} icon={Inbox} />
        <StatCard label="New this week" value={cards.newLeadsThisWeek ?? 0} icon={TrendingUp} hint="Contact form" />
        <StatCard label="Reviews" value={cards.totalReviews ?? 0} icon={Star} />
        <StatCard label="Featured" value={cards.featuredReviews ?? 0} icon={Sparkles} hint="Shown on site" />
      </div>

      <div className="mt-8 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-semibold tracking-tight text-white">Recent leads</h2>
          <Link
            href="/leads"
            className="flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">No leads yet.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-white">{lead.name}</p>
                  <p className="text-sm text-gray-400">{lead.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{lead.subject}</p>
                  <p className="text-xs text-gray-500">{timeAgo(lead.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
