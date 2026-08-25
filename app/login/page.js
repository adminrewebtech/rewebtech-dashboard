'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { api } from '@/lib/api';

const RESEND_COOLDOWN_S = 15;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/leads';

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentAt, setSentAt] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    if (step !== 'otp') return;
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step]);

  const elapsedS = sentAt ? Math.max(0, Math.floor((nowTick - sentAt) / 1000)) : 0;
  const resendReady = elapsedS >= RESEND_COOLDOWN_S;

  const requestOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/request-otp', {
        method: 'POST',
        body: { email: email.trim().toLowerCase() },
      });
      setExpiresInMinutes(data.expiresInMinutes || 10);
      setOtp('');
      setSentAt(Date.now());
      setNowTick(Date.now());
      setStep('otp');
    } catch (err) {
      if (err.code === 'RATE_LIMITED') setError('Too many requests. Try again later.');
      else if (err.code === 'VALIDATION_ERROR') setError(err.details?.[0]?.message || 'Enter a valid email.');
      else setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await api('/auth/verify-otp', {
        method: 'POST',
        body: { email: email.trim().toLowerCase(), otp: otp.trim() },
      });
      // Deliberately leave `loading` true through the redirect — the button
      // must stay disabled/showing "Verifying..." until navigation actually
      // lands, otherwise a slow route transition looks like nothing happened
      // and invites a second submit of the now-consumed code.
      setStep('redirecting');
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      if (err.code === 'INVALID_OTP') setError('Invalid or expired code.');
      else if (err.code === 'OTP_ATTEMPTS_EXCEEDED') setError('Too many attempts. Request a new code.');
      else if (err.code === 'RATE_LIMITED') setError('Too many requests. Try again later.');
      else setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f7fc] px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(37,99,235,0.10),transparent_70%)]" />

      <div className="relative w-full max-w-sm rounded-2xl border border-[#e6ecf6] bg-white p-8 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.22)]">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.8)]">
            <LayoutDashboard size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">RewebTech Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === 'email' && 'Sign in with your email'}
            {step === 'otp' && `Enter the code sent to ${email}`}
            {step === 'redirecting' && 'Signed in — redirecting…'}
          </p>
        </div>

        {step === 'redirecting' ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : step === 'email' ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-[#e6ecf6] bg-white px-3.5 py-2.5 text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                placeholder="admin@rewebtech.in"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-xl py-2.5 font-semibold disabled:opacity-50"
            >
              {loading ? 'Sending code...' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
                6-digit code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className="w-full rounded-xl border border-[#e6ecf6] bg-white px-3.5 py-2.5 text-center text-lg font-semibold tracking-[0.4em] text-slate-900 outline-none transition-shadow placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                placeholder="482913"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Code expires in {expiresInMinutes} minutes · sent {elapsedS}s ago
              </p>
              <p className="mt-1 text-xs text-amber-600">
                Use only the newest email — requesting a new code invalidates any earlier one.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full rounded-xl py-2.5 font-semibold disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & sign in'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                  setSentAt(null);
                }}
                className="text-slate-400 transition-colors hover:text-slate-700"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={requestOtp}
                disabled={loading || !resendReady}
                className="font-medium text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50"
              >
                {resendReady ? 'Resend code' : `Resend code (${RESEND_COOLDOWN_S - elapsedS}s)`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
