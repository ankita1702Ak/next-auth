import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev_secret_key_change_me'
);

export type Role = 'admin' | 'user';

export interface SessionPayload {
  id: string;
  username: string;
  name: string;
  role: Role;
}

// Sign a session JWT (used at login time)
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);
}

// Verify a session JWT. Safe to call from middleware (edge) and server components (node).
export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
