import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import type { Order } from '@/shared/types/api'

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  PENDING: { text: '접수대기', color: 'bg-yellow-100 text-yellow-700' },
  PREPARING: { text: '준비중', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { text: '완료', color: 'bg-green-100 text-green-700' },
}

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Order[]>('/orders')
        setOrders(data)
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/menu')} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">주문 내역</h1>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-lg text-gray-400">주문 내역이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          {orders.map((order) => {
            const status = STATUS_LABEL[order.status] ?? { text: order.status, color: 'bg-gray-100 text-gray-700' }
            return (
              <div key={order.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    주문 #{order.orderNumber}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                    {status.text}
                  </span>
                </div>

                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.menuName} x {item.quantity}
                      </span>
                      <span className="text-gray-500">
                        {(item.unitPrice * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-gray-900">
                    {order.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
