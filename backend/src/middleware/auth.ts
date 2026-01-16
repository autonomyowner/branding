import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express'
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

// Load user from database middleware
export async function loadUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req)

    if (!auth.userId) {
      throw new UnauthorizedError('Not authenticated')
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId }
    })

    if (!user) {
      throw new UnauthorizedError('User not found in database')
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
