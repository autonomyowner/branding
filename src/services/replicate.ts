// Fal.ai Text-to-Image Service (supports browser requests)

export interface ImageModel {
  id: string
  name: string
  description: string
  speed: 'fast' | 'medium' | 'slow'
  quality: 'good' | 'great' | 'excellent'
  costPerImage: number
}

export interface GenerationOptions {
  model: string
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  style?: string
  negativePrompt?: string
}

// Available models on fal.ai
export const AVAILABLE_MODELS: ImageModel[] = [
  {
    id: 'fal-ai/flux/schnell',
    name: 'Flux Schnell',
    description: 'Fast generation, good quality',
    speed: 'fast',
    quality: 'good',
    costPerImage: 0.003
  },
  {
    id: 'fal-ai/flux/dev',
    name: 'Flux Dev',
    description: 'Best quality, slower generation',
    speed: 'slow',
    quality: 'excellent',
    costPerImage: 0.025
  },
  {
    id: 'fal-ai/stable-diffusion-v3-medium',
    name: 'SD3 Medium',
    description: 'Balanced speed and quality',
    speed: 'medium',
    quality: 'great',
    costPerImage: 0.035
  }
]

// Style presets for prompt enhancement
export const IMAGE_STYLES = [
  { value: 'none', label: 'None (use prompt as-is)' },
  { value: 'photorealistic', label: 'Photorealistic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'vibrant', label: 'Vibrant & Colorful' }
] as const

// Aspect ratio options for social media
export const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)', description: 'Instagram, Facebook' },
  { value: '16:9', label: 'Landscape (16:9)', description: 'YouTube, Twitter' },
  { value: '9:16', label: 'Portrait (9:16)', description: 'TikTok, Reels, Stories' },
  { value: '4:3', label: 'Standard (4:3)', description: 'General use' },
  { value: '3:4', label: 'Portrait (3:4)', description: 'Pinterest' }
] as const

const DEFAULT_OPTIONS: GenerationOptions = {
  model: 'fal-ai/flux/schnell',
  aspectRatio: '1:1',
  style: 'none'
}

// Enhance prompt with style
function enhancePrompt(prompt: string, style: string): string {
  if (style === 'none') return prompt

  const styleEnhancements: Record<string, string> = {
    'photorealistic': 'photorealistic, highly detailed, professional photography, 8k resolution',
    'digital-art': 'digital art style, vibrant colors, detailed illustration',
    'illustration': 'illustration style, artistic, clean lines, stylized',
    'cinematic': 'cinematic lighting, dramatic atmosphere, movie still, professional color grading',
    'minimalist': 'minimalist design, clean, simple, elegant, white space',
    'vibrant': 'vibrant colors, bold, eye-catching, high contrast, energetic'
  }

  return `${prompt}, ${styleEnhancements[style] || ''}`
}

// Get dimensions from aspect ratio
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

// Main function: Generate image using fal.ai
export async function generateImage(
  apiKey: string,
  prompt: string,
  options: Partial<GenerationOptions> = {}
): Promise<string> {
  const finalOptions: GenerationOptions = { ...DEFAULT_OPTIONS, ...options }
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
      throw new Error('Invalid API key. Please check your fal.ai API key.')
    }
    if (response.status === 402) {
      throw new Error('Insufficient credits. Please add credits to your fal.ai account.')
    }
    if (response.status === 422) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Invalid request. Please check your prompt.')
    }
    const errorText = await response.text().catch(() => '')
    throw new Error(`Failed to generate image: ${errorText || response.statusText}`)
  }

  const result = await response.json()

  // fal.ai returns images array with url property
  if (!result.images || result.images.length === 0) {
    throw new Error('No image was generated. Please try again.')
  }

  return result.images[0].url
}

// Validate API key by making a test request
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // Just check if we can authenticate
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: 'test',
        image_size: { width: 256, height: 256 },
        num_images: 1
      })
    })
    // 401 = bad key, anything else means key is valid
    return response.status !== 401
  } catch {
    return false
  }
}

// Download image from URL
export async function downloadImage(imageUrl: string, filename: string = 'generated-image.png'): Promise<void> {
  const response = await fetch(imageUrl)
  const blob = await response.blob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Get model by ID
export function getModelById(modelId: string): ImageModel | undefined {
  return AVAILABLE_MODELS.find(m => m.id === modelId)
}

// Estimate cost for generation
export function estimateCost(modelId: string, count: number = 1): number {
  const model = getModelById(modelId)
  return model ? model.costPerImage * count : 0
}
