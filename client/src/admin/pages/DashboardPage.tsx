import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'
import type { AdminOrder, TableInfo } from '@/shared/types/api'
import { useAdminAuth } from '../stores/auth-store'
import { useSSE } from '../hooks/useSSE'
import { TableCard } from '../components/TableCard'

export function DashboardPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterTable, setFilterTable] = useState<string | null>(null)
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set())
  const newOrderTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const logout = useAdminAuth((s) => s.logout)
  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    try {
      const [tablesData, ordersData] = await Promise.all([
        api.get<TableInfo[]>('/admin/tables'),
        api.get<AdminOrder[]>('/admin/orders'),
      ])
      setTables(tablesData)
      setOrders(ordersData)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      newOrderTimers.current.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const markNewOrder = useCallback((orderId: string) => {
    setNewOrderIds((prev) => new Set(prev).add(orderId))
    // Remove highlight after 5 seconds
    const timer = setTimeout(() => {
      setNewOrderIds((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
      newOrderTimers.current.delete(orderId)
    }, 5000)
    newOrderTimers.current.set(orderId, timer)
  }, [])

  useSSE({
    'order.created': (data) => {
      const orderData = data as { orderId: string }
      markNewOrder(orderData.orderId)
      fetchData()
    },
    'order.status_changed': () => fetchData(),
    'order.deleted': () => fetchData(),
  })

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  if (isLoading) return <LoadingSpinner />

  const activeOrderCount = orders.filter((o) => o.status !== 'COMPLETED').length
  const filteredTables = filterTable
    ? tables.filter((t) => t.id === filterTable)
    : tables

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">주문 대시보드</h1>
            <p className="text-sm text-gray-500">
              진행중 주문: <span className="font-semibold text-primary-600">{activeOrderCount}건</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Table Filter */}
            <select
              value={filterTable ?? ''}
              onChange={(e) => setFilterTable(e.target.value || null)}
              className="min-h-[44px] rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">전체 테이블</option>
              {tables
                .sort((a, b) => a.tableNumber - b.tableNumber)
                .map((t) => (
                  <option key={t.id} value={t.id}>테이블 {t.tableNumber}</option>
                ))}
            </select>
            <button
              onClick={fetchData}
              className="min-h-[44px] rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              새로고침
            </button>
            <button
              onClick={handleLogout}
              className="min-h-[44px] rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Table Grid */}
      <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTables
          .sort((a, b) => a.tableNumber - b.tableNumber)
          .map((table) => (
            <TableCard
              key={table.id}
              table={table}
              orders={orders}
              newOrderIds={newOrderIds}
              onRefresh={fetchData}
            />
          ))}
      </div>
    </div>
  )
}
