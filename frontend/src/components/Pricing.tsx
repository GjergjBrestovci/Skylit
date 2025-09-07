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

      // Create payment intent
      const response = await apiClient.post('/api/create-payment', { planId });
      const { clientSecret } = response;

      // Redirect to Stripe Checkout or use Elements
      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`
        }
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        // Payment succeeded
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleSubscription = async (planId: string) => {
    if (processingPayment) return;
    
    setProcessingPayment(planId);
    setError(null);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create subscription
      const response = await apiClient.post('/api/create-subscription', { planId });
      const { clientSecret } = response;

      if (clientSecret) {
        const result = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/subscription-success`
          }
        });

        if (result.error) {
          setError(result.error.message || 'Subscription failed');
        } else {
          onClose();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Loading pricing plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-accent-purple/20 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose Your Plan</h2>
            <p className="text-text/70">Unlock the full power of SkyLit AI</p>
          </div>
          <button
            onClick={onClose}
            className="text-text/50 hover:text-white transition-colors p-2"
          >
            ✕
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Pricing cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                plan.id === 'pro' 
                  ? 'border-accent-cyan bg-accent-cyan/5 transform scale-105' 
                  : 'border-accent-purple/30 bg-[#0a0a0a]'
              }`}
            >
              {/* Popular badge */}
              {plan.id === 'pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-accent-cyan to-accent-purple text-black text-sm font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan details */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-black text-accent-cyan">${plan.price}</span>
                  <span className="text-text/60">/month</span>
                </div>
                <div className="text-accent-purple font-semibold mb-4">
                  {plan.credits} website generations
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-text/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={processingPayment === plan.id}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                    plan.id === 'pro'
                      ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black hover:scale-105'
                      : 'bg-accent-purple hover:bg-accent-purple/80 text-white'
                  } ${processingPayment === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processingPayment === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                      Processing...
                    </div>
                  ) : (
                    'Buy Credits'
                  )}
                </button>
                
                <button
                  onClick={() => handleSubscription(plan.id)}
                  disabled={processingPayment === plan.id}
                  className="w-full py-2 px-4 border border-accent-purple/30 rounded-xl text-accent-purple hover:bg-accent-purple/10 transition-all duration-300 text-sm"
                >
                  Subscribe Monthly
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-accent-purple/20 p-6 text-center text-text/60 text-sm">
          <p>Secure payments powered by Stripe • Cancel anytime • 30-day money-back guarantee</p>
        </div>
      </div>
    </div>
  );
}
