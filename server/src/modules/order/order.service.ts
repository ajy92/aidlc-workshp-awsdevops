import { DomainError, NotFoundError } from '../../shared/errors/domain-error.js'
import { sseManager } from '../../shared/sse/sse-manager.js'
import { findMenuItemById } from '../menu/menu.repository.js'
import { getOrCreateSession } from '../session/session.service.js'
import { validateTransition, type OrderStatus } from './order.state-machine.js'
import * as orderRepo from './order.repository.js'
import type { CreateOrderInput } from './order.schema.js'

export async function createOrder(storeId: string, tableId: string, tableNumber: number, input: CreateOrderInput) {
  // 1. Validate menu items
  const resolvedItems = []
  for (const item of input.items) {
    const menuItem = await findMenuItemById(item.menuItemId)
    if (!menuItem) {
      throw new NotFoundError('menu', item.menuItemId)
    }
    if (menuItem.status === 'SOLD_OUT') {
      throw new DomainError('MENU_SOLD_OUT', `${menuItem.name}은(는) 품절입니다`, 422)
    }
    resolvedItems.push({
      menuItemId: menuItem.id,
      menuName: menuItem.name,
      quantity: item.quantity,
      unitPrice: menuItem.price,
    })
  }

  // 2. Get or create session
  const session = await getOrCreateSession(storeId, tableId)

  // 3. Calculate total
  const totalAmount = resolvedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  // 4. Get next order number
  const orderNumber = await orderRepo.getNextOrderNumber(storeId)

  // 5. Create order
  const order = await orderRepo.createOrder({
    storeId,
    tableId,
    sessionId: session.id,
    orderNumber,
    totalAmount,
    items: resolvedItems,
  })

  // 6. Broadcast SSE
  sseManager.broadcast(storeId, 'order.created', {
    orderId: order.id,
    tableNumber,
    orderNumber: order.orderNumber,
    items: resolvedItems.map((i) => ({ menuName: i.menuName, quantity: i.quantity, unitPrice: i.unitPrice })),
    totalAmount,
  })

  return order
}

export async function getSessionOrders(sessionId: string) {
  return orderRepo.findOrdersBySession(sessionId)
}

export async function getStoreOrders(storeId: string) {
  return orderRepo.findOrdersByStore(storeId)
}

export async function changeOrderStatus(orderId: string, newStatus: OrderStatus, storeId: string) {
  const order = await orderRepo.findOrderById(orderId)
  if (!order) {
    throw new NotFoundError('order', orderId)
  }

  validateTransition(order.status as OrderStatus, newStatus)

  const updated = await orderRepo.updateOrderStatus(orderId, newStatus)

  sseManager.broadcast(storeId, 'order.status_changed', {
    orderId,
    oldStatus: order.status,
    newStatus,
  })

  return updated
}

export async function deleteOrderById(orderId: string, storeId: string) {
  const order = await orderRepo.findOrderById(orderId)
  if (!order) {
    throw new NotFoundError('order', orderId)
  }

  await orderRepo.deleteOrder(orderId)

  sseManager.broadcast(storeId, 'order.deleted', {
    orderId,
    tableId: order.tableId,
  })
}
