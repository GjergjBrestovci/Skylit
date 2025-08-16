# Supabase Setup Guide

## 1. Create Supabase Project
1. Go to https://supabase.com and create an account
2. Create a new project
3. Wait for the project to be ready (1-2 minutes)

## 2. Set up Database Tables
1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `supabase_schema.sql`
3. Run the SQL script to create the tables and policies

## 3. Get Your Credentials
In your Supabase project dashboard:
1. Go to Settings > API
2. Copy your Project URL
3. Copy your `anon` public key
4. Copy your `service_role` secret key (keep this secure!)

## 4. Update Environment Variables
Update your `.env` file with:
```env
SUPABASE_URL=your_actual_project_url
SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_KEY=your_actual_service_role_key
```

## 5. Test the Setup
1. Start your backend server: `npm run dev`
2. The authentication should now work with Supabase
3. Users will be stored in Supabase Auth
4. Projects will be stored in your Supabase database

## Features Enabled
- ✅ User registration and login
- ✅ JWT token authentication
- ✅ Secure project storage
- ✅ Row Level Security (users can only see their own data)
- ✅ Real-time capabilities (can be enabled later)
- ✅ Automatic backups and scaling
