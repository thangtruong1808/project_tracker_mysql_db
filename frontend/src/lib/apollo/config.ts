/**
 * Apollo Client Configuration Helpers
 * URL and environment configuration utilities
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

/**
 * Get GraphQL URL from environment variable
 * Supports two options:
 * 1. VITE_GRAPHQL_URL - For production (Hostinger/Vercel)
 * 2. Falls back to localhost for local development
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns GraphQL endpoint URL
 */
export const getGraphQLUrl = (): string => {
  // Option 1: Production URL (Hostinger/Vercel) - from environment variable
  const productionUrl = import.meta.env.VITE_GRAPHQL_URL
  
  if (productionUrl && productionUrl.trim() !== '') {
    // Remove trailing slashes and ensure /graphql is appended
    const cleanUrl = productionUrl.trim().replace(/\/+$/, '')
    return cleanUrl.endsWith('/graphql') ? cleanUrl : `${cleanUrl}/graphql`
  }
  
  // Option 2: Local development - fallback to localhost
  return 'http://localhost:4000/graphql'
}

/**
 * Get WebSocket URL from environment variable
 * Supports two options:
 * 1. VITE_GRAPHQL_URL - For production (Hostinger/Vercel) - uses WSS
 * 2. Falls back to localhost for local development - uses WS
 * Note: Vercel serverless functions don't support WebSockets, so returns null for production
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns WebSocket endpoint URL or null if WebSockets not supported
 */
export const getWebSocketUrl = (): string | null => {
  // Option 1: Production URL (Hostinger/Vercel) - WebSockets not supported on serverless
  const productionUrl = import.meta.env.VITE_GRAPHQL_URL
  if (productionUrl) {
    // Vercel serverless functions don't support WebSockets
    // Return null to disable WebSocket link in production
    return null
  }
  
  // Option 2: Local development - use WS protocol
  return 'ws://localhost:4000/graphql'
}

