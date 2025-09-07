import { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { Pricing } from './Pricing';

interface UserCredits {
  credits: number;
  plan: string;
  subscriptionStatus: string;
}

export function CreditsDisplay() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await apiClient.get('/api/user-credits');
      setCredits(response);
    } catch (err) {
      console.error('Failed to fetch user credits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    setShowPricing(true);
  };

  const handlePricingClose = () => {
    setShowPricing(false);
    // Refresh credits after potential purchase
    fetchUserCredits();
  };

  if (loading) {
    return (
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r from-accent-purple/5 to-accent-cyan/5 border border-accent-purple/10">
        <div className="animate-pulse space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-purple/20 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-accent-purple/20 rounded-full w-3/4"></div>
              <div className="h-2 bg-accent-purple/10 rounded-full w-1/2"></div>
            </div>
          </div>
          <div className="h-8 bg-accent-purple/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  const isLowCredits = credits.credits < 3;
  const isVeryLowCredits = credits.credits < 1;
  
  const getCreditsColor = () => {
    if (isVeryLowCredits) return 'text-red-400';
    if (isLowCredits) return 'text-yellow-400';
    return 'text-accent-cyan';
  };

  const getCreditsGradient = () => {
    if (isVeryLowCredits) return 'from-red-500/10 to-red-600/10 border-red-500/20';
    if (isLowCredits) return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20';
    return 'from-accent-cyan/10 to-accent-purple/10 border-accent-cyan/20';
  };

  const getPlanBadge = (plan: string) => {
    const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
    switch (plan) {
      case 'basic':
        return <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{planName}</span>;
      case 'pro':
        return <span className="text-xs bg-gradient-to-r from-accent-cyan/20 to-accent-purple/20 text-accent-cyan px-2 py-1 rounded-full border border-accent-cyan/20">{planName}</span>;
      case 'enterprise':
        return <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{planName}</span>;
      default:
        return <span className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full">{planName}</span>;
    }
  };

  return (
    <>
      <div className={`mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-r ${getCreditsGradient()} border transition-all duration-300 hover:scale-105`}>
        {/* Credits display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center">
              <span className="text-black text-lg font-bold">⚡</span>
            </div>
            <div>
              <div className={`text-lg font-bold ${getCreditsColor()}`}>
                {credits.credits}
              </div>
              <div className="text-xs text-text/50">credits remaining</div>
            </div>
          </div>
          {isLowCredits && (
            <div className={`text-xs px-2 py-1 rounded-full ${
              isVeryLowCredits 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {isVeryLowCredits ? 'Empty' : 'Low'}
            </div>
          )}
        </div>

        {/* Plan info */}
        <div className="flex items-center justify-between mb-4">
          {getPlanBadge(credits.plan)}
          {credits.subscriptionStatus === 'active' && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Active</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-accent-purple/10 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                isVeryLowCredits 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : isLowCredits
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-accent-cyan to-accent-purple'
              }`}
              style={{ 
                width: `${Math.max((credits.credits / Math.max(credits.credits === 0 ? 10 : credits.credits + 5, 10)) * 100, 5)}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Upgrade button */}
        <button
          onClick={handleUpgrade}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 ${
            isVeryLowCredits
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
              : isLowCredits
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/25'
              : 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black shadow-lg shadow-accent-cyan/25'
          } hover:shadow-xl`}
        >
          <div className="flex items-center justify-center gap-2">
            {isVeryLowCredits ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <span>Get Credits Now</span>
              </>
            ) : isLowCredits ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14l9-7 1-7z" />
                </svg>
                <span>Buy More Credits</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Upgrade Plan</span>
              </>
            )}
          </div>
        </button>

        {/* Additional info */}
        <div className="mt-3 text-center text-xs text-text/40">
          {credits.credits === 0 
            ? 'Generate unlimited websites with credits'
            : `${credits.credits} ${credits.credits === 1 ? 'website' : 'websites'} remaining`
          }
        </div>
      </div>

      {/* Pricing modal */}
      {showPricing && <Pricing onClose={handlePricingClose} />}
    </>
  );
}
