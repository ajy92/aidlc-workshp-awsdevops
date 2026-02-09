import { findActiveSession, createSession, completeSession } from './session.repository.js'
import { NotFoundError } from '../../shared/errors/domain-error.js'
import * as orderRepo from '../order/order.repository.js'
import { supabase } from '../../db/client.js'
import { sseManager } from '../../shared/sse/sse-manager.js'

export async function getOrCreateSession(storeId: string, tableId: string) {
  const existing = await findActiveSession(storeId, tableId)
  if (existing) return existing
  return createSession(storeId, tableId)
}

export async function completeTableSession(storeId: string, tableId: string) {
  const session = await findActiveSession(storeId, tableId)
  if (!session) {
    throw new NotFoundError('session', tableId)
  }

  // Archive orders to history
  const sessionOrders = await orderRepo.findOrdersBySession(session.id)

  if (sessionOrders.length > 0) {
    const historyEntries = sessionOrders.map((order) => ({
      store_id: storeId,
      table_id: tableId,
      session_id: session.id,
      order_number: order.orderNumber,
      order_items: order.items,
      total_amount: order.totalAmount,
      ordered_at: order.createdAt,
    }))

    const { error } = await supabase.from('order_history').insert(historyEntries)
    if (error) throw new Error(`주문 이력 저장 실패: ${error.message}`)
  }

  // Delete current orders
  await orderRepo.deleteOrdersBySession(session.id)

  // Complete session
  const completed = await completeSession(session.id)

  sseManager.broadcast(storeId, 'session.completed', {
    tableId,
    sessionId: session.id,
    archivedCount: sessionOrders.length,
  })

  return {
    tableId,
    sessionId: session.id,
    completedAt: completed.completedAt,
    archivedOrderCount: sessionOrders.length,
  }
}
