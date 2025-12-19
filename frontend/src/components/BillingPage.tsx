import { useEffect, useState } from 'react';
import { Pricing } from './Pricing';

// Modal wrapper for Billing with cleaner stacking and layout
// Eliminates double overlays and overlapping content by constraining height and scroll areas.

interface BillingPageProps {
  open: boolean;
  onClose: () => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ open, onClose }) => {
  const [showPricing, setShowPricing] = useState(true);

  useEffect(() => {
    if (open) setShowPricing(true);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d0d12] via-[#0f1523] to-[#0c101a] border border-white/10 shadow-[0_20px_120px_-40px_rgba(0,0,0,0.9)]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f1523]/80 backdrop-blur-md">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Billing</p>
            <h2 className="text-lg font-semibold text-white">Plans & Credits</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Close billing"
          >
            Close
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(92vh - 72px)' }}>
          {showPricing ? (
            <Pricing onClose={() => setShowPricing(false)} />
          ) : (
            <div className="p-8 text-center text-white/70">
              <p className="text-base">Billing closed.</p>
              <button
                onClick={() => setShowPricing(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-black text-sm font-semibold shadow-lg"
              >
                Reopen Pricing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
