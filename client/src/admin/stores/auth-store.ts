import { create } from 'zustand'
import { api } from '@/shared/api/client'

interface AdminAuthState {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  restore: () => void
}

export const useAdminAuth = create<AdminAuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.post<{ token: string }>('/auth/admin/login', {
        storeIdentifier: 'demo-store',
        username,
        password,
      })
      localStorage.setItem('token', result.token)
      localStorage.setItem('role', 'admin')
      set({ token: result.token, isAuthenticated: true, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다'
      set({ error: message, isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    set({ token: null, isAuthenticated: false })
  },

  restore: () => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (token && role === 'admin') {
      set({ token, isAuthenticated: true })
    }
  },
}))
