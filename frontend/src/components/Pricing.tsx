import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

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
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const endpoint = billingMode === 'monthly' ? '/api/create-subscription' : '/api/create-payment';
      const response = await apiClient.post(endpoint, { planId });
      const { clientSecret } = response;

      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-background border border-accent-purple/20 rounded-3xl p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-accent-purple/20 rounded-full animate-pulse"></div>
              <div className="h-3 bg-accent-purple/10 rounded-full w-2/3 mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return '⚡';
      case 'pro': return '🚀';
      case 'enterprise': return '👑';
      default: return '💫';
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'basic': return 'from-blue-500/10 to-cyan-500/10 border-blue-500/20';
      case 'pro': return 'from-accent-cyan/10 to-accent-purple/10 border-accent-cyan/30';
      case 'enterprise': return 'from-purple-500/10 to-pink-500/10 border-purple-500/20';
      default: return 'from-accent-purple/10 to-accent-cyan/10 border-accent-purple/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-accent-purple/20 rounded-3xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative px-8 py-6 border-b border-accent-purple/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-black bg-gradient-to-r from-accent-cyan via-accent-purple to-pink-500 bg-clip-text text-transparent">
                Unlock AI Power
              </h2>
              <p className="text-text/60">Choose the perfect plan for your creative journey</p>
            </div>
            <button
              onClick={onClose}
              className="text-text/40 hover:text-text/80 transition-colors p-2 hover:bg-accent-purple/10 rounded-xl"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <div className="bg-[#0a0a0a] border border-accent-purple/20 rounded-2xl p-1 flex">
              <button
                onClick={() => setBillingMode('credits')}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  billingMode === 'credits'
                    ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black shadow-lg'
                    : 'text-text/60 hover:text-text/80'
                }`}
              >
                One-time Credits
              </button>
              <button
                onClick={() => setBillingMode('monthly')}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  billingMode === 'monthly'
                    ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black shadow-lg'
                    : 'text-text/60 hover:text-text/80'
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
          <div className="mx-8 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
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
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`group relative rounded-3xl border-2 transition-all duration-500 hover:scale-105 ${
                  getPlanGradient(plan.id)
                } ${plan.id === 'pro' ? 'lg:scale-110 z-10' : ''}`}
              >
                {/* Popular badge */}
                {plan.id === 'pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-accent-cyan to-accent-purple text-black text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                      ⭐ Most Popular
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
                        <div className="text-4xl font-black text-accent-cyan">
                          ${billingMode === 'monthly' ? plan.price : Math.round(plan.price * 0.8)}
                        </div>
                        <div className="text-text/50 text-sm">
                          {billingMode === 'monthly' ? 'per month' : 'one-time purchase'}
                          {billingMode === 'credits' && (
                            <div className="text-green-400 font-medium mt-1">20% savings!</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credits info */}
                  <div className="text-center p-4 bg-accent-purple/5 rounded-2xl border border-accent-purple/10">
                    <div className="text-2xl font-bold text-accent-purple">{plan.credits}</div>
                    <div className="text-sm text-text/60">AI website generations</div>
                    <div className="text-xs text-text/40 mt-1">
                      ${(plan.price / plan.credits).toFixed(2)} per generation
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.slice(0, 4).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="12" height="12" fill="none" stroke="black" strokeWidth="3">
                            <path d="M4 8l2 2 4-6" />
                          </svg>
                        </div>
                        <span className="text-text/80 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={!!processingPayment}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      plan.id === 'pro'
                        ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black hover:shadow-2xl hover:shadow-accent-cyan/25'
                        : 'bg-gradient-to-r from-accent-purple/80 to-pink-500/80 text-white hover:from-accent-purple hover:to-pink-500'
                    } ${processingPayment === plan.id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'}`}
                  >
                    {processingPayment === plan.id ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Get Started</span>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 13l3 3 7-7M2 8l5 5L21 2" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Additional info */}
                  <div className="text-center text-xs text-text/40">
                    {billingMode === 'monthly' ? 'Cancel anytime • No commitment' : 'Credits never expire'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-accent-purple/10 p-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-6 text-sm text-text/60">
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
            <p className="text-xs text-text/40">
              Join thousands of creators building amazing websites with AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
