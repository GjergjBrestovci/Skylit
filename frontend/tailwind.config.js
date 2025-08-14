/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        text: '#E0E0E0',
        accent: {
          cyan: '#00FFFF',
          purple: '#BB86FC'
        }
      }
    }
  },
  plugins: []
}
