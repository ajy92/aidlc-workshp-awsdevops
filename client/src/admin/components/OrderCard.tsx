import { useState } from 'react'
import { api } from '@/shared/api/client'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import type { AdminOrder } from '@/shared/types/api'

interface OrderCardProps {
  order: AdminOrder
  isNew?: boolean
  onStatusChange: () => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string; next?: string; nextLabel?: string }> = {
  PENDING: { label: '접수대기', color: 'border-yellow-400 bg-yellow-50', next: 'PREPARING', nextLabel: '준비 시작' },
  PREPARING: { label: '준비중', color: 'border-blue-400 bg-blue-50', next: 'COMPLETED', nextLabel: '완료' },
  COMPLETED: { label: '완료', color: 'border-green-400 bg-green-50' },
}

export function OrderCard({ order, isNew, onStatusChange }: OrderCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const config = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'border-gray-400 bg-gray-50' }

  const handleStatusChange = async () => {
    if (!config.next) return
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status: config.next })
      onStatusChange()
    } catch {
      // ignore
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/orders/${order.id}`)
      onStatusChange()
    } catch {
      // ignore
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className={`rounded-xl border-l-4 p-4 shadow-sm transition-all ${config.color} ${isNew ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">
            주문 #{order.orderNumber}
          </span>
          <span className="text-xs font-medium text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="mb-3 space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.menuName} x {item.quantity}</span>
              <span className="text-gray-500">{(item.unitPrice * item.quantity).toLocaleString()}원</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t pt-2">
          <span className="font-bold">{order.totalAmount.toLocaleString()}원</span>
          <div className="flex gap-2">
            {order.status === 'PENDING' && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="min-h-[44px] rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            )}
            {config.next && (
              <button
                onClick={handleStatusChange}
                className="min-h-[44px] rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
              >
                {config.nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="주문 삭제"
          message={`주문 #${order.orderNumber}을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          confirmLabel="삭제"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}
