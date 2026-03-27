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
          // Legacy aliases
          cyan: 'rgb(var(--color-accent-primary) / <alpha-value>)',
          purple: 'rgb(var(--color-accent-secondary) / <alpha-value>)'
        }
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, rgb(var(--color-accent-primary)), rgb(var(--color-accent-secondary)))',
        'gradient-accent-subtle': 'linear-gradient(135deg, rgb(var(--color-accent-primary) / 0.08), rgb(var(--color-accent-secondary) / 0.08))'
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'card': '0 1px 3px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px rgb(0 0 0 / 0.1), 0 2px 4px rgb(0 0 0 / 0.06)',
        // Legacy aliases for existing code
        elevation: '0 4px 12px rgb(0 0 0 / 0.08)',
        glow: '0 0 0 1px rgb(var(--color-accent-primary) / 0.2)',
        'glow-sm': '0 0 0 1px rgb(var(--color-accent-primary) / 0.15)',
        'glow-lg': '0 0 0 2px rgb(var(--color-accent-primary) / 0.25)',
        'glass-sm': '0 1px 3px rgb(0 0 0 / 0.08)',
        'glass': '0 4px 6px rgb(0 0 0 / 0.07)',
        'glass-lg': '0 8px 16px rgb(0 0 0 / 0.1)'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out both',
        'fade-in': 'fade-in 0.2s ease-out both',
        'slide-up': 'slide-up 0.3s ease-out both',
        'slide-down': 'slide-down 0.3s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'spin': 'spin 1s linear infinite'
      }
    }
  },
  plugins: []
}
