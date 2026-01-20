# 🏗️ POSTAIFY Infrastructure Guide

**Your Complete Backend Architecture & Learning Resource**

Click any section to expand and learn more.

---

## 📊 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / FRONTEND                         │
│                     (React / Next.js App)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS Requests
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    🔒 AUTHENTICATION LAYER                       │
│                    Clerk (User Management)                       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ JWT Tokens
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    🛡️ EXPRESS.JS BACKEND                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Rate Limiter │  │  Middleware  │  │   API Routes │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────┬────────────────┬────────────────┬────────────────┬─────┘
        │                │                │                │
        ↓                ↓                ↓                ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  🗄️ DATABASE │  │  🔴 REDIS    │  │  ☁️ STORAGE  │  │  🤖 AI APIs  │
│  PostgreSQL  │  │  Job Queues  │  │  Cloudflare  │  │  OpenRouter  │
│  (Neon)      │  │  + Cache     │  │  R2          │  │  Fal.ai      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 📁 Project File Structure

<details>
<summary><strong>📂 Click to see complete file structure</strong></summary>

```
D:\p1\POSTAIFY\backend\
│
├── 📄 package.json              # Dependencies & scripts
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 .env                      # Environment variables (secrets)
├── 📄 .env.example              # Template for .env
│
├── 📁 prisma/
│   ├── schema.prisma            # Database schema definition
│   └── migrations/              # Database version history
│
├── 📁 src/
│   │
│   ├── 📄 index.ts              # ⭐ Main entry point (starts server)
│   │
│   ├── 📁 config/
│   │   └── env.ts               # Environment variable validation
│   │
│   ├── 📁 lib/
│   │   ├── prisma.ts            # Database connection
│   │   ├── redis.ts             # Redis connection manager
│   │   ├── queue.ts             # Job queue system (BullMQ)
│   │   └── fetchWithTimeout.ts  # HTTP timeout wrapper
│   │
│   ├── 📁 middleware/
│   │   ├── auth.ts              # Clerk authentication
│   │   ├── rateLimit.ts         # Rate limiting protection
│   │   ├── quota.ts             # Usage limits per plan
│   │   ├── validate.ts          # Request validation
│   │   └── errorHandler.ts     # Global error handler
│   │
│   ├── 📁 routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── users.ts             # User endpoints
│   │   ├── brands.ts            # Brand management
│   │   ├── posts.ts             # Post CRUD
│   │   ├── ai.ts                # AI generation
│   │   ├── images.ts            # Image generation
│   │   ├── voice.ts             # Voice/TTS
│   │   ├── telegram.ts          # Telegram integration
│   │   ├── subscriptions.ts     # Stripe subscriptions
│   │   └── webhooks/            # External service hooks
│   │       ├── clerk.ts         # User sync
│   │       ├── stripe.ts        # Payment events
│   │       └── telegram.ts      # Bot updates
│   │
│   ├── 📁 services/
│   │   ├── openrouter.ts        # AI text generation
│   │   ├── fal.ts               # AI image generation
│   │   ├── elevenlabs.ts        # Text-to-speech
│   │   ├── telegram.ts          # Telegram bot API
│   │   ├── stripe.ts            # Payment processing
│   │   └── storage.ts           # Cloudflare R2 uploads
│   │
│   ├── 📁 workers/
│   │   └── scheduler.ts         # Background job scheduler
│   │
│   ├── 📁 schemas/
│   │   └── *.ts                 # Zod validation schemas
│   │
│   └── 📁 types/
│       └── *.ts                 # TypeScript type definitions
│
└── 📁 dist/                     # Compiled JavaScript (build output)
```

</details>

---

## 🎯 Core Technologies

### <details><summary><strong>🟢 Node.js & Express.js (Backend Framework)</strong></summary>

**What it is:**
- **Node.js:** JavaScript runtime that lets you run JavaScript on the server
- **Express.js:** Web framework for Node.js that handles HTTP requests

**What it does in your project:**
- Receives HTTP requests from frontend (GET, POST, PUT, DELETE)
- Routes requests to correct handlers (e.g., `/api/v1/posts` → posts.ts)
- Processes business logic (create post, generate AI content, etc.)
- Sends responses back to frontend

**File location:** `src/index.ts` (main entry point)

**Key concepts:**
```javascript
// 1. Create Express app
const app = express()

// 2. Add middleware (runs before routes)
app.use(helmet())           // Security headers
app.use(compression())      // Compress responses
app.use(cors())             // Allow cross-origin requests

// 3. Define routes
app.get('/api/v1/posts', getAllPosts)      // GET = read
app.post('/api/v1/posts', createPost)      // POST = create
app.put('/api/v1/posts/:id', updatePost)   // PUT = update
app.delete('/api/v1/posts/:id', deletePost) // DELETE = delete

// 4. Start server
app.listen(3001, () => console.log('Server running on port 3001'))
```

**Learn more:**
- Node.js: https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
- Express.js: https://expressjs.com/en/starter/hello-world.html
- REST API: https://restfulapi.net/

</details>

### <details><summary><strong>📘 TypeScript (Programming Language)</strong></summary>

**What it is:**
- JavaScript with **type safety** (catches bugs before runtime)
- Compiles to regular JavaScript

**Why you use it:**
- Prevents bugs: `function add(a: number, b: number)` won't accept strings
- Better autocomplete in VS Code
- Self-documenting code (types explain what functions expect)

**Example:**
```typescript
// Without TypeScript (JavaScript)
function createPost(data) {
  // What is 'data'? What properties does it have? 🤷
  return data.title.toUpperCase()  // Could crash if title doesn't exist
}

// With TypeScript
interface PostData {
  title: string
  content: string
  platform: 'twitter' | 'linkedin' | 'instagram'
}

function createPost(data: PostData) {
  // TypeScript knows exactly what 'data' contains ✅
  // If you forget a property, TypeScript errors before running
  return data.title.toUpperCase()
}
```

**Your project:**
- All files use `.ts` extension
- Build command: `npm run build` (compiles TypeScript → JavaScript)
- Output folder: `dist/` (contains compiled JavaScript)

**Learn more:**
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- TypeScript in 5 minutes: https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html

</details>

### <details><summary><strong>🗄️ PostgreSQL & Neon (Database)</strong></summary>

**What it is:**
- **PostgreSQL:** Powerful open-source relational database (stores data in tables)
- **Neon:** Serverless PostgreSQL hosting (cloud-based, auto-scaling)

**What it stores:**
```sql
Users Table:
┌────────┬────────────────┬──────────────┬─────────┐
│ id     │ email          │ name         │ plan    │
├────────┼────────────────┼──────────────┼─────────┤
│ usr_1  │ john@email.com │ John Doe     │ PRO     │
│ usr_2  │ jane@email.com │ Jane Smith   │ FREE    │
└────────┴────────────────┴──────────────┴─────────┘

Posts Table:
┌────────┬──────────────────────────┬──────────┬─────────┐
│ id     │ content                  │ userId   │ status  │
├────────┼──────────────────────────┼──────────┼─────────┤
│ post_1 │ "Check out this..."      │ usr_1    │ DRAFT   │
│ post_2 │ "Amazing product..."     │ usr_1    │ PUBLISHED│
└────────┴──────────────────────────┴──────────┴─────────┘
```

**Your setup:**
- **Host:** Neon (https://neon.tech)
- **Region:** EU Central (Frankfurt)
- **Connection Pool:** 25 concurrent connections
- **Database:** `neondb`

**Connection string (in .env):**
```
DATABASE_URL=postgresql://user:password@host/database?connection_limit=25
```

**Why Neon over regular PostgreSQL?**
- ✅ Serverless (auto-scales, pay for what you use)
- ✅ Instant branching (create dev/staging copies)
- ✅ Built-in connection pooling
- ✅ Automatic backups
- ✅ Free tier: 0.5GB storage, 100 hours compute/month

**Common operations:**
```sql
-- Create a user
INSERT INTO "User" (email, name, plan) VALUES ('user@email.com', 'Name', 'FREE');

-- Get all posts for a user
SELECT * FROM "Post" WHERE "userId" = 'usr_1';

-- Update subscription
UPDATE "User" SET plan = 'PRO' WHERE id = 'usr_1';

-- Delete a post
DELETE FROM "Post" WHERE id = 'post_1';
```

**Learn more:**
- PostgreSQL Tutorial: https://www.postgresqltutorial.com/
- Neon Docs: https://neon.tech/docs/introduction
- SQL in 100 seconds: https://www.youtube.com/watch?v=zsjvFFKOm3c

</details>

### <details><summary><strong>🔷 Prisma ORM (Database Interface)</strong></summary>

**What it is:**
- **ORM:** Object-Relational Mapping (write TypeScript instead of SQL)
- Translates your code to SQL queries automatically

**File location:** `prisma/schema.prisma`

**Instead of writing SQL:**
```sql
SELECT * FROM "User" WHERE email = 'john@email.com';
```

**You write TypeScript:**
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'john@email.com' }
})
```

**Your Prisma Schema:**
```prisma
// Define your database structure
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String
  plan              Plan     @default(FREE)
  postsThisMonth    Int      @default(0)

  // Relations
  posts             Post[]   // One user has many posts
  brands            Brand[]

  @@index([email])  // Speed up lookups by email
}

model Post {
  id          String      @id @default(cuid())
  content     String
  platform    Platform
  status      PostStatus  @default(DRAFT)

  // Foreign key
  userId      String
  user        User        @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([status])
}
```

**Prisma Client (your code):**
```typescript
// Create a post
const post = await prisma.post.create({
  data: {
    content: "Hello world",
    platform: "TWITTER",
    userId: "usr_123"
  }
})

// Get user with all their posts
const user = await prisma.user.findUnique({
  where: { id: "usr_123" },
  include: { posts: true }  // Include related posts
})

// Update post status
await prisma.post.update({
  where: { id: "post_456" },
  data: { status: "PUBLISHED" }
})

// Count posts per user
const count = await prisma.post.count({
  where: { userId: "usr_123" }
})
```

**Prisma Commands:**
```bash
# Generate TypeScript client from schema
npm run prisma:generate

# Create migration (update database structure)
npm run prisma:migrate

# Open visual database browser
npm run prisma:studio

# Reset database (DEV ONLY!)
npx prisma migrate reset
```

**Why Prisma?**
- ✅ Type-safe (autocomplete for queries)
- ✅ Auto-generated TypeScript types
- ✅ Migration system (version control for database)
- ✅ Visual database browser (Prisma Studio)
- ✅ Prevents SQL injection attacks

**Learn more:**
- Prisma Quickstart: https://www.prisma.io/docs/getting-started/quickstart
- Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Video: https://www.youtube.com/watch?v=RebA5J-rlwg

</details>

### <details><summary><strong>🔴 Redis (In-Memory Database & Queue)</strong></summary>

**What it is:**
- Super-fast **in-memory** database (stores data in RAM, not disk)
- Key-value store: `SET user:123 "John"` → `GET user:123` returns "John"

**What you use it for:**

#### 1. Job Queues (BullMQ)
```
User clicks "Generate Post"
    ↓
Backend adds job to Redis queue
    ↓
Backend responds immediately: "Generating..."
    ↓
Worker picks up job from queue
    ↓
Worker calls OpenRouter API (takes 10-30 seconds)
    ↓
Worker saves result to database
    ↓
Frontend polls for completion
```

#### 2. Caching (future use)
```typescript
// Check cache first (fast)
const cachedPosts = await redis.get('user:123:posts')
if (cachedPosts) return JSON.parse(cachedPosts)

// If not cached, query database (slower)
const posts = await prisma.post.findMany({ where: { userId: '123' }})

// Save to cache for next time
await redis.set('user:123:posts', JSON.stringify(posts), 'EX', 300) // 5 min expiry
```

**Your setup:**
- **Host:** Redis Cloud (https://redis.com)
- **Region:** EU West (Belgium) - close to your Neon DB
- **Memory:** 30MB free tier
- **Connection:** `redis://default:password@host:port`

**Your queues:**
```typescript
// Three separate queues
QUEUE_NAMES = {
  AI_GENERATION: 'ai-generation',      // Text generation jobs
  IMAGE_GENERATION: 'image-generation', // Image creation jobs
  TELEGRAM_DELIVERY: 'telegram-delivery' // Scheduled post delivery
}
```

**How a job flows:**
```typescript
// 1. Add job to queue (src/lib/queue.ts)
await addJob('AI_GENERATION', {
  prompt: "Generate a LinkedIn post about AI",
  userId: "usr_123"
})

// 2. Worker picks it up (src/workers/scheduler.ts)
createWorker('AI_GENERATION', async (job) => {
  const { prompt, userId } = job.data

  // Do expensive work
  const result = await openRouter.generate(prompt)

  // Save result
  await prisma.post.create({ data: { content: result, userId }})

  return { success: true }
})

// 3. If it fails, auto-retry (3 attempts with backoff)
// Retry 1: immediately
// Retry 2: after 1 second
// Retry 3: after 2 seconds
```

**Why Redis?**
- ✅ **Super fast:** 100,000+ ops/second (vs PostgreSQL ~1,000 ops/sec)
- ✅ **Job persistence:** Jobs survive server restarts
- ✅ **Retry logic:** Failed jobs automatically retry
- ✅ **Concurrency control:** Process N jobs at once
- ✅ **Priority queues:** Important jobs processed first

**Redis vs PostgreSQL:**
```
PostgreSQL (Persistent):
- Stores on disk
- Survives restarts
- Slower (disk I/O)
- Complex queries (JOIN, WHERE, etc.)
- Use for: User data, posts, relationships

Redis (In-Memory):
- Stores in RAM
- Ultra-fast
- Simple key-value
- Use for: Caching, queues, rate limiting, sessions
```

**Learn more:**
- Redis in 100 seconds: https://www.youtube.com/watch?v=G1rOthIU-uo
- Redis University: https://university.redis.com/
- BullMQ Docs: https://docs.bullmq.io/

</details>

### <details><summary><strong>🔐 Clerk (Authentication & User Management)</strong></summary>

**What it is:**
- Authentication-as-a-Service (handles login, signup, sessions)
- Like "Sign in with Google" but for your entire auth system

**What it provides:**
- ✅ Sign up / Sign in UI (pre-built)
- ✅ Email verification
- ✅ Password reset
- ✅ OAuth (Google, GitHub, etc.)
- ✅ Multi-factor authentication
- ✅ Session management
- ✅ User management dashboard

**How it works:**

```
1. User visits your frontend
   ↓
2. Clicks "Sign In"
   ↓
3. Clerk modal appears (handled by Clerk)
   ↓
4. User enters email/password
   ↓
5. Clerk verifies and creates session
   ↓
6. Clerk returns JWT token
   ↓
7. Frontend stores token
   ↓
8. Every API request includes token in header
   ↓
9. Backend verifies token with Clerk
   ↓
10. If valid, process request. If not, return 401 Unauthorized
```

**Your implementation:**

**Backend (src/middleware/auth.ts):**
```typescript
import { clerkAuth } from '@clerk/express'

// Verify JWT token
app.use(clerkAuth)

// Require authentication
export async function requireAuthentication(req, res, next) {
  if (!req.auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Load user from database
export async function loadUser(req, res, next) {
  const user = await prisma.user.findUnique({
    where: { clerkId: req.auth.userId }
  })
  req.user = user
  next()
}
```

**Protected route:**
```typescript
// Anyone can access
app.get('/api/v1/posts/public', getPublicPosts)

// Must be logged in
app.get('/api/v1/posts', requireAuthentication, loadUser, getUserPosts)
//                        ↑ Checks token    ↑ Loads user from DB
```

**Webhooks (src/routes/webhooks/clerk.ts):**
Clerk sends events when users sign up/update/delete:
```typescript
// When user signs up in Clerk → Create in your database
'user.created': async (data) => {
  await prisma.user.create({
    data: {
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      plan: 'FREE'
    }
  })
}

// When user updates profile → Sync to your database
'user.updated': async (data) => {
  await prisma.user.update({
    where: { clerkId: data.id },
    data: { email: data.email_addresses[0].email_address }
  })
}
```

**Environment variables:**
```bash
# Public key (safe to expose to frontend)
CLERK_PUBLISHABLE_KEY=pk_test_...

# Secret key (NEVER expose, backend only)
CLERK_SECRET_KEY=sk_test_...

# Webhook signature (verify webhook requests)
CLERK_WEBHOOK_SECRET=whsec_...
```

**Why Clerk?**
- ✅ No password storage (Clerk handles it)
- ✅ Security best practices built-in
- ✅ 5 minutes to implement vs weeks of custom auth
- ✅ Free tier: 10,000 monthly active users
- ✅ GDPR compliant

**Learn more:**
- Clerk Docs: https://clerk.com/docs
- Authentication basics: https://www.youtube.com/watch?v=UBUNrFtufWo
- JWT explained: https://jwt.io/introduction

</details>

### <details><summary><strong>💳 Stripe (Payments & Subscriptions)</strong></summary>

**What it is:**
- Payment processing platform (accepts credit cards, manages subscriptions)

**Your subscription plans:**
```javascript
FREE:     $0/month   - 20 posts/month
PRO:      $19/month  - 1,000 posts/month
BUSINESS: $99/month  - 90,000 posts/month
```

**Payment flow:**

```
1. User clicks "Upgrade to PRO"
   ↓
2. Frontend calls your API: POST /api/v1/subscriptions/create-checkout
   ↓
3. Backend creates Stripe Checkout Session
   ↓
4. User redirected to Stripe payment page
   ↓
5. User enters card details (Stripe handles this securely)
   ↓
6. Payment processed
   ↓
7. Stripe webhook fires: "checkout.session.completed"
   ↓
8. Your backend receives webhook
   ↓
9. Update user's plan in database
   ↓
10. User redirected back to your app with success message
```

**Your implementation (src/services/stripe.ts):**
```typescript
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Create checkout session
export async function createCheckoutSession(userId: string, plan: 'PRO' | 'BUSINESS') {
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    mode: 'subscription',
    line_items: [{
      price: plan === 'PRO' ? 'price_123...' : 'price_456...',
      quantity: 1
    }],
    success_url: 'https://yourapp.com/success',
    cancel_url: 'https://yourapp.com/pricing'
  })

  return session.url  // Redirect user here
}
```

**Webhooks (src/routes/webhooks/stripe.ts):**
```typescript
// When payment succeeds → Upgrade user
'checkout.session.completed': async (session) => {
  await prisma.user.update({
    where: { email: session.customer_email },
    data: {
      plan: 'PRO',
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription
    }
  })
}

// When subscription cancelled → Downgrade user
'customer.subscription.deleted': async (subscription) => {
  await prisma.user.update({
    where: { stripeSubscriptionId: subscription.id },
    data: { plan: 'FREE' }
  })
}

// When payment fails → Notify user
'invoice.payment_failed': async (invoice) => {
  // Send email to user
}
```

**Testing (before going live):**
```bash
# Test card numbers (Stripe provides these)
4242 4242 4242 4242  # Success
4000 0000 0000 9995  # Declined
4000 0025 0000 3155  # Requires 3D Secure
```

**Why Stripe?**
- ✅ Handles PCI compliance (you never touch card data)
- ✅ Recurring billing automatic
- ✅ Handles failed payments & retries
- ✅ Customer portal (users manage own subscriptions)
- ✅ Free tier: No monthly fee, just transaction % (2.9% + $0.30)

**Learn more:**
- Stripe Docs: https://stripe.com/docs
- Payments 101: https://www.youtube.com/watch?v=1r-F3FIONl8
- Testing guide: https://stripe.com/docs/testing

</details>

### <details><summary><strong>☁️ Cloudflare R2 (File Storage)</strong></summary>

**What it is:**
- Object storage (like AWS S3, but cheaper)
- Store images, videos, files, etc.

**What you store:**
- Generated images (from Fal.ai)
- Voice recordings (from ElevenLabs)
- User uploads
- Profile pictures

**How it works:**
```
1. User generates image
   ↓
2. Fal.ai returns image URL
   ↓
3. Backend downloads image to memory (Buffer)
   ↓
4. Upload to Cloudflare R2
   ↓
5. Get public URL
   ↓
6. Save URL to database
   ↓
7. Return URL to frontend
   ↓
8. Frontend displays image from R2 URL
```

**Your implementation (src/services/storage.ts):**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// R2 is S3-compatible (same API)
const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export async function uploadImage(buffer: Buffer, contentType: string) {
  const key = `images/${Date.now()}-${Math.random().toString(36)}.jpg`

  await client.send(new PutObjectCommand({
    Bucket: 't21-media',
    Key: key,
    Body: buffer,
    ContentType: contentType
  }))

  // Return public URL
  return `https://pub-cf1dae4d1cd54383b6a6e8a721f6065f.r2.dev/${key}`
}
```

**File organization:**
```
your-bucket/
├── images/
│   ├── 1234567890-abc123.jpg
│   ├── 1234567891-def456.png
│   └── ...
├── audio/
│   ├── voice-recording-123.mp3
│   └── ...
└── uploads/
    └── ...
```

**R2 vs S3 vs Google Cloud Storage:**
```
AWS S3:
- $0.023/GB storage
- $0.09/GB egress (bandwidth OUT)
- Most popular

Cloudflare R2:
- $0.015/GB storage
- $0.00/GB egress (FREE!) ← Why you use it
- Great for public files (images, videos)

Google Cloud Storage:
- Similar pricing to S3
- Better for Google Cloud ecosystem
```

**Your costs (estimated):**
```
Storage: 10GB × $0.015 = $0.15/month
Egress: 100GB × $0.00 = $0.00/month (FREE!)
Total: ~$0.15/month

(Same on S3: 10GB storage + 100GB egress = $9.23/month!)
```

**Why R2?**
- ✅ Zero egress fees (serve unlimited images for free)
- ✅ S3-compatible (easy migration if needed)
- ✅ Cloudflare CDN built-in (fast worldwide)
- ✅ Free tier: 10GB storage, unlimited egress

**Learn more:**
- R2 Docs: https://developers.cloudflare.com/r2/
- Object storage explained: https://www.youtube.com/watch?v=bXnFQc7rE7U

</details>

---

## 🤖 External AI Services

### <details><summary><strong>🧠 OpenRouter (AI Text Generation)</strong></summary>

**What it is:**
- Gateway to 100+ AI models (GPT-4, Claude, Llama, Mistral, etc.)
- One API, many models
- Pay-per-token pricing

**What you use it for:**
- Generate social media posts from video transcripts
- Rewrite content in different tones
- Create captions
- Optimize text for voiceovers

**Your implementation (src/services/openrouter.ts):**
```typescript
export async function generatePostsFromTranscript(
  transcript: string,
  options: {
    platform: 'twitter' | 'linkedin' | 'instagram',
    numberOfPosts: number,
    style: 'professional' | 'casual' | 'witty'
  }
) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-sonnet',  // Your model choice
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert...'
        },
        {
          role: 'user',
          content: `Generate ${numberOfPosts} ${style} posts for ${platform}:\n\n${transcript}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.9  // Higher = more creative
    })
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)  // Returns array of posts
}
```

**Models you can use:**
```
Cheapest:
- google/gemini-flash-1.5: $0.075 / 1M tokens
- meta/llama-3.1-8b: $0.06 / 1M tokens

Best Quality:
- anthropic/claude-3.5-sonnet: $3.00 / 1M tokens
- openai/gpt-4-turbo: $10.00 / 1M tokens

Balanced (what you probably use):
- anthropic/claude-3-haiku: $0.25 / 1M tokens
- openai/gpt-3.5-turbo: $0.50 / 1M tokens
```

**Cost example:**
```
Typical post generation:
- Input: 2,000 tokens (your video transcript)
- Output: 500 tokens (5 posts × 100 tokens each)
- Total: 2,500 tokens = 0.0025M tokens

Using Claude 3.5 Sonnet:
0.0025M × $3.00 = $0.0075 per generation (~$0.01)

100 generations = ~$1
1,000 generations = ~$10
```

**Why OpenRouter vs direct OpenAI/Anthropic?**
- ✅ Access to 100+ models with one API key
- ✅ Automatic fallback (if one model is down, use another)
- ✅ Compare models easily (switch with 1 line of code)
- ✅ Often cheaper (bulk pricing)
- ✅ Credit system (pay once, use across all models)

**Learn more:**
- OpenRouter Docs: https://openrouter.ai/docs
- Prompt engineering: https://www.promptingguide.ai/
- Token calculator: https://platform.openai.com/tokenizer

</details>

### <details><summary><strong>🎨 Fal.ai (AI Image Generation)</strong></summary>

**What it is:**
- AI image generation API (FLUX, Stable Diffusion, etc.)
- Fast inference (5-10 seconds per image)
- High-quality outputs

**What you use it for:**
- Generate images for social media posts
- Create brand visuals
- Product mockups
- Blog post headers

**Your implementation (src/services/fal.ts):**
```typescript
export async function generateImage(
  prompt: string,
  options: {
    model?: 'fal-ai/flux/schnell' | 'fal-ai/flux/dev',
    aspectRatio?: '1:1' | '16:9' | '9:16',
    style?: 'photographic' | 'digital-art' | 'none'
  }
) {
  // 1. Submit generation job
  const result = await fal.subscribe(options.model || 'fal-ai/flux/schnell', {
    input: {
      prompt: enhancePrompt(prompt, options.style),
      image_size: aspectRatio === '1:1' ? 'square_hd' : 'landscape_16_9',
      num_images: 1,
      enable_safety_checker: true  // Filter NSFW
    }
  })

  // 2. Download generated image
  const imageResponse = await fetch(result.images[0].url)
  const buffer = Buffer.from(await imageResponse.arrayBuffer())

  // 3. Upload to your R2 storage
  const publicUrl = await uploadImage(buffer, 'image/jpeg')

  return { url: publicUrl }
}
```

**Available models:**
```
fal-ai/flux/schnell:
- Speed: 5-10 seconds
- Quality: Good
- Cost: $0.003 per image

fal-ai/flux/dev:
- Speed: 15-20 seconds
- Quality: Better
- Cost: $0.025 per image

fal-ai/flux/pro:
- Speed: 30-40 seconds
- Quality: Best
- Cost: $0.055 per image
```

**Prompt engineering:**
```typescript
// Bad prompt
"a dog"

// Good prompt (what your code does)
"a photorealistic golden retriever puppy sitting in a sunny garden,
professional photography, natural lighting, shallow depth of field,
highly detailed, 4k quality"
```

**Your prompt enhancer:**
```typescript
const stylePrompts = {
  photographic: 'professional photography, natural lighting, highly detailed, 4k',
  'digital-art': 'digital art, vibrant colors, detailed illustration, trending on artstation',
  none: ''
}

function enhancePrompt(userPrompt: string, style: string) {
  return `${userPrompt}, ${stylePrompts[style]}`
}
```

**Cost example:**
```
Using flux/schnell:
- $0.003 per image
- 100 images = $0.30
- 1,000 images = $3.00
- 10,000 images = $30.00
```

**Why Fal.ai vs other providers?**
- ✅ Fast (5-10 seconds vs 30-60 seconds elsewhere)
- ✅ Latest models (FLUX is state-of-the-art)
- ✅ Simple API (no complex setup)
- ✅ Built-in NSFW filter
- ✅ Reasonable pricing

**Learn more:**
- Fal.ai Docs: https://fal.ai/docs
- FLUX models: https://blog.fal.ai/flux/
- Prompt guide: https://www.promptingguide.ai/applications/generating-images

</details>

### <details><summary><strong>🎙️ ElevenLabs (Text-to-Speech)</strong></summary>

**What it is:**
- AI voice generation (ultra-realistic text-to-speech)
- 100+ voices in 29 languages
- Clone your own voice

**What you use it for:**
- Generate voiceovers for video posts
- Audio versions of written content
- Accessibility (screen readers)

**Your implementation (src/services/elevenlabs.ts):**
```typescript
export async function generateSpeech(
  text: string,
  voiceId: string,
  settings?: {
    stability: number,      // 0-1, lower = more variable
    similarity_boost: number, // 0-1, higher = closer to original voice
    style: number,          // 0-1, how much emotion
    use_speaker_boost: boolean
  }
) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: settings || {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    }
  )

  // Returns MP3 audio buffer
  const audioBuffer = Buffer.from(await response.arrayBuffer())

  // Upload to R2
  const audioUrl = await uploadAudio(audioBuffer, 'audio/mpeg')

  return audioUrl
}
```

**Voice selection:**
```typescript
// Get all available voices
const voices = await elevenlabs.getVoices()

// Example voices:
[
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    labels: { accent: 'american', age: 'young', gender: 'female' }
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    labels: { accent: 'american', age: 'young', gender: 'male' }
  }
]
```

**Pricing tiers:**
```
Free:
- 10,000 characters/month
- ~7 minutes of audio
- Standard voices only

Creator ($11/month):
- 100,000 characters/month
- ~70 minutes of audio
- All voices + instant voice cloning

Pro ($99/month):
- 500,000 characters/month
- ~350 minutes of audio
- Professional voice cloning
```

**Character count:**
```
"Hello world" = 11 characters
Average tweet (280 chars) = ~30 seconds audio
Average blog post (1000 words = ~5000 chars) = ~4 minutes audio
```

**Voice settings explained:**
```typescript
{
  stability: 0.5,
  // 0 = Very variable, emotional, natural pauses
  // 1 = Monotone, consistent, robotic

  similarity_boost: 0.75,
  // 0 = More generic/safe
  // 1 = Closer to original voice (may have artifacts)

  style: 0.5,
  // 0 = Neutral delivery
  // 1 = Exaggerated emotion

  use_speaker_boost: true
  // Enhances clarity and volume
}
```

**Why ElevenLabs?**
- ✅ Most realistic voices on the market
- ✅ Natural emotion and intonation
- ✅ Multi-language support
- ✅ Voice cloning (clone your own voice)
- ✅ Fast generation (real-time)

**Learn more:**
- ElevenLabs Docs: https://elevenlabs.io/docs
- Voice cloning guide: https://elevenlabs.io/voice-cloning
- API reference: https://elevenlabs.io/docs/api-reference

</details>

### <details><summary><strong>📱 Telegram Bot API (Delivery Platform)</strong></summary>

**What it is:**
- Platform for building bots on Telegram messenger
- Send/receive messages programmatically
- Your bot = delivery mechanism for scheduled posts

**What you use it for:**
- Deliver generated posts to users at scheduled times
- Notify users of completed generations
- Send daily/weekly digests

**How it works:**

```
1. User schedules post in your app
   ↓
2. User connects Telegram in settings
   ↓
3. Your bot sends message: "Connect your account"
   ↓
4. User clicks /start in Telegram
   ↓
5. Bot receives chat_id
   ↓
6. Save chat_id to user's database record
   ↓
7. When post is due, send via Telegram
```

**Your implementation (src/services/telegram.ts):**
```typescript
// Send a post to user's Telegram
export async function sendPostToTelegram(
  chatId: string,
  content: string,
  platform: string,
  brandName: string
) {
  const message = `
📱 *${platform.toUpperCase()} Post for ${brandName}*

${content}

---
Generated by POSTAIFY
  `

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    }
  )

  return response.ok
}
```

**Bot setup:**
```
1. Message @BotFather on Telegram
2. Send /newbot
3. Choose name: "POSTAIFY Bot"
4. Choose username: "postaify_bot"
5. Receive bot token: "1234567890:ABCdef..."
6. Add token to .env as TELEGRAM_BOT_TOKEN
```

**Bot commands:**
```typescript
// User sends: /start
bot.on('message', async (msg) => {
  if (msg.text === '/start') {
    const chatId = msg.chat.id

    // Look up user by referral code or phone
    const user = await findUserByReferralCode(msg.text)

    // Save chat_id to user
    await prisma.user.update({
      where: { id: user.id },
      data: { telegramChatId: chatId, telegramEnabled: true }
    })

    await sendMessage(chatId, "✅ Connected! You'll receive posts here.")
  }
})
```

**Message formatting:**
```typescript
// Bold
await sendMessage(chatId, "*Bold text*", { parse_mode: 'Markdown' })

// Italic
await sendMessage(chatId, "_Italic text_", { parse_mode: 'Markdown' })

// Link
await sendMessage(chatId, "[Click here](https://example.com)", { parse_mode: 'Markdown' })

// Code
await sendMessage(chatId, "`code here`", { parse_mode: 'Markdown' })
```

**Rate limits:**
```
Per chat:
- 1 message per second
- 20 messages per minute
- Burst: up to 30 messages in 1 second

Global:
- 30 messages per second across all chats
```

**Your scheduler handles this:**
```typescript
// src/workers/scheduler.ts
for (let i = 0; i < posts.length; i += 5) {
  const batch = posts.slice(i, i + 5)

  // Send 5 at a time
  await Promise.allSettled(batch.map(post => sendToTelegram(post)))

  // Wait 200ms before next batch (avoid rate limit)
  await sleep(200)
}
```

**Why Telegram?**
- ✅ Free API (no cost per message)
- ✅ Instant delivery (faster than email)
- ✅ High open rates (95%+ vs 20% for email)
- ✅ Rich formatting (bold, links, buttons)
- ✅ Media support (images, videos, files)
- ✅ 2 billion users worldwide

**Learn more:**
- Telegram Bot API: https://core.telegram.org/bots/api
- Bot tutorial: https://core.telegram.org/bots/tutorial
- BotFather commands: https://core.telegram.org/bots/features#botfather

</details>

---

## 🛡️ Security & Performance

### <details><summary><strong>🚦 Rate Limiting (Prevent Abuse)</strong></summary>

**What it is:**
- Limit how many requests a user/IP can make per time window
- Prevents: DoS attacks, API abuse, cost overruns

**Your implementation (src/middleware/rateLimit.ts):**

```typescript
// General API: 100 requests per minute per IP
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 requests
  message: { error: 'Too many requests, slow down!' }
})

// AI generation: 20 requests per minute per user
export const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.auth.userId  // Per user, not per IP
})

// Image generation: 10 requests per minute per user
export const imageGenerationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
})
```

**How it works:**

```
Request 1-100: ✅ Allowed
Request 101: ❌ 429 Too Many Requests
{
  error: "Too many requests, please try again later"
}

Wait 1 minute...

Request 1: ✅ Allowed (counter reset)
```

**Different strategies:**

```typescript
// Per IP address (prevent single attacker)
keyGenerator: (req) => req.ip

// Per user (prevent single user abuse)
keyGenerator: (req) => req.auth.userId

// Per API key (for public APIs)
keyGenerator: (req) => req.headers['x-api-key']

// Custom (e.g., per email domain)
keyGenerator: (req) => req.body.email.split('@')[1]
```

**Response headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1642425600
Retry-After: 45
```

**Redis-backed rate limiting (for multiple servers):**
```typescript
// Without Redis: Each server has its own counter
// Server 1: User makes 100 requests ✅
// Server 2: User makes 100 requests ✅ (bypassed limit!)

// With Redis: Shared counter across all servers
// Server 1: User makes 50 requests
// Server 2: User makes 50 requests
// Total: 100 ✅ Then blocked
```

**Why rate limiting?**
- ✅ Prevents DoS attacks
- ✅ Protects expensive APIs (AI, image gen)
- ✅ Fair usage across all users
- ✅ Predictable costs
- ✅ Better uptime

**Learn more:**
- Rate limiting patterns: https://blog.logrocket.com/rate-limiting-node-js/
- Express rate limit: https://express-rate-limit.github.io/

</details>

### <details><summary><strong>⏱️ Request Timeouts (Prevent Hanging)</strong></summary>

**What it is:**
- Abort requests that take too long
- Prevents: Server hanging, resource exhaustion

**The problem:**
```typescript
// Without timeout
const response = await fetch('https://slow-api.com/generate')
// If this API hangs forever, your request waits forever
// Meanwhile, your server's connection pool gets exhausted
// Eventually, ALL requests fail
```

**Your solution (src/lib/fetchWithTimeout.ts):**
```typescript
export async function fetchWithTimeout(
  url: string,
  options: { timeout?: number } = {}
) {
  const { timeout = 30000, ...fetchOptions } = options

  // Create abort controller
  const controller = new AbortController()

  // Set timeout
  const timeoutId = setTimeout(() => {
    controller.abort()  // Cancel the request
  }, timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal  // Connect abort signal
    })
    return response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TimeoutError(`Request timed out after ${timeout}ms`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)  // Always cleanup
  }
}
```

**Your timeout values:**
```typescript
TIMEOUTS = {
  AI_GENERATION: 60000,      // 60 seconds (text is fast)
  IMAGE_GENERATION: 120000,  // 2 minutes (images are slow)
  VOICE_GENERATION: 60000,   // 60 seconds
  TELEGRAM_API: 10000,       // 10 seconds (should be instant)
  STRIPE_API: 30000,         // 30 seconds
  DEFAULT: 30000             // 30 seconds
}
```

**Usage:**
```typescript
// Before (bad)
const response = await fetch('https://api.openrouter.ai/...')

// After (good)
const response = await fetchWithTimeout('https://api.openrouter.ai/...', {
  timeout: TIMEOUTS.AI_GENERATION
})
```

**What happens on timeout:**
```
Request starts at 0:00
↓
Still waiting at 0:30
↓
Still waiting at 0:59
↓
⏱️ TIMEOUT at 1:00
↓
AbortError thrown
↓
Your error handler catches it
↓
Return 504 Gateway Timeout to user
↓
User sees: "Request took too long, please try again"
```

**Why timeouts?**
- ✅ Prevents resource leaks
- ✅ Faster failure = better UX
- ✅ Protects against slow APIs
- ✅ Frees up connections for other requests
- ✅ Prevents cascade failures

**Learn more:**
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- AbortController: https://developer.mozilla.org/en-US/docs/Web/API/AbortController

</details>

### <details><summary><strong>🔐 Environment Variables (Secrets Management)</strong></summary>

**What it is:**
- Store sensitive configuration outside your code
- Never commit secrets to Git

**Your .env file:**
```bash
# ❌ NEVER commit this file to Git
# ✅ Add .env to .gitignore

# Database
DATABASE_URL=postgresql://user:password@host/db

# API Keys (keep these SECRET!)
OPENROUTER_API_KEY=sk-or-v1-xxx...
ELEVENLABS_API_KEY=sk_xxx...
FAL_API_KEY=xxx:xxx...
TELEGRAM_BOT_TOKEN=1234567890:ABCdef...

# Clerk
CLERK_SECRET_KEY=sk_test_xxx...
CLERK_WEBHOOK_SECRET=whsec_xxx...

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...

# Cloudflare R2
R2_ACCESS_KEY_ID=xxx...
R2_SECRET_ACCESS_KEY=xxx...

# Redis
REDIS_URL=redis://default:password@host:port
```

**Loading environment variables (src/config/env.ts):**
```typescript
import { z } from 'zod'

// Define schema
const envSchema = z.object({
  DATABASE_URL: z.string(),
  OPENROUTER_API_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  // ... etc
})

// Validate and parse
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)  // Stop server if config is invalid
}

export const env = parsed.data
```

**Why Zod validation?**
```typescript
// Without validation
const apiKey = process.env.OPENROUTER_API_KEY
// ⚠️ Could be undefined, empty string, wrong format
// ⚠️ Only discover at runtime when API call fails

// With validation
const apiKey = env.OPENROUTER_API_KEY
// ✅ TypeScript knows it's a string
// ✅ Server won't start if missing
// ✅ Catch errors immediately
```

**Production deployment:**

```bash
# ❌ DON'T: Put .env file on production server
# ❌ DON'T: Commit .env to Git

# ✅ DO: Use platform environment variables

# Vercel
vercel env add DATABASE_URL

# Railway
# Set in dashboard → Variables tab

# Docker
docker run -e DATABASE_URL=xxx -e REDIS_URL=xxx myapp

# Kubernetes
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL=xxx \
  --from-literal=REDIS_URL=xxx
```

**Security best practices:**
```
1. ✅ Never commit .env to Git
2. ✅ Add .env to .gitignore
3. ✅ Use .env.example (with fake values) for documentation
4. ✅ Rotate secrets regularly
5. ✅ Use different keys for dev/staging/prod
6. ✅ Restrict API key permissions (least privilege)
7. ✅ Monitor API usage for anomalies
```

**Learn more:**
- dotenv: https://github.com/motdotla/dotenv
- Environment security: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

</details>

---

## 🔄 Request Flow

### <details><summary><strong>📥 Complete Request Journey (Example: Create Post)</strong></summary>

Let's trace a single request through your entire stack:

**User action:** Click "Generate Post" button

---

**STEP 1: Frontend (React)**
```javascript
// User clicks button
onClick={() => {
  fetch('https://api.yourapp.com/api/v1/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${clerkToken}`  // JWT from Clerk
    },
    body: JSON.stringify({
      transcript: "Today I learned about AI...",
      platform: "linkedin",
      numberOfPosts: 5,
      style: "professional"
    })
  })
}}
```

---

**STEP 2: DNS Resolution**
```
api.yourapp.com
  ↓ DNS lookup
  → 203.0.113.45 (your server IP)
```

---

**STEP 3: Load Balancer (if using one)**
```
Request arrives at load balancer
  ↓ Round-robin
  → Server 1 (70% capacity) ✅ Selected
  → Server 2 (90% capacity)
  → Server 3 (50% capacity)
```

---

**STEP 4: Express.js Server**

**(A) Security Headers (helmet)**
```typescript
// src/index.ts line 20
app.use(helmet())
// Adds: X-Content-Type-Options, X-Frame-Options, etc.
```

**(B) Compression**
```typescript
// src/index.ts line 23
app.use(compression())
// Will compress response on the way out
```

**(C) CORS Check**
```typescript
// src/index.ts line 40
app.use(cors({
  origin: 'https://yourapp.com'
}))
// ✅ Frontend matches allowed origin
```

**(D) Parse JSON Body**
```typescript
// src/index.ts line 61
app.use(express.json())
// Converts: '{"transcript":"..."}' → JavaScript object
```

**(E) Rate Limiting**
```typescript
// src/index.ts line 102
app.use('/api/v1', apiLimiter)
// Check: Has this IP made 100+ requests in last minute?
// ✅ No, allow (request count: 47/100)
```

**(F) Clerk Authentication**
```typescript
// src/index.ts line 105
app.use(clerkAuth)
// Verifies JWT token
// Extracts: userId = "user_123abc"
// Sets: req.auth = { userId: "user_123abc" }
```

---

**STEP 5: Route Handler**

**(A) Route Matching**
```typescript
// src/routes/index.ts
app.use('/api/v1', apiRoutes)
  → app.use('/ai', aiRouter)
    → app.post('/generate', handler)
// ✅ Matched: POST /api/v1/ai/generate
```

**(B) Authentication Check**
```typescript
// src/routes/ai.ts line 12
router.use(requireAuthentication, loadUser)

// requireAuthentication (src/middleware/auth.ts line 33)
if (!req.auth.userId) {
  return res.status(401).json({ error: 'Unauthorized' })
}
// ✅ userId exists

// loadUser (src/middleware/auth.ts line 42)
const user = await prisma.user.findUnique({
  where: { clerkId: req.auth.userId }
})
req.user = user
// ✅ User found in database
```

**(C) AI-Specific Rate Limit**
```typescript
// src/routes/ai.ts line 15
router.use(aiGenerationLimiter)
// Check: Has this user made 20+ AI requests in last minute?
// ✅ No, allow (request count: 3/20)
```

**(D) Quota Check**
```typescript
// src/middleware/quota.ts line 56
// Check monthly post limit
const limit = PLAN_LIMITS[user.plan].maxPostsPerMonth
// user.plan = 'PRO' → limit = 1000

if (user.postsThisMonth >= limit) {
  throw new QuotaExceededError('Monthly limit reached')
}
// ✅ user.postsThisMonth = 47 < 1000
```

**(E) Request Validation**
```typescript
// src/middleware/validate.ts
validateBody(generatePostSchema)

// Schema check (Zod)
const generatePostSchema = z.object({
  transcript: z.string().min(10),
  platform: z.enum(['twitter', 'linkedin', 'instagram']),
  numberOfPosts: z.number().min(1).max(10),
  style: z.enum(['professional', 'casual', 'witty'])
})
// ✅ All fields valid
```

---

**STEP 6: Business Logic**

**(A) Call OpenRouter**
```typescript
// src/routes/ai.ts line 45
const posts = await generatePostsFromTranscript(
  transcript,
  { platform, numberOfPosts, style }
)

// src/services/openrouter.ts line 202
const response = await fetchWithTimeout(
  'https://openrouter.ai/api/v1/chat/completions',
  {
    method: 'POST',
    body: JSON.stringify({ model: 'claude-3.5-sonnet', ... }),
    timeout: 60000  // 60 second timeout
  }
)
// ⏳ Wait 8 seconds...
// ✅ Response received
```

**(B) Save to Database**
```typescript
// Create 5 posts
const createdPosts = await Promise.all(
  posts.map(content =>
    prisma.post.create({
      data: {
        content,
        platform,
        status: 'DRAFT',
        userId: user.id,
        aiGenerated: true,
        aiModel: 'claude-3.5-sonnet'
      }
    })
  )
)

// Database query (PostgreSQL)
// Takes ~50ms via Neon
```

**(C) Update Usage Counter**
```typescript
await prisma.user.update({
  where: { id: user.id },
  data: { postsThisMonth: { increment: 5 } }
})
// user.postsThisMonth: 47 → 52
```

---

**STEP 7: Send Response**

```typescript
// src/routes/ai.ts line 75
res.json({
  posts: createdPosts.map(p => ({
    id: p.id,
    content: p.content,
    platform: p.platform,
    createdAt: p.createdAt
  }))
})

// Express converts object to JSON string
// Compression middleware compresses it (saves ~60% bandwidth)
// Response: 200 OK
```

---

**STEP 8: Frontend Receives Response**

```javascript
const response = await fetch(...)
const data = await response.json()

// Update UI
setPosts(data.posts)
// ✅ 5 new posts appear in list
```

---

**TOTAL TIME: ~8.5 seconds**
- Network: 50ms
- Authentication: 20ms
- Database lookup (user): 30ms
- OpenRouter API: 8000ms ← Majority of time
- Database writes (5 posts): 150ms
- Response: 50ms

---

**If something goes wrong:**

**(Error: Rate limit exceeded)**
```
STEP 5.C fails
  ↓
Express error handler catches it (src/middleware/errorHandler.ts)
  ↓
Returns: 429 Too Many Requests
  ↓
Frontend shows: "Too many requests, please wait"
```

**(Error: OpenRouter timeout)**
```
STEP 6.A times out after 60 seconds
  ↓
fetchWithTimeout throws TimeoutError
  ↓
Route handler catches it: next(error)
  ↓
Express error handler: 504 Gateway Timeout
  ↓
Frontend shows: "Request took too long, please try again"
```

**(Error: Database down)**
```
STEP 6.B fails (Prisma can't connect)
  ↓
Throws PrismaClientKnownRequestError
  ↓
Express error handler: 503 Service Unavailable
  ↓
Frontend shows: "Service temporarily unavailable"
```

</details>

---

## 🚀 Deployment & Scaling

### <details><summary><strong>☁️ Deployment Options</strong></summary>

**Option 1: Vercel (Easiest)**
```bash
# Pros:
✅ Zero config deployment
✅ Auto-scales
✅ Global CDN
✅ Free tier (100GB bandwidth, 100 hours compute)
✅ Environment variables in dashboard

# Cons:
❌ 10 second function timeout (might cut off long AI requests)
❌ Serverless (cold starts)
❌ PostgreSQL connections limited

# Setup:
1. Install Vercel CLI: npm i -g vercel
2. cd backend && vercel
3. Follow prompts
4. Add environment variables in dashboard
5. Done!

# Cost:
Free tier: $0
Pro: $20/month
```

---

**Option 2: Railway (Recommended for you)**
```bash
# Pros:
✅ Full server (no timeouts)
✅ Persistent connections
✅ PostgreSQL included
✅ Redis included
✅ Auto-deploys from Git
✅ $5 credit free

# Cons:
❌ Costs $5-20/month after credit
❌ Manual scaling

# Setup:
1. Go to railway.app
2. "New Project" → "Deploy from GitHub"
3. Select your backend repo
4. Add environment variables
5. Deploy

# Cost:
$5/month (512MB RAM)
$10/month (1GB RAM)
$20/month (2GB RAM)
```

---

**Option 3: Digital Ocean App Platform**
```bash
# Pros:
✅ Predictable pricing
✅ Full server
✅ Managed PostgreSQL + Redis
✅ Automatic backups

# Cons:
❌ More expensive ($12+/month)
❌ Slower deployment

# Setup:
1. Go to cloud.digitalocean.com
2. Apps → Create App
3. Connect GitHub
4. Add environment variables
5. Deploy

# Cost:
Basic: $12/month (512MB RAM, 1 vCPU)
Professional: $25/month (1GB RAM, 1 vCPU)
```

---

**Option 4: Self-Hosted (VPS)**
```bash
# Pros:
✅ Full control
✅ Cheapest long-term
✅ No platform limits

# Cons:
❌ You manage everything (updates, security, backups)
❌ Requires DevOps knowledge

# Setup:
1. Get VPS (DigitalOcean, Linode, Vultr)
2. SSH into server
3. Install Node.js, PM2, Nginx
4. Clone repo, install dependencies
5. Setup reverse proxy
6. Setup SSL (Let's Encrypt)
7. Configure PM2 for auto-restart

# Cost:
$5-10/month (1GB RAM, 1 vCPU)
```

---

**Recommendation for you:**
Start with **Railway**:
- ✅ No timeout issues (important for AI generation)
- ✅ Simple setup
- ✅ Scales easily when needed
- ✅ Free to try ($5 credit)

When you outgrow Railway (10,000+ DAU):
- Move to DigitalOcean App Platform or AWS

</details>

### <details><summary><strong>📈 Horizontal Scaling (Multiple Servers)</strong></summary>

**When you need it:**
- Single server maxed out (CPU 80%+, RAM 80%+)
- Response times degrading (p95 > 1 second)
- 5,000+ concurrent users

**Architecture:**

```
                    ┌─────────────┐
                    │ Load Balancer│
                    │  (Nginx)     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  Server 1     │  │  Server 2     │  │  Server 3     │
│  Express.js   │  │  Express.js   │  │  Express.js   │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL  │
                    │  (Neon)      │
                    └──────────────┘
```

**Setup with Railway:**
```bash
# 1. Deploy your app
railway up

# 2. Scale to 3 instances
railway scale --replicas 3

# 3. Railway auto-configures load balancer
# Done!
```

**Setup with Nginx (DIY):**
```nginx
# /etc/nginx/nginx.conf
upstream backend {
  # Round-robin load balancing
  server 10.0.0.1:3001;
  server 10.0.0.2:3001;
  server 10.0.0.3:3001;
}

server {
  listen 80;
  server_name api.yourapp.com;

  location / {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

**Important: Shared State**

**Problem:**
```
User logs in → Session saved to Server 1
Next request → Load balancer sends to Server 2
Server 2: "Who are you? Not logged in!" ❌
```

**Solution: Stateless sessions (JWT)**
```
✅ You already use this!
- Clerk JWT tokens (stateless)
- Token contains user ID
- Any server can verify token
- No session storage needed
```

**Problem: Rate limiting**
```
User makes 50 requests → Server 1 (50/100)
User makes 50 requests → Server 2 (50/100)
Total: 100 requests, but both allow it! ❌
```

**Solution: Redis-backed rate limiting**
```typescript
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { getRedisClient } from './lib/redis'

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: getRedisClient()
  }),
  windowMs: 60 * 1000,
  max: 100
})
// ✅ All servers share same Redis counter
```

**Cost comparison:**
```
1 server:
- $20/month
- Handles 500-1000 concurrent

3 servers:
- $60/month
- Handles 2000-3000 concurrent
- 3x capacity, 3x cost
```

</details>

---

## 📚 Learning Resources

### <details><summary><strong>🎓 Recommended Learning Path</strong></summary>

**Week 1-2: JavaScript/TypeScript Foundations**
- JavaScript.info: https://javascript.info/
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- Async/Await: https://www.youtube.com/watch?v=V_Kr9OSfDeU

**Week 3-4: Node.js & Express**
- Node.js docs: https://nodejs.org/en/learn/
- Express.js guide: https://expressjs.com/en/guide/routing.html
- REST API design: https://restfulapi.net/

**Week 5-6: Databases**
- SQL basics: https://www.postgresqltutorial.com/
- Prisma quickstart: https://www.prisma.io/docs/getting-started
- Database design: https://www.youtube.com/watch?v=ztHopE5Wnpc

**Week 7-8: Authentication & Security**
- JWT explained: https://jwt.io/introduction
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Clerk docs: https://clerk.com/docs

**Week 9-10: APIs & Integrations**
- API design: https://www.youtube.com/watch?v=_YlYuNMTCc8
- Webhooks: https://hookdeck.com/webhooks/guides/what-are-webhooks
- Rate limiting: https://blog.logrocket.com/rate-limiting-node-js/

**Week 11-12: Deployment & DevOps**
- Docker basics: https://www.youtube.com/watch?v=Gjnup-PuquQ
- CI/CD: https://www.youtube.com/watch?v=scEDHsr3APg
- Monitoring: https://sentry.io/resources/

**FREE Courses:**
- freeCodeCamp Backend: https://www.freecodecamp.org/learn/back-end-development-and-apis/
- The Odin Project (full-stack): https://www.theodinproject.com/
- Backend roadmap: https://roadmap.sh/backend

**Books:**
- "You Don't Know JS" (free): https://github.com/getify/You-Dont-Know-JS
- "Node.js Design Patterns"
- "Designing Data-Intensive Applications"

</details>

---

## 🐛 Common Issues & Solutions

### <details><summary><strong>❌ Troubleshooting Guide</strong></summary>

**Error: "Cannot connect to database"**
```bash
# Check:
1. DATABASE_URL in .env correct?
2. Database running? (check Neon dashboard)
3. IP allowed? (Neon: Settings → IP Allow)
4. Connection pool exhausted? (increase connection_limit)

# Fix:
DATABASE_URL=postgresql://...?connection_limit=25&pool_timeout=10
```

---

**Error: "Redis connection failed"**
```bash
# Check:
1. REDIS_URL correct?
2. Redis running? (check Redis Cloud dashboard)
3. Password correct?
4. Port open? (default: 6379)

# Server will run without Redis (degraded mode)
# Fix when convenient
```

---

**Error: "Rate limit exceeded"**
```bash
# User sees: 429 Too Many Requests

# Causes:
1. User legitimately exceeding limits
2. Limits too strict
3. Bot attack

# Fix:
# Adjust limits in src/middleware/rateLimit.ts
export const apiLimiter = rateLimit({
  max: 200  // Increase from 100
})
```

---

**Error: "Request timeout"**
```bash
# User sees: "Request took too long"

# Causes:
1. OpenRouter/Fal.ai slow
2. Timeout too aggressive
3. Network issues

# Fix:
# Increase timeout in src/lib/fetchWithTimeout.ts
TIMEOUTS = {
  AI_GENERATION: 120000  // 2 minutes (was 60s)
}
```

---

**Error: "Port 3001 already in use"**
```bash
# Windows:
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill -9

# Or change port:
PORT=3002 npm run dev
```

---

**Error: "Prisma Client not generated"**
```bash
# Run:
npx prisma generate

# Or:
npm run prisma:generate

# Add to package.json postinstall:
"postinstall": "prisma generate"
```

---

**Error: "Clerk webhook signature invalid"**
```bash
# Check:
1. CLERK_WEBHOOK_SECRET correct?
2. Using raw body? (express.raw() not express.json())
3. Signature header present?

# Fix in src/routes/webhooks/clerk.ts:
// Webhook route must come BEFORE express.json()
app.post('/webhooks/clerk', express.raw(), handler)
app.use(express.json())  // After webhooks
```

</details>

---

## 🎯 Next Steps

### <details><summary><strong>📝 Recommended Improvements</strong></summary>

**Phase 1: Monitoring (Week 1)**
```bash
# Add error tracking
npm install @sentry/node

# Add performance monitoring
npm install newrelic

# Add logging
npm install winston

# Cost: $0-25/month
```

---

**Phase 2: Caching (Week 2)**
```typescript
// Cache frequent queries
// src/lib/cache.ts

export async function getCachedUser(userId: string) {
  // Check Redis first
  const cached = await redis.get(`user:${userId}`)
  if (cached) return JSON.parse(cached)

  // Miss: query database
  const user = await prisma.user.findUnique({ where: { id: userId }})

  // Save for next time (5 min expiry)
  await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300)

  return user
}

// Impact: 50-80% reduction in database queries
```

---

**Phase 3: Database Optimization (Week 3)**
```sql
-- Add missing indexes
CREATE INDEX idx_posts_scheduled ON "Post"("scheduledFor") WHERE status = 'SCHEDULED';
CREATE INDEX idx_users_plan ON "User"("plan");

-- Analyze slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- Impact: 2-5x faster queries
```

---

**Phase 4: Background Workers (Week 4)**
```typescript
// Separate worker process for queues
// src/workers/index.ts

// Don't run workers on web servers
if (process.env.WORKER_MODE === 'true') {
  startAllWorkers()
} else {
  startWebServer()
}

// Benefits:
// - Web servers focus on HTTP
// - Workers focus on jobs
// - Better resource utilization
```

---

**Phase 5: Metrics Dashboard (Week 5)**
```typescript
// src/lib/metrics.ts
import { Counter, Histogram } from 'prom-client'

export const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
})

export const requestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Request duration in milliseconds',
  buckets: [10, 50, 100, 500, 1000, 5000]
})

// Visualize with Grafana
// Cost: Free (self-hosted) or $0-50/month (Grafana Cloud)
```

</details>

---

## 📞 Support

**Documentation:**
- This file: `backend/INFRASTRUCTURE_GUIDE.md`
- Production checklist: `backend/PRODUCTION_READY.md`
- API docs: `backend/API.md` (if created)

**Questions?**
Add them to a discussion in your repo or create GitHub issues.

**Need help?**
- Stack Overflow (tag: node.js, express, prisma)
- Discord communities (Node.js, Prisma, etc.)
- Reddit: r/node, r/webdev

---

**🎉 You now understand your entire backend infrastructure!**

Keep this guide open while developing. Click through sections as you work on different parts of the codebase.
