import Stripe from 'stripe';

// For development, allow the app to run without Stripe configured
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_stripe')) {
  console.warn('⚠️  Stripe not configured properly. Payment features will be disabled.');
  console.warn('   Please update STRIPE_SECRET_KEY in .env with a real test key');
}

// Create a mock stripe instance for development if no valid key is provided
const createStripeInstance = () => {
  if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_stripe')) {
    // Return a mock stripe instance
    return null;
  }
  
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
    typescript: true
  });
};

export const stripe = createStripeInstance();

// Helper to ensure Stripe is configured (narrows type from Stripe | null -> Stripe)
function getStripe(): Stripe {
  if (!stripe) {
    throw new Error('Stripe not configured. Please add valid STRIPE_SECRET_KEY to .env');
  }
  return stripe;
}

// Pricing configuration
export const PRICING_PLANS = {
  basic: {
    id: 'basic',  
    name: 'Basic Plan',
    price: 9.99,
    credits: 10,
    features: [
      '10 Website generations',
      'All tech stacks included',
      'Basic customization',
      'Download source code'
    ],
    stripePriceId: 'price_basic_monthly' // Replace with actual Stripe price ID
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 24.99,
    credits: 50,
    features: [
      '50 Website generations',
      'All tech stacks included',
      'Advanced customization',
      'Download source code',
      'Priority support',
      'Custom domains'
    ],
    stripePriceId: 'price_pro_monthly'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 99.99,
    credits: 500,
    features: [
      'Unlimited website generations',
      'All tech stacks included',
      'Full customization',
      'Download source code',
      'Priority support',
      'Custom domains',
      'White-label solution',
      'API access'
    ],
    stripePriceId: 'price_enterprise_monthly'
  }
} as const;

export type PricingPlan = keyof typeof PRICING_PLANS;

// Create a payment intent for one-time purchases
export async function createPaymentIntent(planId: PricingPlan, userId: string) {
  const s = getStripe();

  const plan = PRICING_PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan selected');
  }

  const paymentIntent = await s.paymentIntents.create({
    amount: Math.round(plan.price * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      userId,
      planId,
      credits: plan.credits.toString()
    },
    description: `${plan.name} - ${plan.credits} website generation credits`
  });

  return paymentIntent;
}

// Create a subscription for recurring payments
export async function createSubscription(planId: PricingPlan, userId: string, customerId?: string) {
  const s = getStripe();

  const plan = PRICING_PLANS[planId];
  if (!plan) {
    throw new Error('Invalid plan selected');
  }

  // Create customer if not exists
  let customer = customerId;
  if (!customer) {
    const newCustomer = await s.customers.create({
      metadata: { userId }
    });
    customer = newCustomer.id;
  }

  const subscription = await s.subscriptions.create({
    customer,
    items: [
      {
        price: plan.stripePriceId
      }
    ],
    metadata: {
      userId,
      planId,
      credits: plan.credits.toString()
    }
  });

  return subscription;
}

// Handle successful payment
export async function handleSuccessfulPayment(paymentIntentId: string) {
  const s = getStripe();

  const paymentIntent = await s.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status === 'succeeded') {
    const { userId, planId, credits } = paymentIntent.metadata as { userId: string; planId: PricingPlan; credits: string };
    
    // Here you would update the user's credits in your database
    console.log(`Payment successful for user ${userId}, adding ${credits} credits`);
    
    return {
      userId,
      planId,
      credits: parseInt(credits, 10),
      amount: (paymentIntent.amount || 0) / 100
    };
  }
  
  throw new Error('Payment not successful');
}

// Verify webhook signature
export function verifyWebhookSignature(payload: string, signature: string) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required');
  }
  const s = getStripe();
  
  return s.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
