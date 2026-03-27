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
      relative inline-flex items-center justify-center rounded-lg font-medium
      transition-all duration-150 ease-out
      active:scale-[0.98]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    `;

    const variants = {
      primary: `
        bg-accent-primary text-white
        hover:bg-accent-primary/90
        shadow-sm hover:shadow-md
      `,
      secondary: `
        bg-surface border border-border text-text
        hover:bg-surface-overlay
      `,
      accent: `
        bg-gradient-to-r from-accent-primary to-accent-secondary text-white
        hover:opacity-90
        shadow-sm hover:shadow-md
      `,
      danger: `
        bg-red-500 text-white
        hover:bg-red-600
        shadow-sm
      `,
      ghost: `
        bg-transparent text-muted
        hover:bg-surface hover:text-text
      `
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2',
      xl: 'px-8 py-3.5 text-lg gap-3'
    };

    const glowClass = glow ? 'shadow-md hover:shadow-lg' : '';

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
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
