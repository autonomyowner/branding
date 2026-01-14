# T21 Backend Architecture - Production Ready

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Database Schema Design](#database-schema-design)
3. [API Architecture](#api-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [Infrastructure & Deployment](#infrastructure--deployment)
6. [Security Considerations](#security-considerations)
7. [Scaling Strategy](#scaling-strategy)
8. [Cost Analysis](#cost-analysis)

---

## 1. Technology Stack

### Core Backend
- **Runtime**: Node.js 20 LTS with TypeScript
- **Framework**: Express.js (lightweight, battle-tested)
- **Database**: PostgreSQL 16 (managed via Supabase or Railway)
- **ORM**: Prisma (type-safe, excellent DX)
- **Authentication**: Supabase Auth or Auth0
- **API Type**: RESTful (simpler for frontend integration)

### Storage & Queues
- **File Storage**: AWS S3 or Cloudflare R2 (cheaper)
- **Job Queue**: BullMQ with Redis
- **Cache**: Redis (for rate limiting, sessions, hot data)
- **Search**: PostgreSQL full-text search initially

### External Services
- **Payment**: Stripe (subscriptions + webhooks)
- **Email**: Resend or SendGrid
- **Monitoring**: Sentry (errors) + Better Stack (logs)
- **Analytics**: PostHog (self-hostable option)

### Infrastructure
- **Hosting**: Railway.app or Render.com (auto-scaling, PostgreSQL included)
- **Alternative**: Supabase (Auth + DB + Storage + Edge Functions)
- **CDN**: Cloudflare (free tier)

### Why This Stack?
1. **Cost-Effective**: Railway/Render offer $5-20/mo starting costs
2. **Type Safety**: TypeScript + Prisma = fewer runtime bugs
3. **Scalability**: Horizontal scaling via containers
4. **Developer Experience**: Fast iteration, good tooling
5. **Managed Services**: Less DevOps overhead for a startup

---

## 2. Database Schema Design

### Prisma Schema (schema.prisma)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ================================
// USERS & AUTHENTICATION
// ================================

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  name              String?
  avatarUrl         String?
  password          String?   // Only for email/password auth

  // Auth providers
  authProvider      String    @default("email") // email, google, github
  authProviderId    String?   // External provider user ID

  // Subscription
  stripeCustomerId  String?   @unique
  subscriptionTier  SubscriptionTier @default(FREE)
  subscriptionStatus String?  // active, canceled, past_due
  currentPeriodEnd  DateTime?

  // Usage tracking
  postsThisMonth    Int       @default(0)
  aiCreditsUsed     Int       @default(0)

  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?

  // Relations
  brands            Brand[]
  posts             Post[]
  teamMemberships   TeamMember[]
  organizations     Organization[]
  apiKeys           ApiKey[]
  sessions          Session[]
  notifications     Notification[]

  @@index([email])
  @@index([stripeCustomerId])
}

enum SubscriptionTier {
  FREE      // 0/mo - 3 brands, 30 posts/mo
  PRO       // 7/mo - 10 brands, 150 posts/mo
  BUSINESS  // 35/mo - unlimited brands, 1000 posts/mo
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  ipAddress String?
  userAgent String?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}

model ApiKey {
  id        String   @id @default(cuid())
  userId    String
  name      String
  key       String   @unique
  lastUsed  DateTime?
  createdAt DateTime @default(now())
  expiresAt DateTime?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([key])
}

// ================================
// ORGANIZATIONS & TEAMS
// ================================

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  ownerId     String

  // Billing
  subscriptionTier  SubscriptionTier @default(FREE)
  stripeCustomerId  String?   @unique

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  owner       User     @relation(fields: [ownerId], references: [id])
  members     TeamMember[]
  brands      Brand[]

  @@index([ownerId])
  @@index([slug])
}

model TeamMember {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  role           TeamRole @default(MEMBER)
  invitedBy      String?
  invitedAt      DateTime @default(now())
  joinedAt       DateTime?

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([userId])
}

enum TeamRole {
  OWNER   // Full access
  ADMIN   // Can manage members and brands
  MEMBER  // Can create and edit content
  VIEWER  // Read-only access
}

// ================================
// BRANDS & SOCIAL ACCOUNTS
// ================================

model Brand {
  id              String   @id @default(cuid())
  name            String
  description     String?
  industry        String?
  targetAudience  String?
  toneOfVoice     String?  // casual, professional, humorous
  logoUrl         String?

  // Ownership
  userId          String?
  organizationId  String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  socialAccounts  SocialAccount[]
  posts           Post[]
  contentTemplates ContentTemplate[]

  @@index([userId])
  @@index([organizationId])
}

model SocialAccount {
  id              String   @id @default(cuid())
  brandId         String
  platform        SocialPlatform

  // OAuth tokens (encrypted)
  accessToken     String?
  refreshToken    String?
  tokenExpiresAt  DateTime?

  // Platform-specific IDs
  platformUserId  String?
  platformUsername String?

  isActive        Boolean  @default(true)
  lastSyncAt      DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  brand           Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  posts           Post[]
  analytics       PostAnalytics[]

  @@unique([brandId, platform])
  @@index([brandId])
}

enum SocialPlatform {
  INSTAGRAM
  TWITTER
  LINKEDIN
  TIKTOK
  FACEBOOK
}

// ================================
// CONTENT & POSTS
// ================================

model Post {
  id              String   @id @default(cuid())
  brandId         String
  userId          String   // Creator

  // Content
  content         String   @db.Text
  imageUrls       String[] // Array of media URLs
  videoUrl        String?
  hashtags        String[]

  // AI Generation
  aiGenerated     Boolean  @default(false)
  aiPrompt        String?  @db.Text
  aiModel         String?  // gpt-4, claude-3-opus, etc.

  // Scheduling
  status          PostStatus @default(DRAFT)
  scheduledFor    DateTime?
  publishedAt     DateTime?

  // Target platforms
  platforms       SocialPlatform[]

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id])
  brand           Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)
  socialPosts     SocialPost[]

  @@index([brandId])
  @@index([userId])
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

model SocialPost {
  id              String   @id @default(cuid())
  postId          String
  socialAccountId String

  // Publishing
  status          PostStatus @default(SCHEDULED)
  platformPostId  String?  // ID from social platform
  publishedAt     DateTime?
  error           String?  @db.Text

  // Retry logic
  retryCount      Int      @default(0)
  lastRetryAt     DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  post            Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id], onDelete: Cascade)
  analytics       PostAnalytics[]

  @@index([postId])
  @@index([socialAccountId])
  @@index([status])
}

model ContentTemplate {
  id          String   @id @default(cuid())
  brandId     String
  name        String
  description String?
  template    String   @db.Text
  category    String?  // product_launch, seasonal, promotional

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  brand       Brand    @relation(fields: [brandId], references: [id], onDelete: Cascade)

  @@index([brandId])
}

// ================================
// ANALYTICS
// ================================

model PostAnalytics {
  id              String   @id @default(cuid())
  socialPostId    String
  socialAccountId String

  // Metrics
  impressions     Int      @default(0)
  reach           Int      @default(0)
  likes           Int      @default(0)
  comments        Int      @default(0)
  shares          Int      @default(0)
  clicks          Int      @default(0)
  saves           Int      @default(0)

  // Engagement rate
  engagementRate  Float    @default(0)

  // Timestamps
  fetchedAt       DateTime @default(now())
  date            DateTime @default(now())

  socialPost      SocialPost    @relation(fields: [socialPostId], references: [id], onDelete: Cascade)
  socialAccount   SocialAccount @relation(fields: [socialAccountId], references: [id], onDelete: Cascade)

  @@unique([socialPostId, date])
  @@index([socialAccountId])
}

// ================================
// MEDIA LIBRARY
// ================================

model Media {
  id          String   @id @default(cuid())
  userId      String
  brandId     String?

  // File info
  filename    String
  originalName String
  mimeType    String
  size        Int      // bytes
  url         String
  thumbnailUrl String?

  // Metadata
  width       Int?
  height      Int?
  alt         String?
  tags        String[]

  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([brandId])
}

// ================================
// BILLING & SUBSCRIPTIONS
// ================================

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique

  stripeSubscriptionId String @unique
  stripePriceId     String
  stripeCurrentPeriodEnd DateTime

  tier              SubscriptionTier
  status            String   // active, canceled, past_due, trialing
  cancelAtPeriodEnd Boolean  @default(false)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([stripeSubscriptionId])
}

model Invoice {
  id              String   @id @default(cuid())
  userId          String

  stripeInvoiceId String   @unique
  amountPaid      Int      // in cents
  currency        String   @default("gbp")
  status          String   // paid, open, void, uncollectible

  invoiceUrl      String?
  pdfUrl          String?

  createdAt       DateTime @default(now())

  @@index([userId])
}

// ================================
// NOTIFICATIONS
// ================================

model Notification {
  id        String   @id @default(cuid())
  userId    String

  type      NotificationType
  title     String
  message   String   @db.Text
  link      String?

  read      Boolean  @default(false)
  readAt    DateTime?

  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
}

enum NotificationType {
  POST_PUBLISHED
  POST_FAILED
  SUBSCRIPTION_UPDATED
  TEAM_INVITE
  LIMIT_REACHED
}

// ================================
// WEBHOOKS & EVENTS
// ================================

model WebhookEvent {
  id          String   @id @default(cuid())
  provider    String   // stripe, instagram, twitter
  eventType   String
  payload     Json
  processed   Boolean  @default(false)
  processedAt DateTime?
  error       String?  @db.Text

  createdAt   DateTime @default(now())

  @@index([provider, eventType])
  @@index([processed])
}

// ================================
// AUDIT LOG
// ================================

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  action      String   // created, updated, deleted
  resource    String   // post, brand, user
  resourceId  String
  changes     Json?
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([resource, resourceId])
  @@index([createdAt])
}
```

### Key Design Decisions

1. **Multi-tenancy**: Support both individual users and organizations
2. **Soft constraints**: Track usage in-memory/cache, enforce in API middleware
3. **Normalized structure**: Avoid data duplication, easy to query
4. **Indexes**: Added on foreign keys and frequently queried fields
5. **Timestamps**: Track creation, updates, and soft deletes
6. **Enum types**: Type-safe status fields
7. **JSON fields**: Flexible for webhooks and audit logs

---

## 3. API Architecture

### RESTful API Structure

```
Base URL: https://api.t21.app/v1

Authentication: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Endpoint Specification

#### Authentication
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/verify-email
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/oauth/:provider
GET    /auth/oauth/:provider/callback
```

#### Users
```
GET    /users/me
PATCH  /users/me
DELETE /users/me
GET    /users/me/usage
GET    /users/me/notifications
PATCH  /users/me/notifications/:id/read
```

#### Brands
```
GET    /brands
POST   /brands
GET    /brands/:id
PATCH  /brands/:id
DELETE /brands/:id
GET    /brands/:id/analytics
```

#### Social Accounts
```
GET    /brands/:brandId/social-accounts
POST   /brands/:brandId/social-accounts
DELETE /brands/:brandId/social-accounts/:id
POST   /brands/:brandId/social-accounts/:id/reconnect
GET    /brands/:brandId/social-accounts/:id/analytics
```

#### Posts
```
GET    /posts
POST   /posts
GET    /posts/:id
PATCH  /posts/:id
DELETE /posts/:id
POST   /posts/:id/publish
POST   /posts/:id/schedule
POST   /posts/:id/duplicate
GET    /posts/calendar?month=2024-01
```

#### AI Content Generation
```
POST   /ai/generate-content
POST   /ai/generate-image-caption
POST   /ai/suggest-hashtags
POST   /ai/improve-content
```

#### Media Library
```
GET    /media
POST   /media/upload
DELETE /media/:id
GET    /media/:id/signed-url
```

#### Organizations (Team Features)
```
GET    /organizations
POST   /organizations
GET    /organizations/:id
PATCH  /organizations/:id
DELETE /organizations/:id
GET    /organizations/:id/members
POST   /organizations/:id/members
PATCH  /organizations/:id/members/:userId
DELETE /organizations/:id/members/:userId
```

#### Subscriptions
```
GET    /subscriptions/plans
POST   /subscriptions/checkout
POST   /subscriptions/portal
GET    /subscriptions/current
PATCH  /subscriptions/cancel
GET    /subscriptions/invoices
```

#### Webhooks (Internal)
```
POST   /webhooks/stripe
POST   /webhooks/instagram
POST   /webhooks/twitter
```

### Example Request/Response

#### POST /posts - Create a new post

**Request:**
```json
{
  "brandId": "clx123abc",
  "content": "Exciting product launch coming next week! Stay tuned for something amazing. #ProductLaunch #Innovation",
  "platforms": ["INSTAGRAM", "TWITTER", "LINKEDIN"],
  "scheduledFor": "2026-01-15T10:00:00Z",
  "imageUrls": ["https://cdn.t21.app/media/abc123.jpg"],
  "hashtags": ["ProductLaunch", "Innovation"],
  "aiGenerated": true,
  "aiPrompt": "Create a teaser post for our upcoming product launch"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "clx456def",
    "brandId": "clx123abc",
    "userId": "clx789ghi",
    "content": "Exciting product launch coming next week! Stay tuned for something amazing. #ProductLaunch #Innovation",
    "platforms": ["INSTAGRAM", "TWITTER", "LINKEDIN"],
    "status": "SCHEDULED",
    "scheduledFor": "2026-01-15T10:00:00Z",
    "imageUrls": ["https://cdn.t21.app/media/abc123.jpg"],
    "hashtags": ["ProductLaunch", "Innovation"],
    "aiGenerated": true,
    "createdAt": "2026-01-11T19:00:00Z",
    "updatedAt": "2026-01-11T19:00:00Z"
  },
  "meta": {
    "creditsUsed": 1,
    "creditsRemaining": 149
  }
}
```

#### POST /ai/generate-content - Generate AI content

**Request:**
```json
{
  "brandId": "clx123abc",
  "prompt": "Create a LinkedIn post about the importance of AI in marketing",
  "platform": "LINKEDIN",
  "tone": "professional",
  "length": "medium",
  "includeHashtags": true
}
```

**Response (200 OK):**
```json
{
  "data": {
    "content": "AI is revolutionizing marketing by enabling personalized customer experiences at scale. From predictive analytics to automated content creation, businesses that embrace AI tools are seeing 3x better engagement rates.\n\nThe future of marketing is here, and it's powered by intelligent automation.",
    "hashtags": ["AIMarketing", "MarketingAutomation", "DigitalTransformation"],
    "model": "anthropic/claude-3-opus",
    "tokensUsed": 156
  },
  "meta": {
    "creditsUsed": 1,
    "creditsRemaining": 148
  }
}
```

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "scheduledFor",
        "message": "Must be a future date"
      }
    ]
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-01-11T19:00:00Z"
  }
}
```

### Standard Error Codes
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Invalid request data
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `QUOTA_EXCEEDED` (403): Plan limits reached
- `INTERNAL_ERROR` (500): Server error

---

## 4. Authentication & Authorization

### Authentication Flow (JWT-based)

```typescript
// 1. User Registration/Login
POST /auth/register
{
  "email": "user@example.com",
  "password": "securePass123",
  "name": "John Doe"
}

// Response
{
  "user": {
    "id": "clx123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",  // 15 min expiry
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...", // 7 days expiry
    "expiresIn": 900
  }
}

// 2. Token Refresh
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// 3. Subsequent API Calls
GET /brands
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### OAuth Social Login Flow

```
1. Frontend redirects to: GET /auth/oauth/google
2. User authenticates with Google
3. Google redirects to: GET /auth/oauth/google/callback?code=xyz
4. Backend exchanges code for tokens
5. Backend creates/updates user
6. Backend redirects to: https://app.t21.app/auth/callback?token=jwt_token
7. Frontend stores token and redirects to dashboard
```

### Authorization Middleware (Express)

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    tier: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Missing authentication token' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, subscriptionTier: true }
    });

    if (!user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' }
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      tier: user.subscriptionTier
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' }
    });
  }
}

// middleware/authorize.ts
export function requirePlan(...allowedTiers: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!allowedTiers.includes(req.user.tier)) {
      return res.status(403).json({
        error: {
          code: 'QUOTA_EXCEEDED',
          message: `This feature requires ${allowedTiers.join(' or ')} plan`
        }
      });
    }

    next();
  };
}

// Usage in routes
app.get('/brands', authenticate, async (req, res) => {
  // User is authenticated, req.user available
});

app.post('/ai/generate', authenticate, requirePlan('PRO', 'BUSINESS'), async (req, res) => {
  // Only PRO and BUSINESS users can access
});
```

### Usage Limits Enforcement

```typescript
// middleware/quota.ts
import { redis } from '../lib/redis';

const LIMITS = {
  FREE: { brands: 3, posts: 30, aiCredits: 10 },
  PRO: { brands: 10, posts: 150, aiCredits: 100 },
  BUSINESS: { brands: 999, posts: 1000, aiCredits: 500 }
};

export async function checkQuota(resource: 'brands' | 'posts' | 'aiCredits') {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const tier = req.user!.tier;
    const limit = LIMITS[tier as keyof typeof LIMITS][resource];

    // Check current usage (cached in Redis for performance)
    const cacheKey = `quota:${userId}:${resource}`;
    let current = await redis.get(cacheKey);

    if (!current) {
      // Fetch from database and cache
      if (resource === 'brands') {
        current = await prisma.brand.count({ where: { userId } });
      } else if (resource === 'posts') {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { postsThisMonth: true }
        });
        current = user?.postsThisMonth || 0;
      }
      await redis.set(cacheKey, current, 'EX', 3600); // 1 hour cache
    }

    if (Number(current) >= limit) {
      return res.status(403).json({
        error: {
          code: 'QUOTA_EXCEEDED',
          message: `${resource} limit reached. Upgrade to increase limits.`,
          details: { current, limit }
        }
      });
    }

    next();
  };
}

// Usage
app.post('/brands', authenticate, checkQuota('brands'), async (req, res) => {
  // Create brand if under quota
});
```

---

## 5. Infrastructure & Deployment

### Recommended Architecture (Option A: Railway)

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare CDN                          │
│                   (Free tier + caching)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐            ┌─────────▼────────┐
│  Frontend        │            │  Backend API     │
│  (Vercel/CF)     │            │  (Railway)       │
│  React + Vite    │            │  Node.js + TS    │
└──────────────────┘            └─────────┬────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
          ┌─────────▼────────┐  ┌─────────▼────────┐  ┌────────▼───────┐
          │  PostgreSQL      │  │  Redis           │  │  BullMQ        │
          │  (Railway)       │  │  (Railway)       │  │  (Railway)     │
          │  - Main DB       │  │  - Cache         │  │  - Job Queue   │
          │  - Auto backups  │  │  - Rate limiting │  │  - Scheduling  │
          └──────────────────┘  └──────────────────┘  └────────────────┘
                    │
          ┌─────────▼────────┐
          │  Cloudflare R2   │
          │  - Media storage │
          │  - $0.015/GB     │
          └──────────────────┘

External Services:
- Stripe (payments)
- Resend (emails)
- Sentry (monitoring)
- OpenRouter (AI)
```

### Recommended Architecture (Option B: Supabase - Simpler)

```
┌──────────────────────────────────────────────────────────────┐
│                     Supabase Platform                         │
│  ┌────────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL    │  │  Auth        │  │  Storage     │     │
│  │  (Managed)     │  │  (Built-in)  │  │  (Built-in)  │     │
│  └────────────────┘  └──────────────┘  └──────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Edge Functions (Deno)                             │     │
│  │  - API endpoints                                   │     │
│  │  - Webhooks                                        │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
          ┌─────────▼────────┐  ┌───────▼──────┐
          │  Redis Cloud     │  │  BullMQ      │
          │  (Upstash)       │  │  (Render)    │
          │  Free tier: 10k  │  │  Worker      │
          │  commands/day    │  │              │
          └──────────────────┘  └──────────────┘
```

### Deployment Configuration

#### Docker Setup (for Railway/Render)

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

#### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/t21
DATABASE_POOL_SIZE=10

# Redis
REDIS_URL=redis://default:pass@host:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-secret-key-for-refresh
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_BUSINESS=price_xxx

# Storage
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=t21-media
R2_PUBLIC_URL=https://media.t21.app

# AI
OPENROUTER_API_KEY=sk-or-xxx

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@t21.app

# Social Media APIs
INSTAGRAM_CLIENT_ID=xxx
INSTAGRAM_CLIENT_SECRET=xxx
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
NODE_ENV=production
```

### Background Jobs Setup (BullMQ)

```typescript
// workers/post-publisher.ts
import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { prisma } from '../lib/prisma';
import { publishToInstagram, publishToTwitter } from '../services/social';

const connection = new Redis(process.env.REDIS_URL!);

export const postQueue = new Queue('post-publishing', { connection });

// Worker that processes scheduled posts
const worker = new Worker(
  'post-publishing',
  async (job) => {
    const { postId, platform } = job.data;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { brand: true, socialPosts: true }
    });

    if (!post) throw new Error('Post not found');

    // Update status
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'PUBLISHING' }
    });

    try {
      let platformPostId: string;

      if (platform === 'INSTAGRAM') {
        platformPostId = await publishToInstagram(post);
      } else if (platform === 'TWITTER') {
        platformPostId = await publishToTwitter(post);
      }
      // ... other platforms

      // Update success
      await prisma.socialPost.update({
        where: { id: post.socialPosts[0].id },
        data: {
          status: 'PUBLISHED',
          platformPostId,
          publishedAt: new Date()
        }
      });

      await prisma.post.update({
        where: { id: postId },
        data: { status: 'PUBLISHED', publishedAt: new Date() }
      });

      return { success: true, platformPostId };
    } catch (error) {
      // Handle failure
      await prisma.post.update({
        where: { id: postId },
        data: { status: 'FAILED' }
      });

      throw error;
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

// Schedule posts
export async function schedulePost(postId: string, scheduledFor: Date) {
  await postQueue.add(
    'publish-post',
    { postId },
    {
      delay: scheduledFor.getTime() - Date.now(),
      attempts: 3,
      backoff: { type: 'exponential', delay: 60000 }
    }
  );
}
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Deploy to Railway
        uses: railwayapp/railway-deploy@v1
        with:
          service: backend
          environment: production
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 6. Security Considerations

### 1. Authentication Security
- **Password Hashing**: bcrypt with 12 rounds
- **JWT Secrets**: 256-bit cryptographically random keys
- **Token Expiry**: Short-lived access tokens (15min), refresh tokens (7 days)
- **Refresh Token Rotation**: Issue new refresh token on each refresh
- **OAuth**: Use PKCE flow for additional security

### 2. API Security
```typescript
// Rate limiting (per user)
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each user to 100 requests per windowMs
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    });
  }
});

app.use('/api/', limiter);
```

### 3. Input Validation
```typescript
import { z } from 'zod';

const createPostSchema = z.object({
  brandId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  platforms: z.array(z.enum(['INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'FACEBOOK'])),
  scheduledFor: z.string().datetime().optional(),
  imageUrls: z.array(z.string().url()).max(10).optional()
});

app.post('/posts', authenticate, async (req, res) => {
  try {
    const validated = createPostSchema.parse(req.body);
    // Process request
  } catch (error) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.errors
      }
    });
  }
});
```

### 4. SQL Injection Prevention
- Prisma ORM handles parameterization automatically
- Never use raw SQL with user input
- If raw SQL needed, use `prisma.$queryRaw` with tagged templates

### 5. XSS Prevention
- Sanitize user input before storage
- Frontend framework (React) escapes by default
- Use Content Security Policy headers

### 6. CORS Configuration
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://t21.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 7. Secrets Management
- Never commit secrets to Git
- Use environment variables
- Rotate secrets regularly (especially OAuth tokens)
- Encrypt OAuth tokens in database:

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 8. Webhook Signature Verification
```typescript
// Stripe webhook verification
import Stripe from 'stripe';

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Process event
    handleStripeEvent(event);

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

### 9. HTTPS Only
- Force HTTPS in production
- Use HSTS headers
- Secure cookies (httpOnly, secure, sameSite)

```typescript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// Set security headers
import helmet from 'helmet';
app.use(helmet());
```

---

## 7. Scaling Strategy

### Phase 1: MVP (0-1,000 users)
**Infrastructure:**
- Single Railway instance (4GB RAM)
- PostgreSQL (10GB storage)
- Redis (256MB)
- Cloudflare R2 (pay-as-you-go)

**Cost:** ~$20-50/month

**Bottleneck:** None expected

---

### Phase 2: Growth (1,000-10,000 users)
**Optimizations:**
1. **Database:**
   - Add read replicas for analytics queries
   - Implement connection pooling (PgBouncer)
   - Add database indexes for slow queries

2. **Caching:**
   - Cache frequently accessed data (brands, user profiles)
   - Use Redis for session storage
   - CDN caching for media files

3. **API:**
   - Implement request coalescing for AI calls
   - Background processing for heavy operations

**Infrastructure:**
- Scale to 2-3 Railway instances (horizontal scaling)
- PostgreSQL with read replica
- Redis 512MB
- CDN for static assets

**Cost:** ~$100-200/month

---

### Phase 3: Scale (10,000-100,000 users)
**Optimizations:**
1. **Database Sharding:**
   - Shard by userId or organizationId
   - Use Citus or manual sharding

2. **Microservices Split:**
   - Separate services: Auth, Content, Publishing, Analytics
   - API Gateway (Kong or AWS API Gateway)

3. **Queue Management:**
   - Dedicated BullMQ workers per service
   - Priority queues for time-sensitive posts

4. **Caching Strategy:**
   - Multi-layer cache (L1: in-memory, L2: Redis, L3: DB)
   - Cache warming for popular content

**Infrastructure:**
- Kubernetes cluster or Railway auto-scaling
- PostgreSQL cluster with Citus
- Redis Cluster
- Separate worker nodes

**Cost:** ~$500-1,000/month

---

### Performance Targets
- API response time: <200ms (p95)
- Post publishing latency: <5 seconds
- AI generation: <10 seconds
- Database query time: <50ms (p95)
- Uptime: 99.9%

---

## 8. Cost Analysis

### Monthly Cost Breakdown

#### Tier 1: MVP (0-1,000 users)
| Service | Provider | Cost |
|---------|----------|------|
| Backend Hosting | Railway (Starter) | $5 |
| PostgreSQL | Railway (10GB) | $5 |
| Redis | Upstash (Free tier) | $0 |
| File Storage | Cloudflare R2 (100GB) | $1.50 |
| Frontend Hosting | Vercel (Free) | $0 |
| Email | Resend (3k emails/mo) | $0 |
| Monitoring | Sentry (Free tier) | $0 |
| Domain | Cloudflare | $10/year |
| **Total** | | **~$15/month** |

#### Tier 2: Growth (1,000-10,000 users)
| Service | Provider | Cost |
|---------|----------|------|
| Backend Hosting | Railway (Pro, 2 instances) | $40 |
| PostgreSQL | Railway (100GB + replica) | $40 |
| Redis | Upstash (512MB) | $10 |
| File Storage | Cloudflare R2 (500GB) | $7.50 |
| Frontend Hosting | Vercel (Pro) | $20 |
| Email | Resend (50k emails/mo) | $20 |
| Monitoring | Sentry (Team) | $26 |
| **Total** | | **~$165/month** |

#### Tier 3: Scale (10,000+ users)
| Service | Provider | Cost |
|---------|----------|------|
| Backend Hosting | Railway/K8s (5 instances) | $200 |
| PostgreSQL | Supabase Pro (Citus) | $100 |
| Redis | Redis Cloud (2GB) | $50 |
| File Storage | Cloudflare R2 (5TB) | $75 |
| Frontend Hosting | Vercel (Pro) | $20 |
| Email | Resend (500k emails/mo) | $100 |
| Monitoring | Sentry + Better Stack | $75 |
| AI API | OpenRouter (passthrough) | $0* |
| **Total** | | **~$620/month** |

*Note: AI costs passed to users via usage-based billing

---

### Revenue Projections vs Costs

#### Scenario: 1,000 paying users
- **Free users**: 500 (0 revenue)
- **Pro users (£7/mo)**: 400 = £2,800/mo
- **Business users (£35/mo)**: 100 = £3,500/mo
- **Total Revenue**: £6,300/mo (~$8,000/mo)
- **Infrastructure Cost**: ~$165/mo
- **Gross Margin**: **~98%** (excluding AI passthrough costs)

#### Scenario: 10,000 paying users
- **Free users**: 5,000 (0 revenue)
- **Pro users**: 4,000 = £28,000/mo
- **Business users**: 1,000 = £35,000/mo
- **Total Revenue**: £63,000/mo (~$80,000/mo)
- **Infrastructure Cost**: ~$620/mo
- **Gross Margin**: **~99%**

**Key Insight**: SaaS business model with managed infrastructure = extremely high margins

---

## Implementation Roadmap

### Phase 1: Core Backend (Weeks 1-3)
1. Set up Railway project + PostgreSQL
2. Initialize Express.js + TypeScript + Prisma
3. Implement authentication (email + OAuth)
4. Create basic CRUD endpoints (Users, Brands, Posts)
5. Set up Stripe subscription webhooks
6. Deploy to production

### Phase 2: Content Engine (Weeks 4-6)
1. Integrate OpenRouter API for AI generation
2. Implement media upload to Cloudflare R2
3. Build post scheduling logic
4. Set up BullMQ for background jobs
5. Create social media OAuth flows (start with 1 platform)

### Phase 3: Publishing System (Weeks 7-8)
1. Implement Instagram/Twitter publishing
2. Add retry logic and error handling
3. Build webhook receivers for platform callbacks
4. Create analytics data collection

### Phase 4: Polish & Launch (Weeks 9-10)
1. Add remaining social platforms
2. Implement team/organization features
3. Build admin dashboard
4. Set up monitoring and alerts
5. Load testing and optimization
6. Documentation and API reference

---

## Next Steps

1. **Choose Infrastructure**: Railway (recommended for simplicity) or Supabase
2. **Set up Repository**: Initialize backend project with TypeScript + Prisma
3. **Database Setup**: Apply Prisma schema and run migrations
4. **Core API**: Implement authentication and basic endpoints
5. **Frontend Integration**: Update React app to call real APIs
6. **Stripe Integration**: Set up real payment processing
7. **Deploy**: Push to production and test end-to-end

---

## Additional Resources

### Code Templates
I can provide complete implementations for:
- Express.js server setup with TypeScript
- Prisma schema and migrations
- Authentication middleware
- Stripe webhook handlers
- Social media OAuth flows
- BullMQ job processors
- API route handlers

### Architecture Diagrams
- Sequence diagrams for key flows (auth, payment, publishing)
- Database ERD
- Infrastructure topology
- CI/CD pipeline

Let me know which specific implementations you'd like to see first, and I'll generate production-ready code!
