import { Router } from 'express'
import Stripe from 'stripe'
import { stripe, getPlanFromPriceId, isStripeConfigured } from '../../services/stripe.js'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../config/env.js'

const router = Router()

// Stripe webhook endpoint
router.post('/', async (req, res) => {
  try {
    if (!isStripeConfigured() || !stripe) {
      return res.status(501).json({ error: 'Stripe not configured' })
    }

    const sig = req.headers['stripe-signature'] as string

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.customer && session.subscription) {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0]?.price.id

          if (priceId) {
            const plan = getPlanFromPriceId(priceId)

            // Find user by Stripe customer ID or email
            const user = await prisma.user.findFirst({
              where: {
                OR: [
                  { stripeCustomerId: customerId },
                  { email: session.customer_email || undefined }
                ]
              }
            })

            if (user) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  plan,
                  stripeCustomerId: customerId,
                },
              })

              console.log(`User ${user.email} upgraded to ${plan}`)
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id

        if (priceId) {
          const plan = getPlanFromPriceId(priceId)

          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan },
          })

          console.log(`Subscription updated for customer ${customerId}: ${plan}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade to free plan
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: 'FREE' },
        })

        console.log(`Subscription cancelled for customer ${customerId}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Could send email notification here
        console.log(`Payment failed for customer ${customerId}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
