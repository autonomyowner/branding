# T21 System Architecture Diagrams

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│  │   Web App        │     │   Mobile App     │     │   API Clients    │   │
│  │   React 19       │     │   (Future)       │     │   (3rd party)    │   │
│  │   TypeScript     │     │   React Native   │     │                  │   │
│  └────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘   │
│           │                        │                        │              │
│           └────────────────────────┴────────────────────────┘              │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     │ HTTPS/REST
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                          API GATEWAY LAYER                                   │
├────────────────────────────────────┼────────────────────────────────────────┤
│                                    │                                         │
│  ┌────────────────────────────────▼──────────────────────────────────┐     │
│  │                    Load Balancer (Railway/Cloudflare)              │     │
│  └────────────────────────────────┬──────────────────────────────────┘     │
│                                    │                                         │
│           ┌────────────────────────┼────────────────────────┐               │
│           │                        │                        │               │
│  ┌────────▼────────┐    ┌──────────▼────────┐    ┌─────────▼────────┐     │
│  │  API Instance 1  │    │  API Instance 2   │    │  API Instance N  │     │
│  │  Express.js      │    │  Express.js       │    │  Express.js      │     │
│  │  + TypeScript    │    │  + TypeScript     │    │  + TypeScript    │     │
│  └────────┬─────────┘    └──────────┬────────┘    └─────────┬────────┘     │
│           │                         │                        │              │
│           └─────────────────────────┴────────────────────────┘              │
│                                     │                                        │
└─────────────────────────────────────┼────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
┌────────▼──────────┐      ┌──────────▼──────────┐    ┌───────────▼─────────┐
│  Authentication   │      │  Business Logic     │    │  Background Jobs    │
│  Middleware       │      │  Layer              │    │  (BullMQ Workers)   │
│  - JWT Verify     │      │  - User Service     │    │  - Post Publisher   │
│  - Rate Limiting  │      │  - Brand Service    │    │  - Analytics        │
│  - Quota Check    │      │  - Post Service     │    │  - Email Queue      │
└───────────────────┘      │  - AI Service       │    │  - Retry Logic      │
                           │  - Payment Service  │    └─────────┬───────────┘
                           └──────────┬──────────┘              │
                                      │                         │
┌─────────────────────────────────────┼─────────────────────────┼─────────────┐
│                          DATA LAYER                           │              │
├───────────────────────────────────────────────────────────────┼─────────────┤
│                                                                │              │
│  ┌──────────────────────────────────┐     ┌──────────────────▼──────────┐  │
│  │      PostgreSQL Database          │     │      Redis Cache            │  │
│  │  ┌─────────────────────────────┐ │     │  ┌──────────────────────┐  │  │
│  │  │  Users, Brands, Posts       │ │     │  │  Session Storage     │  │  │
│  │  │  Organizations, Teams       │ │     │  │  Rate Limit Counters │  │  │
│  │  │  Social Accounts            │ │     │  │  Job Queue           │  │  │
│  │  │  Analytics, Subscriptions   │ │     │  │  Hot Data Cache      │  │  │
│  │  └─────────────────────────────┘ │     │  └──────────────────────┘  │  │
│  │                                   │     │                             │  │
│  │  Read Replicas (Scale →)         │     │  Cluster (Scale →)          │  │
│  └──────────────────────────────────┘     └─────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┼────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                      │
├─────────────────────────────────────┼────────────────────────────────────────┤
│                                     │                                         │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  Stripe      │  │  OpenRouter   │  │  Resend     │  │  Cloudflare R2 │  │
│  │  Payments    │  │  AI API       │  │  Email      │  │  File Storage  │  │
│  └──────────────┘  └───────────────┘  └─────────────┘  └────────────────┘  │
│                                                                               │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  ┌────────────────┐  │
│  │  Instagram   │  │  Twitter      │  │  LinkedIn   │  │  Sentry        │  │
│  │  Graph API   │  │  API v2       │  │  API        │  │  Monitoring    │  │
│  └──────────────┘  └───────────────┘  └─────────────┘  └────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────┐                                          ┌─────────────┐
│ Client  │                                          │   Server    │
└────┬────┘                                          └──────┬──────┘
     │                                                      │
     │  POST /auth/register                                │
     │  { email, password, name }                          │
     ├────────────────────────────────────────────────────►│
     │                                                      │
     │                                        ┌─────────────┴────────────┐
     │                                        │ 1. Validate input        │
     │                                        │ 2. Check if user exists  │
     │                                        │ 3. Hash password (bcrypt)│
     │                                        │ 4. Create user in DB     │
     │                                        │ 5. Generate JWT tokens   │
     │                                        │ 6. Store refresh token   │
     │                                        └─────────────┬────────────┘
     │                                                      │
     │  201 Created                                         │
     │  { user, tokens: { accessToken, refreshToken } }    │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  Store tokens in localStorage/secure storage        │
     ├─────────────────────────────────────────────────────┤
     │                                                      │
     │  GET /brands                                         │
     │  Authorization: Bearer <accessToken>                 │
     ├────────────────────────────────────────────────────►│
     │                                                      │
     │                                        ┌─────────────┴────────────┐
     │                                        │ 1. Verify JWT signature  │
     │                                        │ 2. Check expiration      │
     │                                        │ 3. Extract userId        │
     │                                        │ 4. Fetch user from DB    │
     │                                        │ 5. Attach to req.user    │
     │                                        │ 6. Process request       │
     │                                        └─────────────┬────────────┘
     │                                                      │
     │  200 OK                                              │
     │  { data: [...brands] }                               │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  ... 15 minutes later ...                           │
     │                                                      │
     │  GET /posts (accessToken expired)                   │
     ├────────────────────────────────────────────────────►│
     │                                                      │
     │  401 Unauthorized                                    │
     │  { error: "Token expired" }                          │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  POST /auth/refresh                                  │
     │  { refreshToken }                                    │
     ├────────────────────────────────────────────────────►│
     │                                                      │
     │                                        ┌─────────────┴────────────┐
     │                                        │ 1. Verify refresh token  │
     │                                        │ 2. Check in database     │
     │                                        │ 3. Generate new access   │
     │                                        │ 4. Rotate refresh token  │
     │                                        └─────────────┬────────────┘
     │                                                      │
     │  200 OK                                              │
     │  { tokens: { accessToken, refreshToken } }           │
     │◄────────────────────────────────────────────────────┤
     │                                                      │
     │  Update stored tokens                                │
     │  Retry original request                              │
     │                                                      │
```

---

## Post Publishing Flow

```
┌──────┐                 ┌────────┐              ┌──────────┐           ┌───────────┐
│Client│                 │  API   │              │ Database │           │ Job Queue │
└──┬───┘                 └───┬────┘              └────┬─────┘           └─────┬─────┘
   │                         │                        │                       │
   │ POST /posts             │                        │                       │
   │ { content, scheduledFor,│                        │                       │
   │   platforms: [IG, TW] } │                        │                       │
   ├────────────────────────►│                        │                       │
   │                         │                        │                       │
   │                         │ Validate request       │                       │
   │                         │ Check quota            │                       │
   │                         ├───────────────────────►│                       │
   │                         │                        │                       │
   │                         │ Create Post            │                       │
   │                         │ Create SocialPosts     │                       │
   │                         ├───────────────────────►│                       │
   │                         │                        │                       │
   │                         │◄───────────────────────┤                       │
   │                         │ Post ID: abc123        │                       │
   │                         │                        │                       │
   │                         │ Schedule Job           │                       │
   │                         │ { postId, publishAt }  │                       │
   │                         ├───────────────────────────────────────────────►│
   │                         │                        │                       │
   │                         │                        │                       │
   │ 201 Created             │                        │                       │
   │ { id: abc123, ... }     │                        │                       │
   │◄────────────────────────┤                        │                       │
   │                         │                        │                       │
   │                                                                           │
   │         ... wait until scheduledFor time ...                             │
   │                                                                           │
   │                         │                        │                       │
   │                    ┌────▼──────┐                 │                       │
   │                    │  Worker   │                 │                       │
   │                    │  Process  │                 │                       │
   │                    └────┬──────┘                 │                       │
   │                         │                        │                       │
   │                         │ Dequeue Job            │                       │
   │                         │◄───────────────────────────────────────────────┤
   │                         │                        │                       │
   │                         │ Fetch Post + Accounts  │                       │
   │                         ├───────────────────────►│                       │
   │                         │◄───────────────────────┤                       │
   │                         │                        │                       │
   │                         │ Update status: PUBLISHING                      │
   │                         ├───────────────────────►│                       │
   │                         │                        │                       │
   │                    ┌────┴──────┐                 │                       │
   │                    │ Publish to│                 │                       │
   │                    │ Instagram │                 │                       │
   │                    └────┬──────┘                 │                       │
   │                         │ ────────────────────►  │                       │
   │                         │     Graph API          │                       │
   │                         │ ◄────────────────────  │                       │
   │                         │ platformPostId: xyz    │                       │
   │                         │                        │                       │
   │                    ┌────┴──────┐                 │                       │
   │                    │ Publish to│                 │                       │
   │                    │  Twitter  │                 │                       │
   │                    └────┬──────┘                 │                       │
   │                         │ ────────────────────►  │                       │
   │                         │     Twitter API        │                       │
   │                         │ ◄────────────────────  │                       │
   │                         │ tweetId: 123           │                       │
   │                         │                        │                       │
   │                         │ Update SocialPosts     │                       │
   │                         │ status: PUBLISHED      │                       │
   │                         │ platformPostIds        │                       │
   │                         ├───────────────────────►│                       │
   │                         │                        │                       │
   │                         │ Send notification      │                       │
   │                         │ (via email service)    │                       │
   │                         │                        │                       │
   │                         │                        │                       │
   │ WebSocket notification  │                        │                       │
   │ (if connected)          │                        │                       │
   │◄────────────────────────┤                        │                       │
   │ "Post published!"       │                        │                       │
   │                         │                        │                       │
```

---

## Stripe Subscription Flow

```
┌──────┐           ┌────────┐          ┌────────┐          ┌──────────┐
│Client│           │  API   │          │ Stripe │          │ Database │
└──┬───┘           └───┬────┘          └───┬────┘          └────┬─────┘
   │                   │                   │                    │
   │ POST /subscriptions/checkout          │                    │
   │ { tier: "PRO" }    │                   │                    │
   ├───────────────────►│                   │                    │
   │                   │                   │                    │
   │                   │ Get/Create Customer│                   │
   │                   ├──────────────────►│                    │
   │                   │ customerId         │                    │
   │                   │◄──────────────────┤                    │
   │                   │                   │                    │
   │                   │ Create Checkout   │                    │
   │                   │ Session           │                    │
   │                   ├──────────────────►│                    │
   │                   │                   │                    │
   │                   │ sessionUrl         │                    │
   │                   │◄──────────────────┤                    │
   │                   │                   │                    │
   │ { url: checkout   │                   │                    │
   │   .stripe.com/... }│                   │                    │
   │◄──────────────────┤                   │                    │
   │                   │                   │                    │
   │ Redirect to Stripe│                   │                    │
   ├──────────────────────────────────────►│                    │
   │                   │                   │                    │
   │ Enter payment info│                   │                    │
   │ Complete purchase │                   │                    │
   ├──────────────────────────────────────►│                    │
   │                   │                   │                    │
   │                   │  Webhook: customer│                    │
   │                   │  .subscription    │                    │
   │                   │  .created         │                    │
   │                   │◄──────────────────┤                    │
   │                   │                   │                    │
   │                   │ Verify signature  │                    │
   │                   │                   │                    │
   │                   │ Update User       │                    │
   │                   │ tier: PRO         │                    │
   │                   │ status: active    │                    │
   │                   ├──────────────────────────────────────►│
   │                   │                   │                    │
   │                   │ Create Subscription record             │
   │                   ├──────────────────────────────────────►│
   │                   │                   │                    │
   │                   │ Send confirmation email                │
   │                   │                   │                    │
   │                   │ Respond 200 OK    │                    │
   │                   ├──────────────────►│                    │
   │                   │                   │                    │
   │ Redirect to       │                   │                    │
   │ success page      │                   │                    │
   │◄──────────────────────────────────────┤                    │
   │                   │                   │                    │
   │ GET /subscriptions/current             │                    │
   ├───────────────────►│                   │                    │
   │                   │ Fetch subscription│                    │
   │                   ├──────────────────────────────────────►│
   │                   │◄──────────────────────────────────────┤
   │ { tier: PRO,      │                   │                    │
   │   status: active, │                   │                    │
   │   features: [...] }│                   │                    │
   │◄──────────────────┤                   │                    │
   │                   │                   │                    │
```

---

## AI Content Generation Flow

```
┌──────┐         ┌────────┐        ┌──────────┐       ┌────────────┐
│Client│         │  API   │        │ Database │       │ OpenRouter │
└──┬───┘         └───┬────┘        └────┬─────┘       └──────┬─────┘
   │                 │                  │                     │
   │ POST /ai/generate-content          │                     │
   │ { brandId, prompt, platform }      │                     │
   ├─────────────────►│                  │                     │
   │                 │                  │                     │
   │                 │ Authenticate     │                     │
   │                 │ Check quota      │                     │
   │                 ├─────────────────►│                     │
   │                 │                  │                     │
   │                 │ Fetch Brand      │                     │
   │                 │ { name, tone,    │                     │
   │                 │   audience, ... }│                     │
   │                 │◄─────────────────┤                     │
   │                 │                  │                     │
   │            ┌────┴────┐             │                     │
   │            │ Build   │             │                     │
   │            │ Context │             │                     │
   │            │ Prompt  │             │                     │
   │            └────┬────┘             │                     │
   │                 │                  │                     │
   │                 │ POST /chat/completions                 │
   │                 │ { model, messages, max_tokens }        │
   │                 ├───────────────────────────────────────►│
   │                 │                  │                     │
   │                 │                  │   ┌─────────────────┴──┐
   │                 │                  │   │ Call AI model      │
   │                 │                  │   │ (Claude/GPT/etc)   │
   │                 │                  │   │ Generate content   │
   │                 │                  │   └─────────────────┬──┘
   │                 │                  │                     │
   │                 │ { content, tokensUsed }                │
   │                 │◄───────────────────────────────────────┤
   │                 │                  │                     │
   │            ┌────┴────┐             │                     │
   │            │ Extract │             │                     │
   │            │Hashtags │             │                     │
   │            └────┬────┘             │                     │
   │                 │                  │                     │
   │                 │ Increment AI     │                     │
   │                 │ credits used     │                     │
   │                 ├─────────────────►│                     │
   │                 │                  │                     │
   │ 200 OK          │                  │                     │
   │ { content,      │                  │                     │
   │   hashtags,     │                  │                     │
   │   creditsRemaining }                │                     │
   │◄────────────────┤                  │                     │
   │                 │                  │                     │
```

---

## Database Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│     User        │         │   Organization   │
├─────────────────┤         ├──────────────────┤
│ id              │1      N │ id               │
│ email           ├────────◄│ ownerId          │
│ password        │         │ name             │
│ subscriptionTier│         │ subscriptionTier │
│ stripeCustomerId│         └────────┬─────────┘
│ postsThisMonth  │                  │
│ aiCreditsUsed   │                  │1
└────────┬────────┘                  │
         │1                          │
         │                           │
         │                      ┌────▼──────────┐
         │                      │  TeamMember   │
         │                   N  ├───────────────┤
         └─────────────────────►│ userId        │
                                │ organizationId│
                                │ role          │
                                └───────────────┘

┌─────────────────┐         ┌──────────────────┐
│     Brand       │         │  SocialAccount   │
├─────────────────┤         ├──────────────────┤
│ id              │1      N │ id               │
│ name            ├────────►│ brandId          │
│ userId          │         │ platform         │
│ organizationId  │         │ accessToken (enc)│
│ toneOfVoice     │         │ platformUserId   │
│ targetAudience  │         └────────┬─────────┘
└────────┬────────┘                  │
         │1                          │
         │                           │1
         │                           │
    ┌────▼──────────┐           ┌────▼──────────┐
    │     Post      │        N  │  SocialPost   │
    ├───────────────┤  ◄────────┤───────────────┤
    │ id            │1          │ postId        │
    │ brandId       │           │ socialAccountId│
    │ userId        │           │ status        │
    │ content       │           │ platformPostId│
    │ status        │           │ publishedAt   │
    │ scheduledFor  │           └───────────────┘
    │ platforms[]   │
    │ aiGenerated   │
    └───────────────┘

┌──────────────────┐
│  PostAnalytics   │
├──────────────────┤
│ socialPostId     │
│ impressions      │
│ reach            │
│ likes            │
│ comments         │
│ shares           │
│ engagementRate   │
│ date             │
└──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  Subscription    │         │     Invoice      │
├──────────────────┤         ├──────────────────┤
│ userId           │         │ userId           │
│ stripeSubId      │         │ stripeInvoiceId  │
│ tier             │         │ amountPaid       │
│ status           │         │ status           │
│ currentPeriodEnd │         │ pdfUrl           │
└──────────────────┘         └──────────────────┘
```

This completes the comprehensive system architecture documentation!
