import { z } from 'zod'

export const createBrandSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  initials: z.string().min(1).max(3).optional(),
  voice: z.enum(['professional', 'casual', 'witty', 'inspirational', 'educational']).optional(),
  topics: z.array(z.string().max(50)).max(10).optional(),
})

export const updateBrandSchema = createBrandSchema.partial()

export type CreateBrandInput = z.infer<typeof createBrandSchema>
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>
