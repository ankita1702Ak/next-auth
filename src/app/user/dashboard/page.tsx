import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import styles from '@/styles/dashboard.module.css';

export default async function UserDashboard() {
  // SSR session check — same pattern as the admin dashboard, scoped to 'user'.
  const token = cookies().get('session')?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session || session.role !== 'user') {
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <span className={`${styles.badge} ${styles.badgeUser}`}>User</span>
          <h1>User Dashboard</h1>
          <p>Welcome back, {session.name}</p>
        </div>
        <LogoutButton />
      </header>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h3>Account</h3>
          <p>{session.username}</p>
        </div>
        <div className={styles.card}>
          <h3>Role</h3>
          <p>Member</p>
        </div>
        <div className={styles.card}>
          <h3>Status</h3>
          <p>Active</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Your Overview</h2>
        <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
          This page is only reachable by users with the <b>user</b> role.
          Admin routes under <code>/admin</code> are off-limits to this
          account — try visiting <code>/admin/dashboard</code> and you'll be
          redirected right back here.
        </p>
        <p className={styles.note}>
          Protected by the same middleware + SSR session check pattern as the
          admin dashboard, just scoped to a different role.
        </p>
      </section>
    </div>
  );
}
