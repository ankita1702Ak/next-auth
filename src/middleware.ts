import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type Role } from './lib/auth';

const protectedRoutes: { prefix: string; role: Role }[] = [
  { prefix: '/admin', role: 'admin' },
  { prefix: '/user', role: 'user' },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const matched = protectedRoutes.find((r) => pathname.startsWith(r.prefix));

  // Not a protected route — let it through untouched.
  if (!matched) {
    return NextResponse.next();
  }

  const token = req.cookies.get('session')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifyToken(token);

  if (!session) {
    // Expired / tampered token — clear it and send back to login.
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.set('session', '', { path: '/', maxAge: 0 });
    return res;
  }

  if (session.role !== matched.role) {
    // Authenticated, but wrong role for this section — send them to their own dashboard.
    const ownDashboard = session.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    return NextResponse.redirect(new URL(ownDashboard, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
