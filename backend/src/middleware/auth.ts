import { clerkMiddleware, requireAuth, getAuth, createClerkClient } from '@clerk/express'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma.js'
import { UnauthorizedError } from '../lib/errors.js'
import { env } from '../config/env.js'
import type { User } from '@prisma/client'

/**
 * Get the authenticated user from the request.
 * Should only be called after loadUser middleware has run.
 * Throws UnauthorizedError if user is not set.
 */
export function getAuthenticatedUser(req: Request): User {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated')
  }
  return req.user
}

// Initialize Clerk client with secret key
const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

// Base Clerk middleware - adds auth object to request
export const clerkAuth = clerkMiddleware()

// Require authentication middleware
export const requireAuthentication = requireAuth()

// Load user from database middleware - auto-creates user if not exists
export async function loadUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req)

    if (!auth.userId) {
      throw new UnauthorizedError('Not authenticated')
    }

    console.log(`[AUTH] Looking up user with clerkId: ${auth.userId}`)

    let user = await prisma.user.findUnique({
      where: { clerkId: auth.userId }
    })

    // Auto-create user if not exists (handles case where webhook hasn't fired yet)
    if (!user) {
      console.log(`[AUTH] User not found by clerkId: ${auth.userId}, creating new user...`)
      try {
        // Fetch user details from Clerk
        const clerkUser = await clerkClient.users.getUser(auth.userId)

        const email = clerkUser.emailAddresses[0]?.emailAddress
        if (!email) {
          throw new UnauthorizedError('User has no email address')
        }

        console.log(`[AUTH] Clerk user email: ${email}, clerkId: ${auth.userId}`)

        // IMPORTANT: Always create a NEW user for each Clerk ID
        // Do NOT merge by email - each Clerk account should have its own data
        // Generate a unique email if needed to avoid conflicts
        let uniqueEmail = email
        const existingByEmail = await prisma.user.findUnique({
          where: { email }
        })

        if (existingByEmail && existingByEmail.clerkId !== auth.userId) {
          // Different Clerk user with same email exists - make email unique
          // This can happen if someone creates multiple Clerk accounts with same email
          uniqueEmail = `${auth.userId}@postaify.user`
          console.log(`[AUTH] Email ${email} already used by different clerkId ${existingByEmail.clerkId}, using unique email: ${uniqueEmail}`)
        }

        // Create new user with this clerkId
        user = await prisma.user.create({
          data: {
            clerkId: auth.userId,
            email: uniqueEmail,
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
          }
        })
        console.log(`[AUTH] Created new user: ${uniqueEmail}, dbId: ${user.id}, clerkId: ${auth.userId}`)
      } catch (createError: any) {
        // Handle unique constraint violation (race condition)
        if (createError.code === 'P2002') {
          // Try to find the user again - might have been created by another request
          user = await prisma.user.findUnique({
            where: { clerkId: auth.userId }
          })
          if (user) {
            console.log(`[AUTH] Found user after race condition: ${user.email}, dbId: ${user.id}`)
          } else {
            console.error('[AUTH] Failed to sync user after race condition:', createError)
            throw new UnauthorizedError('Failed to create user account')
          }
        } else {
          console.error('[AUTH] Failed to sync user:', createError)
          throw new UnauthorizedError('Failed to create user account')
        }
      }
    } else {
      console.log(`[AUTH] Found user by clerkId: ${user.email}, dbId: ${user.id}`)
    }

    // Check and reset monthly usage if needed (using UTC for consistency across timezones)
    const now = new Date()
    const resetDate = new Date(user.usageResetDate)

    // Compare using UTC to ensure consistent behavior regardless of server timezone
    const nowMonth = now.getUTCMonth()
    const nowYear = now.getUTCFullYear()
    const resetMonth = resetDate.getUTCMonth()
    const resetYear = resetDate.getUTCFullYear()

    if (nowMonth !== resetMonth || nowYear !== resetYear) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          postsThisMonth: 0,
          usageResetDate: now
        }
      })
      req.user = updatedUser
    } else {
      req.user = user
    }

    next()
  } catch (error) {
    next(error)
  }
}
