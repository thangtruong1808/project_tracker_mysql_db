/**
 * Vite Configuration
 * Build configuration with code-splitting for optimal bundle size
 * Loads environment variables from root directory (.env)
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  /**
   * Load .env from root directory (parent of frontend)
   * This allows shared environment variables between frontend and backend
   * @author Thang Truong
   * @date 2025-12-09
   */
  envDir: path.resolve(__dirname, '..'),
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
     * Vercel handles routing automatically, so this is mainly for local preview
     *
     * @author Thang Truong
     * @date 2025-12-04
     */
    allowedHosts: [
      '.vercel.app', // Allow all Vercel preview and production domains
    ],
  },
  build: {
    chunkSizeWarningLimit: 500,
  },
})

