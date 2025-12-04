/**
 * Apollo Client Configuration Helpers
 * Environment-based URL configuration
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

/**
 * Get GraphQL URL from environment variable
 * Uses VITE_GRAPHQL_URL or derives from window location
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
      try { new URL(finalUrl); return finalUrl } catch { /* continue */ }
    }
  }

  // Development mode
  if (import.meta.env.DEV) return 'http://localhost:4000/graphql'

  // Production: derive backend URL from window location
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://project-tracker-mysql-db-wjay.vercel.app/graphql'
  }

  return 'http://localhost:4000/graphql'
}

/**
 * Get WebSocket URL from environment variable
 * @author Thang Truong
 * @date 2025-12-04
 * @returns WebSocket endpoint URL or null
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

  if (import.meta.env.DEV) return 'ws://localhost:4000/graphql'

  // Production: Vercel doesn't support WebSockets, use null
  return null
}
