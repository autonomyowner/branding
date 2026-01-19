import { Router } from 'express'
import { Webhook } from 'svix'
import { prisma } from '../../lib/prisma.js'
import { env } from '../../config/env.js'

const router = Router()

interface ClerkUserData {
  id: string
  email_addresses: Array<{ email_address: string; id: string }>
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

interface ClerkWebhookEvent {
  type: string
  data: ClerkUserData
}

// Clerk webhook endpoint
router.post('/', async (req, res) => {
  try {
    const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET

    // Get the headers
    const svixId = req.headers['svix-id'] as string
    const svixTimestamp = req.headers['svix-timestamp'] as string
    const svixSignature = req.headers['svix-signature'] as string

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: 'Missing svix headers' })
    }

    // Verify the webhook
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: ClerkWebhookEvent

    try {
      // Get raw body - Express should have it as buffer when using express.raw()
      const payload = req.body
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent
    } catch (err) {
      console.error('Webhook verification failed:', err)
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }

    const eventType = evt.type
    const userData = evt.data

    // Handle different event types
    switch (eventType) {
      case 'user.created': {
        const email = userData.email_addresses[0]?.email_address
        if (!email) {
          console.error('No email in user.created event')
          return res.status(400).json({ error: 'No email provided' })
        }

        const name = [userData.first_name, userData.last_name]
          .filter(Boolean)
          .join(' ') || null

        // Upsert to handle SSO linking - if email exists, update clerkId
        await prisma.user.upsert({
          where: { email },
          update: {
            clerkId: userData.id,
            name,
            avatarUrl: userData.image_url,
          },
          create: {
            clerkId: userData.id,
            email,
            name,
            avatarUrl: userData.image_url,
            plan: 'FREE',
            postsThisMonth: 0,
            usageResetDate: new Date(),
          },
        })

        console.log(`User synced: ${email}`)
        break
      }

      case 'user.updated': {
        const email = userData.email_addresses[0]?.email_address
        const name = [userData.first_name, userData.last_name]
          .filter(Boolean)
          .join(' ') || null

        await prisma.user.update({
          where: { clerkId: userData.id },
          data: {
            email,
            name,
            avatarUrl: userData.image_url,
          },
        })

        console.log(`User updated: ${email}`)
        break
      }

      case 'user.deleted': {
        await prisma.user.delete({
          where: { clerkId: userData.id },
        })

        console.log(`User deleted: ${userData.id}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

export default router
