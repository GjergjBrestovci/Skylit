# 🚀 Database Setup - Quick Guide

## ✅ Your Database is READY to Connect!

The script just confirmed:
- ✅ Supabase connection is working
- ❌ Tables need to be created

## 📋 Follow These Steps (5 minutes):

### Step 1: Open Supabase Dashboard
Click here: https://supabase.com/dashboard/project/tkamngwfbnncbzanejnt

### Step 2: Go to SQL Editor
- Look at the left sidebar
- Click **"SQL Editor"**

### Step 3: Create New Query
- Click **"New Query"** button (top right)

### Step 4: Copy & Paste Migration SQL
- Open the file: **`FULL_MIGRATION.sql`** (in this directory)
- Copy ALL the content
- Paste it into the SQL Editor

### Step 5: Run the Migration
- Click the **"Run"** button (or press Ctrl+Enter)
- Wait for "Success" message

### Step 6: Verify It Worked
Run this command again:
```bash
npm run setup:db
```

You should see:
```
✅ user_credits table EXISTS!
🎉 SUCCESS! Database is already set up!
```

## 🎯 What This Creates

The migration creates **3 tables** to track everything per user:

### 1. `user_credits` Table
Tracks for EACH user:
- ✅ **Credits** - How many website generations they have left (default: 10)
- ✅ **Unlimited Access** - Boolean flag (`has_unlimited_credits`)
- ✅ **Secret Key** - Stores "gjergj" for unlimited access
- ✅ **Paid Membership** - Plan type (free/pro/enterprise)
- ✅ **Subscription Status** - active/inactive/cancelled/past_due/none
- ✅ **Stripe IDs** - For payment processing

### 2. `projects` Table  
Stores all generated websites:
- User's website HTML, CSS, JavaScript
- Preview URLs
- Tech stack used
- Creation dates

### 3. `previews` Table
Temporary preview links:
- 24-hour expiration
- Public sharing capability

## 🔒 Security (Row Level Security)

All tables have RLS enabled:
- Users can ONLY see their own data
- Secret keys are protected
- Credits are user-specific

## 🧪 Test It Works

After running the migration:

1. **Restart your backend server**
   ```bash
   npm run dev
   ```

2. **Check the logs** - Should see:
   ```
   ✅ Database connection healthy - user_credits table exists
   ```

3. **Login to your app**

4. **Enter secret key "gjergj"** in the sidebar

5. **Check billing button** - Should show ∞ symbol

6. **Refresh the page** - ∞ symbol should STILL be there!

7. **Restart backend** - ∞ symbol STILL persists!

## ❓ Troubleshooting

### Still seeing "Database Not Connected" warning?
- Make sure you clicked "Run" in Supabase SQL Editor
- Check for any error messages in the SQL Editor
- Restart your backend server

### Table creation failed?
- Make sure you're using the correct Supabase project
- Check that you have permission to create tables
- Try running the SQL in smaller chunks

### Connection errors?
- Verify `backend/.env` has correct SUPABASE_URL
- Check SUPABASE_ANON_KEY is set
- Make sure your Supabase project isn't paused

## 🎉 Once It's Working

You'll have:
- ✅ Credits that persist forever
- ✅ Secret key remembered across sessions
- ✅ Paid membership tracking ready
- ✅ All user data safely stored in database
- ✅ No more "memory fallback" warnings

## 📞 Need Help?

Run the diagnostic tool anytime:
```bash
npm run setup:db
```

It will show you exactly what's missing and how to fix it!
