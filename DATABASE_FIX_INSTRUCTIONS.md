# Database Issues Fix - Action Required

## Problems Identified

1. **RLS (Row Level Security) Issue**: Backend was using ANON_KEY which respects RLS policies. RLS policies check `auth.uid()` which is NULL when the backend makes requests on behalf of users.

2. **Schema Mismatch**: The `projects` table has column `name` but the `saveProject` controller uses `title`.

3. **Missing Columns**: Projects table missing `prompt`, `generated_code`, `model` columns that controllers expect.

## Solutions Applied

### 1. Backend Configuration (✅ Code Updated)

Updated `backend/supabase.ts` to use TWO separate clients:
- **`supabase`** - Uses SERVICE_ROLE_KEY for database operations (bypasses RLS)
- **`supabaseAuth`** - Uses ANON_KEY for authentication (respects RLS)

This is the standard pattern for backend services.

### 2. Schema Migration Created

Created `supabase/migrations/002_fix_projects_schema.sql` to:
- Add missing columns: `title`, `prompt`, `generated_code`, `model`
- Migrate existing `name` data to `title`
- Maintain backward compatibility

## Action Required

### Step 1: Get Your SERVICE_ROLE_KEY

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `Skylit`
3. Go to **Settings** (gear icon in sidebar) → **API**
4. Scroll to **Project API keys**
5. Find **`service_role`** key (marked as "secret")
6. Click **Reveal** and copy it

⚠️ **WARNING**: The service_role key has ADMIN access. Never expose it to frontend!

### Step 2: Add SERVICE_ROLE_KEY to Backend

Add this line to `backend/.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Your `.env` should now have:
```bash
SUPABASE_URL=https://tkamngwfbnncbzanejnt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NEW)
```

### Step 3: Apply Schema Migration

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Click **New query**
4. Copy the contents of `supabase/migrations/002_fix_projects_schema.sql`
5. Paste and click **Run**

OR run this command:
```bash
cat supabase/migrations/002_fix_projects_schema.sql
```
Then copy the output and paste it into Supabase SQL Editor.

### Step 4: Restart Backend

```bash
npm run dev:backend
```

## What This Fixes

✅ **Projects will save correctly** - Service role bypasses RLS, backend handles permissions
✅ **Credits will load/update per user** - Backend can now access user_credits table
✅ **Projects will load per user** - Backend can query projects by user_id
✅ **Schema matches controllers** - All expected columns present

## Verification

After completing steps 1-4, test:

1. **Login** - User authentication should work
2. **Check credits** - Credits should display in UI
3. **Generate website** - Should deduct credits and save project
4. **View projects** - Sidebar should show your projects
5. **Enter secret key "gjergj"** - Should grant unlimited credits

## Security Note

The SERVICE_ROLE_KEY approach is secure because:
- Key is only in backend `.env` (never exposed to frontend)
- Backend middleware still authenticates users via JWT
- Backend controllers check `req.userId` before database operations
- Only the backend server can bypass RLS, not end users

---

**Next Steps**: Please complete Steps 1-4 above, then restart the backend and test the application.
