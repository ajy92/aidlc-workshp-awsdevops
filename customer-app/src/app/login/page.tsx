'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuth } from '@/lib/client-auth';

export default function LoginPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/table-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, tableNumber: Number(tableNumber), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      saveAuth({ token: data.token, storeId, tableNumber: Number(tableNumber), sessionId: data.sessionId });
      router.push('/');
    } catch { setError('로그인에 실패했습니다'); } finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">테이블 로그인</h1>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input className="w-full border rounded-lg p-3 text-lg" placeholder="매장 ID" value={storeId} onChange={e => setStoreId(e.target.value)} required />
        <input className="w-full border rounded-lg p-3 text-lg" placeholder="테이블 번호" type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} required />
        <input className="w-full border rounded-lg p-3 text-lg" placeholder="비밀번호" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-lg p-3 text-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
