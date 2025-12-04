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
 * @author Thang Truong
 * @date 2025-12-04
 */
export const getWebSocketUrl = (): string | null => {
  try {
    const envUrl = import.meta.env.VITE_GRAPHQL_URL
    if (envUrl) {
      const url = String(envUrl).trim().replace(/\/+$/, '')
      const wsUrl = url.replace(/^https?:\/\//, url.startsWith('https') ? 'wss://' : 'ws://')
      return wsUrl.endsWith('/graphql') ? wsUrl : `${wsUrl}/graphql`
    }
  } catch {
    // Silent
  }
  return import.meta.env.DEV ? 'ws://localhost:4000/graphql' : null
}