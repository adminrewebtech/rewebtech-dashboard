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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060f21] px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(37,99,235,0.22),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative w-full max-w-sm rounded-2xl bg-white/[0.04] p-8 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.6)]">
            <LayoutDashboard size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">RewebTech Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">
            {step === 'email' && 'Sign in with your email'}
            {step === 'otp' && `Enter the code sent to ${email}`}
            {step === 'redirecting' && 'Signed in — redirecting…'}
          </p>
        </div>

        {step === 'redirecting' ? (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />
          </div>
        ) : step === 'email' ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-200">
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
                className="w-full rounded-lg bg-white/5 px-3.5 py-2.5 text-white outline-none ring-1 ring-white/10 transition-all placeholder:text-gray-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                placeholder="admin@rewebtech.in"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-all duration-200 hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? 'Sending code...' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-gray-200">
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
                className="w-full rounded-lg bg-white/5 px-3.5 py-2.5 text-center text-lg tracking-[0.4em] text-white outline-none ring-1 ring-white/10 transition-all placeholder:text-gray-500 placeholder:tracking-normal focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                placeholder="482913"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Code expires in {expiresInMinutes} minutes · sent {elapsedS}s ago
              </p>
              <p className="mt-1 text-xs text-amber-400/80">
                Use only the newest email — requesting a new code invalidates any earlier one.
              </p>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 ring-1 ring-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-all duration-200 hover:bg-blue-500 disabled:opacity-60"
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
                className="text-gray-400 hover:text-white"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={requestOtp}
                disabled={loading || !resendReady}
                className="font-medium text-blue-400 hover:text-blue-300 disabled:opacity-60"
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
