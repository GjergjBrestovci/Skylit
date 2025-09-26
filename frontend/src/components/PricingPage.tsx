import { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
import { apiClient } from '../utils/apiClient';

interface PricingPageProps {
  onBack: () => void;
}

const STRIPE_ENABLED = import.meta.env.VITE_STRIPE_ENABLED !== 'false';
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export function PricingPage({ onBack }: PricingPageProps) {
  const [billingMode, setBillingMode] = useState<'credits' | 'monthly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      credits: 100,
      features: [
        '100 AI generations per month',
        'All tech stacks supported',
        'Basic templates',
        'Email support',
        'Download source code'
      ],
      popular: false,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/25',
      buttonGradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 24.99,
      annualPrice: 249.99,
      credits: 500,
      features: [
        '500 AI generations per month',
        'All tech stacks + frameworks',
        'Premium templates',
        'Priority support',
        'Custom branding',
        'API access',
        'Team collaboration'
      ],
      popular: true,
      gradient: 'from-accent-cyan to-accent-purple',
      shadow: 'shadow-accent-cyan/25',
      buttonGradient: 'from-accent-cyan to-accent-purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 99.99,
      annualPrice: 999.99,
      credits: -1, // Unlimited
      features: [
        'Unlimited AI generations',
        'White-label solution',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantees',
        'Advanced analytics',
        'Custom deployment'
      ],
      popular: false,
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/25',
      buttonGradient: 'from-purple-500 to-pink-500'
    }
  ];

  const creditsPacks = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: 9.99,
      credits: 10,
      bonus: 0,
      popular: false,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/25'
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      price: 24.99,
      credits: 30,
      bonus: 5,
      popular: true,
      gradient: 'from-accent-cyan to-accent-purple',
      shadow: 'shadow-accent-cyan/25'
    },
    {
      id: 'ultimate',
      name: 'Ultimate Pack',
      price: 49.99,
      credits: 75,
      bonus: 15,
      popular: false,
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/25'
    }
  ];

  const handlePurchase = async (planId: string, isSubscription: boolean = true) => {
    if (!STRIPE_ENABLED) {
      console.warn('Stripe disabled in development. Skipping payment.');
      return;
    }
    setLoading(planId);
    try {
      const endpoint = isSubscription ? '/api/create-subscription' : '/api/create-payment';
      const response = await apiClient.post(endpoint, { planId });
      
      // const stripe = await stripePromise;
      // if (!stripe) throw new Error('Stripe failed to load');

      const { clientSecret } = response;
      if (!clientSecret) {
        console.error('Missing clientSecret in response. Ensure backend flow matches frontend.');
        return;
      }

      // const result = await stripe.confirmCardPayment(clientSecret);
      // if (result.error) {
      //   console.error('Stripe error:', result.error);
      // }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(null);
    }
  };

  const getDiscountPercentage = (monthly: number, annual: number) => {
    return Math.round((1 - annual / 12 / monthly) * 100);
  };

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-background to-accent-purple/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-accent-cyan/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent-purple/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-text/60 hover:text-text mb-8 transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent-cyan via-white to-accent-purple bg-clip-text text-transparent mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-text/70 max-w-3xl mx-auto leading-relaxed">
            Unlock the power of AI-driven website generation. Choose the perfect plan for your needs and start building amazing websites in minutes.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-[#0a0a0a] border border-accent-purple/20 rounded-2xl p-1 flex">
            <button
              onClick={() => setBillingMode('credits')}
              className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                billingMode === 'credits'
                  ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black shadow-lg'
                  : 'text-text/60 hover:text-text/80'
              }`}
            >
              One-time Credits
            </button>
            <button
              onClick={() => setBillingMode('monthly')}
              className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 relative ${
                billingMode === 'monthly'
                  ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black shadow-lg'
                  : 'text-text/60 hover:text-text/80'
              }`}
            >
              Monthly Subscription
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                SAVE
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        {billingMode === 'monthly' ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative bg-[#0a0a0a]/80 backdrop-blur-sm border rounded-3xl p-8 transition-all duration-500 hover:scale-105 animate-stagger-in ${
                  plan.popular 
                    ? 'border-accent-cyan/50 shadow-2xl shadow-accent-cyan/20' 
                    : 'border-accent-purple/20 hover:border-accent-purple/40'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-accent-cyan to-accent-purple text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
                      ${plan.monthlyPrice}
                    </span>
                    <span className="text-text/60 text-lg">/month</span>
                  </div>
                  <div className="text-accent-cyan font-semibold mb-2">
                    {plan.credits === -1 ? 'Unlimited' : plan.credits} generations/month
                  </div>
                  <div className="text-sm text-text/50">
                    Save {getDiscountPercentage(plan.monthlyPrice, plan.annualPrice)}% with annual billing
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center mt-0.5">
                        <svg width="12" height="12" fill="none" stroke="black" strokeWidth="3">
                          <path d="M9 12l2 2 4-6" />
                        </svg>
                      </div>
                      <span className="text-text/80 leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePurchase(plan.id, true)}
                  disabled={loading === plan.id}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black shadow-xl hover:shadow-2xl hover:shadow-accent-cyan/30'
                      : 'bg-gradient-to-r from-accent-purple/80 to-accent-cyan/80 text-white hover:from-accent-purple hover:to-accent-cyan'
                  }`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Get ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {creditsPacks.map((pack, index) => (
              <div
                key={pack.id}
                className={`relative bg-[#0a0a0a]/80 backdrop-blur-sm border rounded-3xl p-8 transition-all duration-500 hover:scale-105 animate-stagger-in ${
                  pack.popular 
                    ? 'border-accent-cyan/50 shadow-2xl shadow-accent-cyan/20' 
                    : 'border-accent-purple/20 hover:border-accent-purple/40'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {pack.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-accent-cyan to-accent-purple text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Best Value
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{pack.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
                      ${pack.price}
                    </span>
                  </div>
                  <div className="text-accent-cyan font-semibold text-lg mb-2">
                    {pack.credits} Credits
                    {pack.bonus > 0 && (
                      <span className="text-green-400 block text-sm">
                        + {pack.bonus} Bonus Credits
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text/50">
                    One-time purchase • No recurring fees
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center">
                      <svg width="12" height="12" fill="none" stroke="black" strokeWidth="3">
                        <path d="M9 12l2 2 4-6" />
                      </svg>
                    </div>
                    <span className="text-text/80">Never expires</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center">
                      <svg width="12" height="12" fill="none" stroke="black" strokeWidth="3">
                        <path d="M9 12l2 2 4-6" />
                      </svg>
                    </div>
                    <span className="text-text/80">All tech stacks included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center">
                      <svg width="12" height="12" fill="none" stroke="black" strokeWidth="3">
                        <path d="M9 12l2 2 4-6" />
                      </svg>
                    </div>
                    <span className="text-text/80">Commercial usage rights</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center">
                      <svg width="12" height="12" fill="none" stroke="black" strokeWidth="3">
                        <path d="M9 12l2 2 4-6" />
                      </svg>
                    </div>
                    <span className="text-text/80">Download source code</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pack.id, false)}
                  disabled={loading === pack.id}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 ${
                    pack.popular
                      ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black shadow-xl hover:shadow-2xl hover:shadow-accent-cyan/30'
                      : 'bg-gradient-to-r from-accent-purple/80 to-accent-cyan/80 text-white hover:from-accent-purple hover:to-accent-cyan'
                  }`}
                >
                  {loading === pack.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Buy ${pack.name}`
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FAQ or additional info */}
        <div className="mt-20 text-center">
          <div className="bg-[#0a0a0a]/60 backdrop-blur-sm border border-accent-purple/20 rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Why Choose SkyLit?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-black text-xl">🚀</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Lightning Fast</h4>
                <p className="text-text/60 text-sm">Generate complete websites in under 60 seconds with our advanced AI technology.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-black text-xl">⚡</span>
                </div>
                <h4 className="font-semibold text-white mb-2">All Tech Stacks</h4>
                <p className="text-text/60 text-sm">Support for React, Vue, Next.js, Angular, and more. Choose your preferred framework.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-black text-xl">💎</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Production Ready</h4>
                <p className="text-text/60 text-sm">Clean, optimized code ready for deployment. No cleanup required.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
