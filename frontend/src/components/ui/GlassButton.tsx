import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  children: React.ReactNode;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = false, children, ...props }, ref) => {
    const baseClasses = `
      relative overflow-hidden rounded-2xl font-medium transition-all duration-300 
      backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl
      transform-gpu active:scale-[0.98] hover:scale-[1.02] 
      active:transition-transform active:duration-75
      focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
      before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:opacity-60
      after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-t after:from-black/5 after:to-white/10 after:opacity-0 after:transition-opacity after:duration-300
      hover:after:opacity-100
    `;

    const variants = {
      primary: `
        bg-gradient-to-br from-blue-500/20 to-purple-600/20 text-white
        hover:from-blue-400/30 hover:to-purple-500/30
        before:from-blue-400/10 before:to-purple-500/10
        shadow-blue-500/20 hover:shadow-blue-500/30
      `,
      secondary: `
        bg-gradient-to-br from-gray-500/15 to-gray-600/15 text-white/90
        hover:from-gray-400/20 hover:to-gray-500/20
        before:from-gray-400/5 before:to-gray-500/5
        shadow-gray-500/10 hover:shadow-gray-500/20
      `,
      accent: `
        bg-gradient-to-br from-cyan-500/20 to-pink-500/20 text-white
        hover:from-cyan-400/30 hover:to-pink-400/30
        before:from-cyan-400/10 before:to-pink-400/10
        shadow-cyan-500/20 hover:shadow-pink-500/20
      `,
      danger: `
        bg-gradient-to-br from-red-500/20 to-orange-600/20 text-white
        hover:from-red-400/30 hover:to-orange-500/30
        before:from-red-400/10 before:to-orange-500/10
        shadow-red-500/20 hover:shadow-red-500/30
      `,
      ghost: `
        bg-white/5 text-white/80 hover:text-white
        hover:bg-white/10
        before:from-white/5 before:to-white/10
        shadow-white/5 hover:shadow-white/10
      `
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
      xl: 'px-12 py-6 text-xl min-h-[64px]'
    };

    const glowClass = glow ? `
      shadow-2xl hover:shadow-3xl
      before:shadow-inner before:shadow-white/20
    ` : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          glowClass,
          className
        )}
        {...props}
      >
        {/* Glass highlight effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        
        {/* Ripple effect container */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="ripple-container" />
        </div>
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
