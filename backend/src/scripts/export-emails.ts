/**
 * Script to export captured emails to CSV
 * Run with: npx tsx src/scripts/export-emails.ts
 */

import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function exportEmails() {
  console.log('\n📧 Exporting Email Captures to CSV...\n')

  try {
    const captures = await prisma.emailCapture.findMany({
      orderBy: { capturedAt: 'desc' },
    })

    if (captures.length === 0) {
      console.log('❌ No email captures found to export.\n')
      return
    }

    // Create CSV content
    const headers = ['Email', 'Marketing Consent', 'Plan Interest', 'Source', 'Captured At']
    const rows = captures.map(c => [
      c.email,
      c.marketingConsent ? 'Yes' : 'No',
      c.planInterest || '',
      c.source || '',
      c.capturedAt.toISOString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    // Save to file
    const filename = `email-captures-${new Date().toISOString().split('T')[0]}.csv`
    const filepath = join(process.cwd(), filename)
    writeFileSync(filepath, csvContent, 'utf-8')

    console.log(`✅ Exported ${captures.length} email captures`)
    console.log(`📁 File saved: ${filepath}\n`)
  } catch (error) {
    console.error('❌ Error exporting emails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportEmails()
