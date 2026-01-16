import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import {
  sendMessage,
  parseLinkToken,
  type TelegramUpdate,
} from '../../services/telegram.js'

const router = Router()

// Telegram webhook endpoint - receives updates from Telegram
router.post('/', async (req, res) => {
  try {
    const update: TelegramUpdate = req.body

    // Only handle direct messages
    if (!update.message || update.message.chat.type !== 'private') {
      return res.status(200).json({ ok: true })
    }

    const chatId = update.message.chat.id.toString()
    const text = update.message.text || ''
    const firstName = update.message.from.first_name

    // Check if user sent /start with a link token
    if (text.startsWith('/start')) {
      const parts = text.split(' ')
      const token = parts[1]

      if (token) {
        // User clicked the connect link with a token
        const parsed = parseLinkToken(token)

        if (parsed) {
          // Check if token is not expired (24 hours)
          const tokenAge = Date.now() - parsed.timestamp
          const maxAge = 24 * 60 * 60 * 1000 // 24 hours

          if (tokenAge < maxAge) {
            // Link the Telegram account to the user
            try {
              await prisma.user.update({
                where: { id: parsed.userId },
                data: {
                  telegramChatId: chatId,
                  telegramEnabled: true,
                  telegramLinkedAt: new Date(),
                },
              })

              await sendMessage(
                chatId,
                `Connected! Hi ${firstName}, your Postaify account is now linked.\n\nYou'll receive your scheduled posts here when they're ready to publish.\n\nUse /status to check your connection status.\nUse /disconnect to unlink your account.`
              )

              console.log(`Telegram linked: userId=${parsed.userId}, chatId=${chatId}`)
              return res.status(200).json({ ok: true })
            } catch (error) {
              console.error('Failed to link Telegram account:', error)
              await sendMessage(
                chatId,
                'Sorry, there was an error linking your account. Please try again from the Postaify dashboard.'
              )
              return res.status(200).json({ ok: true })
            }
          } else {
            await sendMessage(
              chatId,
              'This link has expired. Please generate a new link from your Postaify dashboard.'
            )
            return res.status(200).json({ ok: true })
          }
        }
      }

      // Plain /start without token
      await sendMessage(
        chatId,
        `Welcome to Postaify Bot!\n\nTo connect your account, go to your Postaify dashboard Settings and click "Connect Telegram".\n\nOnce connected, you'll receive your scheduled posts directly here!`
      )
      return res.status(200).json({ ok: true })
    }

    // Handle /status command
    if (text === '/status') {
      const user = await prisma.user.findUnique({
        where: { telegramChatId: chatId },
        select: { email: true, telegramEnabled: true },
      })

      if (user) {
        await sendMessage(
          chatId,
          `Connected to: ${user.email}\nNotifications: ${user.telegramEnabled ? 'Enabled' : 'Disabled'}`
        )
      } else {
        await sendMessage(
          chatId,
          'Your Telegram is not connected to any Postaify account.\n\nGo to your Postaify dashboard Settings to connect.'
        )
      }
      return res.status(200).json({ ok: true })
    }

    // Handle /disconnect command
    if (text === '/disconnect') {
      const user = await prisma.user.findUnique({
        where: { telegramChatId: chatId },
      })

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            telegramChatId: null,
            telegramEnabled: false,
            telegramLinkedAt: null,
          },
        })

        await sendMessage(
          chatId,
          'Disconnected. Your Telegram account has been unlinked from Postaify.\n\nYou can reconnect anytime from the dashboard.'
        )
        console.log(`Telegram disconnected: userId=${user.id}`)
      } else {
        await sendMessage(
          chatId,
          'Your Telegram is not connected to any Postaify account.'
        )
      }
      return res.status(200).json({ ok: true })
    }

    // Default response for unknown commands
    await sendMessage(
      chatId,
      'I can help you receive your Postaify posts!\n\nCommands:\n/status - Check connection status\n/disconnect - Unlink your account\n\nTo connect, visit your Postaify dashboard Settings.'
    )

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    // Always return 200 to Telegram to avoid retries
    res.status(200).json({ ok: true })
  }
})

export default router
