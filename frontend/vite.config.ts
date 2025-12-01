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
    /**
     * Allowed hosts for preview mode
     * Required for Render deployment to allow requests from Render domain
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    allowedHosts: [
      'project-tracker-frontend-ff0t.onrender.com',
      '.onrender.com', // Allow all Render subdomains
    ],
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

