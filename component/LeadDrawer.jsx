'use client';

import { useEffect, useState } from 'react';
import { X, Phone, Mail, User, Loader2, Send } from 'lucide-react';
import { statusMeta } from '@/lib/leadStatus';
import StatusSelect from '@/component/StatusSelect';
import Button from '@/component/Button';

const TOUCH = {
  CALL: { icon: Phone, title: 'Phone call' },
  EMAIL: { icon: Mail, title: 'Email sent' },
  OTHER: { icon: User, title: 'Contact attempt' },
};

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

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 truncate text-sm font-medium text-slate-900" title={value || undefined}>
        {value || '—'}
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">{children}</div>;
}

export default function LeadDrawer({
  lead,
  loading,
  onClose,
  canUpdate,
  canEmail,
  pending,
  onChangeStatus,
  onLogTouch,
  onSendEmail,
}) {
  // Mount ke baad ek frame ruk kar slide-in karte hain. Turant `open` kar dene
  // par browser ke paas start state paint karne ka mauka nahi hota aur panel
  // bina animation ke chipak jaata hai.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const [emailOpen, setEmailOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Esc se band ho, aur khulne par background scroll na ho — warna drawer ke
  // andar scroll khatam hote hi peeche ka page khisakne lagta hai.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  // Lead badla toh in-progress UI reset — warna ek lead ka aadha likha email
  // agli lead ke drawer me khula reh jaata hai.
  useEffect(() => {
    setEmailOpen(false);
    setSubject('');
    setBody('');
  }, [lead?.id]);

  const meta = lead ? statusMeta(lead.status) : null;
  const busy = (key) => pending === key;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Lead detail"
        className={`fixed right-0 top-0 z-50 flex h-screen w-[440px] max-w-[94vw] flex-col border-l border-[#e6ecf6] bg-white shadow-[-16px_0_48px_-20px_rgba(15,23,42,0.3)] transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {loading || !lead ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 size={16} className="animate-spin" /> Loading lead…
          </div>
        ) : (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-[#eef2f8] px-6 py-5">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{lead.name}</h2>
                <p className="mt-0.5 truncate text-sm text-slate-500">{lead.company || 'No company'}</p>
                <span
                  className={`mt-2.5 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.pill}`}
                >
                  {meta.label}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" value={lead.email} />
                <Field label="Phone" value={lead.phone} />
                <Field label="Budget" value={lead.budget} />
                <Field label="Timeline" value={lead.timeline} />
              </div>

              <div>
                <SectionLabel>Project details</SectionLabel>
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-100">
                  {lead.message || '—'}
                </p>
              </div>

              {canUpdate && (
                <div>
                  <SectionLabel>Status</SectionLabel>
                  <StatusSelect
                    value={lead.status}
                    onChange={onChangeStatus}
                    disabled={!!pending}
                    pending={pending?.startsWith('status:')}
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    Changing this moves the lead between tabs. You can undo it right after.
                  </p>
                </div>
              )}

              {(canUpdate || canEmail) && (
                <div>
                  <SectionLabel>Log a touchpoint</SectionLabel>
                  <div className="flex gap-2">
                    {canUpdate && (
                      <Button
                        size="sm"
                        fullWidth
                        icon={Phone}
                        loading={busy('touch:CALL')}
                        disabled={!!pending}
                        onClick={() => onLogTouch('CALL')}
                      >
                        Call
                      </Button>
                    )}
                    {canEmail && (
                      <Button
                        size="sm"
                        fullWidth
                        icon={Mail}
                        onClick={() => setEmailOpen((v) => !v)}
                        className={emailOpen ? 'bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-50' : ''}
                      >
                        Email
                      </Button>
                    )}
                    {canUpdate && (
                      <Button
                        size="sm"
                        fullWidth
                        icon={User}
                        loading={busy('touch:OTHER')}
                        disabled={!!pending}
                        onClick={() => onLogTouch('OTHER')}
                      >
                        Other
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {canEmail && emailOpen && (
                <div className="flex flex-col gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="text-xs text-slate-500">
                    To <span className="font-medium text-slate-800">{lead.email}</span>
                  </div>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    disabled={busy('email')}
                    className="rounded-lg border border-[#dbe4f3] bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                  />
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your message…"
                    disabled={busy('email')}
                    className="min-h-[110px] resize-y rounded-lg border border-[#dbe4f3] bg-white px-3 py-2 text-sm leading-relaxed text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      icon={Send}
                      loading={busy('email')}
                      disabled={!subject.trim() || !body.trim()}
                      onClick={() =>
                        onSendEmail({ subject, body }, () => {
                          setEmailOpen(false);
                          setSubject('');
                          setBody('');
                        })
                      }
                    >
                      {busy('email') ? 'Sending…' : 'Send'}
                    </Button>
                    <Button variant="tertiary" size="sm" disabled={busy('email')} onClick={() => setEmailOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <SectionLabel>
                  Contact history — {lead.contactCounts?.email ?? 0} email · {lead.contactCounts?.call ?? 0} call ·{' '}
                  {lead.contactCounts?.other ?? 0} other
                </SectionLabel>
                {(lead.contactHistory || []).length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[#e6ecf6] py-5 text-center text-xs text-slate-400">
                    Nothing logged yet.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {lead.contactHistory.map((entry, i) => {
                      const t = TOUCH[entry.type] || TOUCH.OTHER;
                      const Icon = t.icon;
                      return (
                        <li key={i} className="flex gap-3 rounded-xl border border-[#eef2f8] bg-white px-3.5 py-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                            <Icon size={12} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-800">{t.title}</div>
                            <div className="mt-0.5 text-xs text-slate-400">{timeAgo(entry.contactedAt)}</div>
                            {entry.subject && <div className="mt-1.5 truncate text-xs text-slate-500">{entry.subject}</div>}
                            {entry.note && <div className="mt-1 text-xs text-slate-500">{entry.note}</div>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
