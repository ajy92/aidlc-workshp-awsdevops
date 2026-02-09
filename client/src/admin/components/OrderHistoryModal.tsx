import { useEffect, useState } from 'react'
import { api } from '@/shared/api/client'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

interface HistoryItem {
  id: string
  orderNumber: number
  orderItems: Array<{ menuName: string; quantity: number; unitPrice: number }>
  totalAmount: number
  orderedAt: string
  archivedAt: string
}

interface OrderHistoryModalProps {
  tableId: string
  tableNumber: number
  onClose: () => void
}

export function OrderHistoryModal({ tableId, tableNumber, onClose }: OrderHistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      let path = `/admin/tables/${tableId}/history?limit=50`
      if (startDate) path += `&startDate=${startDate}`
      if (endDate) path += `&endDate=${endDate}`
      const data = await api.get<HistoryItem[]>(path)
      setHistory(data)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = () => {
    fetchHistory()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">
            테이블 {tableNumber} - 과거 주문 내역
          </h3>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-lg text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Date Filters */}
        <div className="flex gap-2 border-b px-6 py-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="flex items-center text-gray-400">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleFilter}
            className="min-h-[44px] rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            조회
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <LoadingSpinner />
          ) : history.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">과거 주문 내역이 없습니다</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="rounded-xl border bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">주문 #{item.orderNumber}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.orderedAt).toLocaleString('ko-KR', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="mb-2 space-y-1">
                    {item.orderItems.map((oi, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{oi.menuName} x {oi.quantity}</span>
                        <span className="text-gray-500">{(oi.unitPrice * oi.quantity).toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-xs text-gray-400">
                      완료: {new Date(item.archivedAt).toLocaleString('ko-KR', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className="font-bold text-gray-900">{item.totalAmount.toLocaleString()}원</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4">
          <button
            onClick={onClose}
            className="min-h-[44px] w-full rounded-lg border border-gray-300 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
