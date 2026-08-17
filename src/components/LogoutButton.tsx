'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button className="logoutBtn" onClick={handleLogout} disabled={loading}>
      {loading ? 'Logging out…' : 'Logout'}
    </button>
  );
}
