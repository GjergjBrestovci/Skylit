# 🚀 SkyLit AI - Quick Deployment Guide

This guide will help you deploy SkyLit AI to production in under 30 minutes.

## Prerequisites Checklist

- [ ] GitHub account with the SkyLit code
- [ ] Supabase account (database)
- [ ] Vercel account (frontend hosting) 
- [ ] Railway account (backend hosting)
- [ ] Upstash account (Redis cache)
- [ ] Stripe account (payments)
- [ ] OpenRouter/OpenAI account (AI services)

## Step 1: Setup Database (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: "skylit-ai"
   - Choose a region close to your users

2. **Configure Database**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the SQL to create all tables and policies

3. **Get Connection Details**
   - Go to Settings > API
   - Copy your:
     - Project URL: `https://xxxxx.supabase.co`
     - Anon Key: `eyJhbGci...`
     - Service Role Key: `eyJhbGci...` (keep this secret!)

## Step 2: Setup Redis Cache (Upstash)

1. **Create Redis Database**
   - Go to [upstash.com](https://upstash.com)
   - Create account and new Redis database
   - Choose region close to your backend
   - Copy the Redis URL: `rediss://default:password@host:port`

## Step 3: Deploy Backend (Railway)

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" > "Deploy from GitHub repo"
   - Select your SkyLit repository
   - Choose the `backend` folder as root

2. **Configure Environment Variables**
   Go to Variables tab and add:
   ```bash
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://your-app.vercel.app
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   JWT_SECRET=your_super_secure_jwt_secret_32_chars_min
   JWT_REFRESH_SECRET=your_super_secure_refresh_secret_32_chars_min
   OPENROUTER_API_KEY=your_openrouter_key
   REDIS_URL=rediss://default:password@host:port
   STRIPE_SECRET_KEY=sk_test_or_live_your_stripe_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   CORS_ORIGIN=https://your-app.vercel.app
   ```

3. **Deploy**
   - Railway will automatically build and deploy
   - Copy your backend URL: `https://your-app.railway.app`

## Step 4: Deploy Frontend (Vercel)

1. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" > Import from GitHub
   - Select your SkyLit repository
   - Set Root Directory to `frontend`
   - Framework: Vite

2. **Configure Environment Variables**
   Go to Settings > Environment Variables and add:
   ```bash
   VITE_API_URL=https://your-app.railway.app
   VITE_APP_URL=https://your-app.vercel.app
   VITE_STRIPE_ENABLED=true
   VITE_ANALYTICS_ENABLED=true
   ```

3. **Deploy**
   - Click Deploy
   - Your app will be live at: `https://your-app.vercel.app`

## Step 5: Configure Services

### Stripe Setup
1. Create products in Stripe Dashboard:
   - Free Plan: $0/month
   - Pro Plan: $19.99/month  
   - Enterprise Plan: $99.99/month
2. Copy price IDs to Railway environment variables
3. Set up webhook endpoint: `https://your-app.railway.app/api/webhooks/stripe`

### Domain Setup (Optional)
1. Buy domain (e.g., skylit.ai)
2. In Vercel: Settings > Domains > Add your domain
3. In Railway: Settings > Domains > Add api.yourdomain.com
4. Update CORS_ORIGIN and FRONTEND_URL variables

## Step 6: Verify Deployment

Test these URLs:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend Health: `https://your-app.railway.app/health`
- ✅ Database: Login/signup should work
- ✅ AI Generation: Create a project
- ✅ Payments: Try upgrading plan

## Monitoring & Analytics (Optional)

### Google Analytics
1. Create GA4 property
2. Add tracking ID to Vercel environment: `VITE_GA_TRACKING_ID`

### Sentry Error Tracking
1. Create Sentry project
2. Add DSN to both Vercel and Railway environments

## Scaling Considerations

### Performance
- ✅ CDN (Vercel provides automatically)
- ✅ Redis caching (Upstash)
- ✅ Database connection pooling (Supabase)
- ✅ Rate limiting (implemented)

### Security
- ✅ CORS configuration
- ✅ JWT authentication
- ✅ Row Level Security (Supabase)
- ✅ Input validation (Zod)

## Common Issues & Solutions

### Backend won't start
- Check Railway logs
- Verify all environment variables are set
- Ensure Redis URL is correct

### Frontend can't connect to backend
- Check CORS_ORIGIN includes your Vercel URL
- Verify VITE_API_URL points to Railway

### Database connection issues
- Check Supabase service role key
- Verify RLS policies are correct
- Check database logs in Supabase

### AI generation not working
- Verify OpenRouter/OpenAI API key
- Check API quota limits
- Review backend logs for errors

## Cost Estimation

**Free Tier (Development)**
- Supabase: Free (500MB DB, 50MB storage)
- Vercel: Free (100GB bandwidth)
- Railway: $5/month (512MB RAM, 1GB storage)
- Upstash: Free (10K requests/day)
- **Total: ~$5/month**

**Production (Small Scale)**
- Supabase Pro: $25/month
- Vercel Pro: $20/month  
- Railway: $20/month (2GB RAM, 5GB storage)
- Upstash: $10/month (1M requests)
- **Total: ~$75/month**

## Support

- 📚 [Full Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/GjergjBrestovci/Skylit/issues)
- 💬 [Discord Community](#)
- 📧 [Email Support](mailto:support@skylit.ai)

---

🎉 **Congratulations!** Your SkyLit AI application is now live in production!

Remember to:
- Set up monitoring and alerts
- Configure automated backups
- Plan for scaling as you grow
- Keep dependencies updated
