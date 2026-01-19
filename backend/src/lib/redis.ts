// Redis connection configuration for job queues
// BullMQ handles its own Redis connections, we just need to provide the URL

let isRedisConfigured = false

export function getRedisUrl(): string | null {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    if (!isRedisConfigured) {
      console.log('[Redis] No REDIS_URL configured - running in degraded mode without job queues')
      isRedisConfigured = true
    }
    return null
  }

  return redisUrl
}

export function isRedisAvailable(): boolean {
  return !!process.env.REDIS_URL
}
