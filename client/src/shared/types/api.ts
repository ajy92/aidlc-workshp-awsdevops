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
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export interface MenuItem {
  id: string
  name: string
  nameEn: string | null
  description: string | null
  price: number
  imageUrl: string | null
  status: 'ON_SALE' | 'SOLD_OUT'
  categoryId: string
  sortOrder: number
}

export interface Category {
  id: string
  name: string
  sortOrder: number
}

export interface OrderItem {
  menuName: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderNumber: number
  items: OrderItem[]
  totalAmount: number
  status: 'PENDING' | 'PREPARING' | 'COMPLETED'
  createdAt: string
}

export interface AdminOrder extends Order {
  tableId: string
}

export interface TableInfo {
  id: string
  tableNumber: number
  storeId: string
}
