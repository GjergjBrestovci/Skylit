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
    <div className="fixed inset-0 z-[60] bg-black/50 dark:bg-black/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl bg-background border border-border shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Billing</p>
            <h2 className="text-lg font-semibold text-text">Plans & Credits</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost text-xs"
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
            <div className="p-8 text-center text-muted">
              <p className="text-base">Billing closed.</p>
              <button
                onClick={() => setShowPricing(true)}
                className="btn-primary mt-4"
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
