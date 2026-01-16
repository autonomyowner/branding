import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuthentication, loadUser, getAuthenticatedUser } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { PLAN_LIMITS } from '../middleware/quota.js'
import { createCheckoutSession, createPortalSession, getOrCreateCustomer, getActiveSubscription, isStripeConfigured } from '../services/stripe.js'
import { env } from '../config/env.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// GET /api/v1/subscriptions/current - Get current subscription
router.get('/current', async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req)
    const limits = PLAN_LIMITS[user.plan]

    let subscription = null
    if (user.stripeCustomerId) {
      subscription = await getActiveSubscription(user.stripeCustomerId)
    }

    res.json({
      plan: user.plan,
      limits,
      stripeCustomerId: user.stripeCustomerId,
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      } : null,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/subscriptions/checkout - Create Stripe checkout session
const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'BUSINESS']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

router.post('/checkout', validateBody(checkoutSchema), async (req, res, next) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(501).json({
        error: {
          message: 'Payments are not configured',
          code: 'STRIPE_NOT_CONFIGURED',
        }
      })
    }

    const user = getAuthenticatedUser(req)
    const { plan, successUrl, cancelUrl } = req.body

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      customerId = await getOrCreateCustomer(user.email, user.name)

      // Save customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    // Create checkout session
    const checkoutUrl = await createCheckoutSession(
      customerId,
      user.email,
      plan,
      successUrl || `${env.FRONTEND_URL}/dashboard?success=true`,
      cancelUrl || `${env.FRONTEND_URL}/pricing?cancelled=true`
    )

    res.json({ url: checkoutUrl })
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/subscriptions/portal - Create billing portal session
router.post('/portal', async (req, res, next) => {
  try {
    if (!isStripeConfigured()) {
      return res.status(501).json({
        error: {
          message: 'Payments are not configured',
          code: 'STRIPE_NOT_CONFIGURED',
        }
      })
    }

    const user = getAuthenticatedUser(req)

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        error: {
          message: 'No active subscription',
          code: 'NO_SUBSCRIPTION',
        }
      })
    }

    const returnUrl = (req.body.returnUrl as string) || `${env.FRONTEND_URL}/dashboard`
    const portalUrl = await createPortalSession(user.stripeCustomerId, returnUrl)

    res.json({ url: portalUrl })
  } catch (error) {
    next(error)
  }
})

export default router
