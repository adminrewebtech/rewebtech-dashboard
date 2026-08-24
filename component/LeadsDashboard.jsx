'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/component/AuthProvider';

const STATUS_META = {
  NEW: { bg: '#eef2ff', color: '#3b52d6', border: '#c7d2fe' },
  CONTACTED: { bg: '#fff7ed', color: '#c2650a', border: '#fed7aa' },
  QUALIFIED: { bg: '#ecfdf5', color: '#0f9d58', border: '#a7f3d0' },
  ON_HOLD: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  CLIENT: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
  JUNK: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};

const FILTER_TABS = ['All', 'NEW', 'CONTACTED', 'QUALIFIED', 'ON_HOLD', 'CLIENT', 'JUNK'];
const STATUS_CHIPS = ['NEW', 'CONTACTED', 'QUALIFIED', 'ON_HOLD'];
const CHIP_LABEL = { NEW: 'New', CONTACTED: 'Contacted', QUALIFIED: 'Qualified', ON_HOLD: 'On Hold' };

const TOUCH_ICON = { EMAIL: '✉', CALL: '📞', OTHER: '👤' };
const TOUCH_TITLE = { EMAIL: 'Email sent', CALL: 'Phone call', OTHER: 'Contact attempt' };

function timeAgo(iso) {
  if (!iso) return 'Never contacted';
  const d = new Date(iso);
  const diffH = Math.round((Date.now() - d.getTime()) / 36e5);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  if (diffD < 7) return `${diffD} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function StatusPill({ status, label }) {
  const meta = STATUS_META[status] || STATUS_META.NEW;
  return (
    <span
      className="whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold"
      style={{ background: meta.bg, color: meta.color }}
    >
      {label}
    </span>
  );
}

export default function LeadsDashboard() {
  const { can, checked } = useAuth();

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

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  };

  const fetchSummary = async () => {
    try {
      const data = await api('/leads/summary');
      setSummary(data);
    } catch (err) {
      showToast(err.message || 'Failed to load summary');
    }
  };

  const fetchLeads = async ({ reset = false, cursor } = {}) => {
    if (reset) setLoadingList(true);
    else setLoadingMore(true);
    try {
      const data = await api('/leads', {
        params: { status: statusFilter, q: debouncedSearch, cursor: reset ? undefined : cursor, limit: 25 },
      });
      setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
      setNextCursor(data.nextCursor);
    } catch (err) {
      showToast(err.message || 'Failed to load leads');
    } finally {
      setLoadingList(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

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
    setEmailOpen(false);
    setEmailSubject('');
    setEmailBody('');
    try {
      const data = await api(`/leads/${id}`);
      setSelectedLead(data);
    } catch (err) {
      showToast(err.message || 'Failed to load lead');
      setSelectedId(null);
    } finally {
      setLoadingDrawer(false);
    }
  };

  const closeDrawer = () => {
    setSelectedId(null);
    setSelectedLead(null);
    setEmailOpen(false);
  };

  const refreshAfterMutation = async () => {
    await Promise.all([fetchSummary(), fetchLeads({ reset: true })]);
  };

  const changeStatus = async (status) => {
    if (!selectedLead || mutating) return;
    setMutating(true);
    try {
      const updated = await api(`/leads/${selectedLead.id}/status`, { method: 'PATCH', body: { status } });
      setSelectedLead(updated);
      refreshAfterMutation();
    } catch (err) {
      showToast(err.message || 'Failed to update status');
    } finally {
      setMutating(false);
    }
  };

  const logTouch = async (type) => {
    if (!selectedLead || mutating) return;
    setMutating(true);
    try {
      const updated = await api(`/leads/${selectedLead.id}/contact-history`, { method: 'POST', body: { type } });
      setSelectedLead(updated);
      refreshAfterMutation();
    } catch (err) {
      showToast(err.message || 'Failed to log contact');
    } finally {
      setMutating(false);
    }
  };

  const sendEmail = async () => {
    if (!selectedLead || sendingEmail) return;
    setSendingEmail(true);
    try {
      const updated = await api(`/leads/${selectedLead.id}/email`, {
        method: 'POST',
        body: { subject: emailSubject, body: emailBody },
      });
      setSelectedLead(updated);
      setEmailOpen(false);
      setEmailSubject('');
      setEmailBody('');
      refreshAfterMutation();
    } catch (err) {
      showToast(err.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!checked) {
    return <div className="-m-8 flex min-h-screen items-center justify-center bg-[#f5f7fb] text-[#64748b]">Loading...</div>;
  }

  if (!can('lead:read')) {
    return (
      <div className="-m-8 flex min-h-screen items-center justify-center bg-[#f5f7fb] text-[#64748b]">
        You don&apos;t have access to leads.
      </div>
    );
  }

  const canUpdate = can('lead:update');
  const canEmail = can('lead:email');

  const statCards = summary
    ? [
        { label: 'Total Leads', value: summary.cards.total, color: '#0f172a' },
        { label: 'New', value: summary.cards.new, color: '#3b52d6' },
        { label: 'Qualified', value: summary.cards.qualified, color: '#0f9d58' },
        { label: 'Converted', value: summary.cards.converted, color: '#0369a1' },
      ]
    : [];

  return (
    <div className="-m-8 min-h-screen bg-[#f5f7fb] text-[#0f172a]">
      {/* NAVBAR */}
      <div className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-[#e5e9f0] bg-white px-7">
        <div>
          <div className="text-[19px] font-extrabold tracking-tight text-[#0f172a]">Lead Generation</div>
          <div className="text-[12.5px] text-[#64748b]">Project inquiries from rewebtech.in</div>
        </div>
        <div className="flex items-center gap-4">
          <input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-[9px] border border-[#e2e8f0] bg-[#f8fafc] px-3.5 py-2.5 text-[13.5px] text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-5 px-7 py-6">
        {toast && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{toast}</div>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-4 gap-3.5">
          {(statCards.length ? statCards : Array.from({ length: 4 })).map((card, i) => (
            <div key={i} className="rounded-[14px] border border-[#e5e9f0] bg-white p-[18px_20px] flex flex-col gap-1.5">
              <div className="text-[12.5px] font-semibold text-[#64748b]">{card?.label ?? ' '}</div>
              <div className="text-[26px] font-extrabold tracking-tight" style={{ color: card?.color ?? '#0f172a' }}>
                {card ? card.value : '–'}
              </div>
            </div>
          ))}
        </div>

        {/* FILTER TABS */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((f) => {
            const active = statusFilter === f;
            const count = f === 'All' ? null : summary?.counts?.[f] ?? 0;
            const meta = f === 'All' ? null : STATUS_META[f];
            const bg = f === 'All' ? (active ? '#0f172a' : '#fff') : active ? meta.bg : '#fff';
            const color = f === 'All' ? (active ? '#fff' : '#334155') : active ? meta.color : '#334155';
            const border = f === 'All' ? '#e2e8f0' : active ? meta.border : '#e2e8f0';
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="whitespace-nowrap rounded-[20px] border px-[15px] py-2 text-[13px] font-semibold"
                style={{ background: bg, color, borderColor: border }}
              >
                {f === 'All' ? 'All' : `${CHIP_LABEL[f]} (${count})`}
              </button>
            );
          })}
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-[14px] border border-[#e5e9f0] bg-white">
          <div className="grid grid-cols-[1.6fr_1.1fr_1fr_1fr_1fr_1.3fr_0.8fr] border-b border-[#e5e9f0] bg-[#f8fafc] px-5 py-3 text-[11.5px] font-bold uppercase tracking-wider text-[#64748b]">
            <div>Lead</div>
            <div>Company</div>
            <div>Budget</div>
            <div>Timeline</div>
            <div>Status</div>
            <div>Last Contact</div>
            <div />
          </div>

          {loadingList ? (
            <div className="px-5 py-12 text-center text-sm text-[#94a3b8]">Loading leads...</div>
          ) : items.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#94a3b8]">No leads match this filter.</div>
          ) : (
            items.map((lead) => (
              <div
                key={lead.id}
                onClick={() => selectLead(lead.id)}
                className="grid cursor-pointer grid-cols-[1.6fr_1.1fr_1fr_1fr_1fr_1.3fr_0.8fr] items-center border-b border-[#f1f5f9] px-5 py-[15px] text-[13.5px] hover:bg-[#f8fafc]"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="font-bold text-[#0f172a]">{lead.name}</div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#94a3b8]">
                    {lead.email}
                  </div>
                </div>
                <div className="text-[#334155]">{lead.company}</div>
                <div className="text-[#334155]">{lead.budget}</div>
                <div className="text-[#334155]">{lead.timeline}</div>
                <div>
                  <StatusPill status={lead.status} label={lead.statusLabel} />
                </div>
                <div className="text-[12.5px] text-[#64748b]">{timeAgo(lead.lastContactAt)}</div>
                <div className="pr-1.5 text-right font-bold text-[#94a3b8]">›</div>
              </div>
            ))
          )}
        </div>

        {nextCursor && !loadingList && (
          <button
            onClick={() => fetchLeads({ cursor: nextCursor })}
            disabled={loadingMore}
            className="self-center rounded-lg border border-[#e2e8f0] bg-white px-5 py-2 text-sm font-semibold text-[#334155] hover:bg-[#f8fafc] disabled:opacity-60"
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        )}
      </div>

      {/* DRAWER */}
      {selectedId && (
        <>
          <div onClick={closeDrawer} className="fixed inset-0 z-40 bg-[#0a0e1a]/45" />
          <div className="fixed right-0 top-0 z-41 flex h-screen w-[460px] max-w-[92vw] flex-col bg-white shadow-2xl">
            {loadingDrawer || !selectedLead ? (
              <div className="flex flex-1 items-center justify-center text-sm text-[#94a3b8]">Loading...</div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-[#e5e9f0] px-6 py-[22px]">
                  <div>
                    <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#94a3b8]">
                      Lead detail
                    </div>
                    <div className="text-[19px] font-extrabold text-[#0f172a]">{selectedLead.name}</div>
                    <div className="mt-0.5 text-[13px] text-[#64748b]">{selectedLead.company}</div>
                  </div>
                  <button onClick={closeDrawer} className="p-1 text-[22px] leading-none text-[#94a3b8]">
                    ×
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-[22px] flex flex-col gap-[22px]">
                  <div>
                    <span
                      className="rounded-full px-3 py-1.5 text-xs font-bold"
                      style={{
                        background: STATUS_META[selectedLead.status]?.bg,
                        color: STATUS_META[selectedLead.status]?.color,
                      }}
                    >
                      {selectedLead.statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <Field label="Email" value={selectedLead.email} />
                    <Field label="Phone" value={selectedLead.phone || '—'} />
                    <Field label="Budget" value={selectedLead.budget} />
                    <Field label="Timeline" value={selectedLead.timeline} />
                  </div>

                  <div>
                    <div className="mb-1.5 text-[11px] font-semibold text-[#94a3b8]">Project details</div>
                    <div className="rounded-[10px] bg-[#f8fafc] px-3.5 py-3 text-[13.5px] leading-relaxed text-[#334155]">
                      {selectedLead.message || '—'}
                    </div>
                  </div>

                  {canUpdate && (
                    <div>
                      <div className="mb-2 text-[11px] font-semibold text-[#94a3b8]">Change status</div>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_CHIPS.map((st) => {
                          const active = selectedLead.status === st;
                          const meta = STATUS_META[st];
                          return (
                            <button
                              key={st}
                              disabled={mutating}
                              onClick={() => changeStatus(st)}
                              className="rounded-[20px] border px-3.5 py-1.5 text-[12.5px] font-semibold disabled:opacity-60"
                              style={{
                                background: active ? meta.bg : '#fff',
                                color: active ? meta.color : '#64748b',
                                borderColor: active ? meta.border : '#e2e8f0',
                              }}
                            >
                              {CHIP_LABEL[st]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {canUpdate && (
                    <div className="flex gap-2.5">
                      <button
                        disabled={mutating}
                        onClick={() => changeStatus('JUNK')}
                        className="flex-1 rounded-[10px] border border-red-200 bg-red-50 py-2.5 text-[13.5px] font-bold text-red-600 disabled:opacity-60"
                      >
                        Mark Junk
                      </button>
                      <button
                        disabled={mutating}
                        onClick={() => changeStatus('CLIENT')}
                        className="flex-1 rounded-[10px] bg-blue-600 py-2.5 text-[13.5px] font-bold text-white disabled:opacity-60"
                      >
                        Convert to Client
                      </button>
                    </div>
                  )}

                  {(canUpdate || canEmail) && (
                    <div>
                      <div className="mb-2 text-[11px] font-semibold text-[#94a3b8]">Log a touchpoint</div>
                      <div className="flex gap-2">
                        {canUpdate && (
                          <button
                            disabled={mutating}
                            onClick={() => logTouch('CALL')}
                            className="flex-1 rounded-[9px] border border-[#e2e8f0] bg-[#f8fafc] py-2 text-[12.5px] font-semibold text-[#334155] disabled:opacity-60"
                          >
                            📞 Call
                          </button>
                        )}
                        {canEmail && (
                          <button
                            onClick={() => setEmailOpen((v) => !v)}
                            className="flex-1 rounded-[9px] border border-[#e2e8f0] bg-[#f8fafc] py-2 text-[12.5px] font-semibold text-[#334155]"
                          >
                            ✉ Email
                          </button>
                        )}
                        {canUpdate && (
                          <button
                            disabled={mutating}
                            onClick={() => logTouch('OTHER')}
                            className="flex-1 rounded-[9px] border border-[#e2e8f0] bg-[#f8fafc] py-2 text-[12.5px] font-semibold text-[#334155] disabled:opacity-60"
                          >
                            👤 Other
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {canEmail && emailOpen && (
                    <div className="flex flex-col gap-2.5 rounded-xl border border-[#dbe3ff] bg-[#f5f7ff] p-4">
                      <div className="text-[12.5px] font-bold text-[#1d3fd6]">
                        Compose email to {selectedLead.email}
                      </div>
                      <input
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Subject"
                        disabled={sendingEmail}
                        className="rounded-lg border border-[#dbe3ff] px-2.5 py-2 text-[13px] outline-none disabled:opacity-60"
                      />
                      <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Write your message..."
                        disabled={sendingEmail}
                        className="min-h-[90px] resize-y rounded-lg border border-[#dbe3ff] px-2.5 py-2 text-[13px] outline-none disabled:opacity-60"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={sendEmail}
                          disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                          className="flex-1 rounded-lg bg-blue-600 py-2 text-[12.5px] font-bold text-white disabled:opacity-60"
                        >
                          {sendingEmail ? 'Sending...' : 'Send'}
                        </button>
                        <button
                          onClick={() => setEmailOpen(false)}
                          disabled={sendingEmail}
                          className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#64748b] disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-[11px] font-semibold text-[#94a3b8]">
                      Contact history — {selectedLead.contactCounts?.email ?? 0} emails ·{' '}
                      {selectedLead.contactCounts?.call ?? 0} calls · {selectedLead.contactCounts?.other ?? 0} other
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {(selectedLead.contactHistory || []).length === 0 ? (
                        <div className="py-3.5 text-center text-[12.5px] text-[#94a3b8]">No contact logged yet.</div>
                      ) : (
                        selectedLead.contactHistory.map((entry, i) => (
                          <div key={i} className="flex gap-2.5 rounded-[9px] bg-[#f8fafc] px-3 py-2.5">
                            <div className="text-[15px]">{TOUCH_ICON[entry.type]}</div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-semibold text-[#0f172a]">
                                {TOUCH_TITLE[entry.type]}
                              </div>
                              <div className="mt-0.5 text-xs text-[#94a3b8]">{timeAgo(entry.contactedAt)}</div>
                              {entry.note && (
                                <div className="mt-1 text-[12.5px] text-[#475569]">{entry.note}</div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="mb-[3px] text-[11px] font-semibold text-[#94a3b8]">{label}</div>
      <div className="text-[13.5px] font-semibold text-[#0f172a]">{value}</div>
    </div>
  );
}
