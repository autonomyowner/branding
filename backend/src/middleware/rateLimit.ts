import rateLimit from 'express-rate-limit'
import { Request } from 'express'

// General API rate limiter - 100 requests per minute per IP
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Disable all validation
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health'
  },
})

// Strict limiter for AI generation endpoints - 20 requests per minute
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    error: {
      message: 'Too many AI generation requests, please wait before trying again',
      code: 'AI_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    const userId = (req as Request & { auth?: { userId?: string } }).auth?.userId
    return userId || req.ip || 'unknown'
  },
})

// Very strict limiter for image generation - 10 requests per minute
export const imageGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: {
      message: 'Too many image generation requests, please wait before trying again',
      code: 'IMAGE_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req: Request) => {
    const userId = (req as Request & { auth?: { userId?: string } }).auth?.userId
    return userId || req.ip || 'unknown'
  },
})

// Auth endpoint limiter - prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes
  message: {
    error: {
      message: 'Too many authentication attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
})

// Webhook limiter - more lenient for automated systems
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  message: {
    error: {
      message: 'Too many webhook requests',
      code: 'WEBHOOK_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
})
