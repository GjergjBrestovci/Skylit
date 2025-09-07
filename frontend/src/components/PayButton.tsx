import { useState } from 'react';
import { Pricing } from './Pricing';

interface PayButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export function PayButton({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children 
}: PayButtonProps) {
  const [showPricing, setShowPricing] = useState(false);

  const getButtonStyles = () => {
    const baseStyles = 'font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2';
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-6 py-3 text-base rounded-2xl',
      lg: 'px-8 py-4 text-lg rounded-2xl'
    };

    const variantStyles = {
      primary: 'bg-gradient-to-r from-accent-cyan to-accent-purple text-black hover:shadow-xl hover:shadow-accent-cyan/25',
      secondary: 'bg-gradient-to-r from-accent-purple/80 to-pink-500/80 text-white hover:from-accent-purple hover:to-pink-500 hover:shadow-xl',
      minimal: 'border-2 border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/60'
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  };

  return (
    <>
      <button
        onClick={() => setShowPricing(true)}
        className={getButtonStyles()}
      >
        {children || (
          <>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>Get Credits</span>
          </>
        )}
      </button>

      {showPricing && (
        <Pricing onClose={() => setShowPricing(false)} />
      )}
    </>
  );
}
