import { create } from 'zustand'
import { api } from '@/shared/api/client'

interface AuthState {
  token: string | null
  tableNumber: number | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (tableNumber: number, password: string) => Promise<void>
  logout: () => void
  restore: () => Promise<void>
}

export const useCustomerAuth = create<AuthState>((set) => ({
  token: null,
  tableNumber: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (tableNumber, password) => {
    set({ isLoading: true, error: null })
    try {
      const result = await api.post<{ token: string }>('/auth/table/login', {
        storeIdentifier: 'demo-store',
        tableNumber,
        password,
      })
      localStorage.setItem('token', result.token)
      localStorage.setItem('tableNumber', String(tableNumber))
      localStorage.setItem('tablePassword', password)
      set({ token: result.token, tableNumber, isAuthenticated: true, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다'
      set({ error: message, isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('tableNumber')
    localStorage.removeItem('tablePassword')
    set({ token: null, tableNumber: null, isAuthenticated: false })
  },

  restore: async () => {
    const token = localStorage.getItem('token')
    const tableNumber = localStorage.getItem('tableNumber')
    const password = localStorage.getItem('tablePassword')

    if (!tableNumber || !password) return

    if (token) {
      set({ token, tableNumber: Number(tableNumber), isAuthenticated: true })
      return
    }

    // Auto-login with saved credentials
    try {
      const result = await api.post<{ token: string }>('/auth/table/login', {
        storeIdentifier: 'demo-store',
        tableNumber: Number(tableNumber),
        password,
      })
      localStorage.setItem('token', result.token)
      set({ token: result.token, tableNumber: Number(tableNumber), isAuthenticated: true })
    } catch {
      // Credentials expired or invalid, clear saved data
      localStorage.removeItem('tableNumber')
      localStorage.removeItem('tablePassword')
    }
  },
}))
