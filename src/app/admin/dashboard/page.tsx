import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { users } from '@/lib/users';
import LogoutButton from '@/components/LogoutButton';
import styles from '@/styles/dashboard.module.css';

export default async function AdminDashboard() {
  // SSR session check — runs on the server before any HTML is sent.
  // Middleware already guards this route, this is a second, explicit check
  // right at the data/render boundary (defense in depth).
  const token = cookies().get('session')?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <span className={`${styles.badge} ${styles.badgeAdmin}`}>Admin</span>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {session.name}</p>
        </div>
        <LogoutButton />
      </header>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className={styles.card}>
          <h3>Admins</h3>
          <p>{users.filter((u) => u.role === 'admin').length}</p>
        </div>
        <div className={styles.card}>
          <h3>Access Level</h3>
          <p>Full</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>All Users</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.name}</td>
                <td>
                  <span className={`${styles.roleTag} ${styles[u.role]}`}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.note}>
          This is admin-only data. It's protected by middleware (edge, before
          render) and re-verified here on the server before the page renders.
        </p>
      </section>
    </div>
  );
}
