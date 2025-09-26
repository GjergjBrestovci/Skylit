# SkyLit AI - Production Deployment Guide

## Overview

This guide covers deploying SkyLit AI to production with enterprise-grade reliability, security, and performance.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   CDN (Cloudflare│    │   DNS Provider  │
│   (AWS ALB/     │────│   /CloudFront)   │────│   (Route 53)    │
│   Nginx Proxy)  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Monitoring    │
│   (Vercel/      │────│   (Railway/     │────│   (DataDog/     │
│   Netlify)      │    │   Render/AWS)   │    │   New Relic)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Cache Layer   │    │   File Storage  │
│   (Supabase/    │────│   (Redis/       │────│   (S3/Supabase  │
│   PostgreSQL)   │    │   Upstash)      │    │   Storage)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### Required Accounts & Services

1. **Database**: Supabase (recommended) or PostgreSQL
2. **Cache**: Redis (Upstash recommended for serverless)
3. **AI Provider**: OpenRouter, OpenAI, or Anthropic
4. **Payments**: Stripe
5. **Hosting**: Vercel (frontend) + Railway/Render (backend)
6. **Monitoring**: DataDog, New Relic, or Sentry
7. **CDN**: Cloudflare or AWS CloudFront
8. **DNS**: Cloudflare or AWS Route 53

### Domain Requirements

- **Primary Domain**: `skylit.ai`
- **API Subdomain**: `api.skylit.ai`
- **CDN Subdomain**: `cdn.skylit.ai`
- **Status Page**: `status.skylit.ai`

## Environment Configuration

### Backend Environment Variables

Create a `.env.production` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Domain Configuration
FRONTEND_URL=https://skylit.ai
API_URL=https://api.skylit.ai

# Database (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_minimum_32_characters

# AI Services
OPENROUTER_API_KEY=your_openrouter_api_key
# OR
OPENAI_API_KEY=your_openai_api_key

# Cache (Redis)
REDIS_URL=redis://your-redis-instance:6379
# OR for Upstash
REDIS_URL=rediss://default:password@host:port

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_BASIC_PRICE_ID=price_your_basic_price
STRIPE_PRO_PRICE_ID=price_your_pro_price
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price

# Security
CORS_ORIGIN=https://skylit.ai,https://www.skylit.ai
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Monitoring
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_api_key

# Features
MOCK_AI=false
AUTH_BYPASS=false
STRIPE_ENABLED=true
```

### Frontend Environment Variables

Create a `.env.production` file:

```bash
# API Configuration
VITE_API_URL=https://api.skylit.ai
VITE_APP_URL=https://skylit.ai

# Features
VITE_STRIPE_ENABLED=true
VITE_ANALYTICS_ENABLED=true

# Analytics
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_POSTHOG_KEY=your_posthog_key

# Sentry
VITE_SENTRY_DSN=your_frontend_sentry_dsn

# CDN
VITE_CDN_URL=https://cdn.skylit.ai
```

## Database Setup

### Supabase Configuration

1. **Create Supabase Project**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Initialize project
   supabase init
   ```

2. **Run Database Migrations**:
   ```bash
   # Apply schema from your schema.sql
   supabase db push
   ```

3. **Configure Row Level Security (RLS)**:
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view own credits" ON user_credits
     FOR SELECT USING (user_id = auth.uid());
   
   CREATE POLICY "Users can view own projects" ON user_projects
     FOR ALL USING (user_id = auth.uid());
   ```

4. **Set up Realtime (Optional)**:
   ```sql
   -- Enable realtime for specific tables
   ALTER PUBLICATION supabase_realtime ADD TABLE user_credits;
   ALTER PUBLICATION supabase_realtime ADD TABLE user_projects;
   ```

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   railway up
   ```

3. **Configure Custom Domain**:
   ```bash
   railway domain add api.skylit.ai
   ```

4. **Set Environment Variables**:
   ```bash
   # Set all production environment variables
   railway variables set NODE_ENV=production
   railway variables set SUPABASE_URL=your_url
   # ... add all other variables
   ```

### Option 2: Render

1. **Create `render.yaml`**:
   ```yaml
   services:
     - type: web
       name: skylit-api
       env: node
       plan: starter
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 5000
   ```

2. **Deploy**:
   - Connect your GitHub repository
   - Configure environment variables in Render dashboard
   - Deploy automatically on push

### Option 3: AWS ECS (Advanced)

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 5000
   
   USER node
   
   CMD ["npm", "start"]
   ```

2. **Deploy with ECS**:
   ```bash
   # Build and push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-ecr-url
   docker build -t skylit-api .
   docker tag skylit-api:latest your-ecr-url/skylit-api:latest
   docker push your-ecr-url/skylit-api:latest
   ```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Configure `vercel.json`**:
   ```json
   {
     "framework": "vite",
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://api.skylit.ai/api/$1"
       }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "Strict-Transport-Security",
             "value": "max-age=31536000; includeSubDomains"
           }
         ]
       }
     ]
   }
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Custom Domain**:
   ```bash
   vercel domains add skylit.ai
   vercel domains add www.skylit.ai
   ```

### Option 2: Netlify

1. **Configure `netlify.toml`**:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [[redirects]]
     from = "/api/*"
     to = "https://api.skylit.ai/api/:splat"
     status = 200
   
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
   ```

2. **Deploy**:
   ```bash
   cd frontend
   netlify deploy --prod --dir=dist
   ```

## CDN Configuration

### Cloudflare Setup

1. **Add Domain to Cloudflare**:
   - Add `skylit.ai` to Cloudflare
   - Update nameservers at your domain registrar

2. **Configure DNS Records**:
   ```
   Type    Name    Content                 Proxy
   A       @       your-vercel-ip          Proxied
   CNAME   www     skylit.ai               Proxied
   CNAME   api     your-backend-url        Proxied
   CNAME   cdn     skylit.ai               Proxied
   ```

3. **Configure Page Rules**:
   ```
   URL: api.skylit.ai/*
   Settings:
   - Cache Level: Bypass
   - Security Level: High
   
   URL: *.skylit.ai/static/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   ```

4. **SSL/TLS Configuration**:
   - Set SSL/TLS encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"
   - Enable "HTTP Strict Transport Security (HSTS)"

## Monitoring & Alerting

### Uptime Monitoring

1. **Pingdom/UptimeRobot Setup**:
   ```
   Monitor URLs:
   - https://skylit.ai (Frontend)
   - https://api.skylit.ai/health (Backend health)
   - https://api.skylit.ai/health/simple (Load balancer health)
   ```

2. **Alert Thresholds**:
   - Response time > 5 seconds
   - Uptime < 99.9%
   - Health check failures

### Application Monitoring

1. **Sentry Configuration**:
   ```typescript
   // frontend/src/main.tsx
   import * as Sentry from "@sentry/react";
   
   if (import.meta.env.PROD) {
     Sentry.init({
       dsn: import.meta.env.VITE_SENTRY_DSN,
       environment: "production",
       tracesSampleRate: 0.1,
     });
   }
   ```

2. **DataDog Integration**:
   ```javascript
   // backend/src/monitoring.ts
   import { datadogLogs } from '@datadog/browser-logs'
   
   datadogLogs.init({
     clientToken: process.env.DATADOG_CLIENT_TOKEN,
     env: 'production',
     site: 'datadoghq.com',
     forwardErrorsToLogs: true,
     sampleRate: 100,
   })
   ```

### Performance Monitoring

1. **Core Web Vitals**:
   ```typescript
   // Track performance metrics
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

## Security Configuration

### SSL/TLS Certificates

1. **Automatic Certificates**:
   - Vercel: Automatic SSL for custom domains
   - Cloudflare: Universal SSL certificate
   - Let's Encrypt: Free SSL certificates

2. **Certificate Monitoring**:
   ```bash
   # Check certificate expiration
   echo | openssl s_client -servername skylit.ai -connect skylit.ai:443 2>/dev/null | openssl x509 -noout -dates
   ```

### Security Headers

Configure security headers in your CDN or reverse proxy:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.skylit.ai;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
```

### Firewall Rules

1. **Cloudflare WAF Rules**:
   ```
   Rule 1: Block countries (if needed)
   - Expression: (ip.geoip.country in {"CN" "RU"})
   - Action: Block
   
   Rule 2: Rate limiting
   - Expression: (http.request.uri.path contains "/api/generate-site")
   - Action: Rate limit (5 requests per minute)
   
   Rule 3: Block malicious patterns
   - Expression: (http.request.uri.query contains "union select" or http.request.body contains "<script>")
   - Action: Block
   ```

## Backup & Disaster Recovery

### Database Backups

1. **Supabase Backups**:
   ```bash
   # Automated daily backups (Supabase Pro)
   # Manual backup
   supabase db dump --db-url postgresql://user:pass@host:port/db > backup.sql
   ```

2. **S3 Backup Storage**:
   ```bash
   # Upload backup to S3
   aws s3 cp backup.sql s3://skylit-backups/$(date +%Y-%m-%d)/
   ```

### Application Backups

1. **Environment Variables Backup**:
   ```bash
   # Export environment variables
   railway variables > env-backup-$(date +%Y-%m-%d).txt
   ```

2. **Code Repository**:
   - GitHub: Primary repository
   - GitLab: Mirror repository (backup)

### Disaster Recovery Plan

1. **RTO (Recovery Time Objective)**: < 4 hours
2. **RPO (Recovery Point Objective)**: < 1 hour

3. **Recovery Steps**:
   ```bash
   # 1. Restore database from backup
   psql -h new-host -U user -d database < backup.sql
   
   # 2. Deploy latest code
   git clone https://github.com/your-org/skylit-ai
   railway up
   
   # 3. Update DNS records
   # 4. Verify functionality
   # 5. Monitor for issues
   ```

## Performance Optimization

### Frontend Optimization

1. **Bundle Analysis**:
   ```bash
   npm run build -- --analyze
   ```

2. **Code Splitting**:
   ```typescript
   // Lazy load components
   const Dashboard = lazy(() => import('./components/Dashboard'));
   const Pricing = lazy(() => import('./components/Pricing'));
   ```

3. **Service Worker**:
   ```typescript
   // Cache API responses
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```

### Backend Optimization

1. **Database Optimization**:
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
   CREATE INDEX idx_user_projects_created_at ON user_projects(created_at DESC);
   ```

2. **Caching Strategy**:
   ```typescript
   // Cache frequently accessed data
   app.get('/api/templates', cacheMiddleware(3600), getTemplates);
   app.get('/api/pricing', cacheMiddleware(7200), getPricingPlans);
   ```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**:
   ```nginx
   upstream backend {
       server api1.skylit.ai;
       server api2.skylit.ai;
       server api3.skylit.ai;
   }
   
   server {
       listen 80;
       server_name api.skylit.ai;
       
       location / {
           proxy_pass http://backend;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

2. **Database Read Replicas**:
   ```typescript
   // Use read replicas for read operations
   const readDB = new Pool({ connectionString: process.env.READ_DB_URL });
   const writeDB = new Pool({ connectionString: process.env.WRITE_DB_URL });
   ```

### Auto-scaling

1. **AWS ECS Auto Scaling**:
   ```json
   {
     "targetTrackingScalingPolicies": [
       {
         "targetValue": 70.0,
         "scaleOutCooldown": 300,
         "scaleInCooldown": 300,
         "predefinedMetricSpecification": {
           "predefinedMetricType": "ECSServiceAverageCPUUtilization"
         }
       }
     ]
   }
   ```

## Cost Optimization

### Infrastructure Costs

1. **Monthly Cost Estimates**:
   ```
   Frontend (Vercel Pro): $20/month
   Backend (Railway Pro): $50/month
   Database (Supabase Pro): $25/month
   Cache (Upstash): $20/month
   CDN (Cloudflare Pro): $20/month
   Monitoring (DataDog): $50/month
   Total: ~$185/month (up to 10K users)
   ```

2. **Cost Optimization**:
   - Use CDN to reduce backend load
   - Implement efficient caching
   - Optimize database queries
   - Use compression for API responses

## Maintenance & Updates

### Regular Maintenance Tasks

1. **Weekly**:
   - Review error logs and alerts
   - Check performance metrics
   - Update dependencies (patch versions)

2. **Monthly**:
   - Security updates
   - Database maintenance
   - Backup verification
   - Cost analysis

3. **Quarterly**:
   - Major dependency updates
   - Performance audit
   - Security audit
   - Disaster recovery testing

### Update Process

1. **Staging Environment**:
   ```bash
   # Deploy to staging first
   railway environment staging
   railway up
   
   # Run tests
   npm run test:e2e
   
   # Deploy to production
   railway environment production
   railway up
   ```

2. **Blue-Green Deployment**:
   ```bash
   # Deploy to green environment
   # Switch traffic gradually
   # Monitor for issues
   # Rollback if needed
   ```

## Troubleshooting

### Common Issues

1. **High Memory Usage**:
   ```bash
   # Check memory usage
   railway logs --tail
   
   # Solutions:
   # - Implement memory caching limits
   # - Optimize image processing
   # - Use streaming for large responses
   ```

2. **Database Connection Issues**:
   ```typescript
   // Implement connection pooling
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

3. **API Rate Limiting**:
   ```typescript
   // Implement exponential backoff
   const retryRequest = async (fn: Function, retries = 3) => {
     try {
       return await fn();
     } catch (error) {
       if (retries > 0 && error.status === 429) {
         await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
         return retryRequest(fn, retries - 1);
       }
       throw error;
     }
   };
   ```

### Monitoring Commands

```bash
# Check application health
curl -f https://api.skylit.ai/health || echo "Health check failed"

# Monitor logs
railway logs --tail

# Check database performance
psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Monitor Redis
redis-cli --latency-history -i 1

# Check SSL certificate
echo | openssl s_client -servername skylit.ai -connect skylit.ai:443 2>/dev/null | openssl x509 -noout -dates
```

## Support & Maintenance

- **Documentation**: Keep this guide updated with changes
- **Runbooks**: Create specific runbooks for common incidents
- **Team Access**: Ensure team members have appropriate access to all services
- **Emergency Contacts**: Maintain list of service provider support contacts

---

**Deployment Checklist**:
- [ ] All environment variables configured
- [ ] Database schema applied
- [ ] SSL certificates configured
- [ ] DNS records set up
- [ ] Monitoring alerts configured
- [ ] Backup system tested
- [ ] Performance baseline established
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] Documentation updated

*Last updated: September 18, 2025*
