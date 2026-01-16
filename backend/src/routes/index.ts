import { Router } from 'express'

import usersRouter from './users.js'
import brandsRouter from './brands.js'
import postsRouter from './posts.js'
import aiRouter from './ai.js'
import voiceRouter from './voice.js'
import imagesRouter from './images.js'
import subscriptionsRouter from './subscriptions.js'
import emailsRouter from './emails.js'
import adminRouter from './admin.js'

const router = Router()

// API v1 routes
router.use('/users', usersRouter)
router.use('/brands', brandsRouter)
router.use('/posts', postsRouter)
router.use('/ai', aiRouter)
router.use('/voice', voiceRouter)
router.use('/images', imagesRouter)
router.use('/subscriptions', subscriptionsRouter)
router.use('/emails', emailsRouter)
router.use('/admin', adminRouter)

export default router
