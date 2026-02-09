import { Router } from 'express'
import { authenticate, requireRole } from '../../shared/middleware/auth.js'
import { validate } from '../../shared/middleware/validate.js'
import { changeStatusSchema } from './order.schema.js'
import { getStoreOrders, changeOrderStatus, deleteOrderById } from './order.service.js'
import { completeTableSession } from '../session/session.service.js'
import { sseManager } from '../../shared/sse/sse-manager.js'
import { success } from '../../shared/types/api.js'
import { supabase } from '../../db/client.js'
import { toCamelArray } from '../../db/mappers.js'

export const orderAdminRoutes = Router()

interface TableRow { id: string; storeId: string; tableNumber: number; passwordHash: string; createdAt: string }
interface HistoryRow { id: string; storeId: string; tableId: string; sessionId: string; orderNumber: number; orderItems: unknown; totalAmount: number; orderedAt: string; archivedAt: string }

// SSE stream
orderAdminRoutes.get('/events', authenticate, requireRole('ADMIN'), (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  const clientId = sseManager.addClient(req.user!.storeId, res)
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId })}\n\n`)
})

// GET /admin/orders
orderAdminRoutes.get('/orders', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const storeOrders = await getStoreOrders(req.user!.storeId)
    res.json(success(storeOrders.map((o) => ({
      id: o.id,
      tableId: o.tableId,
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

// PATCH /admin/orders/:orderId/status
orderAdminRoutes.patch('/orders/:orderId/status', authenticate, requireRole('ADMIN'), validate(changeStatusSchema), async (req, res, next) => {
  try {
    const orderId = req.params.orderId as string
    const updated = await changeOrderStatus(orderId, req.body.status, req.user!.storeId)
    res.json(success({ id: updated.id, status: updated.status, updatedAt: updated.updatedAt }))
  } catch (err) {
    next(err)
  }
})

// DELETE /admin/orders/:orderId
orderAdminRoutes.delete('/orders/:orderId', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const orderId = req.params.orderId as string
    await deleteOrderById(orderId, req.user!.storeId)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// GET /admin/tables
orderAdminRoutes.get('/tables', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('table_info')
      .select('*')
      .eq('store_id', req.user!.storeId)

    if (error) throw new Error(`테이블 조회 실패: ${error.message}`)

    res.json(success(toCamelArray<TableRow>(data)))
  } catch (err) {
    next(err)
  }
})

// POST /admin/tables/:tableId/complete
orderAdminRoutes.post('/tables/:tableId/complete', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const tableId = req.params.tableId as string
    const result = await completeTableSession(req.user!.storeId, tableId)
    res.json(success(result))
  } catch (err) {
    next(err)
  }
})

// GET /admin/tables/:tableId/history
orderAdminRoutes.get('/tables/:tableId/history', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const storeId = req.user!.storeId
    const tableId = req.params.tableId as string
    const page = Number(req.query.page) || 1
    const limit = Math.min(Number(req.query.limit) || 20, 100)

    let query = supabase
      .from('order_history')
      .select('*')
      .eq('store_id', storeId)
      .eq('table_id', tableId)

    if (req.query.startDate) {
      query = query.gte('archived_at', new Date(req.query.startDate as string).toISOString())
    }
    if (req.query.endDate) {
      query = query.lte('archived_at', new Date(req.query.endDate as string).toISOString())
    }

    const start = (page - 1) * limit
    const end = start + limit // fetch limit+1 to check hasNext

    const { data: rows, error } = await query
      .order('archived_at', { ascending: false })
      .range(start, end)

    if (error) throw new Error(`주문 이력 조회 실패: ${error.message}`)

    const allRows = toCamelArray<HistoryRow>(rows)
    const hasNext = allRows.length > limit
    const data = allRows.slice(0, limit)

    res.json(success(data, { total: data.length, page, limit, hasNext }))
  } catch (err) {
    next(err)
  }
})
