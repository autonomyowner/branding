import { Router } from 'express'
import { requireAuthentication, loadUser } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { checkFeature } from '../middleware/quota.js'
import { generateImageSchema } from '../schemas/ai.js'
import { generateImage, AVAILABLE_MODELS, ASPECT_RATIOS } from '../services/fal.js'
import { uploadImage } from '../services/storage.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// GET /api/v1/images/models - Get available image models
router.get('/models', (req, res) => {
  res.json(AVAILABLE_MODELS)
})

// GET /api/v1/images/aspect-ratios - Get available aspect ratios
router.get('/aspect-ratios', (req, res) => {
  res.json(ASPECT_RATIOS)
})

// POST /api/v1/images/generate - Generate image
router.post('/generate', checkFeature('image'), validateBody(generateImageSchema), async (req, res, next) => {
  try {
    const { prompt, model, aspectRatio, style } = req.body

    // Generate image
    const { buffer } = await generateImage(prompt, {
      model,
      aspectRatio,
      style,
    })

    // Upload to R2
    const imageUrl = await uploadImage(buffer)

    res.json({
      url: imageUrl,
      prompt,
      model: model || 'fal-ai/flux/schnell',
      aspectRatio: aspectRatio || '1:1',
      style: style || 'none',
    })
  } catch (error) {
    next(error)
  }
})

export default router
