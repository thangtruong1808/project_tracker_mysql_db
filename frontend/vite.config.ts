/**
 * Vite Configuration
 * Build configuration with code-splitting for optimal bundle size
 * Handles environment variables for both local and Vercel deployments
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

/**
 * Determine the environment directory for .env files
 * Uses parent directory for local development (shared .env)
 * Falls back to current directory for Vercel builds
 * @author Thang Truong
 * @date 2025-12-09
 */
const getEnvDir = (): string => {
  const parentEnv = path.resolve(__dirname, '..', '.env')
  if (fs.existsSync(parentEnv)) {
    return path.resolve(__dirname, '..')
  }
  return __dirname
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  /**
   * Load .env from appropriate directory
   * Local: parent directory (shared with backend)
   * Vercel: current directory (uses Vercel-injected vars)
   * @author Thang Truong
   * @date 2025-12-09
   */
  envDir: getEnvDir(),
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
     * @author Thang Truong
     * @date 2025-12-09
     */
    allowedHosts: ['.vercel.app'],
  },
  build: {
    chunkSizeWarningLimit: 500,
  },
})
