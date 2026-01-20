# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # TypeScript check + production build
npm run preview      # Preview production build locally
npm run lint         # ESLint
npx convex dev       # Start Convex dev server (watches for changes)
npx convex deploy    # Deploy Convex functions to production
```

**Development workflow:** Run `npm run dev` and `npx convex dev` in separate terminals.

## Architecture Overview

**POSTAIFY** is a SaaS for AI-powered social media content generation. The backend runs entirely on **Convex** (serverless database + functions).

```
/src                 # React 19 frontend (Vite, TypeScript, Tailwind)
/convex              # Convex backend (schema, queries, mutations, actions)
/backend             # DEPRECATED - Old Express/Prisma backend (not used)
```

## Convex Backend Structure

**Schema:** `convex/schema.ts` - 4 tables: `users`, `brands`, `posts`, `emailCaptures`

**Function Types:**
- **Queries** (`*.ts`) - Read-only, real-time reactive
- **Mutations** (`*.ts`) - Write operations, transactional
- **Actions** (`*Action.ts`) - External API calls (OpenRouter, ElevenLabs, Fal.ai, Stripe)

**Key Files:**
| File | Purpose |
|------|---------|
| `users.ts` | User CRUD, `syncUser`, `getByClerkId` |
| `brands.ts` | Brand CRUD with quota checks |
| `posts.ts` | Post CRUD, calendar queries |
| `ai.ts` | Content generation via OpenRouter |
| `voice.ts` | Voiceover via ElevenLabs |
| `imagesAction.ts` | Image generation via Fal.ai |
| `subscriptionsAction.ts` | Stripe checkout/portal |
| `telegram.ts` | Telegram bot integration |
| `http.ts` | Webhooks (Clerk, Stripe, Telegram) |
| `admin.ts` | Admin dashboard functions |

## Frontend Architecture

**State Management:** React Context
- `DataContext` - User, brands, posts CRUD via Convex hooks
- `SubscriptionContext` - Plan limits, feature gating, Stripe

**Convex Hooks Pattern:**
```typescript
const data = useQuery(api.posts.list, { clerkId, brandId })
const createPost = useMutation(api.posts.create)
const generateContent = useAction(api.ai.generateContent)
```

**Key Directories:**
- `src/components/ui/` - Reusable UI (shadcn-style)
- `src/components/dashboard/` - Dashboard modals (GenerateModal, VoiceoverModal, etc.)
- `src/context/` - DataContext, SubscriptionContext

## Auth Pattern: clerkId Fallback

Clerk JWT tokens don't always work with Convex auth. All authenticated functions use this pattern:

```typescript
// Backend (Convex)
handler: async (ctx, args) => {
  const identity = await ctx.auth.getUserIdentity();
  const userClerkId = identity?.subject || args.clerkId;  // Fallback
  if (!userClerkId) throw new Error("Not authenticated");
  // ...
}

// Frontend
const { user } = useUser()  // from @clerk/clerk-react
await someAction({ ...data, clerkId: user?.id })
```

**When calling queries from actions:** Pass `clerkId` explicitly since auth context doesn't transfer:
```typescript
const brand = await ctx.runQuery(api.brands.getById, { id: brandId, clerkId: userClerkId });
```

## Plan Limits

Defined in `convex/lib/planLimits.ts`:

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| Brands | 2 | 5 | 999 |
| Posts/Month | 20 | 1,000 | 90,000 |
| Image Gen | No | Yes | Yes |
| Voiceover | No | Yes | Yes |
| Video Repurpose | No | Yes | Yes |

## Environment Variables (Convex Dashboard)

**Required:**
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk domain for auth
- `OPENROUTER_API_KEY` - AI content generation

**Optional:**
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS`
- `ELEVENLABS_API_KEY` - Voiceover
- `FAL_API_KEY` - Image generation
- `R2_*` - Cloudflare R2 storage
- `TELEGRAM_BOT_TOKEN`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD` - Admin panel

## Case Conventions

Frontend uses Title Case, backend uses UPPERCASE:
```typescript
// Frontend
platform: 'Instagram' | 'Twitter' | 'LinkedIn' | 'TikTok' | 'Facebook'
status: 'draft' | 'scheduled' | 'published'

// Backend (Convex)
platform: 'INSTAGRAM' | 'TWITTER' | 'LINKEDIN' | 'TIKTOK' | 'FACEBOOK'
status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'
```

Conversion helpers in `DataContext.tsx`: `platformToBackend()`, `platformFromBackend()`, `statusToBackend()`, `statusFromBackend()`

## Internationalization (i18n)

Translations in `src/i18n/locales/` - supports English (`en.json`), French (`fr.json`), Arabic (`ar.json`).

Uses `react-i18next` with `useTranslation()` hook:
```typescript
const { t } = useTranslation()
<span>{t('dashboard.welcome')}</span>
```

## Responsive Design Pattern

Mobile-first with `sm:` breakpoint (640px). Consistent sizing across components:
- Card padding: `p-2 sm:p-6`
- Text sizes: `text-[10px] sm:text-sm` or `text-xs sm:text-base`
- Button heights: `h-8 sm:h-10`
- Gaps/margins: `gap-1.5 sm:gap-3`, `mb-3 sm:mb-4`

## Debugging Convex

Use MCP tools or CLI:
```bash
npx convex logs                    # View function logs
npx convex env list --prod         # List production env vars
npx convex data users --prod       # Query production data
```
