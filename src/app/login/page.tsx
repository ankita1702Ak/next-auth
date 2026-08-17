'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import styles from './login.module.css';

interface LoginResponse {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        username,
        password,
      });
      const dashboard =
        res.data.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';

      // router.refresh() forces the next server component render to re-read
      // the (now set) session cookie, so the SSR dashboard check picks it up.
      router.push(dashboard);
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to access your dashboard</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin or user"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className={styles.hint}>
          Demo accounts — Admin: <b>admin / admin123</b>
          <br />
          User: <b>user / user123</b>
        </p>
      </form>
    </div>
  );
}
