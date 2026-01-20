import { env } from '../config/env.js'
import { fetchWithTimeout, TIMEOUTS } from '../lib/fetchWithTimeout.js'

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot'

// Check if Telegram is configured
export function isTelegramConfigured(): boolean {
  return !!env.TELEGRAM_BOT_TOKEN
}

// Get bot API URL
function getBotUrl(method: string): string {
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error('Telegram bot token not configured')
  }
  return `${TELEGRAM_API_BASE}${env.TELEGRAM_BOT_TOKEN}/${method}`
}

// Send a text message to a chat
export async function sendMessage(
  chatId: string,
  text: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    disableWebPagePreview?: boolean
  }
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  if (!isTelegramConfigured()) {
    return { ok: false, error: 'Telegram not configured' }
  }

  try {
    const response = await fetchWithTimeout(getBotUrl('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode,
        disable_web_page_preview: options?.disableWebPagePreview,
      }),
      timeout: TIMEOUTS.TELEGRAM_API,
    })

    const data = await response.json() as {
      ok: boolean
      result?: { message_id: number }
      description?: string
    }

    if (data.ok) {
      return { ok: true, messageId: data.result?.message_id }
    } else {
      return { ok: false, error: data.description || 'Unknown error' }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { ok: false, error: message }
  }
}

// Send post content to Telegram
export async function sendPostToTelegram(
  chatId: string,
  postContent: string,
  platform: string,
  brandName: string
): Promise<{ ok: boolean; error?: string }> {
  // Format the message nicely
  const message = `
📱 *${platform}* | ${brandName}

${escapeMarkdown(postContent)}

━━━━━━━━━━━━━━━━━━━━
✨ Ready to post! Copy the text above.
`.trim()

  return sendMessage(chatId, message, { parseMode: 'Markdown' })
}

// Escape special characters for Markdown
function escapeMarkdown(text: string): string {
  // Escape Markdown special chars but keep basic formatting
  return text
    .replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
}

// Set webhook for the bot (called once during setup)
export async function setWebhook(webhookUrl: string): Promise<boolean> {
  if (!isTelegramConfigured()) {
    return false
  }

  try {
    const response = await fetchWithTimeout(getBotUrl('setWebhook'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
      timeout: TIMEOUTS.TELEGRAM_API,
    })

    const data = await response.json() as { ok: boolean }
    return data.ok
  } catch {
    return false
  }
}

// Delete webhook (for polling mode)
export async function deleteWebhook(): Promise<boolean> {
  if (!isTelegramConfigured()) {
    return false
  }

  try {
    const response = await fetchWithTimeout(getBotUrl('deleteWebhook'), {
      method: 'POST',
      timeout: TIMEOUTS.TELEGRAM_API,
    })

    const data = await response.json() as { ok: boolean }
    return data.ok
  } catch {
    return false
  }
}

// Get bot info
export async function getBotInfo(): Promise<{
  ok: boolean
  username?: string
  firstName?: string
}> {
  if (!isTelegramConfigured()) {
    return { ok: false }
  }

  try {
    const response = await fetchWithTimeout(getBotUrl('getMe'), {
      timeout: TIMEOUTS.TELEGRAM_API,
    })
    const data = await response.json() as {
      ok: boolean
      result?: { username: string; first_name: string }
    }

    if (data.ok && data.result) {
      return {
        ok: true,
        username: data.result.username,
        firstName: data.result.first_name,
      }
    }
    return { ok: false }
  } catch {
    return { ok: false }
  }
}

// Types for Telegram webhook updates
export interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      username?: string
    }
    chat: {
      id: number
      type: 'private' | 'group' | 'supergroup' | 'channel'
      first_name?: string
      username?: string
    }
    date: number
    text?: string
  }
}

// Generate a link token for connecting accounts
export function generateLinkToken(userId: string): string {
  // Simple token: base64 encoded user ID with timestamp
  const payload = `${userId}:${Date.now()}`
  return Buffer.from(payload).toString('base64url')
}

// Parse a link token
export function parseLinkToken(token: string): { userId: string; timestamp: number } | null {
  try {
    const payload = Buffer.from(token, 'base64url').toString('utf-8')
    const [userId, timestamp] = payload.split(':')
    if (userId && timestamp) {
      return { userId, timestamp: parseInt(timestamp, 10) }
    }
    return null
  } catch {
    return null
  }
}
