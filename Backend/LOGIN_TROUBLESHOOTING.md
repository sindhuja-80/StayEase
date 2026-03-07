# Login Troubleshooting Guide

## Current Setup
- Frontend is on `http://localhost:5174`
- Backend is on `http://localhost:5000`
- Database: PostgreSQL (stayease)
- Authentication: Clerk

## Common Issues & Solutions

### Issue 1: User not found in database after login

**Problem**: User logs in via Clerk but gets "User not found in DB" error

**Cause**: Clerk webhook isn't being triggered to create the user in PostgreSQL

**Solution**: 

1. **For Development Testing - Create a test user manually**:
```bash
curl -X POST http://localhost:5000/api/user/test-create \
  -H "Content-Type: application/json" \
  -d '{
    "id": "user_test123",
    "username": "Test User",
    "email": "test@example.com",
    "image": "https://example.com/avatar.png",
    "role": "user"
  }'
```

2. **Verify user was created**:
```bash
curl http://localhost:5000/api/user/all
```

### Issue 2: Authentication token not being sent

**Cause**: Frontend isn't attaching Clerk token to requests

**Check**: Open browser console (F12) and look at network requests to `/api/user`
- Should have `Authorization: Bearer <token>` header
- If missing, there's an issue with Clerk integration on frontend

**Solution**:
- Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in Frontend/.env
- Try logging out and logging back in
- Clear browser cache

### Issue 3: Webhook not configured

**When to expect webhooks**:
- User signs up via Clerk
- User logs in for the first time
- User updates profile
- User deletes account

**Current setup**:
- Development mode enabled: `NODE_ENV=development`
- Webhook verification skipped: `SKIP_WEBHOOK_VERIFY=true`
- Backend is at `http://localhost:5000/api/clerk`

**To configure Clerk webhooks**:
1. Go to https://dashboard.clerk.com
2. Navigate to Webhooks
3. Add endpoint: `https://yourdomain.com/api/clerk` (use ngrok for local testing)
4. Subscribe to: `user.created`, `user.updated`, `user.deleted`

## Testing Flow

### Step 1: Start Backend
```bash
cd Backend
npm run server
```

### Step 2: Start Frontend
```bash
cd Frontend
npm run dev
```

### Step 3: Create Test User (if webhook not working)
```bash
curl -X POST http://localhost:5000/api/user/test-create \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test_user_id",
    "username": "Test User",
    "email": "test@example.com"
  }'
```

### Step 4: Get Token from Clerk Console
- Sign in on frontend
- Open browser DevTools → Network tab
- Filter by "user" endpoint
- Copy your Clerk user ID from the request

### Step 5: Test Protected Endpoint
```bash
# Replace YOUR_USER_ID with the actual Clerk user ID
curl -X GET http://localhost:5000/api/user \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

## Database Schema

The database has 4 tables:

**users** - Stores user data from Clerk
```sql
id (TEXT, PRIMARY KEY)
username (TEXT)
email (TEXT)
image (TEXT)
role (TEXT) - 'user' or 'hotelOwner'
recent_searched_cities (TEXT[])
created_at, updated_at (TIMESTAMPTZ)
```

**hotels** - Hotel listings created by hotel owners
```sql
id (SERIAL, PRIMARY KEY)
name, address, contact, city (TEXT)
owner (TEXT) - references users.id
created_at, updated_at (TIMESTAMPTZ)
```

**rooms** - Rooms in hotels
```sql
id (SERIAL, PRIMARY KEY)
hotel (INTEGER) - references hotels.id
room_type, price_per_night, amenities
images (TEXT[])
is_available (BOOLEAN)
created_at, updated_at (TIMESTAMPTZ)
```

**bookings** - Room bookings
```sql
id (SERIAL, PRIMARY KEY)
user, room, hotel (references to other tables)
check_in_date, check_out_date (DATE)
total_price, guests (NUMBER)
status, payment_method, is_paid
created_at, updated_at (TIMESTAMPTZ)
```

## Debugging Tips

1. **Check backend logs** - Look for "protect middleware" messages
2. **Check database** - Connect to postgres and verify users table:
```sql
SELECT * FROM users;
```

3. **Check browser console** - Frontend errors will show here
4. **Use test endpoint** - `/api/user/test-create` to manually add users

## Environment Variables

**Backend (.env)**:
- `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- `NODE_ENV=development`
- `SKIP_WEBHOOK_VERIFY=true` (for testing)

**Frontend (.env)**:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_BACKEND_URL=http://localhost:5000`
- `VITE_CURRENCY=$`
