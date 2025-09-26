import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { loadStripe } from '@stripe/stripe-js';
import { GlassButton } from './ui/GlassButton';

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

export function Pricing({ onClose }: PricingProps) {
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[80]">
        <div className="glass-medium rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-white/20 rounded-full animate-pulse"></div>
              <div className="h-3 bg-white/10 rounded-full w-2/3 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return '⚡';
      case 'pro': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
      );
      case 'enterprise': return '👑';
      default: return '💫';
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'basic': return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
      case 'pro': return 'from-cyan-400/10 to-purple-500/10 border-cyan-400/30';
      case 'enterprise': return 'from-purple-500/10 to-pink-500/10 border-purple-500/20';
      default: return 'from-purple-500/10 to-cyan-400/10 border-purple-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Unlock AI Power
          </h2>
          <p className="text-white/60 text-lg">Choose the perfect plan for your creative journey</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mt-6">
          <div className="glass-medium rounded-2xl p-1 flex border border-white/20">
            <button
              onClick={() => setBillingMode('credits')}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ease-bounce-light ${
                billingMode === 'credits'
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-glass-lg scale-105'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              One-time Credits
            </button>
            <button
              onClick={() => setBillingMode('monthly')}
              className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ease-bounce-light ${
                billingMode === 'monthly'
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-glass-lg scale-105'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Monthly Subscription
              <span className="ml-2 bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 glass-light border border-red-400/20 rounded-2xl text-red-400 text-center">
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
            className={`relative glass-medium rounded-3xl border backdrop-blur-xl transition-all duration-300 ease-bounce-light hover:scale-105 hover:shadow-glass-xl ${getPlanGradient(plan.id)}`}
          >
            {/* Popular badge */}
            {plan.id === 'pro' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="glass-light px-4 py-2 rounded-full text-sm font-semibold text-cyan-400 border border-cyan-400/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    Most Popular
                  </div>
                </div>
              </div>
            )}

            <div className="p-8 space-y-6">
              {/* Plan header */}
              <div className="text-center space-y-4">
                <div className="text-4xl">{getPlanIcon(plan.id)}</div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="space-y-1">
                    <div className="text-4xl font-black text-cyan-400">
                      ${billingMode === 'monthly' ? plan.price : Math.round(plan.price * 0.8)}
                    </div>
                    <div className="text-white/50 text-sm">
                      {billingMode === 'monthly' ? 'per month' : 'one-time purchase'}
                      {billingMode === 'credits' && (
                        <div className="text-green-400 font-medium mt-1">20% savings!</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Credits info */}
              <div className="text-center p-4 glass-light rounded-2xl border border-purple-500/10">
                <div className="text-2xl font-bold text-purple-400">{plan.credits}</div>
                <div className="text-sm text-white/60">AI website generations</div>
                <div className="text-xs text-white/40 mt-1">
                  ${(plan.price / plan.credits).toFixed(2)} per generation
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2">
                        <path d="M5 12l2 2 4-4" />
                      </svg>
                    </div>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <GlassButton
                  variant={plan.id === 'pro' ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full"
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
                </GlassButton>
              </div>

              {/* Plan details */}
              <div className="text-center text-xs text-white/40 border-t border-white/10 pt-4">
                {billingMode === 'monthly' ? 'Cancel anytime • No commitment' : 'Credits never expire'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-purple-500/10 p-6 glass-light rounded-2xl">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-6 text-sm text-white/60">
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
          <p className="text-xs text-white/40">
            Join thousands of creators building amazing websites with AI
          </p>
        </div>
      </div>
    </div>
  );
}
