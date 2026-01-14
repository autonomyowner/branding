# T21 API Implementation Examples

## Complete API Route Examples

### Authentication Routes

```typescript
// routes/auth.ts
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2)
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(422).json({
        error: {
          code: 'USER_EXISTS',
          message: 'Email already registered'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subscriptionTier: 'FREE'
      },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true
      }
    });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Store refresh token
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(201).json({
      user,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900 // 15 minutes in seconds
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors
        }
      });
    }
    throw error;
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      subscriptionTier: true
    }
  });

  if (!user || !user.password) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  await prisma.session.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    user: userWithoutPassword,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 900
    }
  });
});

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      error: { code: 'MISSING_TOKEN', message: 'Refresh token required' }
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string };

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' }
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    // Optionally: Rotate refresh token
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900
      }
    });
  } catch (error) {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' }
    });
  }
});

export default router;
```

### Posts Routes

```typescript
// routes/posts.ts
import express from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkQuota } from '../middleware/quota';
import { prisma } from '../lib/prisma';
import { schedulePost } from '../workers/post-publisher';

const router = express.Router();

const createPostSchema = z.object({
  brandId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  platforms: z.array(z.enum(['INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'FACEBOOK'])),
  scheduledFor: z.string().datetime().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  hashtags: z.array(z.string()).optional(),
  aiGenerated: z.boolean().optional(),
  aiPrompt: z.string().optional()
});

// GET /posts - List all posts for user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { status, brandId, limit = '50', offset = '0' } = req.query;

  const where: any = {
    OR: [
      { userId },
      {
        brand: {
          organization: {
            members: {
              some: { userId }
            }
          }
        }
      }
    ]
  };

  if (status) where.status = status;
  if (brandId) where.brandId = brandId;

  const posts = await prisma.post.findMany({
    where,
    include: {
      brand: { select: { id: true, name: true } },
      socialPosts: {
        select: {
          id: true,
          status: true,
          platformPostId: true,
          publishedAt: true,
          socialAccount: {
            select: { platform: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: Number(offset)
  });

  const total = await prisma.post.count({ where });

  res.json({
    data: posts,
    meta: {
      total,
      limit: Number(limit),
      offset: Number(offset)
    }
  });
});

// POST /posts - Create new post
router.post('/', authenticate, checkQuota('posts'), async (req: AuthRequest, res) => {
  try {
    const data = createPostSchema.parse(req.body);
    const userId = req.user!.id;

    // Verify brand ownership
    const brand = await prisma.brand.findFirst({
      where: {
        id: data.brandId,
        OR: [
          { userId },
          {
            organization: {
              members: {
                some: { userId, role: { in: ['OWNER', 'ADMIN', 'MEMBER'] } }
              }
            }
          }
        ]
      },
      include: {
        socialAccounts: {
          where: { platform: { in: data.platforms } }
        }
      }
    });

    if (!brand) {
      return res.status(404).json({
        error: { code: 'BRAND_NOT_FOUND', message: 'Brand not found or access denied' }
      });
    }

    // Check if all requested platforms are connected
    const connectedPlatforms = brand.socialAccounts.map(acc => acc.platform);
    const missingPlatforms = data.platforms.filter(p => !connectedPlatforms.includes(p));

    if (missingPlatforms.length > 0) {
      return res.status(422).json({
        error: {
          code: 'PLATFORMS_NOT_CONNECTED',
          message: `Connect ${missingPlatforms.join(', ')} to this brand first`,
          details: { missingPlatforms }
        }
      });
    }

    // Determine post status
    const status = data.scheduledFor ? 'SCHEDULED' : 'DRAFT';
    const scheduledFor = data.scheduledFor ? new Date(data.scheduledFor) : null;

    // Validate scheduled time is in future
    if (scheduledFor && scheduledFor <= new Date()) {
      return res.status(422).json({
        error: {
          code: 'INVALID_SCHEDULE_TIME',
          message: 'Scheduled time must be in the future'
        }
      });
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        brandId: data.brandId,
        userId,
        content: data.content,
        imageUrls: data.imageUrls || [],
        hashtags: data.hashtags || [],
        platforms: data.platforms,
        status,
        scheduledFor,
        aiGenerated: data.aiGenerated || false,
        aiPrompt: data.aiPrompt,
        socialPosts: {
          create: brand.socialAccounts.map(account => ({
            socialAccountId: account.id,
            status: status as any
          }))
        }
      },
      include: {
        brand: { select: { id: true, name: true } },
        socialPosts: true
      }
    });

    // Schedule job if scheduled
    if (scheduledFor) {
      await schedulePost(post.id, scheduledFor);
    }

    // Increment user's post count
    await prisma.user.update({
      where: { id: userId },
      data: { postsThisMonth: { increment: 1 } }
    });

    // Get usage info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { postsThisMonth: true, subscriptionTier: true }
    });

    const limits = {
      FREE: 30,
      PRO: 150,
      BUSINESS: 1000
    };

    res.status(201).json({
      data: post,
      meta: {
        creditsUsed: 1,
        creditsRemaining: limits[user!.subscriptionTier as keyof typeof limits] - user!.postsThisMonth
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors
        }
      });
    }
    throw error;
  }
});

// GET /posts/:id - Get single post
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const post = await prisma.post.findFirst({
    where: {
      id,
      OR: [
        { userId },
        {
          brand: {
            organization: {
              members: {
                some: { userId }
              }
            }
          }
        }
      ]
    },
    include: {
      brand: true,
      user: { select: { id: true, name: true, email: true } },
      socialPosts: {
        include: {
          socialAccount: true,
          analytics: { orderBy: { date: 'desc' }, take: 1 }
        }
      }
    }
  });

  if (!post) {
    return res.status(404).json({
      error: { code: 'POST_NOT_FOUND', message: 'Post not found' }
    });
  }

  res.json({ data: post });
});

// PATCH /posts/:id - Update post
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Only allow updating draft posts
  const existing = await prisma.post.findFirst({
    where: {
      id,
      userId,
      status: 'DRAFT'
    }
  });

  if (!existing) {
    return res.status(404).json({
      error: {
        code: 'POST_NOT_FOUND',
        message: 'Post not found or cannot be edited'
      }
    });
  }

  const updateSchema = z.object({
    content: z.string().min(1).max(5000).optional(),
    imageUrls: z.array(z.string().url()).max(10).optional(),
    hashtags: z.array(z.string()).optional(),
    scheduledFor: z.string().datetime().optional()
  });

  const data = updateSchema.parse(req.body);

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      status: data.scheduledFor ? 'SCHEDULED' : 'DRAFT'
    }
  });

  res.json({ data: post });
});

// DELETE /posts/:id - Delete post
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const post = await prisma.post.findFirst({
    where: {
      id,
      userId,
      status: { in: ['DRAFT', 'SCHEDULED'] }
    }
  });

  if (!post) {
    return res.status(404).json({
      error: {
        code: 'POST_NOT_FOUND',
        message: 'Post not found or cannot be deleted'
      }
    });
  }

  await prisma.post.delete({ where: { id } });

  res.status(204).send();
});

// POST /posts/:id/publish - Publish immediately
router.post('/:id/publish', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const post = await prisma.post.findFirst({
    where: {
      id,
      userId,
      status: { in: ['DRAFT', 'SCHEDULED'] }
    }
  });

  if (!post) {
    return res.status(404).json({
      error: { code: 'POST_NOT_FOUND', message: 'Post not found' }
    });
  }

  // Schedule for immediate publishing (5 seconds from now)
  const publishTime = new Date(Date.now() + 5000);

  await prisma.post.update({
    where: { id },
    data: {
      status: 'SCHEDULED',
      scheduledFor: publishTime
    }
  });

  await schedulePost(id, publishTime);

  res.json({
    data: {
      message: 'Post queued for publishing',
      estimatedPublishTime: publishTime
    }
  });
});

export default router;
```

### AI Generation Route

```typescript
// routes/ai.ts
import express from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requirePlan } from '../middleware/authorize';
import { generateContent } from '../services/openrouter';
import { prisma } from '../lib/prisma';

const router = express.Router();

const generateSchema = z.object({
  brandId: z.string().cuid(),
  prompt: z.string().min(10).max(1000),
  platform: z.enum(['INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'FACEBOOK']).optional(),
  tone: z.enum(['casual', 'professional', 'humorous', 'inspiring']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  includeHashtags: z.boolean().optional()
});

// POST /ai/generate-content
router.post('/generate-content', authenticate, requirePlan('PRO', 'BUSINESS'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const data = generateSchema.parse(req.body);

    // Get brand context
    const brand = await prisma.brand.findFirst({
      where: {
        id: data.brandId,
        OR: [{ userId }, { organization: { members: { some: { userId } } } }]
      }
    });

    if (!brand) {
      return res.status(404).json({
        error: { code: 'BRAND_NOT_FOUND', message: 'Brand not found' }
      });
    }

    // Check AI credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiCreditsUsed: true, subscriptionTier: true }
    });

    const creditLimits = {
      FREE: 10,
      PRO: 100,
      BUSINESS: 500
    };

    const limit = creditLimits[user!.subscriptionTier as keyof typeof creditLimits];

    if (user!.aiCreditsUsed >= limit) {
      return res.status(403).json({
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'AI generation limit reached for this month',
          details: { used: user!.aiCreditsUsed, limit }
        }
      });
    }

    // Build context-aware prompt
    const systemPrompt = `You are a social media content creator for ${brand.name}.
${brand.description ? `Brand Description: ${brand.description}` : ''}
${brand.targetAudience ? `Target Audience: ${brand.targetAudience}` : ''}
${brand.toneOfVoice ? `Tone of Voice: ${brand.toneOfVoice}` : `Tone: ${data.tone || 'professional'}`}
${data.platform ? `Platform: ${data.platform}` : ''}

Create engaging content that resonates with the target audience. Keep it concise and impactful.`;

    const lengthGuide = {
      short: 'Keep it under 100 characters',
      medium: 'Aim for 150-250 characters',
      long: 'Can be up to 500 characters'
    };

    const userPrompt = `${data.prompt}

${data.length ? lengthGuide[data.length] : ''}
${data.includeHashtags ? 'Include 3-5 relevant hashtags at the end.' : 'Do not include hashtags.'}`;

    // Call OpenRouter API
    const result = await generateContent(systemPrompt, userPrompt);

    // Extract hashtags if included
    let content = result.content;
    const hashtags: string[] = [];

    if (data.includeHashtags) {
      const hashtagRegex = /#[\w]+/g;
      const matches = content.match(hashtagRegex);
      if (matches) {
        hashtags.push(...matches.map(h => h.substring(1)));
        content = content.replace(hashtagRegex, '').trim();
      }
    }

    // Increment AI credits
    await prisma.user.update({
      where: { id: userId },
      data: { aiCreditsUsed: { increment: 1 } }
    });

    res.json({
      data: {
        content,
        hashtags,
        model: result.model,
        tokensUsed: result.tokensUsed
      },
      meta: {
        creditsUsed: 1,
        creditsRemaining: limit - (user!.aiCreditsUsed + 1)
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors
        }
      });
    }
    throw error;
  }
});

export default router;
```

### Stripe Webhook Handler

```typescript
// routes/webhooks/stripe.ts
import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../../lib/prisma';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
});

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log webhook for debugging
  await prisma.webhookEvent.create({
    data: {
      provider: 'stripe',
      eventType: event.type,
      payload: event.data as any
    }
  });

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: subscription.customer as string }
        });

        if (!user) {
          console.error('User not found for customer:', subscription.customer);
          break;
        }

        // Determine tier from price ID
        const priceId = subscription.items.data[0].price.id;
        let tier = 'FREE';

        if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
          tier = 'PRO';
        } else if (priceId === process.env.STRIPE_PRICE_ID_BUSINESS) {
          tier = 'BUSINESS';
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionTier: tier as any,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });

        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            tier: tier as any,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          },
          update: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            tier: tier as any,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        });

        // Send notification
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'SUBSCRIPTION_UPDATED',
            title: 'Subscription Updated',
            message: `Your subscription has been updated to ${tier}`
          }
        });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: subscription.customer as string }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: 'FREE',
              subscriptionStatus: 'canceled',
              currentPeriodEnd: null
            }
          });

          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'SUBSCRIPTION_UPDATED',
              title: 'Subscription Cancelled',
              message: 'Your subscription has been cancelled'
            }
          });
        }

        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: invoice.customer as string }
        });

        if (user) {
          await prisma.invoice.create({
            data: {
              userId: user.id,
              stripeInvoiceId: invoice.id,
              amountPaid: invoice.amount_paid,
              currency: invoice.currency,
              status: invoice.status!,
              invoiceUrl: invoice.hosted_invoice_url,
              pdfUrl: invoice.invoice_pdf
            }
          });
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        const user = await prisma.user.findUnique({
          where: { stripeCustomerId: invoice.customer as string }
        });

        if (user) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'SUBSCRIPTION_UPDATED',
              title: 'Payment Failed',
              message: 'Your recent payment failed. Please update your payment method.'
            }
          });
        }

        break;
      }
    }

    // Mark webhook as processed
    await prisma.webhookEvent.updateMany({
      where: {
        provider: 'stripe',
        payload: { path: ['id'], equals: event.id }
      },
      data: {
        processed: true,
        processedAt: new Date()
      }
    });

    res.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);

    // Log error
    await prisma.webhookEvent.updateMany({
      where: {
        provider: 'stripe',
        payload: { path: ['id'], equals: event.id }
      },
      data: {
        error: error.message
      }
    });

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
```

These examples provide complete, production-ready implementations for the core API functionality.
