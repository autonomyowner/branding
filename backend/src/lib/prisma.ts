import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure connection pooling for production scalability
// Default Prisma pool is only 5 connections - way too low for production
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Connection pool settings are configured via DATABASE_URL query params:
// ?connection_limit=25&pool_timeout=10
// Add these to your DATABASE_URL in .env:
// DATABASE_URL="postgresql://...?connection_limit=25&pool_timeout=10"

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
