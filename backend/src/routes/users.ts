import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuthentication, loadUser } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { PLAN_LIMITS } from '../middleware/quota.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// GET /api/v1/users/me - Get current user profile with usage stats
router.get('/me', async (req, res, next) => {
  try {
    const user = req.user!

    // Get brand count
    const brandCount = await prisma.brand.count({
      where: { userId: user.id }
    })

    // Get post count
    const postCount = await prisma.post.count({
      where: { userId: user.id }
    })

    const limits = PLAN_LIMITS[user.plan]

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      usage: {
        postsThisMonth: user.postsThisMonth,
        postsLimit: limits.maxPostsPerMonth,
        brands: brandCount,
        brandsLimit: limits.maxBrands,
        totalPosts: postCount,
      },
      features: {
        hasImageGeneration: limits.hasImageGeneration,
        hasVoiceover: limits.hasVoiceover,
        hasVideoRepurpose: limits.hasVideoRepurpose,
      },
      createdAt: user.createdAt,
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/v1/users/me - Update current user profile
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

router.patch('/me', validateBody(updateUserSchema), async (req, res, next) => {
  try {
    const user = req.user!
    const { name } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        plan: true,
        createdAt: true,
      },
    })

    res.json(updatedUser)
  } catch (error) {
    next(error)
  }
})

export default router
