/**
 * Script to manually grant PRO plan access to a user
 * Run with: npx tsx src/scripts/grant-pro-access.ts
 */

import { PrismaClient, Plan } from '@prisma/client'

const prisma = new PrismaClient()

async function grantProAccess(email: string, durationYears: number = 1) {
  console.log('\n🎁 Granting PRO Plan Access\n')
  console.log('=' .repeat(80))

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log(`\n❌ User not found with email: ${email}`)
      console.log('💡 Make sure the user has signed up first.\n')
      return
    }

    console.log(`\n✅ Found user: ${user.name || 'No name'} (${user.email})`)
    console.log(`   Current Plan: ${user.plan}`)
    console.log(`   Posts This Month: ${user.postsThisMonth}`)

    // Update user to PRO plan
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        plan: Plan.PRO,
        usageResetDate: new Date(), // Reset usage counter
        postsThisMonth: 0, // Reset monthly posts
      },
    })

    const expirationDate = new Date()
    expirationDate.setFullYear(expirationDate.getFullYear() + durationYears)

    console.log(`\n✅ Successfully upgraded to PRO plan!`)
    console.log(`\n📋 Updated Details:`)
    console.log(`   Plan: ${updatedUser.plan}`)
    console.log(`   Posts Reset: ${updatedUser.postsThisMonth}`)
    console.log(`   Usage Reset Date: ${updatedUser.usageResetDate.toLocaleDateString()}`)
    console.log(`\n⏰ Manual Expiration Note:`)
    console.log(`   Granted on: ${new Date().toLocaleDateString()}`)
    console.log(`   Should expire on: ${expirationDate.toLocaleDateString()}`)
    console.log(`   ⚠️  NOTE: This is a manual grant. Set a reminder to check/revert after 1 year.`)
    console.log(`\n💎 PRO Plan Features Unlocked:`)
    console.log(`   • Up to 5 brands`)
    console.log(`   • 1,000 posts per month`)
    console.log(`   • AI image generation`)
    console.log(`   • Voiceover generation`)
    console.log(`   • Video repurposing`)

  } catch (error) {
    console.error('\n❌ Error granting PRO access:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script with the specified email
const targetEmail = 'sbm8371@gmail.com'
const durationYears = 1

console.log(`\n🎯 Target: ${targetEmail}`)
console.log(`⏰ Duration: ${durationYears} year(s)`)

grantProAccess(targetEmail, durationYears)
