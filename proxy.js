import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'rwt_session';

export function proxy(request) {
  // The session cookie belongs to api.rewebtech.in. In production the
  // dashboard is itself a rewebtech.in subdomain, so it's visible here and
  // this check is meaningful. In local dev the dashboard runs on a
  // different domain (localhost), so the cookie is never visible to this
  // server-side check even for a genuinely logged-in user — skip the gate
  // and let the client-side AuthProvider verify directly against the API
  // instead (a real cross-origin browser request, where the cookie *is*
  // attached correctly).
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!login|_next/static|_next/image|favicon.ico).*)'],
};
