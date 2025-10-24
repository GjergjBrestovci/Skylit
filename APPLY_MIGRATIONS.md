# Apply Database Migrations to Supabase

The credit system and unlimited access are currently using **memory fallback** because the database tables haven't been created yet. To make credits and unlimited status persist across sessions, you need to apply the migrations to your Supabase database.

## Option 1: Apply Migrations via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/tkamngwfbnncbzanejnt

2. Navigate to **SQL Editor** in the left sidebar

3. Copy and paste the contents of each migration file in order:

### Migration 1: Initial Schema
```sql
-- Copy contents from: supabase/migrations/001_initial_schema.sql
```

Click "Run" to execute.

### Migration 2: Add Secret Key Support
```sql
-- Copy contents from: supabase/migrations/002_add_secret_key.sql
```

Click "Run" to execute.

## Option 2: Use Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref tkamngwfbnncbzanejnt

# Apply migrations
supabase db push
```

## Verify Tables Were Created

After applying migrations, verify in Supabase Dashboard:

1. Go to **Table Editor**
2. You should see these tables:
   - `projects` - stores user's website projects
   - `user_credits` - stores credit balance and unlimited status
   - `previews` - stores preview URLs

## What Happens After Migration?

Once the migrations are applied:

✅ **Credits persist** - User credits are saved in the database
✅ **Secret key remembered** - Unlimited access status is saved
✅ **No more memory fallback** - System uses real database instead
✅ **Works across sessions** - Credits and unlimited status survive page refreshes and logouts

## Current Behavior (Memory Fallback)

Without migrations applied:
- Credits reset to 10 every time the server restarts
- Secret key needs to be re-entered after server restart
- Each user ID gets independent memory storage
- Data is lost when browser closes

## Testing After Migration

1. Enter secret key "gjergj" in the sidebar
2. Verify unlimited credits are activated (∞ symbol shows)
3. Refresh the page
4. **Credits should still show ∞** (unlimited persists)
5. Restart the backend server
6. Login again
7. **Unlimited status should still be active** (saved in database)

## Troubleshooting

If you still see "Using memory fallback" in logs:

1. Check backend/.env has correct SUPABASE_URL and SUPABASE_ANON_KEY
2. Verify migrations were applied successfully in Supabase Dashboard
3. Check Supabase project is not paused (free tier projects pause after inactivity)
4. Restart backend server: `npm run dev:backend`
