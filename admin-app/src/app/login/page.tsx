'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuth } from '@/lib/client-auth';

export default function LoginPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      saveAuth({ token: data.token, storeId, storeName: data.storeName });
      router.push('/');
    } catch { setError('로그인 실패'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">🏪 관리자 로그인</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input value={storeId} onChange={e => setStoreId(e.target.value)} placeholder="매장 ID" required
          className="w-full border rounded-lg px-4 py-2.5 text-sm" />
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="아이디" required
          className="w-full border rounded-lg px-4 py-2.5 text-sm" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="비밀번호" required
          className="w-full border rounded-lg px-4 py-2.5 text-sm" />
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
