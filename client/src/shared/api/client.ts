import type { ApiSuccessResponse } from '../types/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    return localStorage.getItem('token')
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const message = body?.error?.message ?? `Request failed: ${response.status}`
      const error = new Error(message) as Error & { status: number; code: string }
      error.status = response.status
      error.code = body?.error?.code ?? 'UNKNOWN'
      throw error
    }

    if (response.status === 204) {
      return undefined as T
    }

    const json = await response.json() as ApiSuccessResponse<T>
    return json.data
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' })
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete(path: string): Promise<void> {
    return this.request<void>(path, { method: 'DELETE' })
  }
}

export const api = new ApiClient('/api/v1')
