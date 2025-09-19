/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const proxyTarget = process.env.VITE_BACKEND_PROXY || process.env.BACKEND_PROXY_URL || 'http://127.0.0.1:5000';
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_STRIPE_ENABLED': JSON.stringify(process.env.VITE_STRIPE_ENABLED ?? 'false')
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // @ts-ignore - Vitest config extends Vite config
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/coverage/**'
        ]
      }
    }
  }
})
