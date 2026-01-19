import { Queue, Worker, Job } from 'bullmq'
import { getRedisUrl, isRedisAvailable } from './redis.js'

// Queue names
export const QUEUE_NAMES = {
  AI_GENERATION: 'ai-generation',
  IMAGE_GENERATION: 'image-generation',
  TELEGRAM_DELIVERY: 'telegram-delivery',
} as const

type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES]

// Queue instances (lazily initialized)
const queues: Map<string, Queue> = new Map()
const workers: Map<string, Worker> = new Map()

// Get Redis connection config for BullMQ
function getConnectionConfig(): { host: string; port: number; password?: string; username?: string } | null {
  const redisUrl = getRedisUrl()
  if (!redisUrl) return null

  // Parse Redis URL for BullMQ connection
  try {
    const url = new URL(redisUrl)
    return {
      host: url.hostname || 'localhost',
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      username: url.username || undefined,
    }
  } catch {
    // If URL parsing fails, assume it's just a hostname
    return {
      host: redisUrl,
      port: 6379,
    }
  }
}

// Get or create a queue
export function getQueue(name: QueueName): Queue | null {
  const connection = getConnectionConfig()
  if (!connection) return null

  if (!queues.has(name)) {
    const queue = new Queue(name, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
          count: 500, // Keep last 500 failed jobs for debugging
        },
      },
    })
    queues.set(name, queue)
  }

  return queues.get(name)!
}

// Create a worker for a queue
export function createWorker<T, R>(
  name: QueueName,
  processor: (job: Job<T>) => Promise<R>,
  concurrency: number = 3
): Worker<T, R> | null {
  const connection = getConnectionConfig()
  if (!connection) return null

  if (workers.has(name)) {
    return workers.get(name) as Worker<T, R>
  }

  const worker = new Worker<T, R>(name, processor, {
    connection,
    concurrency,
    limiter: {
      max: 10, // Max 10 jobs per
      duration: 1000, // per second
    },
  })

  worker.on('completed', (job: Job<T>) => {
    console.log(`[Queue:${name}] Job ${job.id} completed`)
  })

  worker.on('failed', (job: Job<T> | undefined, err: Error) => {
    console.error(`[Queue:${name}] Job ${job?.id} failed:`, err.message)
  })

  worker.on('error', (err: Error) => {
    console.error(`[Queue:${name}] Worker error:`, err.message)
  })

  workers.set(name, worker)
  return worker
}

// Add a job to a queue (with fallback to synchronous execution)
export async function addJob<T>(
  queueName: QueueName,
  data: T,
  options?: {
    priority?: number
    delay?: number
    jobId?: string
  }
): Promise<{ queued: boolean; jobId?: string }> {
  const queue = getQueue(queueName)

  if (!queue) {
    // Queue not available - return that it wasn't queued
    // The caller should handle synchronous fallback
    return { queued: false }
  }

  const job = await queue.add(queueName, data, {
    priority: options?.priority,
    delay: options?.delay,
    jobId: options?.jobId,
  })

  return { queued: true, jobId: job.id }
}

// Check if queues are available
export function areQueuesAvailable(): boolean {
  return isRedisAvailable()
}

// Graceful shutdown
export async function closeQueues(): Promise<void> {
  // Close all workers first
  for (const [name, worker] of workers) {
    console.log(`[Queue] Closing worker: ${name}`)
    await worker.close()
  }
  workers.clear()

  // Then close all queues
  for (const [name, queue] of queues) {
    console.log(`[Queue] Closing queue: ${name}`)
    await queue.close()
  }
  queues.clear()
}
