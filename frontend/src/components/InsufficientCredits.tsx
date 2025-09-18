import { useState } from 'react';
import { Pricing } from './Pricing';

interface InsufficientCreditsProps {
  onClose: () => void;
  onSuccess: () => void;
  creditsNeeded?: number;
}

export function InsufficientCredits({ onClose, onSuccess, creditsNeeded = 1 }: InsufficientCreditsProps) {
  const [showPricing, setShowPricing] = useState(false);

  const handleUpgrade = () => {
    setShowPricing(true);
  };

  const handlePricingClose = () => {
    setShowPricing(false);
    onSuccess(); // Refresh the parent component
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-background border border-red-500/20 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-red-400 sm:w-8 sm:h-8"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Insufficient Credits
              </h2>
              <p className="text-sm sm:text-base text-text/70 leading-relaxed px-2">
                You need at least {creditsNeeded} {creditsNeeded === 1 ? 'credit' : 'credits'} to generate a website. 
                Purchase credits to continue creating amazing websites with AI.
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="text-text/60">Credits needed:</div>
                <div className="text-red-400 font-semibold">{creditsNeeded}</div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm mt-2">
                <div className="text-text/60">Your balance:</div>
                <div className="text-red-400 font-semibold">0</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gradient-to-r from-accent-cyan to-accent-purple text-black font-bold rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-accent-cyan/25 text-sm sm:text-base"
            >
              <div className="flex items-center justify-center gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Get Credits Now</span>
              </div>
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2 sm:py-2 px-3 sm:px-4 text-text/60 hover:text-text/80 transition-colors border border-accent-purple/20 rounded-xl sm:rounded-2xl hover:bg-accent-purple/5 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>

          {/* Benefits reminder */}
          <div className="bg-gradient-to-r from-accent-cyan/5 to-accent-purple/5 border-t border-accent-purple/10 px-4 sm:px-6 py-3 sm:py-4">
            <div className="text-center space-y-1 sm:space-y-2">
              <div className="text-xs sm:text-sm font-medium text-white">✨ What you get:</div>
              <div className="text-xs text-text/60 space-y-0.5 sm:space-y-1">
                <div>• AI-powered website generation</div>
                <div>• All tech stacks (React, Vue, Next.js, etc.)</div>
                <div>• Download full source code</div>
                <div>• Commercial usage rights</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing modal - Higher z-index to appear above */}
      {showPricing && <Pricing onClose={handlePricingClose} />}
    </>
  );
}
