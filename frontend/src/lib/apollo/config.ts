/**
 * Apollo Client Configuration Helpers
 * Environment-based URL configuration - no hardcoded URLs
 * Uses VITE_GRAPHQL_URL for all environments
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

/**
 * Get GraphQL URL from environment variable
 * Development: Uses VITE_GRAPHQL_URL or defaults to localhost:4000
 * Production: Requires VITE_GRAPHQL_URL to be set
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns GraphQL endpoint URL
 */
export const getGraphQLUrl = (): string => {
  const envUrl = import.meta.env.VITE_GRAPHQL_URL

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '').replace(/\s+/g, '')
    cleanUrl = cleanUrl.replace(/^["']|["']$/g, '')
    const finalUrl = cleanUrl.endsWith('/graphql') ? cleanUrl : `${cleanUrl}/graphql`

    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
      try {
        new URL(finalUrl)
        return finalUrl
      } catch {
        // Invalid URL format - continue to default
      }
    }
  }

  // Development mode: default to localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:4000/graphql'
  }

  // Production: VITE_GRAPHQL_URL must be set
  throw new Error('VITE_GRAPHQL_URL environment variable is required in production')
}

/**
 * Get WebSocket URL from environment variable
 * Converts HTTP URL to WebSocket URL
 * Note: Vercel does NOT support WebSockets - use Pusher for real-time
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns WebSocket endpoint URL or null if not available
 */
export const getWebSocketUrl = (): string | null => {
  const envUrl = import.meta.env.VITE_GRAPHQL_URL

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '')
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      const wsProtocol = cleanUrl.startsWith('https://') ? 'wss://' : 'ws://'
      const wsUrl = cleanUrl.replace(/^https?:\/\//, wsProtocol)
      return wsUrl.endsWith('/graphql') ? wsUrl : `${wsUrl}/graphql`
    }
  }

  // Development mode: default to localhost WebSocket
  if (import.meta.env.DEV) {
    return 'ws://localhost:4000/graphql'
  }

  // Production: WebSocket URL derived from VITE_GRAPHQL_URL
  return null
}
