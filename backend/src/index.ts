import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { clerkAuth } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import apiRoutes from './routes/index.js'
import clerkWebhook from './routes/webhooks/clerk.js'
import stripeWebhook from './routes/webhooks/stripe.js'

const app = express()

// Security middleware
app.use(helmet())

// CORS - allow frontend origin (both www and non-www variants)
const frontendOrigin = env.FRONTEND_URL.replace(/\/$/, '')
const allowedOrigins = [
  frontendOrigin,
  frontendOrigin.replace('https://', 'https://www.'),
  frontendOrigin.replace('https://www.', 'https://'),
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
app.use('/webhooks/clerk', express.raw({ type: 'application/json' }), clerkWebhook)
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

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
  console.log(`
┌─────────────────────────────────────────┐
│                                         │
│   T21 Backend Server                    │
│                                         │
│   Port: ${PORT}                           │
│   Env:  ${env.NODE_ENV.padEnd(11)}               │
│                                         │
│   Ready to accept connections           │
│                                         │
└─────────────────────────────────────────┘
  `)
})

export default app
