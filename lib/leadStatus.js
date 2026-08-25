/**
 * Lead statuses — label aur colour, ek hi jagah.
 *
 * Pehle ye teen adhoore maps me bikhre the aur `CLIENT`/`JUNK` unme the hi
 * nahi, jiski wajah se filter tabs par literally "undefined (3)" chhapta tha.
 * Ab har status yahin se aata hai, toh koi status chhut nahi sakta.
 *
 * Classes poori likhi hui hain, jodi hui nahi (`bg-${c}-50` nahi) — Tailwind
 * source me literal strings dhoondhta hai, banaye hue naam usse dikhte hi nahi
 * aur woh colour build me aata hi nahi.
 */
export const STATUS = {
  NEW: {
    label: 'New',
    pill: 'bg-blue-50 text-blue-700 ring-blue-200',
    tab: 'bg-blue-50 text-blue-700 ring-blue-300',
    dot: 'bg-blue-500',
  },
  CONTACTED: {
    label: 'Contacted',
    pill: 'bg-amber-50 text-amber-700 ring-amber-200',
    tab: 'bg-amber-50 text-amber-700 ring-amber-300',
    dot: 'bg-amber-500',
  },
  QUALIFIED: {
    label: 'Qualified',
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    tab: 'bg-emerald-50 text-emerald-700 ring-emerald-300',
    dot: 'bg-emerald-500',
  },
  ON_HOLD: {
    label: 'On Hold',
    pill: 'bg-slate-100 text-slate-600 ring-slate-200',
    tab: 'bg-slate-100 text-slate-700 ring-slate-300',
    dot: 'bg-slate-400',
  },
  CLIENT: {
    label: 'Client',
    pill: 'bg-violet-50 text-violet-700 ring-violet-200',
    tab: 'bg-violet-50 text-violet-700 ring-violet-300',
    dot: 'bg-violet-500',
  },
  JUNK: {
    label: 'Junk',
    pill: 'bg-rose-50 text-rose-700 ring-rose-200',
    tab: 'bg-rose-50 text-rose-700 ring-rose-300',
    dot: 'bg-rose-500',
  },
};

/** Tabs ka order — design me yahi kram hai. */
export const FILTER_TABS = ['All', 'NEW', 'CONTACTED', 'QUALIFIED', 'ON_HOLD', 'CLIENT', 'JUNK'];

/** Unknown status par bhi kuch dikhna chahiye, `undefined` nahi. */
export function statusMeta(status) {
  return STATUS[status] || { label: status || 'Unknown', pill: STATUS.NEW.pill, tab: STATUS.NEW.tab, dot: STATUS.NEW.dot };
}
