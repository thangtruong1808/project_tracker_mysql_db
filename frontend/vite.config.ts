/**
 * Vite Configuration
 * Build configuration with code-splitting for optimal bundle size
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
    // Allow all hosts for Render deployment - use function to allow any host
    allowedHosts: (host: string) => {
      // Allow all hosts for Render deployment
      return true
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('@apollo') || id.includes('graphql')) {
              return 'apollo-vendor'
            }
            // Other node_modules go into vendor chunk
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})

