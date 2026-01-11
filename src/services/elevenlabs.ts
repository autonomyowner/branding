// ElevenLabs Text-to-Speech Service

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

export interface VoicesResponse {
  voices: Voice[]
}

export interface GenerationSettings {
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

// Fetch available voices from ElevenLabs
export async function getVoices(apiKey: string): Promise<Voice[]> {
  const response = await fetch('https://api.elevenlabs.io/v1/voices', {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your ElevenLabs API key.')
    }
    throw new Error('Failed to fetch voices. Please try again.')
  }

  const data: VoicesResponse = await response.json()
  return data.voices
}

// Generate speech from text
export async function generateSpeech(
  apiKey: string,
  text: string,
  voiceId: string,
  settings: GenerationSettings = DEFAULT_SETTINGS
): Promise<Blob> {
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
      throw new Error('Invalid API key. Please check your ElevenLabs API key.')
    }
    if (response.status === 400) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail?.message || 'Invalid request. Please check your text.')
    }
    if (response.status === 422) {
      throw new Error('Text is too long. Please shorten your script (max 5000 characters).')
    }
    throw new Error('Failed to generate speech. Please try again.')
  }

  return response.blob()
}

// Get user subscription info (for character limits)
export async function getSubscriptionInfo(apiKey: string): Promise<{
  character_count: number
  character_limit: number
}> {
  const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
    method: 'GET',
    headers: {
      'xi-api-key': apiKey
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch subscription info.')
  }

  const data = await response.json()
  return {
    character_count: data.character_count || 0,
    character_limit: data.character_limit || 10000
  }
}

// Download audio blob as MP3 file
export function downloadAudio(blob: Blob, filename: string = 'voiceover.mp3'): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Create audio URL from blob for playback
export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

// Revoke audio URL when done
export function revokeAudioUrl(url: string): void {
  URL.revokeObjectURL(url)
}

// Estimate character count and cost
export function estimateCharacterCount(text: string): number {
  return text.length
}

// Check if text is within limits
export function isWithinLimits(text: string, maxCharacters: number = 5000): boolean {
  return text.length <= maxCharacters
}
