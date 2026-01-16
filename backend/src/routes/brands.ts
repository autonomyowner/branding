import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuthentication, loadUser, getAuthenticatedUser } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { checkBrandQuota } from '../middleware/quota.js'
import { createBrandSchema, updateBrandSchema } from '../schemas/brand.js'
import { NotFoundError, ForbiddenError } from '../lib/errors.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// GET /api/v1/brands - List user's brands
router.get('/', async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req)

    const brands = await prisma.brand.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    res.json(brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      color: brand.color,
      initials: brand.initials,
      voice: brand.voice,
      topics: brand.topics,
      postCount: brand._count.posts,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    })))
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/brands - Create a new brand
router.post('/', checkBrandQuota(), validateBody(createBrandSchema), async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req)
    const { name, description, color, initials, voice, topics } = req.body

    // Generate initials from name if not provided
    const brandInitials = initials || name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const brand = await prisma.brand.create({
      data: {
        name,
        description,
        color: color || '#8b5cf6',
        initials: brandInitials,
        voice: voice || 'professional',
        topics: topics || [],
        userId: user.id,
      },
    })

    res.status(201).json({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      color: brand.color,
      initials: brand.initials,
      voice: brand.voice,
      topics: brand.topics,
      postCount: 0,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/brands/:id - Get a specific brand
router.get('/:id', async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req)
    const id = req.params.id as string

    const brand = await prisma.brand.findUnique({
      where: { id },
    })

    if (!brand) {
      throw new NotFoundError('Brand')
    }

    if (brand.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this brand')
    }

    const postCount = await prisma.post.count({ where: { brandId: id } })

    res.json({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      color: brand.color,
      initials: brand.initials,
      voice: brand.voice,
      topics: brand.topics,
      postCount,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/v1/brands/:id - Update a brand
router.patch('/:id', validateBody(updateBrandSchema), async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req)
    const id = req.params.id as string

    // Check ownership
    const existing = await prisma.brand.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Brand')
    }

    if (existing.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this brand')
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: req.body,
    })

    // Get post count separately
    const postCount = await prisma.post.count({ where: { brandId: id } })

    res.json({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      color: brand.color,
      initials: brand.initials,
      voice: brand.voice,
      topics: brand.topics,
      postCount,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/v1/brands/:id - Delete a brand
router.delete('/:id', async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req)
    const id = req.params.id as string

    // Check ownership
    const existing = await prisma.brand.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Brand')
    }

    if (existing.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this brand')
    }

    await prisma.brand.delete({ where: { id } })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default router
