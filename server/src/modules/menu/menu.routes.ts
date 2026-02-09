import { Router } from 'express'
import { authenticate } from '../../shared/middleware/auth.js'
import { getMenuItems, getCategories } from './menu.service.js'
import { success } from '../../shared/types/api.js'

export const menuRoutes = Router()

menuRoutes.get('/menu-items', authenticate, async (req, res, next) => {
  try {
    const storeId = req.user!.storeId
    const categoryId = req.query.categoryId as string | undefined
    const lang = req.query.lang as string | undefined
    const items = await getMenuItems(storeId, categoryId, lang)
    res.json(success(items))
  } catch (err) {
    next(err)
  }
})

menuRoutes.get('/categories', authenticate, async (req, res, next) => {
  try {
    const storeId = req.user!.storeId
    const cats = await getCategories(storeId)
    res.json(success(cats))
  } catch (err) {
    next(err)
  }
})
