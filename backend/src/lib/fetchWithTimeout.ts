/**
 * Fetch with timeout support
 * Prevents hanging requests from blocking the event loop
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number // in milliseconds
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(`Request to ${url} timed out after ${timeout}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// Default timeouts for different service types
export const TIMEOUTS = {
  AI_GENERATION: 60000,      // 60 seconds for AI text generation
  IMAGE_GENERATION: 120000,  // 2 minutes for image generation
  VOICE_GENERATION: 60000,   // 60 seconds for voice generation
  TELEGRAM_API: 10000,       // 10 seconds for Telegram
  STRIPE_API: 30000,         // 30 seconds for Stripe
  DEFAULT: 30000,            // 30 seconds default
} as const
