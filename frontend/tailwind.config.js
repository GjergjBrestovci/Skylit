/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-surface) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        accent: {
          cyan: 'rgb(var(--color-accent-cyan) / <alpha-value>)',
          purple: 'rgb(var(--color-accent-purple) / <alpha-value>)'
        }
      },
      boxShadow: {
        elevation: '0 20px 60px -28px rgba(0,0,0,0.45)'
      }
    }
  },
  plugins: []
}
