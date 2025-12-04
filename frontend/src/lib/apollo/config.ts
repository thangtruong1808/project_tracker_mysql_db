/**
 * Apollo Client Configuration Helpers
 * @author Thang Truong
 * @date 2025-12-04
 */

/**
 * Get GraphQL URL from environment
 * @author Thang Truong
 * @date 2025-12-04
 */
export const getGraphQLUrl = (): string => {
  try {
    const envUrl = import.meta.env.VITE_GRAPHQL_URL
    if (envUrl) {
      const url = String(envUrl).trim().replace(/\/+$/, '')
      return url.endsWith('/graphql') ? url : `${url}/graphql`
    }
  } catch {
    // Silent
  }
  return import.meta.env.DEV ? 'http://localhost:4000/graphql' : '/graphql'
}

/**
 * Get WebSocket URL from environment
 * Only processes absolute HTTP/HTTPS URLs, returns null for relative paths
 * @author Thang Truong
 * @date 2025-12-04
 */
export const getWebSocketUrl = (): string | null => {
  try {
    const envUrl = import.meta.env.VITE_GRAPHQL_URL
    if (envUrl) {
      const url = String(envUrl).trim().replace(/\/+$/, '')
      // Only convert absolute URLs - relative paths cannot be WebSocket URLs
      if (url.startsWith('https://')) {
        const wsUrl = url.replace(/^https:\/\//, 'wss://')
        return wsUrl.endsWith('/graphql') ? wsUrl : `${wsUrl}/graphql`
      }
      if (url.startsWith('http://')) {
        const wsUrl = url.replace(/^http:\/\//, 'ws://')
        return wsUrl.endsWith('/graphql') ? wsUrl : `${wsUrl}/graphql`
      }
      // Relative paths cannot be converted to WebSocket URLs
      return null
    }
  } catch {
    // Silent
  }
  return import.meta.env.DEV ? 'ws://localhost:4000/graphql' : null
}
