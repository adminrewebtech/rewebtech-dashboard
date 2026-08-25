'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Inbox, Sparkles, CircleCheck, TrendingUp, Loader2, ChevronRight, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/component/AuthProvider';
import { useToasts, ToastStack } from '@/component/Toasts';
import LeadDrawer from '@/component/LeadDrawer';
import PageHeader from '@/component/PageHeader';
import StatCard from '@/component/StatCard';
import { FILTER_TABS, statusMeta } from '@/lib/leadStatus';

function timeAgo(iso) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const diffH = Math.round((Date.now() - d.getTime()) / 36e5);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  if (diffD < 7) return `${diffD} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function Centered({ children }) {
  return <div className="px-6 py-16 text-center text-sm text-slate-400">{children}</div>;
}

export default function LeadsDashboard() {
  const { can, checked } = useAuth();
  const { toasts, push, dismiss } = useToasts();

  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loadingDrawer, setLoadingDrawer] = useState(false);

  // Ek hi global "mutating" flag ke bajaye yeh batata hai ki *kaunsa* control
  // chal raha hai (`status:CLIENT`, `touch:CALL`, `email`), taaki spinner usi
  // button par aaye jo dabaya gaya hai.
  const [pending, setPending] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setSummary(await api('/leads/summary'));
    } catch (err) {
      push(err.message || 'Could not load the summary', 'error');
    }
  }, [push]);

  const fetchLeads = useCallback(
    async ({ reset = false, cursor } = {}) => {
      if (reset) setLoadingList(true);
      else setLoadingMore(true);
      try {
        const data = await api('/leads', {
          params: { status: statusFilter, q: debouncedSearch, cursor: reset ? undefined : cursor, limit: 25 },
        });
        setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
        setNextCursor(data.nextCursor);
      } catch (err) {
        push(err.message || 'Could not load leads', 'error');
      } finally {
        setLoadingList(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, debouncedSearch, push]
  );

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchLeads({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const selectLead = async (id) => {
    setSelectedId(id);
    setSelectedLead(null);
    setLoadingDrawer(true);
    try {
      setSelectedLead(await api(`/leads/${id}`));
    } catch (err) {
      push(err.message || 'Could not open that lead', 'error');
      setSelectedId(null);
    } finally {
      setLoadingDrawer(false);
    }
  };

  const closeDrawer = useCallback(() => {
    setSelectedId(null);
    setSelectedLead(null);
  }, []);

  /**
   * Har mutation ka ek hi raasta: server ka jawab drawer me daalo, list aur
   * counts refresh karo, aur user ko batao ki kya hua.
   *
   * Refresh isliye zaroori hai ki status badalne par lead active filter se
   * bahar ja sakti hai — table use hata dega, aur toast bata dega ki kyun.
   */
  const run = async (key, request, message, after, action) => {
    if (pending) return;
    setPending(key);
    try {
      const updated = await request();
      setSelectedLead(updated);
      after?.();
      push(message(updated), 'success', action);
      await Promise.all([fetchSummary(), fetchLeads({ reset: true })]);
    } catch (err) {
      push(err.message || 'That did not go through', 'error');
    } finally {
      setPending(null);
    }
  };

  /**
   * Status badalna ek click ka kaam hai, isliye confirm dialog ki jagah Undo
   * dete hain — galti sasti ho jaati hai aur flow rukta nahi.
   */
  const changeStatus = (status, after) => {
    const previous = selectedLead?.status;
    const id = selectedLead?.id;
    return run(
      `status:${status}`,
      () => api(`/leads/${id}/status`, { method: 'PATCH', body: { status } }),
      (lead) => `${lead.name} → ${statusMeta(lead.status).label}`,
      after,
      previous && previous !== status
        ? {
            label: 'Undo',
            onClick: () =>
              run(
                `status:${previous}`,
                () => api(`/leads/${id}/status`, { method: 'PATCH', body: { status: previous } }),
                (lead) => `Reverted to ${statusMeta(lead.status).label}`
              ),
          }
        : null
    );
  };

  const logTouch = (type) =>
    run(
      `touch:${type}`,
      () => api(`/leads/${selectedLead.id}/contact-history`, { method: 'POST', body: { type } }),
      () => (type === 'CALL' ? 'Call logged' : 'Contact logged')
    );

  const sendEmail = ({ subject, body }, after) =>
    run(
      'email',
      () => api(`/leads/${selectedLead.id}/email`, { method: 'POST', body: { subject, body } }),
      (lead) => `Email sent to ${lead.email}`,
      after
    );

  if (!checked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-slate-400">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  if (!can('lead:read')) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-400">
        You don&apos;t have access to leads.
      </div>
    );
  }

  const cards = summary?.cards;
  const searching = debouncedSearch.length > 0;

  return (
    <div>
      <PageHeader title="Lead Generation" subtitle="Project inquiries from rewebtech.in" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total leads" value={cards?.total ?? '—'} icon={Inbox} />
        <StatCard label="New" value={cards?.new ?? '—'} icon={Sparkles} hint="Not yet contacted" />
        <StatCard label="Qualified" value={cards?.qualified ?? '—'} icon={CircleCheck} />
        <StatCard label="Converted" value={cards?.converted ?? '—'} icon={TrendingUp} hint="Became clients" />
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const active = statusFilter === tab;
            if (tab === 'All') {
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                    active
                      ? 'bg-slate-900 text-white ring-slate-900'
                      : 'bg-white text-slate-500 ring-[#e6ecf6] hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  All {summary ? `(${summary.total})` : ''}
                </button>
              );
            }
            const meta = statusMeta(tab);
            const count = summary?.counts?.[tab] ?? 0;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                  active ? meta.tab : 'bg-white text-slate-500 ring-[#e6ecf6] hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${active ? meta.dot : 'bg-slate-300'}`} />
                {meta.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative lg:w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, company, email…"
            className="w-full rounded-xl border border-[#e6ecf6] bg-white py-2.5 pl-9 pr-8 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="panel mt-4 overflow-hidden">
        {/* Table apne andar scroll karti hai — page kabhi horizontally nahi khiskta. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#eef2f8] bg-[#fbfcfe] text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Lead</th>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Budget</th>
                <th className="px-6 py-3 font-medium">Timeline</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last contact</th>
                <th className="w-10 px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f4f9]">
              {loadingList ? (
                <tr>
                  <td colSpan={7}>
                    <Centered>
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={15} className="animate-spin" /> Loading leads…
                      </span>
                    </Centered>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <Centered>
                      {searching
                        ? `Nothing matches “${debouncedSearch}”.`
                        : statusFilter === 'All'
                          ? 'No leads yet.'
                          : `No leads in ${statusMeta(statusFilter).label}.`}
                    </Centered>
                  </td>
                </tr>
              ) : (
                items.map((lead) => {
                  const meta = statusMeta(lead.status);
                  return (
                    <tr
                      key={lead.id}
                      tabIndex={0}
                      onClick={() => selectLead(lead.id)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), selectLead(lead.id))}
                      className="group cursor-pointer outline-none transition-colors hover:bg-[#f8fafd] focus-visible:bg-[#f4f7fc]"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{lead.name}</div>
                        <div className="mt-0.5 text-xs text-slate-400">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{lead.company || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{lead.budget || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{lead.timeline || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.pill}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">{timeAgo(lead.lastContactAt)}</td>
                      <td className="px-6 py-4 text-slate-300 transition-colors group-hover:text-slate-600">
                        <ChevronRight size={16} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {nextCursor && !loadingList && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => fetchLeads({ cursor: nextCursor })}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e6ecf6] bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#d7e0ee] hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            {loadingMore && <Loader2 size={14} className="animate-spin" />}
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {selectedId && (
        <LeadDrawer
          lead={selectedLead}
          loading={loadingDrawer}
          onClose={closeDrawer}
          canUpdate={can('lead:update')}
          canEmail={can('lead:email')}
          pending={pending}
          onChangeStatus={changeStatus}
          onLogTouch={logTouch}
          onSendEmail={sendEmail}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
