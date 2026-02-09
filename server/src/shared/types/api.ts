export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: {
    total: number
    page: number
    limit: number
    hasNext: boolean
  }
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
    requestId: string
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function success<T>(data: T, meta?: ApiSuccessResponse<T>['meta']): ApiSuccessResponse<T> {
  return { success: true, data, ...(meta ? { meta } : {}) }
}
