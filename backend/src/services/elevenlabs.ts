import { env } from '../config/env.js'

export interface Voice {
  voice_id: string
  name: string
  preview_url: string
  category: string
  labels: {
    accent?: string
    age?: string
    gender?: string
    description?: string
    use_case?: string
  }
}

interface VoicesResponse {
  voices: Voice[]
}

interface GenerationSettings {
  stability: number
  similarity_boost: number
  style?: number
  use_speaker_boost?: boolean
}

const DEFAULT_SETTINGS: GenerationSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.5,
  use_speaker_boost: true
}

export async function getVoices(): Promise<Voice[]> {
  const apiKey = env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid ElevenLabs API key')
    }
    throw new Error('Failed to fetch voices')
  }

  const data = await response.json() as VoicesResponse
  return data.voices
}

export async function generateSpeech(
  text: string,
  voiceId: string,
  settings: GenerationSettings = DEFAULT_SETTINGS
): Promise<Buffer> {
  const apiKey = env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
          style: settings.style,
          use_speaker_boost: settings.use_speaker_boost
        }
      })
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid ElevenLabs API key')
    }
    if (response.status === 422) {
      throw new Error('Text is too long. Max 5000 characters.')
    }
    throw new Error('Failed to generate speech')
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Optimize text for voiceover
export async function optimizeForVoiceover(
  text: string,
  style: 'conversational' | 'professional' | 'energetic' | 'calm'
): Promise<string> {
  // Import OpenRouter service for script optimization
  const { env: envConfig } = await import('../config/env.js')

  const styleInstructions: Record<string, string> = {
    conversational: "Natural, like talking to a friend. Casual pacing with natural pauses.",
    professional: "Clear, authoritative, and polished. Suitable for business content.",
    energetic: "Upbeat, enthusiastic, and dynamic. Great for motivational content.",
    calm: "Soothing, measured, and relaxed. Perfect for educational or meditative content."
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${envConfig.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'system',
          content: `Transform text into a voiceover script optimized for TTS.

Style: ${styleInstructions[style]}

Rules:
1. Remove hashtags, @mentions, emojis, URLs
2. Use proper punctuation for pacing
3. Break long sentences
4. Write numbers as words when appropriate
5. Keep it concise (30 seconds to 2 minutes)

Output ONLY the voiceover script.`
        },
        {
          role: 'user',
          content: `Transform this into a ${style} voiceover script:\n\n${text}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    // Return original text if optimization fails
    return text
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content || text
}
