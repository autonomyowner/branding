import { prisma } from '../lib/prisma.js'
import { sendPostToTelegram, isTelegramConfigured } from '../services/telegram.js'

// How often to check for due posts (in milliseconds)
const CHECK_INTERVAL = 60 * 1000 // 1 minute

let isRunning = false
let intervalId: NodeJS.Timeout | null = null

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
      take: 50, // Process in batches
    })

    if (duePosts.length === 0) {
      return
    }

    console.log(`[Scheduler] Processing ${duePosts.length} due posts`)

    for (const post of duePosts) {
      if (!post.user.telegramChatId || !post.user.telegramEnabled) {
        continue
      }

      try {
        // Send to Telegram
        const result = await sendPostToTelegram(
          post.user.telegramChatId,
          post.content,
          post.platform,
          post.brand.name
        )

        if (result.ok) {
          // Mark as sent to Telegram and update status to PUBLISHED
          await prisma.post.update({
            where: { id: post.id },
            data: {
              telegramSent: true,
              telegramSentAt: new Date(),
              status: 'PUBLISHED',
              publishedAt: new Date(),
            },
          })

          console.log(`[Scheduler] Sent post ${post.id} to Telegram`)
        } else {
          console.error(`[Scheduler] Failed to send post ${post.id}: ${result.error}`)
        }
      } catch (error) {
        console.error(`[Scheduler] Error processing post ${post.id}:`, error)
      }

      // Small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  } catch (error) {
    console.error('[Scheduler] Error processing scheduled posts:', error)
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
