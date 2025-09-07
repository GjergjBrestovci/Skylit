import { useEffect, useState } from 'react';

interface PaymentSuccessProps {
  onClose: () => void;
}

export function PaymentSuccess({ onClose }: PaymentSuccessProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-accent-purple/20 rounded-3xl max-w-md w-full overflow-hidden">
        {/* Success animation */}
        <div className="p-8 text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                fill="none"
                stroke="white"
                strokeWidth="3"
                className="animate-bounce"
              >
                <path d="M9 12l2 2 4-6" />
              </svg>
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-green-400/20 animate-ping"></div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Payment Successful!
            </h2>
            <p className="text-text/80 leading-relaxed">
              Your credits have been added to your account. You can now create amazing websites with SkyLit AI!
            </p>
          </div>

          {/* Credits info */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 border border-accent-cyan/20">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-cyan to-accent-purple flex items-center justify-center">
                <span className="text-black font-bold text-sm">⚡</span>
              </div>
              <div>
                <div className="text-sm text-text/60">Credits Added</div>
                <div className="text-lg font-bold text-accent-cyan">Ready to Create!</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-accent-cyan to-accent-purple text-black font-bold rounded-2xl hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-accent-cyan/25"
            >
              Start Creating ({countdown}s)
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-text/60 hover:text-text/80 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Confetti effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full animate-bounce opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
