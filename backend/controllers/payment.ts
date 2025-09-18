import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createPaymentIntent, createSubscription, PRICING_PLANS, PricingPlan } from '../services/stripe';
import { getCredits } from '../services/credits';

// Get available pricing plans
export const getPricingPlans = async (req: AuthRequest, res: Response) => {
  try {
    const plans = Object.values(PRICING_PLANS).map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      credits: plan.credits,
      features: plan.features
    }));
    
    res.json({ plans, stripeEnabled: process.env.STRIPE_ENABLED !== 'false' });
  } catch (error) {
    console.error('Get pricing plans error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
};

// Create payment intent for one-time purchase
export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.STRIPE_ENABLED === 'false') {
      return res.status(503).json({ error: 'Payments disabled in development' });
    }
    const { planId } = req.body as { planId: PricingPlan };
    
    if (!planId || !PRICING_PLANS[planId]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    const paymentIntent = await createPaymentIntent(planId, req.userId!);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      planDetails: PRICING_PLANS[planId]
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Create subscription
export const createSubscriptionPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.STRIPE_ENABLED === 'false') {
      return res.status(503).json({ error: 'Payments disabled in development' });
    }
    const { planId, customerId } = req.body as { planId: PricingPlan; customerId?: string };
    
    if (!planId || !PRICING_PLANS[planId]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }
    
    const subscription = await createSubscription(planId, req.userId!, customerId);
    
    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice ? 
        (subscription.latest_invoice as any).payment_intent?.client_secret : null,
      planDetails: PRICING_PLANS[planId]
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

// Get user's current credits and plan
export const getUserCredits = async (req: AuthRequest, res: Response) => {
  try {
  const info = await getCredits(req.userId!);
  res.json(info);
  } catch (error) {
    console.error('Get user credits error:', error);
    res.status(500).json({ error: 'Failed to fetch user credits' });
  }
};
