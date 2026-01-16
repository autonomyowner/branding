import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { validateBody } from '../middleware/validate.js'

const router = Router()

// POST /api/v1/emails/capture - Capture email (no auth required)
const captureEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  marketingConsent: z.boolean().optional().default(false),
  source: z.string().optional().default('pricing_modal'),
  planInterest: z.string().optional(),
})

router.post('/capture', validateBody(captureEmailSchema), async (req, res, next) => {
  try {
    const { email, marketingConsent, source, planInterest } = req.body

    // Check if email already exists in captures
    const existingCapture = await prisma.emailCapture.findFirst({
      where: { email },
      orderBy: { capturedAt: 'desc' },
    })

    // If email was captured recently (within 24 hours), update it instead of creating new
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    if (existingCapture && existingCapture.capturedAt > oneDayAgo) {
      const updated = await prisma.emailCapture.update({
        where: { id: existingCapture.id },
        data: {
          marketingConsent,
          source,
          planInterest,
          capturedAt: new Date(), // Update timestamp
        },
      })

      return res.json({
        success: true,
        capture: updated,
        message: 'Email capture updated',
      })
    }

    // Create new capture
    const capture = await prisma.emailCapture.create({
      data: {
        email,
        marketingConsent,
        source,
        planInterest,
      },
    })

    res.status(201).json({
      success: true,
      capture,
      message: 'Email captured successfully',
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/emails/captures - Get all captured emails (admin only - future)
// For now, you can add this later if you want an admin dashboard

export default router
