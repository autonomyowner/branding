import { Router } from 'express'
import { requireAuthentication, loadUser, getAuthenticatedUser } from '../middleware/auth.js'
import {
  generateLinkToken,
  isTelegramConfigured,
  getBotInfo,
} from '../services/telegram.js'
import { prisma } from '../lib/prisma.js'

const router = Router()

// All routes require authentication
router.use(requireAuthentication, loadUser)

// Get Telegram connection status
router.get('/status', async (req, res) => {
  try {
    const authUser = getAuthenticatedUser(req)

    const configured = isTelegramConfigured()

    res.json({
      configured,
      connected: !!authUser.telegramChatId,
      enabled: authUser.telegramEnabled,
      linkedAt: authUser.telegramLinkedAt,
    })
  } catch (error) {
    console.error('Get Telegram status error:', error)
    res.status(500).json({ error: 'Failed to get Telegram status' })
  }
})

// Generate a connect link for the user
router.post('/connect', async (req, res) => {
  try {
    if (!isTelegramConfigured()) {
      return res.status(400).json({ error: 'Telegram is not configured' })
    }

    const user = getAuthenticatedUser(req)

    // Get bot info to build the link
    const botInfo = await getBotInfo()
    if (!botInfo.ok || !botInfo.username) {
      return res.status(500).json({ error: 'Failed to get bot info' })
    }

    // Generate a secure link token
    const token = generateLinkToken(user.id)

    // Build the Telegram deep link
    const connectLink = `https://t.me/${botInfo.username}?start=${token}`

    res.json({
      connectLink,
      botUsername: botInfo.username,
      expiresIn: '24 hours',
    })
  } catch (error) {
    console.error('Generate connect link error:', error)
    res.status(500).json({ error: 'Failed to generate connect link' })
  }
})

// Disconnect Telegram
router.post('/disconnect', async (req, res) => {
  try {
    const user = getAuthenticatedUser(req)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        telegramChatId: null,
        telegramEnabled: false,
        telegramLinkedAt: null,
      },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Disconnect Telegram error:', error)
    res.status(500).json({ error: 'Failed to disconnect Telegram' })
  }
})

// Toggle Telegram notifications on/off
router.patch('/toggle', async (req, res) => {
  try {
    const { enabled } = req.body

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' })
    }

    const user = getAuthenticatedUser(req)

    if (!user.telegramChatId) {
      return res.status(400).json({ error: 'Telegram not connected' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { telegramEnabled: enabled },
    })

    res.json({ success: true, enabled })
  } catch (error) {
    console.error('Toggle Telegram error:', error)
    res.status(500).json({ error: 'Failed to toggle Telegram' })
  }
})

export default router
