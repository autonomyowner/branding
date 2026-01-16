import { z } from 'zod'

// Transform platform to uppercase for DB storage
export const platformSchema = z.string().transform(val => val.toUpperCase()).pipe(
  z.enum(['INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'FACEBOOK'])
)

// Transform status to uppercase for DB storage
export const postStatusSchema = z.string().transform(val => val.toUpperCase()).pipe(
  z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED'])
)

export const createPostSchema = z.object({
  content: z.string().min(1).max(10000),
  platform: platformSchema,
  brandId: z.string(),
  imageUrl: z.string().url().optional().or(z.literal('')).transform(val => val || undefined),
  voiceUrl: z.string().url().optional().or(z.literal('')).transform(val => val || undefined),
  status: postStatusSchema.optional(),
  scheduledFor: z.string().optional().transform(val => val || undefined),
  aiGenerated: z.boolean().optional(),
  aiModel: z.string().optional(),
})

export const updatePostSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  platform: platformSchema.optional(),
  imageUrl: z.string().url().nullable().optional().or(z.literal('')).transform(val => val || null),
  voiceUrl: z.string().url().nullable().optional().or(z.literal('')).transform(val => val || null),
  status: postStatusSchema.optional(),
  scheduledFor: z.string().nullable().optional(),
})

export const listPostsQuerySchema = z.object({
  brandId: z.string().optional(),
  status: z.string().transform(val => val.toUpperCase()).pipe(z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED'])).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>
