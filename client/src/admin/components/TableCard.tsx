import { useState } from 'react'
import { api } from '@/shared/api/client'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import type { AdminOrder, TableInfo } from '@/shared/types/api'
import { OrderCard } from './OrderCard'
import { OrderHistoryModal } from './OrderHistoryModal'

interface TableCardProps {
  table: TableInfo
  orders: AdminOrder[]
  newOrderIds: Set<string>
  onRefresh: () => void
}

export function TableCard({ table, orders, newOrderIds, onRefresh }: TableCardProps) {
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const tableOrders = orders.filter((o) => o.tableId === table.id)
  const activeOrders = tableOrders.filter((o) => o.status !== 'COMPLETED')
  const hasActiveOrders = activeOrders.length > 0
  const totalAmount = tableOrders.reduce((sum, o) => sum + o.totalAmount, 0)

  const handleComplete = async () => {
    try {
      await api.post(`/admin/tables/${table.id}/complete`)
      onRefresh()
    } catch {
      // ignore
    } finally {
      setShowCompleteConfirm(false)
    }
  }

  return (
    <>
      <div className={`rounded-2xl border bg-white p-4 shadow-sm ${hasActiveOrders ? 'ring-2 ring-primary-200' : ''}`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            테이블 {table.tableNumber}
          </h3>
          <div className="flex items-center gap-2">
            {hasActiveOrders && (
              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                {activeOrders.length}건 진행중
              </span>
            )}
          </div>
        </div>

        {/* Total Amount */}
        {tableOrders.length > 0 && (
          <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">총 주문액</span>
              <span className="text-lg font-bold text-gray-900">{totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        )}

        {tableOrders.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">주문 없음</p>
        ) : (
          <div className="space-y-3">
            {tableOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isNew={newOrderIds.has(order.id)}
                onStatusChange={onRefresh}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-3 flex gap-2 border-t pt-3">
          <button
            onClick={() => setShowHistory(true)}
            className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            과거 내역
          </button>
          {tableOrders.length > 0 && (
            <button
              onClick={() => setShowCompleteConfirm(true)}
              className="min-h-[44px] flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-700"
            >
              이용 완료
            </button>
          )}
        </div>
      </div>

      {showCompleteConfirm && (
        <ConfirmDialog
          title="테이블 이용 완료"
          message={`테이블 ${table.tableNumber}의 이용을 완료하시겠습니까? 현재 주문 내역이 과거 이력으로 이동되고, 주문 목록이 초기화됩니다.`}
          confirmLabel="이용 완료"
          variant="primary"
          onConfirm={handleComplete}
          onCancel={() => setShowCompleteConfirm(false)}
        />
      )}

      {showHistory && (
        <OrderHistoryModal
          tableId={table.id}
          tableNumber={table.tableNumber}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  )
}
