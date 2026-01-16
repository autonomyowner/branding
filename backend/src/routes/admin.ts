import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuthentication, loadUser, getAuthenticatedUser } from '../middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// Simple admin check - you can enhance this with a role-based system
// For now, checking against specific admin emails
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean)

const requireAdmin = (req: any, res: any, next: any) => {
  const user = getAuthenticatedUser(req)

  if (!ADMIN_EMAILS.includes(user.email)) {
    return res.status(403).json({ error: { message: 'Access denied. Admin only.' } })
  }

  next()
}

router.use(requireAdmin)

// GET /api/v1/admin/stats - Get overall statistics
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      freeUsers,
      proUsers,
      businessUsers,
      totalPosts,
      totalBrands,
      totalEmailCaptures,
      emailCapturesWithConsent,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: 'FREE' } }),
      prisma.user.count({ where: { plan: 'PRO' } }),
      prisma.user.count({ where: { plan: 'BUSINESS' } }),
      prisma.post.count(),
      prisma.brand.count(),
      prisma.emailCapture.count(),
      prisma.emailCapture.count({ where: { marketingConsent: true } }),
    ])

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentSignups = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    })

    // Get recent email captures (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentEmailCaptures = await prisma.emailCapture.count({
      where: { capturedAt: { gte: sevenDaysAgo } },
    })

    res.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        pro: proUsers,
        business: businessUsers,
        recentSignups,
      },
      content: {
        totalPosts,
        totalBrands,
      },
      emailCaptures: {
        total: totalEmailCaptures,
        withConsent: emailCapturesWithConsent,
        consentRate: totalEmailCaptures > 0
          ? Math.round((emailCapturesWithConsent / totalEmailCaptures) * 100)
          : 0,
        recentCaptures: recentEmailCaptures,
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/admin/users - Get all users with usage stats
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const skip = (page - 1) * limit

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              brands: true,
              posts: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ])

    const usersWithStats = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      postsThisMonth: user.postsThisMonth,
      brandsCount: user._count.brands,
      postsCount: user._count.posts,
      stripeCustomerId: user.stripeCustomerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    res.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/admin/email-captures - Get all email captures
router.get('/email-captures', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const skip = (page - 1) * limit

    const [captures, totalCount] = await Promise.all([
      prisma.emailCapture.findMany({
        skip,
        take: limit,
        orderBy: { capturedAt: 'desc' },
      }),
      prisma.emailCapture.count(),
    ])

    res.json({
      captures,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/admin/recent-activity - Get recent activity
router.get('/recent-activity', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20

    const [recentUsers, recentPosts, recentCaptures] = await Promise.all([
      prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          plan: true,
          createdAt: true,
        },
      }),
      prisma.post.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          platform: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.emailCapture.findMany({
        take: limit,
        orderBy: { capturedAt: 'desc' },
        select: {
          id: true,
          email: true,
          planInterest: true,
          marketingConsent: true,
          capturedAt: true,
        },
      }),
    ])

    res.json({
      recentUsers,
      recentPosts,
      recentCaptures,
    })
  } catch (error) {
    next(error)
  }
})

export default router
