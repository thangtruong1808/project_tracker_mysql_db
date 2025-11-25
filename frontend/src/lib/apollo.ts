/**
 * Apollo Client Configuration
 * Sets up GraphQL client with authentication headers and error handling
 * Handles token expiration and automatic token refresh
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * Suppress WebSocket connection errors BEFORE any imports
 * This must run first to catch errors from graphql-ws library
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalWindowError = window.onerror

/**
 * Check if error message is WebSocket-related and should be suppressed
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const suppressWebSocketLogs = (message: string): boolean => {
  const msg = String(message || '').toLowerCase()
  return (
    (msg.includes('websocket') || 
     msg.includes('ws://localhost:4000') || 
     msg.includes('graphql-ws') ||
     msg.includes('ws://')) &&
    (msg.includes('failed') || msg.includes('error') || msg.includes('warning') || msg.includes('connection'))
  )
}

/**
 * Override window.onerror to catch WebSocket errors before they're logged
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
window.onerror = (message, source, lineno, colno, error) => {
  const errorMessage = String(message || '')
  if (suppressWebSocketLogs(errorMessage)) {
    return true // Suppress error
  }
  if (originalWindowError) {
    return originalWindowError.call(window, message, source, lineno, colno, error) || false
  }
  return false
}

/**
 * Override console.error to suppress WebSocket errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
console.error = (...args: any[]) => {
  const errorMessage = args.map((arg) => String(arg || '')).join(' ')
  if (suppressWebSocketLogs(errorMessage)) return
  originalConsoleError.apply(console, args)
}

/**
 * Override console.warn to suppress WebSocket warnings
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
console.warn = (...args: any[]) => {
  const errorMessage = args.map((arg) => String(arg || '')).join(' ')
  if (suppressWebSocketLogs(errorMessage)) return
  originalConsoleWarn.apply(console, args)
}

import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { refreshAccessToken } from '../utils/tokenRefresh'

// Global handler for token expiration - will be set by TokenExpirationHandler
let onTokenExpired: (() => Promise<void>) | null = null

/**
 * Set the token expiration handler callback
 * Called when token refresh fails
 * @param handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (handler: () => Promise<void>) => {
  onTokenExpired = handler
}

/**
 * HTTP link to GraphQL endpoint
 */
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
})


/**
 * WebSocket link for GraphQL subscriptions
 * Handles real-time comment updates
 * Silently fails if WebSocket is unavailable - subscriptions are optional
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: () => {
      const accessToken = getAccessToken ? getAccessToken() : null
      return {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
        authToken: accessToken || '', // Also send as authToken for compatibility
      }
    },
    shouldRetry: () => false, // Don't retry to avoid console spam
    on: {
      /**
       * Handle WebSocket connection errors silently
       * Prevents console errors from being displayed
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      error: (error: any) => {
        // Silently handle WebSocket errors - subscriptions are optional
        // HTTP queries/mutations still work without WebSocket
      },
      /**
       * Handle WebSocket connection closed events silently
       *
       * @author Thang Truong
       * @date 2025-01-27
       */
      closed: () => {
        // Silently handle WebSocket closed events
      },
    },
  })
)

/**
 * Split link - uses WebSocket for subscriptions, HTTP for queries and mutations
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  httpLink
)

/**
 * Error link to handle GraphQL and network errors
 * Automatically refreshes token on 401/authentication errors
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  // Handle GraphQL errors
  if (graphQLErrors) {
    for (const { message, extensions } of graphQLErrors) {
      // Check for authentication errors
      const isAuthError =
        extensions?.code === 'UNAUTHENTICATED' ||
        message.toLowerCase().includes('unauthorized') ||
        message.toLowerCase().includes('authentication') ||
        message.toLowerCase().includes('token expired') ||
        message.toLowerCase().includes('invalid token')

      if (isAuthError) {
        // Attempt to refresh token using refresh token from HTTP-only cookie
        refreshAccessToken()
          .then(async (result) => {
            if (result && result.accessToken) {
              // Token refreshed successfully - access token is managed by AuthContext
              // Refresh token is in HTTP-only cookie (not accessible to JavaScript)
            } else {
              // Refresh failed - trigger logout
              if (onTokenExpired) {
                await onTokenExpired()
              }
            }
          })
          .catch(async () => {
            // Refresh failed - trigger logout
            if (onTokenExpired) {
              await onTokenExpired()
            }
          })
      }
    }
  }

  // Handle network errors (including 401)
  if (networkError) {
    const statusCode = (networkError as any).statusCode
    if (statusCode === 401) {
      // Attempt to refresh token using refresh token from HTTP-only cookie
      refreshAccessToken()
        .then(async (result) => {
          if (result && result.accessToken) {
            // Token refreshed successfully - access token is managed by AuthContext
            // Refresh token is in HTTP-only cookie (not accessible to JavaScript)
          } else {
            if (onTokenExpired) {
              await onTokenExpired()
            }
          }
        })
        .catch(async () => {
          if (onTokenExpired) {
            await onTokenExpired()
          }
        })
    }
  }
})

// Module-level variable to store access token getter function
// This allows AuthContext to provide the current access token to Apollo Client
let getAccessToken: (() => string | null) | null = null

/**
 * Set the access token getter function
 * Called by AuthContext to provide current access token
 * @param getter - Function that returns current access token or null
 */
export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessToken = getter
}

/**
 * Auth link to add access token to requests
 * Attaches JWT token from memory (via getter) to Authorization header
 * Access token is stored in memory, not localStorage, for security
 */
const authLink = setContext((_, { headers }) => {
  const accessToken = getAccessToken ? getAccessToken() : null

  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
      'content-type': 'application/json',
    },
  }
})

/**
 * Apollo Client instance
 * Configured with error handling, authentication, and caching
 */
export const client = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
})
