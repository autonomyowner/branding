/**
 * Script to verify a user's plan in the database
 * Run with: npx tsx src/scripts/verify-user-plan.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyUserPlan(email: string) {
  console.log(`\n🔍 Verifying plan for: ${email}\n`)

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log(`❌ User not found: ${email}`)
      return
    }

    console.log('Database Record:')
    console.log('================')
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.name}`)
    console.log(`Plan: ${user.plan}`)
    console.log(`Clerk ID: ${user.clerkId}`)
    console.log(`Posts This Month: ${user.postsThisMonth}`)
    console.log(`Usage Reset Date: ${user.usageResetDate}`)
    console.log(`Stripe Customer ID: ${user.stripeCustomerId || 'None'}`)
    console.log()

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyUserPlan('autonomy.owner@gmail.com')
