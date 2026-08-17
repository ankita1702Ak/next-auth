import { NextRequest, NextResponse } from 'next/server';
import { findUser } from '@/lib/users';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json(
      { message: 'Username and password are required' },
      { status: 400 }
    );
  }

  const user = findUser(username, password);
  if (!user) {
    return NextResponse.json(
      { message: 'Invalid username or password' },
      { status: 401 }
    );
  }

  const token = await signToken({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  const res = NextResponse.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });

  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours, matches JWT expiry
  });

  return res;
}
