import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestId } from './shared/middleware/request-id.js'
import { logger } from './shared/middleware/logger.js'
import { errorHandler } from './shared/middleware/error-handler.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { menuRoutes } from './modules/menu/menu.routes.js'
import { orderRoutes } from './modules/order/order.routes.js'
import { orderAdminRoutes } from './modules/order/order.admin-routes.js'
import { supabase } from './db/client.js'

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(requestId)
app.use(logger)

// Health check
app.get('/api/v1/health', async (_req, res) => {
  try {
    const { error } = await supabase.from('stores').select('id').limit(1)
    if (error) throw error
    res.json({ status: 'ok', timestamp: new Date().toISOString(), checks: { database: 'ok' } })
  } catch {
    res.status(503).json({ status: 'down', timestamp: new Date().toISOString(), checks: { database: 'down' } })
  }
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1', menuRoutes)
app.use('/api/v1', orderRoutes)
app.use('/api/v1/admin', orderAdminRoutes)

app.use(errorHandler)

export { app }
