# Admin Dashboard Setup

## Overview

The admin dashboard allows authorized users to view:
- **Statistics**: Total users, posts, brands, email captures
- **Users Table**: All registered users with their plan, usage stats
- **Email Captures Table**: All captured emails from pricing modal

## Setup Instructions

### 1. Set Admin Emails

Add your admin email(s) to the backend `.env` file:

```bash
# Single admin
ADMIN_EMAILS=admin@postaify.com

# Multiple admins (comma-separated)
ADMIN_EMAILS=admin@postaify.com,developer@postaify.com,manager@postaify.com
```

### 2. Access the Dashboard

1. Sign in to your account at https://www.postaify.com
2. Navigate to: https://www.postaify.com/admin
3. If your email is in `ADMIN_EMAILS`, you'll see the dashboard
4. If not, you'll see "Access denied. Admin only."

## Dashboard Features

### Overview Tab 📊
- **User Statistics**
  - Total users
  - Users by plan (Free, Pro, Business)
  - Recent signups (last 30 days)

- **Content Statistics**
  - Total posts created
  - Total brands created

- **Email Capture Statistics**
  - Total email captures
  - Captures with marketing consent
  - Consent rate percentage
  - Recent captures (last 7 days)

### Users Tab 👥
View all registered users with:
- Email address
- Name
- Current plan (Free/Pro/Business)
- Number of brands created
- Total posts created
- Posts this month
- Joined date

**Features:**
- Paginated view (50 users per page)
- Navigate between pages
- See real-time usage stats

### Email Captures Tab 📧
View all captured emails with:
- Email address
- Plan interest (Pro/Business)
- Marketing consent status
- Source (e.g., pricing_modal)
- Capture timestamp

**Features:**
- Paginated view (50 captures per page)
- Filter by consent status (visual indicators)
- Navigate between pages

## API Endpoints

All admin endpoints require authentication + admin email verification.

### GET /api/v1/admin/stats
Returns overall statistics

**Response:**
```json
{
  "users": {
    "total": 150,
    "free": 100,
    "pro": 40,
    "business": 10,
    "recentSignups": 25
  },
  "content": {
    "totalPosts": 5000,
    "totalBrands": 300
  },
  "emailCaptures": {
    "total": 200,
    "withConsent": 150,
    "consentRate": 75,
    "recentCaptures": 30
  }
}
```

### GET /api/v1/admin/users?page=1&limit=50
Returns paginated list of users

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

### GET /api/v1/admin/email-captures?page=1&limit=50
Returns paginated list of email captures

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

### GET /api/v1/admin/recent-activity?limit=20
Returns recent activity across the platform

## Security

- **Authentication Required**: Must be signed in
- **Email Verification**: Email must be in `ADMIN_EMAILS` env var
- **403 Error**: Returned if user is not an admin
- **No Role in Database**: Admin status is environment-based only

## Troubleshooting

### "Access denied. Admin only."
**Solution:** Add your email to `ADMIN_EMAILS` in backend `.env` file:
```bash
ADMIN_EMAILS=your-email@example.com
```

Then restart your backend:
```bash
cd backend
npm run dev
```

### Dashboard shows but no data
**Possible causes:**
1. Database has no data yet (sign up users, capture emails)
2. Backend API connection issue (check console for errors)
3. Authentication issue (try signing out and back in)

### Can't access /admin route
**Possible causes:**
1. Not signed in (sign in first)
2. Route not deployed (check Vercel deployment)
3. Check browser console for errors

## Adding More Admins

Simply add their email to the comma-separated list:

```bash
# Before
ADMIN_EMAILS=admin@postaify.com

# After
ADMIN_EMAILS=admin@postaify.com,newadmin@postaify.com,manager@postaify.com
```

No need to restart - the env variable is checked on each request.

## Future Enhancements

Potential features to add:
- Export data to CSV
- Search and filter users
- View individual user details
- Delete test data
- Send emails to captured leads
- Analytics charts and graphs
- Activity timeline
- User impersonation for support

## Related Files

**Backend:**
- `backend/src/routes/admin.ts` - Admin API routes
- `backend/src/routes/emails.ts` - Email capture endpoint
- `backend/prisma/schema.prisma` - Database schema

**Frontend:**
- `src/pages/AdminPage.tsx` - Admin dashboard component
- `src/lib/api.ts` - API client methods
- `src/App.tsx` - Admin route configuration
