import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma.js'
import { QuotaExceededError, FeatureNotAvailableError } from '../lib/errors.js'
import type { Plan } from '@prisma/client'

// Plan limits configuration
export const PLAN_LIMITS = {
  FREE: {
    maxBrands: 2,
    maxPostsPerMonth: 20,
    hasImageGeneration: false,
    hasVoiceover: false,
    hasVideoRepurpose: false,
  },
  PRO: {
    maxBrands: 5,
    maxPostsPerMonth: 1000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
  },
  BUSINESS: {
    maxBrands: 999,
    maxPostsPerMonth: 90000,
    hasImageGeneration: true,
    hasVoiceover: true,
    hasVideoRepurpose: true,
  },
} as const

export type PlanLimits = typeof PLAN_LIMITS[Plan]

// Get plan limits for a user
export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan]
}

// Check if user can add a brand
export function checkBrandQuota() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not loaded'))
      }

      const limits = getPlanLimits(req.user.plan)
      const brandCount = await prisma.brand.count({
        where: { userId: req.user.id }
      })

      if (brandCount >= limits.maxBrands) {
        throw new QuotaExceededError('Brand', limits.maxBrands)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// Check if user can create a post
export function checkPostQuota() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not loaded'))
      }

      const limits = getPlanLimits(req.user.plan)

      if (req.user.postsThisMonth >= limits.maxPostsPerMonth) {
        throw new QuotaExceededError('Monthly posts', limits.maxPostsPerMonth)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// Check if user has access to a feature
export function checkFeature(feature: 'image' | 'voiceover' | 'videoRepurpose') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not loaded'))
      }

      const limits = getPlanLimits(req.user.plan)

      const featureMap = {
        image: { available: limits.hasImageGeneration, name: 'Image Generation', plan: 'Pro' },
        voiceover: { available: limits.hasVoiceover, name: 'Voiceover', plan: 'Pro' },
        videoRepurpose: { available: limits.hasVideoRepurpose, name: 'Video Repurpose', plan: 'Pro' },
      }

      const featureInfo = featureMap[feature]

      if (!featureInfo.available) {
        throw new FeatureNotAvailableError(featureInfo.name, featureInfo.plan)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
