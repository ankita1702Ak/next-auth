import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';

export default async function Home() {
  const token = cookies().get('session')?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    redirect('/login');
  }

  redirect(session.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
}
