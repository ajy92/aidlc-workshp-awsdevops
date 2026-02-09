import { z } from 'zod'

export const adminLoginSchema = z.object({
  storeIdentifier: z.string().min(1).max(50).trim(),
  username: z.string().min(1).max(50).trim(),
  password: z.string().min(1).max(100),
})

export const tableLoginSchema = z.object({
  storeIdentifier: z.string().min(1).max(50).trim(),
  tableNumber: z.number().int().min(1),
  password: z.string().min(1).max(100),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type TableLoginInput = z.infer<typeof tableLoginSchema>
