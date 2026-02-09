import { z } from 'zod'

export const createOrderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
})

export const changeStatusSchema = z.object({
  status: z.enum(['PREPARING', 'COMPLETED']),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>
