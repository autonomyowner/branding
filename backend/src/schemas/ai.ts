import { z } from 'zod'

export const contentStyleSchema = z.enum(['viral', 'storytelling', 'educational', 'controversial', 'inspirational'])
export const platformSchema = z.enum(['Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'Facebook'])

export const generateContentSchema = z.object({
  brandId: z.string(),
  platform: platformSchema,
  topic: z.string().max(500).optional(),
  style: contentStyleSchema.optional().default('viral'),
  model: z.string().optional().default('anthropic/claude-3-haiku'),
})

export const generateFromVideoSchema = z.object({
  brandId: z.string(),
  platform: platformSchema,
  transcript: z.string().min(10).max(50000),
  videoTitle: z.string().max(500),
  numberOfPosts: z.number().min(1).max(20).default(5),
  style: contentStyleSchema.optional().default('viral'),
  model: z.string().optional().default('anthropic/claude-3.5-sonnet'),
})

export const generateVoiceoverSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string(),
  style: z.enum(['conversational', 'professional', 'energetic', 'calm']).optional().default('conversational'),
})

export const generateImageSchema = z.object({
  prompt: z.string().min(1).max(2000),
  model: z.string().optional().default('fal-ai/flux/schnell'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).optional().default('1:1'),
  style: z.enum(['none', 'photorealistic', 'digital-art', 'illustration', 'cinematic', 'minimalist', 'vibrant']).optional().default('none'),
})

export type GenerateContentInput = z.infer<typeof generateContentSchema>
export type GenerateFromVideoInput = z.infer<typeof generateFromVideoSchema>
export type GenerateVoiceoverInput = z.infer<typeof generateVoiceoverSchema>
export type GenerateImageInput = z.infer<typeof generateImageSchema>
