import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuthentication, loadUser } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { checkFeature } from '../middleware/quota.js'
import { generateContentSchema, generateFromVideoSchema } from '../schemas/ai.js'
import { generateContent, generateFromVideo, AVAILABLE_MODELS } from '../services/openrouter.js'
import { NotFoundError, ForbiddenError } from '../lib/errors.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// GET /api/v1/ai/models - Get available AI models
router.get('/models', (req, res) => {
  res.json(AVAILABLE_MODELS)
})

// POST /api/v1/ai/generate - Generate content
router.post('/generate', validateBody(generateContentSchema), async (req, res, next) => {
  try {
    const user = req.user!
    const { brandId, platform, topic, style, model } = req.body

    // Verify brand ownership
    const brand = await prisma.brand.findUnique({ where: { id: brandId } })

    if (!brand) {
      throw new NotFoundError('Brand')
    }

    if (brand.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this brand')
    }

    // Generate content
    const content = await generateContent({
      brand: {
        name: brand.name,
        description: brand.description,
        voice: brand.voice,
        topics: brand.topics,
      },
      platform,
      topic,
      style,
      model,
    })

    res.json({
      content,
      platform,
      model: model || 'anthropic/claude-3-haiku',
      style: style || 'viral',
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/ai/video-to-posts - Generate posts from video transcript
router.post('/video-to-posts', checkFeature('videoRepurpose'), validateBody(generateFromVideoSchema), async (req, res, next) => {
  try {
    const user = req.user!
    const { brandId, platform, transcript, videoTitle, numberOfPosts, style, model } = req.body

    // Verify brand ownership
    const brand = await prisma.brand.findUnique({ where: { id: brandId } })

    if (!brand) {
      throw new NotFoundError('Brand')
    }

    if (brand.userId !== user.id) {
      throw new ForbiddenError('You do not have access to this brand')
    }

    // Generate posts from video
    const posts = await generateFromVideo({
      brand: {
        name: brand.name,
        description: brand.description,
        voice: brand.voice,
        topics: brand.topics,
      },
      platform,
      transcript,
      videoTitle,
      numberOfPosts,
      style,
      model,
    })

    res.json({
      posts,
      count: posts.length,
      platform,
      model: model || 'anthropic/claude-3.5-sonnet',
    })
  } catch (error) {
    next(error)
  }
})

export default router
