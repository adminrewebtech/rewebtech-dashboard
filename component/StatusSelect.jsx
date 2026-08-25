'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { STATUS, statusMeta } from '@/lib/leadStatus';

const ALL = Object.keys(STATUS);

/**
 * Status ko naam se badalne wala dropdown.
 *
 * Pehle yahan chaar chips the aur "Mark junk"/"Convert to client" alag bade
 * buttons — ek hi cheez teen alag shakal me. Ab saare six statuses ek hi list
 * me hain, apne naam ke saath, aur chunne ki jagah sirf ek hai.
 */
export default function StatusSelect({ value, onChange, disabled, pending }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = statusMeta(value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      // Drawer ka Esc handler bhi laga hua hai — pehle sirf menu band ho,
      // poora drawer nahi.
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const pick = (status) => {
    setOpen(false);
    if (status !== value) onChange(status);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#e6ecf6] bg-white px-4 py-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-[#d7e0ee] hover:bg-slate-50 disabled:opacity-50"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {pending ? (
            <Loader2 size={14} className="shrink-0 animate-spin text-blue-600" />
          ) : (
            <span className={`h-2 w-2 shrink-0 rounded-full ${current.dot}`} />
          )}
          <span className="truncate text-sm font-medium text-slate-900">{current.label}</span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-10 mt-2 overflow-hidden rounded-xl border border-[#e6ecf6] bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)]"
        >
          {ALL.map((status) => {
            const meta = statusMeta(status);
            const active = status === value;
            return (
              <li key={status}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(status)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                  <span className="flex-1 font-medium">{meta.label}</span>
                  {active && <Check size={14} className="shrink-0 text-blue-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
