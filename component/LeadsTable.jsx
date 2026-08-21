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
      <div className="overflow-x-auto rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Contact</th>
              <th className="px-6 py-3 font-medium">Budget</th>
              <th className="px-6 py-3 font-medium">Timeline</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => openDetail(lead)}
                className="cursor-pointer transition-colors hover:bg-white/5"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.company || '—'}</p>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  <p>{lead.email}</p>
                  <p className="text-xs text-gray-500">{lead.phone || '—'}</p>
                </td>
                <td className="px-6 py-4 text-gray-300">{lead.budget || '—'}</td>
                <td className="px-6 py-4 text-gray-300">{lead.timeline || '—'}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.status || 'new'}
                    onChange={(e) => updateLead(lead.id, { status: e.target.value })}
                    className="rounded-lg border-0 bg-white/5 px-2 py-1.5 text-xs font-medium text-gray-200 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-[#0a1220] text-white">
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
          <p className="px-6 py-10 text-center text-sm text-gray-500">No leads match this filter.</p>
        )}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="relative flex h-full w-full max-w-md flex-col bg-[#0a1220] shadow-2xl ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="font-semibold tracking-tight text-white">Lead details</h3>
              <button onClick={() => setActive(null)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</p>
                <p className="mt-1 text-white">{active.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</p>
                <p className="mt-1 text-white">{active.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</p>
                <p className="mt-1 text-white">{active.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Company</p>
                <p className="mt-1 text-white">{active.company || '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Budget</p>
                  <p className="mt-1 text-white">{active.budget || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Timeline</p>
                  <p className="mt-1 text-white">{active.timeline || '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</p>
                <div className="mt-1.5">
                  <StatusBadge status={active.status} />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Message</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-300">{active.message}</p>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Internal notes
                </p>
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={4}
                  placeholder="Follow-up notes, call summary, etc."
                  className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-gray-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save notes'}
                </button>
              </div>
              <p className="text-xs text-gray-500">Received {formatDate(active.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
