/**
 * Apollo Client Configuration Helpers
 * URL and environment configuration utilities
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

/**
 * Production GraphQL URL fallback
 * Used when VITE_GRAPHQL_URL is not set
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
const FALLBACK_PRODUCTION_GRAPHQL_URL = 'https://project-tracker-mysql-db-wjay.vercel.app/graphql'

/**
 * Get GraphQL URL from environment variable with fallback
 * Supports three options:
 * 1. VITE_GRAPHQL_URL - From environment variable (preferred)
 * 2. Hardcoded production URL - Fallback if env var is not set
 * 3. Localhost - For local development
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns GraphQL endpoint URL
 */
export const getGraphQLUrl = (): string => {
  // Option 1: Production URL from environment variable (preferred)
  const productionUrl = import.meta.env.VITE_GRAPHQL_URL
  
  if (productionUrl && typeof productionUrl === 'string' && productionUrl.trim() !== '') {
    // Remove trailing slashes, whitespace, and ensure /graphql is appended
    let cleanUrl = productionUrl.trim().replace(/\/+$/, '').replace(/\s+/g, '')
    
    // Remove quotes if present (sometimes env vars are set with quotes)
    cleanUrl = cleanUrl.replace(/^["']|["']$/g, '')
    
    // Ensure /graphql is appended
    const finalUrl = cleanUrl.endsWith('/graphql') ? cleanUrl : `${cleanUrl}/graphql`
    
    // Validate URL format - must be a valid HTTP/HTTPS URL
    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
      // Try to create a URL object to validate it's a valid URL
      try {
        new URL(finalUrl)
        return finalUrl
      } catch {
        // Invalid URL format - fall through to fallback
      }
    }
  }
  
  // Option 2: Production - use hardcoded fallback URL
  // This ensures the app works even if environment variable is not set
  if (import.meta.env.PROD) {
    return FALLBACK_PRODUCTION_GRAPHQL_URL
  }
  
  // Option 3: Local development - fallback to localhost
  return 'http://localhost:4000/graphql'
}

/**
 * Production WebSocket URL fallback
 * Note: Vercel serverless does NOT support WebSockets - use Pusher for real-time
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
const FALLBACK_PRODUCTION_WEBSOCKET_URL = 'wss://project-tracker-mysql-db-wjay.vercel.app/graphql'

/**
 * Get WebSocket URL from environment variable with fallback
 * Supports three options:
 * 1. VITE_GRAPHQL_URL - From environment variable (preferred)
 * 2. Hardcoded production URL - Fallback if env var is not set
 * 3. Localhost - For local development
 * Note: Vercel does NOT support WebSockets, so subscriptions will fall back to HTTP polling
 * Railway backend supports WebSockets, but Vercel frontend cannot use them
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns WebSocket endpoint URL or null if WebSockets not supported
 */
export const getWebSocketUrl = (): string | null => {
  // Option 1: Production URL from environment variable (preferred)
  const productionUrl = import.meta.env.VITE_GRAPHQL_URL
  if (productionUrl && typeof productionUrl === 'string' && productionUrl.trim() !== '') {
    // Render supports WebSockets, so convert HTTP URL to WebSocket URL
    const cleanUrl = productionUrl.trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '')
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      const wsUrl = cleanUrl.replace(/^https?:\/\//, 'wss://')
      return wsUrl.endsWith('/graphql') ? wsUrl : `${wsUrl}/graphql`
    }
  }
  
  // Option 2: Production - use hardcoded fallback WebSocket URL
  if (import.meta.env.PROD) {
    return FALLBACK_PRODUCTION_WEBSOCKET_URL
  }
  
  // Option 3: Local development - use WS protocol
  return 'ws://localhost:4000/graphql'
}

