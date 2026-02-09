import { Router } from 'express'
import { validate } from '../../shared/middleware/validate.js'
import { loginRateLimit } from '../../shared/middleware/rate-limit.js'
import { adminLoginSchema, tableLoginSchema } from './auth.schema.js'
import { loginAdmin, loginTable } from './auth.service.js'
import { success } from '../../shared/types/api.js'

export const authRoutes = Router()

authRoutes.post('/admin/login', loginRateLimit, validate(adminLoginSchema), async (req, res, next) => {
  try {
    const result = await loginAdmin(req.body)
    res.json(success(result))
  } catch (err) {
    next(err)
  }
})

authRoutes.post('/table/login', loginRateLimit, validate(tableLoginSchema), async (req, res, next) => {
  try {
    const result = await loginTable(req.body)
    res.json(success(result))
  } catch (err) {
    next(err)
  }
})
