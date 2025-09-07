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
      <div className="px-4 py-3 border-t border-accent-purple/20">
        <div className="animate-pulse">
          <div className="h-4 bg-accent-purple/20 rounded mb-2"></div>
          <div className="h-3 bg-accent-purple/20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  const isLowCredits = credits.credits < 3;
  const creditsColor = isLowCredits ? 'text-red-400' : 'text-accent-cyan';

  return (
    <>
      <div className="px-4 py-3 border-t border-accent-purple/20 space-y-3">
        {/* Credits display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-sm text-text/70">Credits</div>
              <div className={`font-bold ${creditsColor}`}>
                {credits.credits} remaining
              </div>
            </div>
          </div>
          {isLowCredits && (
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
              Low
            </span>
          )}
        </div>

        {/* Plan info */}
        <div className="text-xs text-text/60">
          {credits.plan.charAt(0).toUpperCase() + credits.plan.slice(1)} Plan
          {credits.subscriptionStatus === 'active' && (
            <span className="ml-2 text-green-400">• Active</span>
          )}
        </div>

        {/* Upgrade button */}
        <button
          onClick={handleUpgrade}
          className="w-full py-2 px-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-black font-semibold rounded-lg hover:scale-105 transition-all duration-300 text-sm"
        >
          {isLowCredits ? 'Buy More Credits' : 'Upgrade Plan'}
        </button>
      </div>

      {/* Pricing modal */}
      {showPricing && <Pricing onClose={handlePricingClose} />}
    </>
  );
}
