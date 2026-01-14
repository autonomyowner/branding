# T21 Backend Setup Guide

## Quick Start: From Zero to Deployed in 1 Hour

### Step 1: Initialize Project (5 minutes)

```bash
# Create backend directory
mkdir t21-backend
cd t21-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet dotenv
npm install prisma @prisma/client
npm install bcrypt jsonwebtoken zod
npm install bullmq ioredis
npm install stripe
npm install resend
npm install axios

# Install dev dependencies
npm install -D typescript @types/node @types/express @types/bcrypt @types/jsonwebtoken
npm install -D tsx nodemon
npm install -D @types/cors

# Install social media SDKs
npm install twitter-api-v2
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Initialize TypeScript
npx tsc --init
```

### Step 2: Project Structure

```
t21-backend/
├── src/
│   ├── index.ts                 # Main server entry
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── brands.ts
│   │   ├── posts.ts
│   │   ├── ai.ts
│   │   ├── subscriptions.ts
│   │   └── webhooks/
│   │       └── stripe.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── authorize.ts
│   │   ├── quota.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── services/
│   │   ├── openrouter.ts
│   │   ├── storage.ts
│   │   ├── email.ts
│   │   ├── analytics.ts
│   │   └── social/
│   │       ├── instagram.ts
│   │       ├── twitter.ts
│   │       ├── linkedin.ts
│   │       ├── tiktok.ts
│   │       └── facebook.ts
│   ├── workers/
│   │   ├── post-publisher.ts
│   │   └── analytics-collector.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   ├── crypto.ts
│   │   └── stripe.ts
│   └── types/
│       └── express.d.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

### Step 3: Core Configuration Files

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### package.json scripts
```json
{
  "scripts": {
    "dev": "nodemon --exec tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "worker": "tsx src/workers/post-publisher.ts",
    "analytics": "tsx src/workers/analytics-collector.ts"
  }
}
```

#### .env.example
```env
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/t21

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_REFRESH_SECRET=another-secret-key-for-refresh-tokens
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption (for OAuth tokens)
ENCRYPTION_KEY=64-character-hex-string-generate-with-openssl

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_BUSINESS=price_xxx

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=t21-media
R2_PUBLIC_URL=https://media.t21.app

# OpenRouter
OPENROUTER_API_KEY=sk-or-xxx

# Resend
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@t21.app

# Social Media APIs
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_BEARER_TOKEN=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Monitoring
SENTRY_DSN=
```

#### .gitignore
```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

### Step 4: Main Server Setup

#### src/index.ts
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import brandRoutes from './routes/brands';
import postRoutes from './routes/posts';
import aiRoutes from './routes/ai';
import stripeWebhook from './routes/webhooks/stripe';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Stripe webhook (must be before express.json())
app.use('/api/v1/webhooks', stripeWebhook);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/ai', aiRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

#### src/middleware/errorHandler.ts
```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed'
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
  }

  // Default error
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message
    }
  });
}
```

#### src/lib/prisma.ts
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### src/lib/redis.ts
```typescript
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected');
});
```

#### src/lib/crypto.ts
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

if (KEY.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Generate encryption key (run once, store in .env)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
```

### Step 5: Database Setup

```bash
# Copy the Prisma schema from backend-architecture.md
# to prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### Step 6: Local Development

```bash
# Terminal 1: Start PostgreSQL (if using Docker)
docker run --name t21-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Terminal 2: Start Redis (if using Docker)
docker run --name t21-redis -p 6379:6379 -d redis

# Terminal 3: Start API server
npm run dev

# Terminal 4: Start background worker
npm run worker
```

### Step 7: Deploy to Railway (Production)

#### Option A: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -hex 32)
# ... add all other variables

# Deploy
railway up

# Run migrations
railway run npx prisma migrate deploy
```

#### Option B: Using Railway Dashboard

1. Go to railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repo
5. Add PostgreSQL database
6. Add Redis database
7. Set environment variables in dashboard
8. Railway auto-deploys on git push

### Step 8: Set Up External Services

#### Stripe
```bash
# 1. Create account at stripe.com
# 2. Get API keys from Dashboard > Developers > API keys
# 3. Create products and prices
# 4. Set up webhook endpoint: https://api.t21.app/api/v1/webhooks/stripe
# 5. Select events: customer.subscription.*, invoice.paid, invoice.payment_failed
# 6. Copy webhook secret
```

#### Cloudflare R2
```bash
# 1. Go to Cloudflare dashboard
# 2. R2 > Create bucket
# 3. Create API token with R2 read/write permissions
# 4. Set up custom domain (optional)
```

#### Resend
```bash
# 1. Create account at resend.com
# 2. Add domain and verify DNS
# 3. Create API key
```

#### OpenRouter
```bash
# 1. Create account at openrouter.ai
# 2. Add credits
# 3. Generate API key
```

### Step 9: Configure Social Media OAuth

#### Instagram (Meta)
```
1. Go to developers.facebook.com
2. Create app > Business type
3. Add Instagram Basic Display product
4. Configure OAuth redirect: https://api.t21.app/api/v1/auth/oauth/instagram/callback
5. Get Client ID and Secret
```

#### Twitter
```
1. Go to developer.twitter.com
2. Create project and app
3. Enable OAuth 1.0a with Read and Write permissions
4. Set callback URL: https://api.t21.app/api/v1/auth/oauth/twitter/callback
5. Get API keys
```

#### LinkedIn
```
1. Go to linkedin.com/developers
2. Create app
3. Add "Sign In with LinkedIn" product
4. Set OAuth 2.0 redirect: https://api.t21.app/api/v1/auth/oauth/linkedin/callback
5. Request r_liteprofile, r_emailaddress, w_member_social scopes
```

### Step 10: Testing

```bash
# Install testing dependencies
npm install -D jest ts-jest @types/jest supertest @types/supertest

# Create test file: src/__tests__/auth.test.ts
# Run tests
npm test
```

### Step 11: Monitoring Setup

```bash
# Install Sentry
npm install @sentry/node

# Add to src/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Step 12: CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Production Checklist

- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Stripe webhook configured
- [ ] Social media OAuth apps created
- [ ] Domain configured and SSL enabled
- [ ] CORS configured for production frontend URL
- [ ] Rate limiting enabled
- [ ] Sentry error tracking configured
- [ ] Background workers running
- [ ] Analytics cron job scheduled
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit completed

---

## Useful Commands

```bash
# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create new migration
npx prisma migrate deploy      # Apply migrations (production)
npx prisma db push             # Sync schema without migration
npx prisma generate            # Regenerate Prisma client

# Development
npm run dev                    # Start dev server
npm run worker                 # Start background worker
npm run build                  # Build for production
npm start                      # Run production build

# Utilities
openssl rand -hex 32           # Generate secret key
npx tsx scripts/seed.ts        # Seed database
npx tsx scripts/reset-usage.ts # Reset monthly usage counters
```

---

## Next Steps After Deployment

1. **Frontend Integration**: Update React app to use production API URL
2. **User Onboarding**: Create welcome flow for new users
3. **Documentation**: Write API docs (consider Swagger/OpenAPI)
4. **Analytics Dashboard**: Build admin panel for system metrics
5. **Email Templates**: Design beautiful transactional emails
6. **Mobile App**: Consider React Native app using same API
7. **Webhooks for Users**: Allow users to receive webhooks on events
8. **Advanced Features**: Content calendar, team collaboration, A/B testing

Your production-ready backend is now live!
