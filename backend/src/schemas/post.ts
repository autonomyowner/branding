import { z } from 'zod'

export const platformSchema = z.enum(['INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'FACEBOOK'])
export const postStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED'])

export const createPostSchema = z.object({
  content: z.string().min(1).max(10000),
  platform: platformSchema,
  brandId: z.string(),
  imageUrl: z.string().url().optional(),
  voiceUrl: z.string().url().optional(),
  status: postStatusSchema.optional(),
  scheduledFor: z.string().datetime().optional(),
  aiGenerated: z.boolean().optional(),
  aiModel: z.string().optional(),
})

export const updatePostSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  platform: platformSchema.optional(),
  imageUrl: z.string().url().nullable().optional(),
  voiceUrl: z.string().url().nullable().optional(),
  status: postStatusSchema.optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
})

export const listPostsQuerySchema = z.object({
  brandId: z.string().optional(),
  status: postStatusSchema.optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>
