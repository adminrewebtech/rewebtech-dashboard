'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, X, TriangleAlert } from 'lucide-react';

const AUTO_DISMISS_MS = 5000;

/**
 * Chhota toast stack.
 *
 * Pehle sirf ek `toast` string thi aur woh sirf errors ke liye use hoti thi —
 * kaamyaab action par kuch dikhta hi nahi tha. "Convert to Client" dabane par
 * screen par kuch nahi badalta tha jise aap turant dekh sako, isliye lagta tha
 * ki button kaam hi nahi kar raha. Ab har mutation kuch kehta hai, aur status
 * change ke saath ek Undo bhi deta hai.
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'success', action = null) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, message, tone, action }]);
      timers.current.set(id, setTimeout(() => dismiss(id), AUTO_DISMISS_MS));
    },
    [dismiss]
  );

  // Unmount par pending timers band karo, warna woh gayab component par
  // setState karne ki koshish karte hain.
  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return { toasts, push, dismiss };
}

export function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-[min(380px,calc(100vw-3rem))] flex-col gap-2">
      {toasts.map((t) => {
        const error = t.tone === 'error';
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-white px-4 py-3 text-sm shadow-[0_12px_32px_-10px_rgba(15,23,42,0.28)] ${
              error ? 'border-rose-200' : 'border-emerald-200'
            }`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                error ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {error ? <TriangleAlert size={12} /> : <Check size={12} />}
            </span>
            <span className="flex-1 leading-snug text-slate-700">{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  onDismiss(t.id);
                  t.action.onClick();
                }}
                className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
              className="-mr-1 shrink-0 rounded p-0.5 text-slate-300 transition-colors hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
