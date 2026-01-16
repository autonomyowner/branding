// Frontend environment variable validation
// Validates that required env vars are present and properly formatted

interface EnvConfig {
  VITE_API_URL: string
  VITE_CLERK_PUBLISHABLE_KEY: string
}

function validateEnv(): EnvConfig {
  const apiUrl = import.meta.env.VITE_API_URL
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  const errors: string[] = []

  // Validate API URL
  if (!apiUrl) {
    console.warn('VITE_API_URL not set, defaulting to http://localhost:3001')
  } else if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    errors.push('VITE_API_URL must be a valid URL starting with http:// or https://')
  }

  // Validate Clerk publishable key
  if (!clerkKey) {
    errors.push('VITE_CLERK_PUBLISHABLE_KEY is required')
  } else if (!clerkKey.startsWith('pk_')) {
    errors.push('VITE_CLERK_PUBLISHABLE_KEY must start with "pk_"')
  }

  // Log errors in development, throw in production
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`
    if (import.meta.env.PROD) {
      throw new Error(errorMessage)
    } else {
      console.error(errorMessage)
    }
  }

  return {
    VITE_API_URL: apiUrl || 'http://localhost:3001',
    VITE_CLERK_PUBLISHABLE_KEY: clerkKey || '',
  }
}

export const env = validateEnv()
