import React, { useEffect, useState } from 'react';
import { Pricing } from './Pricing';

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
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#161616] border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold">Billing & Credits</h2>
          <button onClick={onClose} className="text-text/60 hover:text-text text-xs">Close</button>
        </div>
        <div className="p-2 sm:p-4 overflow-y-auto max-h-[calc(90vh-3rem)]">
          {showPricing && <Pricing onClose={() => setShowPricing(false)} />}
          {!showPricing && (
            <div className="p-6 text-center text-text/70">
              <p>Billing closed.</p>
              <button onClick={() => setShowPricing(true)} className="mt-4 px-4 py-2 rounded-md bg-accent-cyan text-black text-sm font-semibold">Reopen Pricing</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
