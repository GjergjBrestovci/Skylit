import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const STRIPE_ENABLED = import.meta.env.VITE_STRIPE_ENABLED !== 'false';
const stripePromise = STRIPE_ENABLED ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here') : Promise.resolve(null as any);

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
}

interface PricingProps {
  onClose: () => void;
}

export function Pricing(_props: PricingProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingMode, setBillingMode] = useState<'monthly' | 'credits'>('credits');

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const response = await apiClient.get('/api/pricing');
      setPlans(response.plans);
    } catch (err) {
      setError('Failed to load pricing plans');
      console.error('Pricing fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    if (processingPayment) return;

    setProcessingPayment(planId);
    setError(null);

    try {
      if (!STRIPE_ENABLED) {
        throw new Error('Payment processing is not enabled');
      }

      const response = await apiClient.post('/api/payment/create-checkout-session', {
        planId,
        billingMode
      });

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: response.sessionId
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="card rounded-xl p-6 animate-pulse space-y-4">
              <div className="h-4 bg-surface-elevated rounded w-24"></div>
              <div className="h-8 bg-surface-elevated rounded w-32"></div>
              <div className="h-6 bg-surface rounded w-20"></div>
              <div className="space-y-2">
                {[1,2,3,4].map(j => (
                  <div key={j} className="h-3 bg-surface rounded"></div>
                ))}
              </div>
              <div className="h-10 bg-surface-elevated rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return (
        <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
      case 'pro': return (
        <svg className="w-5 h-5 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
      case 'enterprise': return (
        <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
      default: return (
        <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-text">
            Choose your plan
          </h2>
          <p className="text-muted text-lg">Select the perfect plan for your creative journey</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mt-6">
          <div className="bg-surface-elevated rounded-lg p-1 flex border border-border">
            <button
              onClick={() => setBillingMode('credits')}
              className={`px-5 py-2.5 rounded-md font-medium text-sm transition-all ${
                billingMode === 'credits'
                  ? 'btn-primary shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              One-time Credits
            </button>
            <button
              onClick={() => setBillingMode('monthly')}
              className={`px-5 py-2.5 rounded-md font-medium text-sm transition-all ${
                billingMode === 'monthly'
                  ? 'btn-primary shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              Monthly Subscription
              <span className="ml-2 bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-700 dark:text-red-300 text-center">
          <div className="flex items-center justify-center gap-2">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative card rounded-xl transition-all hover:shadow-md ${
              plan.id === 'pro' ? 'border-accent-primary ring-1 ring-accent-primary/20' : ''
            }`}
          >
            {/* Popular badge */}
            {plan.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-accent-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-6">
              {/* Plan header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-elevated border border-border">
                  {getPlanIcon(plan.id)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text mb-2">{plan.name}</h3>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-text">
                      ${billingMode === 'monthly' ? plan.price : Math.round(plan.price * 0.8)}
                    </div>
                    <div className="text-muted text-sm">
                      {billingMode === 'monthly' ? 'per month' : 'one-time purchase'}
                      {billingMode === 'credits' && (
                        <div className="text-green-600 dark:text-green-400 font-medium mt-1">20% savings!</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Credits info */}
              <div className="text-center p-4 bg-surface-elevated rounded-lg border border-border">
                <div className="text-2xl font-bold text-accent-primary">{plan.credits}</div>
                <div className="text-sm text-muted">AI website generations</div>
                <div className="text-xs text-muted mt-1">
                  ${(plan.price / plan.credits).toFixed(2)} per generation
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent-primary/15 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-accent-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-text text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <button
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition ${
                    plan.id === 'pro' ? 'btn-primary' : 'btn-secondary'
                  }`}
                  onClick={() => handlePurchase(plan.id)}
                  disabled={processingPayment === plan.id}
                >
                  {processingPayment === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    `Get ${plan.name} Plan`
                  )}
                </button>
              </div>

              {/* Plan details */}
              <div className="text-center text-xs text-muted border-t border-border pt-4">
                {billingMode === 'monthly' ? 'Cancel anytime - No commitment' : 'Credits never expire'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-6 bg-surface-elevated rounded-lg">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4M7 12H3a2 2 0 01-2-2V5a2 2 0 012-2h4M7 12V9a2 2 0 012-2h9a2 2 0 012 2v3a2 2 0 01-2 2h-1" />
              </svg>
              <span>Secure payments by Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
              </svg>
              <span>30-day money-back guarantee</span>
            </div>
          </div>
          <p className="text-xs text-muted">
            Join thousands of creators building amazing websites with AI
          </p>
        </div>
      </div>
    </div>
  );
}
