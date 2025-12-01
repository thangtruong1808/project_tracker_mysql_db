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
 * 1. VITE_GRAPHQL_URL - For production (Render backend URL)
 * 2. Falls back to localhost for local development
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns GraphQL endpoint URL
 */
/**
 * Get GraphQL URL from environment variable
 * Supports two options:
 * 1. VITE_GRAPHQL_URL - For production (Render backend URL)
 * 2. Falls back to localhost for local development
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns GraphQL endpoint URL
 * @throws Error if URL is invalid in production
 */
export const getGraphQLUrl = (): string => {
  // Option 1: Production URL (Render) - from environment variable
  const productionUrl = import.meta.env.VITE_GRAPHQL_URL
  
  if (productionUrl && productionUrl.trim() !== '') {
    // Remove trailing slashes and ensure /graphql is appended
    const cleanUrl = productionUrl.trim().replace(/\/+$/, '')
    const finalUrl = cleanUrl.endsWith('/graphql') ? cleanUrl : `${cleanUrl}/graphql`
    
    // Validate URL format
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      throw new Error(
        `Invalid VITE_GRAPHQL_URL format: "${productionUrl}". ` +
        `URL must start with http:// or https://. ` +
        `Please set VITE_GRAPHQL_URL in Render environment variables (e.g., https://project-tracker-backend-pa9k.onrender.com)`
      )
    }
    
    return finalUrl
  }
  
  // Option 2: Local development - fallback to localhost
  // In production, this should not happen - VITE_GRAPHQL_URL must be set
  if (import.meta.env.PROD) {
    throw new Error(
      'VITE_GRAPHQL_URL environment variable is not set in production. ' +
      'Please configure VITE_GRAPHQL_URL in Render environment variables for the frontend service. ' +
      'Example: https://project-tracker-backend-pa9k.onrender.com'
    )
  }
  
  return 'http://localhost:4000/graphql'
}

/**
 * Get WebSocket URL from environment variable
 * Supports two options:
 * 1. VITE_GRAPHQL_URL - For production (Render) - uses WSS
 * 2. Falls back to localhost for local development - uses WS
 * Note: Render supports WebSockets, so subscriptions will work in production
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns WebSocket endpoint URL or null if WebSockets not supported
 */
export const getWebSocketUrl = (): string | null => {
  // Option 1: Production URL (Render) - Render supports WebSockets
  const productionUrl = import.meta.env.VITE_GRAPHQL_URL
  if (productionUrl) {
    // Render supports WebSockets, so convert HTTP URL to WebSocket URL
    const cleanUrl = productionUrl.trim().replace(/\/+$/, '')
    const wsUrl = cleanUrl.replace(/^https?:\/\//, 'wss://')
    return wsUrl.endsWith('/graphql') ? wsUrl : `${wsUrl}/graphql`
  }
  
  // Option 2: Local development - use WS protocol
  return 'ws://localhost:4000/graphql'
}

