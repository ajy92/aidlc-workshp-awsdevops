import { Router } from 'express'
import { authenticate, requireRole, type TableTokenPayload } from '../../shared/middleware/auth.js'
import { validate } from '../../shared/middleware/validate.js'
import { createOrderSchema } from './order.schema.js'
import { createOrder, getSessionOrders } from './order.service.js'
import { getOrCreateSession } from '../session/session.service.js'
import { findActiveSession } from '../session/session.repository.js'
import { success } from '../../shared/types/api.js'

export const orderRoutes = Router()

// POST /api/v1/orders — 고객 주문 생성
orderRoutes.post('/orders', authenticate, requireRole('TABLE'), validate(createOrderSchema), async (req, res, next) => {
  try {
    const user = req.user as TableTokenPayload
    const order = await createOrder(user.storeId, user.tableId, user.tableNumber, req.body)

    res.status(201).json(success({
      id: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map((i) => ({
        menuItemId: i.menuItemId,
        menuName: i.menuName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    }))
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/orders — 고객 현재 세션 주문 조회
orderRoutes.get('/orders', authenticate, requireRole('TABLE'), async (req, res, next) => {
  try {
    const user = req.user as TableTokenPayload
    const session = await findActiveSession(user.storeId, user.tableId)

    if (!session) {
      res.json(success([]))
      return
    }

    const sessionOrders = await getSessionOrders(session.id)
    res.json(success(sessionOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      items: o.items.map((i) => ({ menuName: i.menuName, quantity: i.quantity, unitPrice: i.unitPrice })),
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
    }))))
  } catch (err) {
    next(err)
  }
})
