# T21 Backend Architecture

> Production-ready backend specification for T21 - AI-powered social media automation platform

---

## Tech Stack Overview

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Runtime** | Node.js 20 + TypeScript | Type safety, large ecosystem, fast iteration |
| **Framework** | Express.js | Lightweight, battle-tested, flexible |
| **Database** | PostgreSQL 16 | ACID compliance, JSON support, scalable |
| **ORM** | Prisma | Type-safe queries, migrations, studio UI |
| **Cache** | Redis | Sessions, rate limiting, job queues |
| **Job Queue** | BullMQ | Reliable background jobs with retry logic |
| **Authentication** | Clerk | Managed auth, OAuth, organizations |
| **Payments** | Stripe | Subscriptions, webhooks, invoices |
| **AI** | OpenRouter API | Multi-model access, server-side keys |
| **File Storage** | Cloudflare R2 | S3-compatible, $0.015/GB |
| **Email** | Resend | Modern API, free tier 3K/month |
| **Hosting** | Railway.app | Auto-scaling, managed Postgres/Redis |
| **Monitoring** | Sentry | Error tracking, performance monitoring |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Web App     │  │  Mobile App  │  │  API Users   │              │
│  │  React 19    │  │  (Future)    │  │  (Business)  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                            ▼ HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Express.js Server                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │    │
│  │  │ Clerk Auth  │  │ Rate Limit  │  │ Validation  │        │    │
│  │  │ Middleware  │  │ Middleware  │  │ Middleware  │        │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │    │
│  │                                                             │    │
│  │  Routes: /auth /brands /posts /ai /subscriptions /webhooks │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────────┐ ┌─────────────┐ ┌──────────────────┐
│   PostgreSQL     │ │    Redis    │ │   BullMQ Workers │
│  ┌────────────┐  │ │ ┌─────────┐ │ │  ┌────────────┐  │
│  │ Users      │  │ │ │ Sessions│ │ │  │ Publisher  │  │
│  │ Brands     │  │ │ │ Cache   │ │ │  │ Analytics  │  │
│  │ Posts      │  │ │ │ Queues  │ │ │  │ Email      │  │
│  │ Analytics  │  │ │ │ Limits  │ │ │  │ Cleanup    │  │
│  └────────────┘  │ │ └─────────┘ │ │  └────────────┘  │
└──────────────────┘ └─────────────┘ └──────────────────┘
                            │
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                               │
│  ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────┐ ┌────────┐ ┌───────┐ │
│  │ Clerk  │ │ Stripe   │ │OpenRouter│ │Resend│ │   R2   │ │Sentry │ │
│  │ Auth   │ │ Payments │ │   AI   │ │ Email│ │Storage │ │Monitor│ │
│  └────────┘ └──────────┘ └────────┘ └──────┘ └────────┘ └───────┘ │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Instagram │ │ Twitter  │ │ LinkedIn │ │  TikTok  │ │ Facebook │ │
│  │ Graph API│ │  API v2  │ │   API    │ │   API    │ │ Graph API│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Authentication (Clerk)

### Why Clerk

- **Zero auth code to maintain** - Handles JWT, sessions, password reset, email verification
- **20+ OAuth providers** - Google, GitHub, Twitter, LinkedIn built-in
- **Organizations** - Perfect for team collaboration (Pro/Business tiers)
- **React SDK** - Drop-in components `<SignIn/>`, `<UserButton/>`
- **Express SDK** - One-line middleware protection
- **Webhooks** - Sync users to your database automatically
- **Free tier** - 10,000 MAU at $0

### Clerk Setup

```
Frontend:
- @clerk/clerk-react
- <ClerkProvider>
- <SignedIn>, <SignedOut>, <RedirectToSignIn>
- <UserButton>, <OrganizationSwitcher>

Backend:
- @clerk/express
- clerkMiddleware()
- requireAuth()
- req.auth.userId, req.auth.orgId
```

### User Sync Flow

```
Clerk User Created
        │
        ▼ Webhook: user.created
        │
┌───────┴───────┐
│ POST /webhooks/clerk
│ Verify signature
│ Create user in DB:
│   - clerkId
│   - email
│   - name
│   - subscriptionTier: FREE
│   - postsThisMonth: 0
└───────────────┘
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id                String   @id @default(cuid())
  clerkId           String   @unique
  email             String   @unique
  name              String?
  avatarUrl         String?

  // Subscription
  subscriptionTier  SubscriptionTier @default(FREE)
  stripeCustomerId  String?  @unique

  // Usage tracking
  postsThisMonth    Int      @default(0)
  aiCreditsUsed     Int      @default(0)
  usageResetDate    DateTime @default(now())

  // Relations
  brands            Brand[]
  posts             Post[]
  subscriptions     Subscription[]
  invoices          Invoice[]
  organizationMemberships OrganizationMember[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([clerkId])
  @@index([stripeCustomerId])
}

enum SubscriptionTier {
  FREE
  PRO
  BUSINESS
}

// ============================================
// ORGANIZATIONS (Teams)
// ============================================

model Organization {
  id                String   @id @default(cuid())
  clerkOrgId        String   @unique
  name              String
  slug              String   @unique

  subscriptionTier  SubscriptionTier @default(FREE)
  stripeCustomerId  String?  @unique

  // Relations
  members           OrganizationMember[]
  brands            Brand[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model OrganizationMember {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           OrgRole  @default(MEMBER)

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt      DateTime @default(now())

  @@unique([userId, organizationId])
}

enum OrgRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// ============================================
// BRANDS
// ============================================

model Brand {
  id              String   @id @default(cuid())
  name            String
  description     String?
  logoUrl         String?

  // Brand voice settings
  toneOfVoice     String?  // e.g., "professional", "casual", "witty"
  targetAudience  String?
  topics          String[] // Array of topics/niches
  contentStyle    ContentStyle @default(EDUCATIONAL)

  // Relations
  userId          String
  organizationId  String?
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization? @relation(fields: [organizationId], references: [id])

  posts           Post[]
  socialAccounts  SocialAccount[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([organizationId])
}

enum ContentStyle {
  VIRAL
  STORYTELLING
  EDUCATIONAL
  CONTROVERSIAL
  INSPIRATIONAL
}

// ============================================
// SOCIAL ACCOUNTS
// ============================================

model SocialAccount {
  id                String   @id @default(cuid())
  platform          Platform
  platformUserId    String
  platformUsername  String

  // OAuth tokens (encrypted)
  accessToken       String
  refreshToken      String?
  tokenExpiresAt    DateTime?

  // Relations
  brandId           String
  brand             Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  socialPosts       SocialPost[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([platform, platformUserId])
  @@index([brandId])
}

enum Platform {
  INSTAGRAM
  TWITTER
  LINKEDIN
  TIKTOK
  FACEBOOK
}

// ============================================
// POSTS & CONTENT
// ============================================

model Post {
  id              String   @id @default(cuid())
  content         String

  // Media
  mediaUrls       String[]
  mediaType       MediaType?

  // Scheduling
  status          PostStatus @default(DRAFT)
  scheduledFor    DateTime?
  publishedAt     DateTime?

  // AI metadata
  aiGenerated     Boolean  @default(false)
  aiModel         String?
  aiPrompt        String?

  // Targeting
  platforms       Platform[]
  hashtags        String[]

  // Relations
  userId          String
  brandId         String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  brand           Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  socialPosts     SocialPost[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([brandId])
  @@index([status])
  @@index([scheduledFor])
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHING
  PUBLISHED
  FAILED
}

enum MediaType {
  IMAGE
  VIDEO
  CAROUSEL
}

model SocialPost {
  id                String   @id @default(cuid())

  status            SocialPostStatus @default(PENDING)
  platformPostId    String?  // ID from the platform after publishing
  platformPostUrl   String?

  publishedAt       DateTime?
  errorMessage      String?
  retryCount        Int      @default(0)

  // Relations
  postId            String
  socialAccountId   String
  post              Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  socialAccount     SocialAccount @relation(fields: [socialAccountId], references: [id], onDelete: Cascade)

  analytics         PostAnalytics[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([postId, socialAccountId])
  @@index([status])
}

enum SocialPostStatus {
  PENDING
  PUBLISHING
  PUBLISHED
  FAILED
}

// ============================================
// ANALYTICS
// ============================================

model PostAnalytics {
  id              String   @id @default(cuid())

  impressions     Int      @default(0)
  reach           Int      @default(0)
  likes           Int      @default(0)
  comments        Int      @default(0)
  shares          Int      @default(0)
  saves           Int      @default(0)
  clicks          Int      @default(0)
  engagementRate  Float    @default(0)

  // Relations
  socialPostId    String
  socialPost      SocialPost @relation(fields: [socialPostId], references: [id], onDelete: Cascade)

  collectedAt     DateTime @default(now())

  @@index([socialPostId])
  @@index([collectedAt])
}

// ============================================
// SUBSCRIPTIONS & BILLING
// ============================================

model Subscription {
  id                  String   @id @default(cuid())
  stripeSubscriptionId String  @unique

  tier                SubscriptionTier
  status              SubscriptionStatus

  currentPeriodStart  DateTime
  currentPeriodEnd    DateTime
  cancelAtPeriodEnd   Boolean  @default(false)

  // Relations
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([userId])
  @@index([stripeSubscriptionId])
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  TRIALING
}

model Invoice {
  id                String   @id @default(cuid())
  stripeInvoiceId   String   @unique

  amountPaid        Int      // in cents
  currency          String   @default("gbp")
  status            InvoiceStatus
  pdfUrl            String?

  // Relations
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt         DateTime @default(now())

  @@index([userId])
}

enum InvoiceStatus {
  DRAFT
  OPEN
  PAID
  VOID
  UNCOLLECTIBLE
}
```

---

## API Endpoints

### Authentication (Clerk-managed)

```
Clerk handles these automatically:
- Sign up / Sign in / Sign out
- OAuth flows
- Password reset
- Email verification
- Session management
```

### Webhooks

```
POST   /webhooks/clerk           - Clerk user/org events
POST   /webhooks/stripe          - Stripe subscription events
```

### Users

```
GET    /api/v1/users/me          - Get current user profile
PATCH  /api/v1/users/me          - Update profile
GET    /api/v1/users/me/usage    - Get usage stats
```

### Brands

```
GET    /api/v1/brands            - List user's brands
POST   /api/v1/brands            - Create brand
GET    /api/v1/brands/:id        - Get brand details
PATCH  /api/v1/brands/:id        - Update brand
DELETE /api/v1/brands/:id        - Delete brand
```

### Social Accounts

```
GET    /api/v1/brands/:id/accounts           - List connected accounts
POST   /api/v1/brands/:id/accounts/:platform - Connect platform (OAuth)
DELETE /api/v1/brands/:id/accounts/:id       - Disconnect account
```

### Posts

```
GET    /api/v1/posts             - List posts (with filters)
POST   /api/v1/posts             - Create post
GET    /api/v1/posts/:id         - Get post details
PATCH  /api/v1/posts/:id         - Update post
DELETE /api/v1/posts/:id         - Delete post
POST   /api/v1/posts/:id/publish - Publish immediately
POST   /api/v1/posts/:id/schedule - Schedule post
```

### AI Generation

```
POST   /api/v1/ai/generate       - Generate content
POST   /api/v1/ai/improve        - Improve existing content
POST   /api/v1/ai/hashtags       - Generate hashtags
POST   /api/v1/ai/caption        - Generate image caption
```

### Analytics

```
GET    /api/v1/analytics/overview        - Dashboard stats
GET    /api/v1/analytics/posts/:id       - Post performance
GET    /api/v1/analytics/brands/:id      - Brand performance
GET    /api/v1/analytics/export          - Export CSV
```

### Subscriptions

```
POST   /api/v1/subscriptions/checkout    - Create Stripe checkout
GET    /api/v1/subscriptions/current     - Get current subscription
POST   /api/v1/subscriptions/portal      - Get Stripe portal URL
POST   /api/v1/subscriptions/cancel      - Cancel subscription
```

### Media

```
POST   /api/v1/media/upload      - Upload image/video
GET    /api/v1/media             - List media library
DELETE /api/v1/media/:id         - Delete media
```

---

## Background Jobs (BullMQ)

### Post Publisher

```typescript
// Runs when scheduledFor time is reached
Queue: 'post-publisher'
Job: {
  postId: string
  platforms: Platform[]
}

Process:
1. Fetch post and social accounts
2. Update status to PUBLISHING
3. For each platform:
   - Call platform API
   - Store platformPostId
   - Update SocialPost status
4. Update post status to PUBLISHED
5. Send notification email
```

### Analytics Collector

```typescript
// Runs every hour via cron
Queue: 'analytics-collector'
Job: {
  socialPostId: string
}

Process:
1. Fetch social post with platform details
2. Call platform API for metrics
3. Create PostAnalytics record
4. Calculate engagement rate
```

### Usage Reset

```typescript
// Runs monthly on billing cycle
Queue: 'usage-reset'
Job: {
  userId: string
}

Process:
1. Reset postsThisMonth to 0
2. Reset aiCreditsUsed to 0
3. Update usageResetDate
```

---

## Rate Limits & Quotas

### By Subscription Tier

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Brands | 2 | 5 | Unlimited |
| Posts/month | 20 | 1,000 | 90,000 |
| AI credits/month | 50 | 500 | 5,000 |
| Team members | 1 | 5 | Unlimited |
| API requests/min | 10 | 100 | 1,000 |
| Social accounts | 2 | 10 | Unlimited |

### Implementation

```typescript
// middleware/quota.ts
const checkQuota = (feature: string) => async (req, res, next) => {
  const user = await getUser(req.auth.userId)
  const limits = TIER_LIMITS[user.subscriptionTier]

  if (feature === 'posts' && user.postsThisMonth >= limits.postsPerMonth) {
    return res.status(429).json({
      error: 'Monthly post limit reached',
      limit: limits.postsPerMonth,
      upgrade: '/pricing'
    })
  }

  next()
}
```

---

## Security

### API Security

- **Clerk JWT validation** on all protected routes
- **Rate limiting** with Redis (express-rate-limit)
- **Input validation** with Zod schemas
- **CORS** configured for frontend domain only
- **Helmet.js** security headers
- **SQL injection** prevented by Prisma ORM

### Data Security

- **OAuth tokens** encrypted with AES-256-GCM before storage
- **Stripe webhook** signature verification
- **Clerk webhook** signature verification
- **No sensitive data** in JWT payloads

### Encryption Helper

```typescript
// lib/crypto.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // 32 bytes
const IV_LENGTH = 16

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(encrypted: string): string {
  const [ivHex, tagHex, dataHex] = encrypted.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const data = Buffer.from(dataHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  decipher.setAuthTag(tag)
  return decipher.update(data) + decipher.final('utf8')
}
```

---

## Environment Variables

```bash
# .env

# App
NODE_ENV=production
PORT=3000
API_URL=https://api.t21.app
FRONTEND_URL=https://t21.app

# Database
DATABASE_URL=postgresql://user:pass@host:5432/t21

# Redis
REDIS_URL=redis://default:pass@host:6379

# Clerk
CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_BUSINESS=price_xxx

# OpenRouter
OPENROUTER_API_KEY=sk-or-xxx

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=t21-media
R2_PUBLIC_URL=https://media.t21.app

# Resend
RESEND_API_KEY=re_xxx

# Security
ENCRYPTION_KEY=32-byte-hex-key

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Project Structure

```
t21-backend/
├── src/
│   ├── index.ts                 # Express app entry
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── users.ts
│   │   ├── brands.ts
│   │   ├── posts.ts
│   │   ├── ai.ts
│   │   ├── analytics.ts
│   │   ├── subscriptions.ts
│   │   ├── media.ts
│   │   └── webhooks/
│   │       ├── clerk.ts
│   │       └── stripe.ts
│   ├── middleware/
│   │   ├── auth.ts              # Clerk middleware
│   │   ├── quota.ts             # Usage limits
│   │   ├── rateLimit.ts
│   │   └── validate.ts          # Zod validation
│   ├── services/
│   │   ├── openrouter.ts        # AI generation
│   │   ├── instagram.ts
│   │   ├── twitter.ts
│   │   ├── linkedin.ts
│   │   ├── tiktok.ts
│   │   ├── facebook.ts
│   │   ├── storage.ts           # R2 uploads
│   │   └── email.ts             # Resend
│   ├── workers/
│   │   ├── index.ts             # Worker entry
│   │   ├── publisher.ts
│   │   ├── analytics.ts
│   │   └── usage.ts
│   ├── lib/
│   │   ├── prisma.ts            # DB client
│   │   ├── redis.ts
│   │   ├── queue.ts             # BullMQ setup
│   │   ├── crypto.ts
│   │   └── stripe.ts
│   ├── schemas/                 # Zod schemas
│   │   ├── brand.ts
│   │   ├── post.ts
│   │   └── ...
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

---

## Cost Breakdown

### Monthly Infrastructure Costs

| Service | Free Tier | Growth (1K-10K users) |
|---------|-----------|----------------------|
| Railway (API + Workers) | $5 | $20-50 |
| Railway PostgreSQL | $5 | $20-40 |
| Railway Redis | $5 | $10-20 |
| Cloudflare R2 | $0 (10GB) | $5-20 |
| Clerk | $0 (10K MAU) | $0-100 |
| Resend | $0 (3K/mo) | $0-20 |
| Sentry | $0 (5K errors) | $26 |
| **Total** | **~$15/mo** | **~$80-250/mo** |

### Variable Costs (Pass-through)

| Service | Cost |
|---------|------|
| OpenRouter AI | ~$0.001-0.01 per generation |
| Stripe | 2.9% + 30p per transaction |

---

## Deployment

### Railway Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add services
railway add --name api
railway add --plugin postgresql
railway add --plugin redis

# Set environment variables
railway variables set NODE_ENV=production
railway variables set CLERK_SECRET_KEY=sk_live_xxx
# ... etc

# Deploy
railway up
```

### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Clerk webhook endpoint configured
- [ ] Stripe webhook endpoint configured
- [ ] Stripe products/prices created
- [ ] Social platform OAuth apps created
- [ ] CORS whitelist updated
- [ ] SSL certificate active
- [ ] Sentry error tracking enabled
- [ ] Health check endpoint working
- [ ] Background workers running
- [ ] Rate limits tested
- [ ] Load testing completed

---

## Scaling Strategy

### Phase 1: MVP (0-1K users)
- Single Railway instance
- Vertical scaling (upgrade plan)
- Basic monitoring

### Phase 2: Growth (1K-10K users)
- Multiple API instances (Railway auto-scaling)
- PostgreSQL read replicas
- Redis cluster
- CDN for media (Cloudflare)

### Phase 3: Scale (10K+ users)
- Kubernetes migration
- Database sharding by organization
- Multi-region deployment
- Dedicated job workers
- Advanced caching (query results)

---

## Next Steps

1. **Initialize project** - `npm init`, install dependencies
2. **Set up Prisma** - Schema, migrations, generate client
3. **Configure Clerk** - Create app, set up webhooks
4. **Create Express app** - Basic routes, middleware
5. **Add Stripe** - Products, checkout, webhooks
6. **Implement AI service** - OpenRouter integration
7. **Build social connectors** - OAuth flows, publishing
8. **Deploy to Railway** - Staging environment
9. **Test end-to-end** - Full user journey
10. **Production deploy** - Go live

---

*Document Version: 1.0*
*Last Updated: 2026-01-11*
