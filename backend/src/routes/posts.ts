import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuthentication, loadUser } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { checkPostQuota } from '../middleware/quota.js'
import { createPostSchema, updatePostSchema } from '../schemas/post.js'
import { NotFoundError, ForbiddenError } from '../lib/errors.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// GET /api/v1/posts - List user's posts
router.get('/', async (req, res, next) => {
  try {
    const user = req.user!
    const brandId = req.query.brandId as string | undefined
    const status = req.query.status as string | undefined
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50))
    const offset = Math.max(0, parseInt(req.query.offset as string) || 0)

    const where = {
      userId: user.id,
      ...(brandId && { brandId }),
      ...(status && { status: status as any }),
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              color: true,
              initials: true,
            }
          }
        }
      }),
      prisma.post.count({ where })
    ])

    res.json({
      posts: posts.map(post => ({
        id: post.id,
        content: post.content,
        platform: post.platform,
        imageUrl: post.imageUrl,
        voiceUrl: post.voiceUrl,
        status: post.status,
        scheduledFor: post.scheduledFor,
        publishedAt: post.publishedAt,
        aiGenerated: post.aiGenerated,
        aiModel: post.aiModel,
        brand: post.brand,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
      total,
      limit,
      offset,
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/posts - Create a new post
router.post('/', checkPostQuota(), validateBody(createPostSchema), async (req, res, next) => {
  try {
    const user = req.user!
    const { content, platform, brandId, imageUrl, voiceUrl, status, scheduledFor, aiGenerated, aiModel } = req.body

    // Verify brand ownership
    const brand = await prisma.brand.findUnique({ where: { id: brandId } })

    if (!brand) {
      throw new NotFoundError('Brand')
    }

    if (brand.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this brand')
    }

    // Create post and increment usage in transaction
    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          content,
          platform,
          imageUrl,
          voiceUrl,
          status: status || 'DRAFT',
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          aiGenerated: aiGenerated || false,
          aiModel,
          userId: user.id,
          brandId,
        },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              color: true,
              initials: true,
            }
          }
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { postsThisMonth: { increment: 1 } }
      })
    ])

    res.status(201).json({
      id: post.id,
      content: post.content,
      platform: post.platform,
      imageUrl: post.imageUrl,
      voiceUrl: post.voiceUrl,
      status: post.status,
      scheduledFor: post.scheduledFor,
      publishedAt: post.publishedAt,
      aiGenerated: post.aiGenerated,
      aiModel: post.aiModel,
      brand: post.brand,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/posts/:id - Get a specific post
router.get('/:id', async (req, res, next) => {
  try {
    const user = req.user!
    const id = req.params.id as string

    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      throw new NotFoundError('Post')
    }

    if (post.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this post')
    }

    const brand = await prisma.brand.findUnique({
      where: { id: post.brandId },
      select: { id: true, name: true, color: true, initials: true }
    })

    res.json({
      id: post.id,
      content: post.content,
      platform: post.platform,
      imageUrl: post.imageUrl,
      voiceUrl: post.voiceUrl,
      status: post.status,
      scheduledFor: post.scheduledFor,
      publishedAt: post.publishedAt,
      aiGenerated: post.aiGenerated,
      aiModel: post.aiModel,
      brand,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/v1/posts/:id - Update a post
router.patch('/:id', validateBody(updatePostSchema), async (req, res, next) => {
  try {
    const user = req.user!
    const id = req.params.id as string

    // Check ownership
    const existing = await prisma.post.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Post')
    }

    if (existing.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this post')
    }

    const updateData: any = { ...req.body }
    if (updateData.scheduledFor !== undefined) {
      updateData.scheduledFor = updateData.scheduledFor ? new Date(updateData.scheduledFor) : null
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    })

    // Get brand info separately
    const brand = await prisma.brand.findUnique({
      where: { id: post.brandId },
      select: { id: true, name: true, color: true, initials: true }
    })

    res.json({
      id: post.id,
      content: post.content,
      platform: post.platform,
      imageUrl: post.imageUrl,
      voiceUrl: post.voiceUrl,
      status: post.status,
      scheduledFor: post.scheduledFor,
      publishedAt: post.publishedAt,
      aiGenerated: post.aiGenerated,
      aiModel: post.aiModel,
      brand,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/v1/posts/:id - Delete a post
router.delete('/:id', async (req, res, next) => {
  try {
    const user = req.user!
    const id = req.params.id as string

    // Check ownership
    const existing = await prisma.post.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError('Post')
    }

    if (existing.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this post')
    }

    await prisma.post.delete({ where: { id } })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export default router
