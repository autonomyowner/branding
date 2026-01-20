# Email Captures - How to Access

This guide shows you how to view and manage captured emails from your pricing modal.

## Quick Access Methods

### 1. Prisma Studio (Visual GUI)

**Easiest method - opens in your browser**

```bash
cd backend
npx prisma studio
```

Then:
- Open http://localhost:5555
- Click "EmailCapture" in the sidebar
- View, search, filter, and edit data visually

---

### 2. View Script (Terminal)

**Quick command-line view with statistics**

```bash
cd backend
npx tsx src/scripts/view-emails.ts
```

Shows:
- List of all captured emails
- Marketing consent status
- Plan interest (Pro/Business)
- Capture timestamps
- Statistics (total count, consent rate, etc.)

---

### 3. Export to CSV

**Download all emails as spreadsheet**

```bash
cd backend
npx tsx src/scripts/export-emails.ts
```

Creates a CSV file with all captured emails that you can open in Excel/Google Sheets.

---

### 4. Direct SQL Queries

**For advanced users - run these in your Neon database console**

#### Get all captures
```sql
SELECT * FROM "EmailCapture" ORDER BY "capturedAt" DESC;
```

#### Get only emails with marketing consent
```sql
SELECT * FROM "EmailCapture"
WHERE "marketingConsent" = true
ORDER BY "capturedAt" DESC;
```

#### Count total captures
```sql
SELECT COUNT(*) as total FROM "EmailCapture";
```

#### Get Pro plan interest
```sql
SELECT * FROM "EmailCapture"
WHERE "planInterest" = 'Pro'
ORDER BY "capturedAt" DESC;
```

#### Get recent captures (last 7 days)
```sql
SELECT * FROM "EmailCapture"
WHERE "capturedAt" > NOW() - INTERVAL '7 days'
ORDER BY "capturedAt" DESC;
```

#### Statistics by plan
```sql
SELECT
  "planInterest",
  COUNT(*) as count,
  SUM(CASE WHEN "marketingConsent" THEN 1 ELSE 0 END) as with_consent
FROM "EmailCapture"
GROUP BY "planInterest";
```

---

## Database Schema

**Table:** `EmailCapture`

| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique identifier (cuid) |
| email | String | User's email address |
| marketingConsent | Boolean | Did they opt in for marketing? |
| source | String | Where captured (e.g., "pricing_modal") |
| planInterest | String | Which plan they were viewing (Pro/Business) |
| capturedAt | DateTime | Timestamp when captured |
| userId | String? | Optional: Linked User ID if they sign up |

---

## How It Works

1. **User fills out pricing modal** on your site
2. **Email is captured** and sent to backend
3. **Stored in database** with all metadata
4. **Analytics tracked** (Meta Pixel Lead event + GA4 generate_lead)
5. **Also stored in localStorage** for checkout pre-fill

---

## Common Tasks

### View today's captures
```bash
npx tsx src/scripts/view-emails.ts
```

### Export for email marketing
```bash
npx tsx src/scripts/export-emails.ts
```

### Count marketing consent rate
```sql
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN "marketingConsent" THEN 1 ELSE 0 END) as consented,
  ROUND(100.0 * SUM(CASE WHEN "marketingConsent" THEN 1 ELSE 0 END) / COUNT(*), 2) as consent_rate_percent
FROM "EmailCapture";
```

---

## Access Your Neon Database Directly

1. Go to https://console.neon.tech/
2. Select your project
3. Click on "SQL Editor"
4. Run any of the SQL queries above

---

## Troubleshooting

**"No captures found"**
- Feature just deployed, emails will appear after users submit the form
- Test it yourself at https://www.postaify.com

**"Prisma Studio won't open"**
- Make sure you're in the `backend` folder
- Check your `.env` file has `DATABASE_URL`
- Try: `npx prisma generate` first

**"Script won't run"**
- Install tsx: `npm install -D tsx`
- Make sure you're in the `backend` folder

---

## Need Help?

- View scripts: `backend/src/scripts/`
- Database connection: Check `backend/.env` → `DATABASE_URL`
- Prisma schema: `backend/prisma/schema.prisma`
