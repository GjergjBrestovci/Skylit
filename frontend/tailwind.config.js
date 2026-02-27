/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      colors: {
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        'surface-overlay': 'rgb(var(--color-surface-overlay) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        accent: {
          primary: 'rgb(var(--color-accent-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-accent-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-accent-tertiary) / <alpha-value>)',
          // Legacy aliases so old code still compiles
          cyan: 'rgb(var(--color-accent-primary) / <alpha-value>)',
          purple: 'rgb(var(--color-accent-secondary) / <alpha-value>)'
        }
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, rgb(var(--color-accent-primary)), rgb(var(--color-accent-secondary)))',
        'gradient-accent-subtle': 'linear-gradient(135deg, rgb(var(--color-accent-primary) / 0.15), rgb(var(--color-accent-secondary) / 0.15))'
      },
      boxShadow: {
        elevation: '0 20px 60px -28px rgba(0,0,0,0.45)',
        glow: '0 0 24px rgba(139, 92, 246, 0.4)',
        'glow-sm': '0 0 12px rgba(139, 92, 246, 0.25)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.5)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(139,92,246,0.3)' },
          '50%': { boxShadow: '0 0 28px rgba(139,92,246,0.6)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'skeleton-pulse': 'skeleton-pulse 1.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.4,0,0.2,1) both',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
