# T21 Backend Architecture Documentation

> **Production-ready backend architecture for T21 SaaS platform**
> AI-powered social media automation with multi-platform publishing

---

## Quick Links

- [Backend Architecture](./backend-architecture.md) - Complete technical specification
- [API Examples](./api-examples.md) - Production-ready route implementations
- [Services Implementation](./services-implementation.md) - External service integrations
- [Setup Guide](./project-setup-guide.md) - Step-by-step deployment instructions
- [System Diagrams](./system-diagrams.md) - Visual architecture and flow diagrams

---

## Executive Summary

### What This Architecture Provides

**Complete backend system** for T21 that supports:
- Multi-tenant SaaS with 3 pricing tiers (Free/Pro/Business)
- User authentication (email + OAuth)
- AI content generation via OpenRouter
- Scheduled publishing to 5 social platforms
- Real-time analytics collection
- Stripe subscription management
- Team collaboration features
- Background job processing
- File storage and media management

### Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Runtime** | Node.js 20 + TypeScript | Type safety, ecosystem |
| **Framework** | Express.js | Lightweight, proven |
| **Database** | PostgreSQL 16 + Prisma ORM | ACID compliance, type-safe queries |
| **Cache/Queue** | Redis + BullMQ | Fast, reliable job processing |
| **Storage** | Cloudflare R2 | Cost-effective ($0.015/GB) |
| **Hosting** | Railway.app | Auto-scaling, managed DB |
| **Payments** | Stripe | Industry standard |
| **AI** | OpenRouter | Multi-model access |
| **Email** | Resend | Modern, developer-friendly |

### Cost Structure

| User Scale | Monthly Cost | Revenue (Example) | Margin |
|------------|--------------|-------------------|---------|
| MVP (0-1K) | $15-50 | $0-5K | 99% |
| Growth (1K-10K) | $100-200 | $5K-50K | 98% |
| Scale (10K+) | $500-1K | $50K+ | 98% |

**Note**: Costs exclude AI API usage (passed through to users)

### Key Features

#### Authentication & Authorization
- JWT-based sessions (15min access, 7-day refresh)
- OAuth support (Google, GitHub)
- Role-based access control (Owner/Admin/Member/Viewer)
- Rate limiting and quota enforcement

#### Content Management
- Multi-brand support per user
- AI-powered content generation
- Media library with cloud storage
- Content templates and reusable assets

#### Social Media Integration
- Instagram, Twitter, LinkedIn, TikTok, Facebook
- OAuth connection flow
- Automated publishing with retry logic
- Analytics collection and reporting

#### Subscription Management
- Stripe integration with webhooks
- 3-tier pricing (Free £0, Pro £7, Business £35)
- Usage-based limits
- Automatic tier upgrades/downgrades

#### Background Processing
- Scheduled post publishing
- Analytics collection cron
- Email notifications
- Automatic retry on failures

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Stripe account
- Social media developer accounts

### Installation (5 minutes)

```bash
# Clone repository
git clone <your-repo-url>
cd t21-backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Set up database
npx prisma migrate dev

# Start development server
npm run dev
```

### Deploy to Production (10 minutes)

```bash
# Using Railway CLI
railway login
railway init
railway add postgresql
railway add redis
railway up

# Or push to GitHub and connect Railway dashboard
```

**Full setup guide**: [project-setup-guide.md](./project-setup-guide.md)

---

## API Overview

### Base URL
```
Production: https://api.t21.app/v1
Development: http://localhost:3000/api/v1
```

### Authentication
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Core Endpoints

#### Authentication
```
POST   /auth/register           - Create new account
POST   /auth/login              - Login with credentials
POST   /auth/refresh            - Refresh access token
GET    /auth/oauth/:provider    - Social OAuth flow
```

#### Brands & Content
```
GET    /brands                  - List user's brands
POST   /brands                  - Create new brand
GET    /posts                   - List posts
POST   /posts                   - Create post
POST   /posts/:id/publish       - Publish immediately
```

#### AI Generation
```
POST   /ai/generate-content     - Generate AI content
POST   /ai/suggest-hashtags     - Get hashtag suggestions
POST   /ai/improve-content      - Improve existing content
```

#### Subscriptions
```
POST   /subscriptions/checkout  - Create Stripe checkout
GET    /subscriptions/current   - Get current subscription
POST   /subscriptions/cancel    - Cancel subscription
```

**Complete API reference**: [api-examples.md](./api-examples.md)

---

## Database Schema

### Core Tables
- **Users** - Authentication, subscriptions, usage tracking
- **Brands** - Multi-brand support with targeting info
- **Posts** - Content with scheduling and AI metadata
- **SocialAccounts** - OAuth connections to platforms
- **Organizations** - Team/organization structure
- **PostAnalytics** - Performance metrics

### Key Relationships
```
User ──► Brand ──► Post ──► SocialPost ──► Analytics
                           ▼
                     SocialAccount
```

**Full schema**: [backend-architecture.md#database-schema-design](./backend-architecture.md#2-database-schema-design)

---

## Architecture Patterns

### Multi-Tenancy
- User-level isolation by default
- Optional organization grouping
- Row-level security via Prisma filters

### Background Jobs
- BullMQ for reliable job processing
- Retry logic with exponential backoff
- Priority queues for time-sensitive operations

### Caching Strategy
- Redis for session storage
- Hot data caching (brands, user profiles)
- Rate limit counters
- Cache invalidation on updates

### Security
- bcrypt password hashing (12 rounds)
- Encrypted OAuth tokens (AES-256-CBC)
- Stripe webhook signature verification
- SQL injection prevention via Prisma
- Rate limiting per user/IP
- CORS configuration
- Helmet security headers

---

## Scaling Strategy

### Phase 1: MVP (0-1K users)
- Single server instance
- Vertical scaling (increase RAM/CPU)
- Basic monitoring

### Phase 2: Growth (1K-10K users)
- Horizontal scaling (2-3 instances)
- Database read replicas
- CDN for media files
- Enhanced caching

### Phase 3: Scale (10K+ users)
- Microservices architecture
- Database sharding
- Kubernetes orchestration
- Multi-region deployment

**Detailed strategy**: [backend-architecture.md#7-scaling-strategy](./backend-architecture.md#7-scaling-strategy)

---

## External Service Setup

### Required Services

1. **Stripe** (Payments)
   - Create products for each tier
   - Set up webhook endpoint
   - Configure subscription prices

2. **OpenRouter** (AI)
   - Create API key
   - Add credits
   - Configure models

3. **Cloudflare R2** (Storage)
   - Create bucket
   - Generate API tokens
   - Optional: Custom domain

4. **Resend** (Email)
   - Add and verify domain
   - Create API key

5. **Social Platforms**
   - Instagram: Meta Developer App
   - Twitter: Developer Portal
   - LinkedIn: Developer Apps
   - TikTok: For Developers
   - Facebook: Meta Business

**Setup instructions**: [project-setup-guide.md#step-8](./project-setup-guide.md#step-8-set-up-external-services)

---

## File Structure

```
t21-backend/
├── src/
│   ├── index.ts                    # Express server
│   ├── routes/                     # API endpoints
│   ├── middleware/                 # Auth, validation, quota
│   ├── services/                   # External integrations
│   ├── workers/                    # Background jobs
│   ├── lib/                        # Utilities (DB, Redis, crypto)
│   └── types/                      # TypeScript definitions
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Migration history
├── .env                            # Environment variables
├── tsconfig.json                   # TypeScript config
├── Dockerfile                      # Container definition
└── package.json                    # Dependencies
```

---

## Key Implementation Files

### Core Services
- [OpenRouter Integration](./services-implementation.md#openrouter-ai-service)
- [Instagram Publishing](./services-implementation.md#social-media-publishing-services)
- [Twitter Publishing](./services-implementation.md#social-media-publishing-services)
- [File Storage (R2)](./services-implementation.md#file-storage-service-cloudflare-r2)
- [Email Service](./services-implementation.md#email-service-resend)

### API Routes
- [Authentication](./api-examples.md#authentication-routes)
- [Posts Management](./api-examples.md#posts-routes)
- [AI Generation](./api-examples.md#ai-generation-route)
- [Stripe Webhooks](./api-examples.md#stripe-webhook-handler)

---

## Development Workflow

### Local Development
```bash
# Terminal 1: PostgreSQL
docker run --name t21-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Terminal 2: Redis
docker run --name t21-redis -p 6379:6379 -d redis

# Terminal 3: API Server
npm run dev

# Terminal 4: Background Worker
npm run worker
```

### Testing
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Database Management
```bash
npx prisma studio         # Visual database editor
npx prisma migrate dev    # Create migration
npx prisma generate       # Regenerate client
```

---

## Deployment Checklist

**Pre-deployment**
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] External services connected and tested
- [ ] SSL certificate configured
- [ ] CORS whitelist updated
- [ ] Error monitoring (Sentry) active

**Post-deployment**
- [ ] Health check endpoint responding
- [ ] Stripe webhooks receiving events
- [ ] Background workers running
- [ ] Email delivery working
- [ ] Analytics collection active
- [ ] Load testing completed

**Full checklist**: [project-setup-guide.md#production-checklist](./project-setup-guide.md#production-checklist)

---

## Monitoring & Maintenance

### Key Metrics
- API response time (target: <200ms p95)
- Database query time (target: <50ms p95)
- Job queue length
- Error rate
- Active subscriptions
- Monthly revenue

### Daily Tasks
- Monitor error logs (Sentry)
- Check job queue health
- Review failed posts

### Weekly Tasks
- Database backup verification
- Performance review
- Usage quota monitoring

### Monthly Tasks
- Reset usage counters (posts, AI credits)
- Cost analysis
- Security updates

---

## Support & Resources

### Documentation
- API Reference: [api-examples.md](./api-examples.md)
- System Diagrams: [system-diagrams.md](./system-diagrams.md)
- Setup Guide: [project-setup-guide.md](./project-setup-guide.md)

### External Documentation
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe API](https://stripe.com/docs/api)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Railway Docs](https://docs.railway.app)

### Community
- GitHub Issues: Report bugs and request features
- Discord: Real-time support (when available)
- Documentation: This comprehensive guide

---

## Next Steps

### Immediate (Week 1-2)
1. Set up development environment
2. Deploy to Railway staging
3. Configure Stripe test mode
4. Implement authentication flow
5. Test social media OAuth

### Short-term (Week 3-4)
1. Complete all API endpoints
2. Add background workers
3. Integrate AI generation
4. Set up monitoring
5. Deploy to production

### Medium-term (Month 2-3)
1. Add remaining social platforms
2. Build admin dashboard
3. Implement team features
4. Advanced analytics
5. Performance optimization

### Long-term (Month 4+)
1. Mobile app API
2. Webhooks for users
3. A/B testing features
4. White-label options
5. Enterprise features

---

## Success Metrics

### Technical
- 99.9% uptime
- <200ms API response time
- <5 second post publishing
- Zero data loss

### Business
- <5% churn rate
- >98% gross margin
- >80% feature adoption
- High NPS score

---

## Version History

- **v1.0** (2026-01-11): Initial architecture design
  - Complete API specification
  - Database schema
  - Service integrations
  - Deployment guides

---

## License

Proprietary - T21 Platform

---

## Contributors

- Architecture: Backend System Architect
- Documentation: Comprehensive technical specifications
- Code Examples: Production-ready implementations

---

**Ready to build?** Start with the [Setup Guide](./project-setup-guide.md) and have your backend running in under an hour.

Questions? Review the [API Examples](./api-examples.md) for implementation details or the [System Diagrams](./system-diagrams.md) for visual architecture reference.
