# Database Issues - Summary & Fix

## Issues Found

### 1. ❌ Projects Not Saving
**Cause**: Backend using ANON_KEY → RLS blocks requests (auth.uid() is NULL)
**Fix**: Use SERVICE_ROLE_KEY for database operations

### 2. ❌ Credits Not Loading/Saving by User
**Cause**: Same RLS issue - backend can't access user_credits table
**Fix**: Same - SERVICE_ROLE_KEY bypasses RLS

### 3. ❌ Schema Mismatch
**Cause**: Projects table has `name` column, but saveProject controller uses `title`
**Fix**: Added migration to add `title`, `prompt`, `generated_code`, `model` columns

## What Changed

### Code Updates (✅ Already Done)

1. **`backend/supabase.ts`**
   - Created TWO clients: `supabase` (SERVICE_ROLE) and `supabaseAuth` (ANON)
   - `supabase` → database operations (bypasses RLS)
   - `supabaseAuth` → authentication (respects RLS)

2. **`backend/controllers/auth.ts`**
   - Now imports `supabaseAuth` for authentication

3. **`backend/middleware/auth.ts`**
   - Now imports `supabaseAuth` for token verification

4. **`supabase/migrations/002_fix_projects_schema.sql`**
   - Adds missing columns to projects table
   - Migrates data from `name` to `title`

### Required Manual Steps

You need to:

1. **Get SERVICE_ROLE_KEY from Supabase**
   - Dashboard → Settings → API → service_role key

2. **Add to `backend/.env`**
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Run migration SQL**
   - Copy `supabase/migrations/002_fix_projects_schema.sql`
   - Paste in Supabase Dashboard → SQL Editor → Run

4. **Restart backend**
   ```bash
   npm run dev:backend
   ```

## How It Works Now

```
User Request Flow:
1. User logs in → supabaseAuth validates → returns JWT
2. User saves project → middleware verifies JWT → extracts userId
3. Controller uses supabase (SERVICE_ROLE) → saves to database
4. Even though RLS is bypassed, code checks userId matches requester
```

## Security

✅ **Still Secure**: 
- SERVICE_ROLE only in backend (never exposed)
- Middleware authenticates every request
- Controllers check userId before database operations
- Users can only access their own data (enforced in code)

## Testing After Fix

1. ✅ Login with your account
2. ✅ Check credits display in UI
3. ✅ Generate a website (should deduct credits)
4. ✅ View projects in sidebar (should show your projects)
5. ✅ Enter secret key "gjergj" (should grant unlimited)
6. ✅ Save/load projects (should persist correctly)

---

**See**: 
- `DATABASE_FIX_INSTRUCTIONS.md` for step-by-step setup
- `DATABASE_ARCHITECTURE.md` for technical deep-dive
