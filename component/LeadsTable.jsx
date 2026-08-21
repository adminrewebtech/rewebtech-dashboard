'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import StatusBadge from '@/component/StatusBadge';

const STATUS_OPTIONS = ['new', 'contacted', 'won', 'lost'];

function formatDate(date) {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadsTable({ leads }) {
  const [rows, setRows] = useState(leads);
  const [active, setActive] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const updateLead = async (id, patch) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    return data;
  };

  const openDetail = (lead) => {
    setActive(lead);
    setNotesDraft(lead.notes || '');
  };

  const saveNotes = async () => {
    if (!active) return;
    setSaving(true);
    await updateLead(active.id, { notes: notesDraft });
    setSaving(false);
    setActive((prev) => (prev ? { ...prev, notes: notesDraft } : prev));
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-900/[0.06] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-900/[0.06] text-xs uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Budget</th>
              <th className="px-6 py-3 font-medium">Timeline</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900/[0.06]">
            {rows.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => openDetail(lead)}
                className="cursor-pointer transition-colors hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.company || '—'}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <p>{lead.email}</p>
                  <p className="text-xs text-gray-400">{lead.phone || '—'}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{lead.budget || '—'}</td>
                <td className="px-6 py-4 text-gray-600">{lead.timeline || '—'}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.status || 'new'}
                    onChange={(e) => updateLead(lead.id, { status: e.target.value })}
                    className="rounded-lg border-0 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-900/[0.08] focus:ring-2 focus:ring-blue-600"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {formatDate(lead.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No leads match this filter.</p>
        )}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setActive(null)} />
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-900/[0.06] px-6 py-4">
              <h3 className="font-semibold tracking-tight text-gray-900">Lead details</h3>
              <button onClick={() => setActive(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Name</p>
                <p className="mt-1 text-gray-900">{active.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
                <p className="mt-1 text-gray-900">{active.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Phone</p>
                <p className="mt-1 text-gray-900">{active.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Company</p>
                <p className="mt-1 text-gray-900">{active.company || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Budget</p>
                  <p className="mt-1 text-gray-900">{active.budget || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Timeline</p>
                  <p className="mt-1 text-gray-900">{active.timeline || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</p>
                <div className="mt-1.5">
                  <StatusBadge status={active.status} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{active.message}</p>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Internal notes
                </p>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={4}
                  placeholder="Follow-up notes, call summary, etc."
                  className="w-full rounded-lg bg-gray-50/70 px-3 py-2 text-sm text-gray-900 outline-none ring-1 ring-gray-900/[0.08] focus:bg-white focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  className="mt-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save notes'}
                </button>
              </div>
              <p className="text-xs text-gray-400">Received {formatDate(active.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
