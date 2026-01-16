import { env } from '../config/env.js'

interface GenerationOptions {
  model: string
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  style?: string
  negativePrompt?: string
}

const styleEnhancements: Record<string, string> = {
  'none': '',
  'photorealistic': 'photorealistic, highly detailed, professional photography, 8k resolution',
  'digital-art': 'digital art style, vibrant colors, detailed illustration',
  'illustration': 'illustration style, artistic, clean lines, stylized',
  'cinematic': 'cinematic lighting, dramatic atmosphere, movie still, professional color grading',
  'minimalist': 'minimalist design, clean, simple, elegant, white space',
  'vibrant': 'vibrant colors, bold, eye-catching, high contrast, energetic'
}

function enhancePrompt(prompt: string, style: string): string {
  if (!style || style === 'none') return prompt
  const enhancement = styleEnhancements[style]
  return enhancement ? `${prompt}, ${enhancement}` : prompt
}

function getImageSize(aspectRatio: string): { width: number; height: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 },
    '3:4': { width: 896, height: 1152 }
  }
  return dimensions[aspectRatio] || dimensions['1:1']
}

export async function generateImage(
  prompt: string,
  options: Partial<GenerationOptions> = {}
): Promise<{ url: string; buffer: Buffer; contentType: string }> {
  const apiKey = env.FAL_API_KEY
  if (!apiKey) {
    throw new Error('Fal.ai API key not configured')
  }

  const finalOptions: GenerationOptions = {
    model: options.model || 'fal-ai/flux/schnell',
    aspectRatio: options.aspectRatio || '1:1',
    style: options.style || 'none',
    negativePrompt: options.negativePrompt
  }

  const enhancedPrompt = enhancePrompt(prompt, finalOptions.style || 'none')
  const imageSize = getImageSize(finalOptions.aspectRatio)

  const response = await fetch(`https://fal.run/${finalOptions.model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: enhancedPrompt,
      image_size: imageSize,
      num_images: 1,
      enable_safety_checker: true,
      ...(finalOptions.negativePrompt && { negative_prompt: finalOptions.negativePrompt })
    })
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid Fal.ai API key')
    }
    if (response.status === 402) {
      throw new Error('Insufficient Fal.ai credits')
    }
    const errorText = await response.text().catch(() => '')
    throw new Error(`Failed to generate image: ${errorText || response.statusText}`)
  }

  const result = await response.json() as { images?: Array<{ url: string }> }

  if (!result.images || result.images.length === 0) {
    throw new Error('No image was generated')
  }

  const imageUrl = result.images[0].url

  // Download the image to return as buffer (for R2 upload)
  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    throw new Error('Failed to download generated image')
  }

  // Get the actual content type from the response
  const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

  const arrayBuffer = await imageResponse.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return { url: imageUrl, buffer, contentType }
}

export const AVAILABLE_MODELS = [
  { id: 'fal-ai/flux/schnell', name: 'Flux Schnell', speed: 'fast' },
  { id: 'fal-ai/flux/dev', name: 'Flux Dev', speed: 'slow' },
  { id: 'fal-ai/stable-diffusion-v3-medium', name: 'SD3 Medium', speed: 'medium' }
]

export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Portrait (9:16)' },
  { value: '4:3', label: 'Standard (4:3)' },
  { value: '3:4', label: 'Portrait (3:4)' }
]
