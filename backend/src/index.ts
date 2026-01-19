import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { env } from './config/env.js'
import { clerkAuth } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiLimiter, webhookLimiter } from './middleware/rateLimit.js'
import apiRoutes from './routes/index.js'
import clerkWebhook from './routes/webhooks/clerk.js'
import stripeWebhook from './routes/webhooks/stripe.js'
import telegramWebhook from './routes/webhooks/telegram.js'
import { startScheduler, stopScheduler } from './workers/scheduler.js'
import { isRedisAvailable } from './lib/redis.js'
import { closeQueues } from './lib/queue.js'
import { prisma } from './lib/prisma.js'

const app = express()

// Security middleware
app.use(helmet())

// Compression middleware - reduces response size by ~60-70%
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept it
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  }
}))

// CORS - allow frontend origin and Clerk authentication subdomains
const frontendOrigin = env.FRONTEND_URL.replace(/\/$/, '')
const baseDomain = frontendOrigin.replace(/^https?:\/\/(www\.)?/, '')
const allowedOrigins = [
  frontendOrigin,
  frontendOrigin.replace('https://', 'https://www.'),
  frontendOrigin.replace('https://www.', 'https://'),
  `https://accounts.${baseDomain}`,
  `https://clerk.${baseDomain}`,
].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// Webhooks need raw body for signature verification
// IMPORTANT: Must come before express.json()
app.use('/webhooks/clerk', webhookLimiter, express.raw({ type: 'application/json' }), clerkWebhook)
app.use('/webhooks/stripe', webhookLimiter, express.raw({ type: 'application/json' }), stripeWebhook)

// Telegram webhook (uses JSON body)
app.use('/webhooks/telegram', webhookLimiter, express.json(), telegramWebhook)

// JSON body parser for all other routes
app.use(express.json({ limit: '10mb' }))

// Health check endpoint (before auth)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  })
})

// Cache-Control middleware for API responses
app.use('/api/v1', (req, res, next) => {
  // Set default no-cache for mutations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Cache-Control', 'no-store')
    return next()
  }

  // Cache static data endpoints
  const cacheDurations: Record<string, number> = {
    '/api/v1/ai/models': 3600,      // 1 hour - AI models rarely change
    '/api/v1/images/models': 3600,  // 1 hour - Image models rarely change
    '/api/v1/voice/voices': 3600,   // 1 hour - Voices rarely change
    '/api/v1/brands': 300,          // 5 minutes - Brands change occasionally
    '/api/v1/users/me': 60,         // 1 minute - User data changes more often
  }

  const matchedPath = Object.keys(cacheDurations).find(path => req.path.startsWith(path.replace('/api/v1', '')))
  if (matchedPath) {
    const maxAge = cacheDurations[matchedPath]
    res.setHeader('Cache-Control', `private, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`)
  } else {
    // Default: short cache for GET requests
    res.setHeader('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')
  }

  next()
})

// Rate limiting for API routes
app.use('/api/v1', apiLimiter)

// Clerk authentication middleware (adds auth object to request)
app.use(clerkAuth)

// API routes
app.use('/api/v1', apiRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not found',
      code: 'NOT_FOUND',
    }
  })
})

// Error handler
app.use(errorHandler)

// Start server
const PORT = parseInt(env.PORT, 10)

app.listen(PORT, () => {
  // Check Redis availability (optional - for job queues)
  const redisStatus = isRedisAvailable() ? 'configured' : 'not configured'

  console.log(`
┌─────────────────────────────────────────┐
│                                         │
│   POSTAIFY Backend Server               │
│                                         │
│   Port:  ${String(PORT).padEnd(10)}               │
│   Env:   ${env.NODE_ENV.padEnd(10)}               │
│   Redis: ${redisStatus.padEnd(10)}               │
│                                         │
│   Ready to accept connections           │
│                                         │
└─────────────────────────────────────────┘
  `)

  // Start the scheduler for Telegram delivery
  startScheduler()
})

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`[Server] ${signal} received, shutting down gracefully...`)

  try {
    // Stop accepting new scheduled jobs
    stopScheduler()
    console.log('[Server] Scheduler stopped')

    // Close queue connections
    await closeQueues()
    console.log('[Server] Queues closed')

    // Close database connection
    await prisma.$disconnect()
    console.log('[Server] Database disconnected')

    console.log('[Server] Graceful shutdown complete')
    process.exit(0)
  } catch (error) {
    console.error('[Server] Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

export default app
