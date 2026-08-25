'use client';

import { Loader2 } from 'lucide-react';

/**
 * Ek hi button component, variants ke saath.
 *
 * Pehle har button apni class strings khud leke ghoomta tha, isliye "Send" aur
 * "Load more" aur "Call" teenon alag-alag dikhte the. Ab shakal yahan tay hoti
 * hai aur call site sirf iraada batati hai.
 *
 *   primary   — screen ka ek asli kaam (Send, Save)
 *   secondary — barabar ke actions (Call, Email, Load more)
 *   tertiary  — kam wazan wale (Cancel, Dismiss)
 *   danger    — kuch mitane wala
 *
 * Rang website ke system se hain (rewebtech.in ka styles/theme.js): primary
 * blue-600 → blue-700 gradient uske neeche blue glow ke saath.
 */
const VARIANTS = {
  primary:
    'bg-gradient-to-b from-blue-600 to-blue-700 text-white ' +
    'shadow-[0_6px_16px_-6px_rgba(29,78,216,0.55),inset_0_1px_0_rgba(255,255,255,0.22)] ' +
    'hover:brightness-110 active:brightness-95',
  secondary:
    'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 ' +
    'shadow-[0_1px_2px_rgba(16,24,40,0.04)] ' +
    'hover:bg-slate-50 hover:ring-slate-300 hover:text-slate-900',
  tertiary: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900',
  danger:
    'bg-white text-rose-600 ring-1 ring-inset ring-rose-200 ' +
    'shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-rose-50 hover:ring-rose-300',
};

const SIZES = {
  sm: 'h-9 gap-1.5 px-3 text-xs',
  md: 'h-11 gap-2 px-4 text-sm',
};

export default function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-[filter,background-color,box-shadow,color] duration-150 disabled:opacity-45 ${
        VARIANTS[variant]
      } ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {/* Spinner icon ki jagah leta hai, uske aage nahi — warna button ki
          chaudai badal jaati hai aur layout hilta hai. */}
      {loading ? (
        <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" />
      ) : (
        Icon && <Icon size={size === 'sm' ? 13 : 15} />
      )}
      {children}
    </button>
  );
}
