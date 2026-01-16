import { clerkMiddleware, requireAuth, getAuth, clerkClient } from '@clerk/express'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma.js'
import { UnauthorizedError } from '../lib/errors.js'
import type { User } from '@prisma/client'

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

    let user = await prisma.user.findUnique({
      where: { clerkId: auth.userId }
    })

    // Auto-create user if not exists (handles case where webhook hasn't fired yet)
    if (!user) {
      try {
        // Fetch user details from Clerk
        const clerkUser = await clerkClient.users.getUser(auth.userId)

        const email = clerkUser.emailAddresses[0]?.emailAddress
        if (!email) {
          throw new UnauthorizedError('User has no email address')
        }

        // Create user in database
        user = await prisma.user.create({
          data: {
            clerkId: auth.userId,
            email,
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
          }
        })

        console.log(`Auto-created user: ${email}`)
      } catch (createError) {
        console.error('Failed to auto-create user:', createError)
        throw new UnauthorizedError('Failed to create user account')
      }
    }

    // Check and reset monthly usage if needed
    const now = new Date()
    const resetDate = new Date(user.usageResetDate)

    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
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
