import { Router } from 'express'
import { requireAuthentication, loadUser } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { checkFeature } from '../middleware/quota.js'
import { generateVoiceoverSchema } from '../schemas/ai.js'
import { getVoices, generateSpeech, optimizeForVoiceover } from '../services/elevenlabs.js'
import { uploadAudio } from '../services/storage.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// GET /api/v1/voice/voices - Get available voices
router.get('/voices', async (req, res, next) => {
  try {
    const voices = await getVoices()

    res.json(voices.map(voice => ({
      id: voice.voice_id,
      name: voice.name,
      previewUrl: voice.preview_url,
      category: voice.category,
      labels: voice.labels,
    })))
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/voice/generate - Generate voiceover
router.post('/generate', checkFeature('voiceover'), validateBody(generateVoiceoverSchema), async (req, res, next) => {
  try {
    const { text, voiceId, style } = req.body

    // Optimize text for voiceover
    const optimizedText = await optimizeForVoiceover(text, style || 'conversational')

    // Generate speech
    const audioBuffer = await generateSpeech(optimizedText, voiceId)

    // Upload to R2
    const audioUrl = await uploadAudio(audioBuffer)

    res.json({
      url: audioUrl,
      text: optimizedText,
      voiceId,
      style: style || 'conversational',
    })
  } catch (error) {
    next(error)
  }
})

export default router
