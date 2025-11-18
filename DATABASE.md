# SkyLit AI - Database Setup Guide

## Quick Start

Your database is configured and ready! Run this to verify:

```bash
npm run setup:db
```

## What's Configured

### Tables
- **user_credits** - Tracks credits, plans, and unlimited access per user
- **projects** - Stores generated websites with title, code, and metadata
- **previews** - Temporary preview URLs (24-hour TTL)

### Environment Variables

Required in `backend/.env`:
```bash
SUPABASE_URL=https://tkamngwfbnncbzanejnt.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Migrations

All SQL migrations are in `supabase/migrations/`:

1. **001_initial_schema.sql** - Core tables with RLS policies
2. **002_fix_projects_schema.sql** - Adds title/prompt/model columns
3. **003_fix_function_security.sql** - Secures trigger functions

### Applying Migrations

Run each SQL file in Supabase Dashboard → SQL Editor in order (001, 002, 003).

## Dev Mode

When using `AUTH_BYPASS=true`, non-UUID user IDs (like "dev-user") automatically use in-memory storage instead of hitting Supabase. This prevents UUID validation errors during development.

To test with real Supabase data in dev mode, create a real user and set:
```bash
# In your .env or as request header
DEV_SUPABASE_USER_ID=actual-uuid-from-auth-users
```

## Secret Key Feature

Users can enter secret key **"gjergj"** to unlock unlimited credits. This is stored in `user_credits.secret_key` and sets `has_unlimited_credits = true`.

## Troubleshooting

### Credits not persisting?
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in `backend/.env`
- Run `npm run setup:db` to check connection
- Check backend logs for UUID validation warnings

### Projects not saving?
- Ensure migrations 001 and 002 are applied
- Verify user is authenticated (not dev bypass with invalid UUID)
- Check `projects` table exists in Supabase Dashboard

### RLS blocking requests?
- Backend uses SERVICE_ROLE_KEY which bypasses RLS
- Controllers validate `req.userId` before database operations
- RLS policies are for direct client access only

## Architecture

- **Backend uses SERVICE_ROLE_KEY** to bypass RLS for trusted server operations
- **Frontend uses ANON_KEY** for authentication only
- **Middleware validates JWT** and extracts userId
- **Controllers enforce permissions** by filtering on userId

---

**Database Status:** ✅ Connected and operational
