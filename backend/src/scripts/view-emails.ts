/**
 * Script to view captured emails from the database
 * Run with: npx tsx src/scripts/view-emails.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function viewEmails() {
  console.log('\n📧 Email Captures Report\n')
  console.log('=' .repeat(80))

  try {
    // Get all captures
    const captures = await prisma.emailCapture.findMany({
      orderBy: { capturedAt: 'desc' },
      take: 50, // Limit to last 50
    })

    if (captures.length === 0) {
      console.log('\n❌ No email captures found yet.')
      console.log('💡 Emails will appear here after users enter them in the pricing modal.\n')
      return
    }

    console.log(`\n✅ Found ${captures.length} email captures:\n`)

    // Display each capture
    captures.forEach((capture, index) => {
      console.log(`${index + 1}. ${capture.email}`)
      console.log(`   📅 Captured: ${capture.capturedAt.toLocaleString()}`)
      console.log(`   📋 Plan Interest: ${capture.planInterest || 'Not specified'}`)
      console.log(`   ${capture.marketingConsent ? '✅' : '❌'} Marketing Consent`)
      console.log(`   📍 Source: ${capture.source}`)
      console.log()
    })

    // Statistics
    console.log('=' .repeat(80))
    console.log('\n📊 Statistics:\n')

    const totalCount = await prisma.emailCapture.count()
    const withConsent = await prisma.emailCapture.count({
      where: { marketingConsent: true },
    })
    const proInterest = await prisma.emailCapture.count({
      where: { planInterest: 'Pro' },
    })
    const businessInterest = await prisma.emailCapture.count({
      where: { planInterest: 'Business' },
    })

    console.log(`Total Captures: ${totalCount}`)
    console.log(`With Marketing Consent: ${withConsent} (${Math.round((withConsent / totalCount) * 100)}%)`)
    console.log(`Pro Plan Interest: ${proInterest}`)
    console.log(`Business Plan Interest: ${businessInterest}`)

    // Recent captures (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentCount = await prisma.emailCapture.count({
      where: { capturedAt: { gte: oneDayAgo } },
    })
    console.log(`Captured in Last 24 Hours: ${recentCount}\n`)

  } catch (error) {
    console.error('❌ Error fetching emails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

viewEmails()
