# Admin Dashboard Setup

## Overview

The admin dashboard allows authorized users to view:
- **Statistics**: Total users, posts, brands, email captures
- **Users Table**: All registered users with their plan, usage stats
- **Email Captures Table**: All captured emails from pricing modal

## Setup Instructions

### Admin Credentials

The admin dashboard uses simple username and password authentication:

**Username:** `admin`
**Password:** `RTILLidie22`

These credentials are hardcoded in `backend/src/routes/admin.ts`. To change them, edit the following lines:

```typescript
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'RTILLidie22'
```

### Access the Dashboard

1. Navigate to: https://www.postaify.com/admin
2. Enter the admin username and password
3. You'll see the admin dashboard with three tabs

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

### POST /api/v1/admin/login
Login to get admin access token

**Request:**
```json
{
  "username": "admin",
  "password": "RTILLidie22"
}
```

**Response:**
```json
{
  "success": true,
  "token": "admin-session-RTILLidie22",
  "message": "Login successful"
}
```

All other admin endpoints require the Authorization header with the admin token.

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

- **Simple Username/Password**: Admin login uses hardcoded credentials
- **Token-Based**: Admin token stored in localStorage after login
- **Authorization Header**: All admin API calls include Bearer token
- **403 Error**: Returned if token is invalid or missing
- **No Database Storage**: Credentials are hardcoded in backend route

**Security Note:** For production use, consider implementing:
- Environment variables for credentials
- Hashed password storage
- Session expiration
- Rate limiting on login attempts

## Troubleshooting

### "Access denied. Admin only."
**Solution:** Make sure you're using the correct credentials:
- Username: `admin`
- Password: `RTILLidie22`

If you changed the credentials in the code, restart your backend:
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

## Changing Admin Credentials

To change the admin username or password:

1. Open `backend/src/routes/admin.ts`
2. Update the credentials:
   ```typescript
   const ADMIN_USERNAME = 'your-new-username'
   const ADMIN_PASSWORD = 'your-new-password'
   ```
3. Restart the backend:
   ```bash
   cd backend
   npm run dev
   ```
4. Login with the new credentials

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
