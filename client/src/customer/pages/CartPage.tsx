import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { useCart } from '../stores/cart-store'
import { CartItem } from '../components/CartItem'

export function CartPage() {
  const { items, totalAmount, clearCart } = useCart()
  const [isOrdering, setIsOrdering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleOrder = async () => {
    if (items.length === 0) return
    setIsOrdering(true)
    setError(null)

    try {
      const result = await api.post<{ orderNumber: number }>('/orders', {
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      })
      clearCart()
      navigate('/order-success', { state: { orderNumber: result.orderNumber } })
    } catch (err) {
      const message = err instanceof Error ? err.message : '주문에 실패했습니다'
      setError(message)
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/menu')} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">장바구니</h1>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-lg text-gray-400">장바구니가 비어있습니다</p>
          <button
            onClick={() => navigate('/menu')}
            className="mt-4 text-primary-600 hover:underline"
          >
            메뉴 보러 가기
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 p-4">
            {items.map((item) => (
              <CartItem key={item.menuItemId} item={item} />
            ))}
          </div>

          {error && (
            <div className="mx-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Order Footer */}
          <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-gray-600">총 금액</span>
              <span className="text-xl font-bold text-gray-900">
                {totalAmount().toLocaleString()}원
              </span>
            </div>
            <button
              onClick={handleOrder}
              disabled={isOrdering}
              className="w-full rounded-xl bg-primary-600 py-4 font-semibold text-white transition-colors hover:bg-primary-700 disabled:bg-gray-300"
            >
              {isOrdering ? '주문 중...' : `${totalAmount().toLocaleString()}원 주문하기`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
