import Stripe from 'stripe'
import { env } from '../config/env.js'
import type { Plan } from '@prisma/client'

// Stripe is optional - only initialize if configured
export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null

export function isStripeConfigured(): boolean {
  return !!stripe
}

// Map plans to Stripe price IDs (only if configured)
export const PLAN_PRICES: Record<Exclude<Plan, 'FREE'>, string | undefined> = {
  PRO: env.STRIPE_PRICE_PRO,
  BUSINESS: env.STRIPE_PRICE_BUSINESS,
}

// Map Stripe price IDs to plans
export function getPlanFromPriceId(priceId: string): Plan {
  if (priceId === env.STRIPE_PRICE_PRO) return 'PRO'
  if (priceId === env.STRIPE_PRICE_BUSINESS) return 'BUSINESS'
  return 'FREE'
}

// Create a checkout session for subscription
export async function createCheckoutSession(
  customerId: string | null,
  email: string,
  plan: 'PRO' | 'BUSINESS',
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const priceId = PLAN_PRICES[plan]
  if (!priceId) {
    throw new Error(`Price not configured for plan: ${plan}`)
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  }

  // Use existing customer or create new
  if (customerId) {
    sessionParams.customer = customerId
  } else {
    sessionParams.customer_email = email
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  if (!session.url) {
    throw new Error('Failed to create checkout session')
  }

  return session.url
}

// Create a billing portal session
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

// Get customer's active subscription
export async function getActiveSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    return null
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  })

  return subscriptions.data[0] || null
}

// Get or create a Stripe customer
export async function getOrCreateCustomer(
  email: string,
  name?: string | null
): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
  })

  return customer.id
}
