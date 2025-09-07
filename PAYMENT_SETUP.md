# SkyLit Payment System Setup

## Overview
SkyLit now includes a complete Stripe-based payment system with:
- ✅ Modern, minimalistic checkout UI
- ✅ One-time payments and subscriptions
- ✅ Credit-based usage system
- ✅ Webhook processing for payment events
- ✅ Responsive design for desktop and mobile

## Pricing Plans
- **Basic Plan**: $9.99/month - 100 AI generations
- **Pro Plan**: $24.99/month - 500 AI generations  
- **Enterprise Plan**: $99.99/month - Unlimited generations

## Setup Instructions

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Navigate to Developers → API keys
3. Copy your publishable key and secret key

### 2. Update Environment Variables

**Backend** (`backend/.env`):
```bash
# Add these Stripe keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Frontend** (`frontend/.env`):
```bash
# Add this Stripe publishable key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 3. Set Up Webhook Endpoint
1. In Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhook/stripe`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to your backend `.env`

### 4. Database Schema (Future Enhancement)
You'll need to add these tables to track credits and payments:

```sql
-- User credits table
CREATE TABLE user_credits (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  credits_remaining INTEGER DEFAULT 0,
  total_credits INTEGER DEFAULT 0,
  plan_type VARCHAR(20) DEFAULT 'free',
  subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment history table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(20),
  plan_type VARCHAR(20),
  credits_added INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Features Implemented

### Frontend Components
- `Pricing.tsx` - Main checkout interface with billing toggle
- `CreditsDisplay.tsx` - Sidebar credit tracking with progress bars
- `PaymentSuccess.tsx` - Success confirmation with animations
- `PayButton.tsx` - Reusable payment button component
- `InsufficientCredits.tsx` - Credits exhaustion modal

### Backend Services
- `services/stripe.ts` - Core Stripe integration
- `controllers/payment.ts` - Payment API endpoints
- `controllers/webhook.ts` - Stripe webhook handler

## Testing
1. Use Stripe test cards for development:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`
2. Test webhook events using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:5000/api/webhook/stripe
   ```

## Design Features
- Gradient backgrounds with backdrop blur effects
- Responsive layout for all screen sizes
- Hover animations and smooth transitions
- Tech-savvy, AI-focused design aesthetic
- Clear pricing with billing period toggle
- Visual credit indicators and progress bars

## Next Steps
1. Set up real Stripe account and update API keys
2. Implement database integration for persistent credit tracking
3. Add credit deduction logic to generation endpoints
4. Deploy with proper SSL certificate for webhooks
