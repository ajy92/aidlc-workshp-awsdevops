'use client';
import { TableAuth } from '@/lib/types';

const AUTH_KEY = 'table_auth';

export function getAuth(): TableAuth | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
}

export function saveAuth(auth: TableAuth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const auth = getAuth();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...options.headers as Record<string, string> };
  if (auth?.token) headers['Authorization'] = `Bearer ${auth.token}`;
  const res = await fetch(path, { ...options, headers });
  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res;
}
