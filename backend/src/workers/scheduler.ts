import { prisma } from '../lib/prisma.js'
import { sendPostToTelegram, isTelegramConfigured } from '../services/telegram.js'
import { getQueue, createWorker, QUEUE_NAMES, areQueuesAvailable } from '../lib/queue.js'

// How often to check for due posts (in milliseconds)
const CHECK_INTERVAL = 60 * 1000 // 1 minute
const BATCH_SIZE = 50 // Process posts in batches
const CONCURRENCY = 5 // Process up to 5 posts concurrently

let isRunning = false
let intervalId: NodeJS.Timeout | null = null

interface TelegramDeliveryJob {
  postId: string
  chatId: string
  content: string
  platform: string
  brandName: string
}

// Process a single post (used by both queue worker and direct processing)
async function processPost(job: TelegramDeliveryJob): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await sendPostToTelegram(
      job.chatId,
      job.content,
      job.platform,
      job.brandName
    )

    if (result.ok) {
      await prisma.post.update({
        where: { id: job.postId },
        data: {
          telegramSent: true,
          telegramSentAt: new Date(),
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      })
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

// Process scheduled posts that are due
async function processScheduledPosts(): Promise<void> {
  if (!isTelegramConfigured()) {
    return
  }

  try {
    const now = new Date()

    // Find scheduled posts that are due and haven't been sent to Telegram
    const duePosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          lte: now,
        },
        telegramSent: false,
        user: {
          telegramEnabled: true,
          telegramChatId: {
            not: null,
          },
        },
      },
      include: {
        user: {
          select: {
            telegramChatId: true,
            telegramEnabled: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
      take: BATCH_SIZE,
    })

    if (duePosts.length === 0) {
      return
    }

    console.log(`[Scheduler] Processing ${duePosts.length} due posts`)

    // If queues are available, use them for better reliability
    const queue = getQueue(QUEUE_NAMES.TELEGRAM_DELIVERY)

    if (queue) {
      // Add jobs to queue for processing
      for (const post of duePosts) {
        if (!post.user.telegramChatId || !post.user.telegramEnabled) {
          continue
        }

        await queue.add(QUEUE_NAMES.TELEGRAM_DELIVERY, {
          postId: post.id,
          chatId: post.user.telegramChatId,
          content: post.content,
          platform: post.platform,
          brandName: post.brand.name,
        } as TelegramDeliveryJob)
      }
      console.log(`[Scheduler] Added ${duePosts.length} jobs to queue`)
    } else {
      // Fallback: Process concurrently without queue (degraded mode)
      const jobs: TelegramDeliveryJob[] = duePosts
        .filter(post => post.user.telegramChatId && post.user.telegramEnabled)
        .map(post => ({
          postId: post.id,
          chatId: post.user.telegramChatId!,
          content: post.content,
          platform: post.platform,
          brandName: post.brand.name,
        }))

      // Process in parallel batches of CONCURRENCY
      for (let i = 0; i < jobs.length; i += CONCURRENCY) {
        const batch = jobs.slice(i, i + CONCURRENCY)
        const results = await Promise.allSettled(batch.map(job => processPost(job)))

        results.forEach((result, index) => {
          const job = batch[index]
          if (result.status === 'fulfilled' && result.value.success) {
            console.log(`[Scheduler] Sent post ${job.postId} to Telegram`)
          } else {
            const error = result.status === 'rejected'
              ? result.reason
              : result.value.error
            console.error(`[Scheduler] Failed to send post ${job.postId}: ${error}`)
          }
        })

        // Small delay between batches to avoid rate limiting
        if (i + CONCURRENCY < jobs.length) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error processing scheduled posts:', error)
  }
}

// Initialize the queue worker (if Redis is available)
function initializeWorker(): void {
  if (!areQueuesAvailable()) {
    console.log('[Scheduler] Redis not available - running in degraded mode without job queue')
    return
  }

  const worker = createWorker<TelegramDeliveryJob, { success: boolean }>(
    QUEUE_NAMES.TELEGRAM_DELIVERY,
    async (job) => {
      console.log(`[Worker] Processing job ${job.id} for post ${job.data.postId}`)
      const result = await processPost(job.data)
      if (!result.success) {
        throw new Error(result.error || 'Failed to process post')
      }
      return result
    },
    CONCURRENCY
  )

  if (worker) {
    console.log('[Scheduler] Queue worker initialized with Redis')
  }
}

// Start the scheduler
export function startScheduler(): void {
  if (isRunning) {
    console.log('[Scheduler] Already running')
    return
  }

  if (!isTelegramConfigured()) {
    console.log('[Scheduler] Telegram not configured, scheduler disabled')
    return
  }

  isRunning = true

  // Initialize queue worker if Redis is available
  initializeWorker()

  console.log('[Scheduler] Started - checking for due posts every minute')

  // Run immediately on start
  processScheduledPosts()

  // Then run every CHECK_INTERVAL
  intervalId = setInterval(processScheduledPosts, CHECK_INTERVAL)
}

// Stop the scheduler
export function stopScheduler(): void {
  if (!isRunning) {
    return
  }

  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }

  isRunning = false
  console.log('[Scheduler] Stopped')
}

// Check if scheduler is running
export function isSchedulerRunning(): boolean {
  return isRunning
}
