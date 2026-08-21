import prisma from '@/lib/prisma';
import PageHeader from '@/component/PageHeader';
import LeadsTable from '@/component/LeadsTable';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'won', 'lost'];

export default async function LeadsPage({ searchParams }) {
  const params = await searchParams;
  const q = (params?.q || '').trim();
  const status = params?.status || 'all';

  const where = {
    ...(status !== 'all' ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const leads = await prisma.contact.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${leads.length} contact form submission${leads.length === 1 ? '' : 's'}`} />

      <form className="mb-5 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, email, company..."
          className="w-64 rounded-lg bg-white px-3.5 py-2 text-sm text-gray-900 outline-none ring-1 ring-gray-900/[0.08] focus:ring-2 focus:ring-blue-600"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg bg-white px-3.5 py-2 text-sm text-gray-900 outline-none ring-1 ring-gray-900/[0.08] focus:ring-2 focus:ring-blue-600"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All statuses' : s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
        >
          Filter
        </button>
      </form>

      <LeadsTable leads={leads} />
    </div>
  );
}
