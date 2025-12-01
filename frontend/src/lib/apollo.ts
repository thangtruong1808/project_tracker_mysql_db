/**
 * Apollo Client Configuration
 * Sets up GraphQL client with authentication headers and error handling
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

// Must import before Apollo to suppress WebSocket errors
import './suppressWebSocketErrors'

import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { refreshAccessToken } from '../utils/tokenRefresh'

// Enable detailed error messages in development
// This helps debug Apollo Client errors during development
// Note: @apollo/client/dev is only available in development builds
if (import.meta.env.DEV) {
  try {
    // Dynamic import to avoid issues if dev module is not available
    import('@apollo/client/dev').then(({ loadErrorMessages, loadDevMessages }) => {
      loadDevMessages()
      loadErrorMessages()
    }).catch(() => {
      // Silently fail if dev module is not available (e.g., in production builds)
    })
  } catch {
    // Silently fail if import fails
  }
}

let onTokenExpired: (() => Promise<void>) | null = null
let getAccessToken: (() => string | null) | null = null

/**
 * Set the token expiration handler callback
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (handler: () => Promise<void>) => {
  onTokenExpired = handler
}

/**
 * Set the access token getter function
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param getter - Function that returns current access token
 */
export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessToken = getter
}

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
const getGraphQLUrl = (): string => {
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
const getWebSocketUrl = (): string | null => {
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

/**
 * HTTP link to GraphQL endpoint
 * Includes error handling for invalid URIs
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const graphqlUrl = getGraphQLUrl()

// Validate GraphQL URL - provide helpful error message
if (!graphqlUrl || graphqlUrl === 'undefined/graphql' || !graphqlUrl.startsWith('http')) {
  const errorMessage = import.meta.env.DEV
    ? `Invalid GraphQL URL: "${graphqlUrl}". Please set VITE_GRAPHQL_URL environment variable to your backend URL (e.g., https://your-backend.onrender.com)`
    : 'Invalid GraphQL URL. Please configure VITE_GRAPHQL_URL environment variable.'
  throw new Error(errorMessage)
}

const httpLink = createHttpLink({
  uri: graphqlUrl,
  credentials: 'include',
  fetchOptions: {
    mode: 'cors',
  },
})

/**
 * WebSocket link for GraphQL subscriptions
 * Only created if WebSocket URL is available (local development)
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const wsUrl = getWebSocketUrl()
const wsLink = wsUrl
  ? new GraphQLWsLink(
      createClient({
        url: wsUrl,
        connectionParams: () => {
          const accessToken = getAccessToken ? getAccessToken() : null
          return {
            authorization: accessToken ? `Bearer ${accessToken}` : '',
            authToken: accessToken || '',
          }
        },
        shouldRetry: () => false,
        on: {
          error: () => { /* Silently handle WebSocket errors */ },
          closed: () => { /* Silently handle WebSocket closed events */ },
        },
      })
    )
  : null

/**
 * Split link - uses WebSocket for subscriptions, HTTP for queries/mutations
 * Falls back to HTTP if WebSocket is not available (production/Vercel)
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const createSplitLink = () => {
  if (!wsLink) {
    return httpLink
  }

  try {
    return split(
      ({ query }) => {
        try {
          const definition = getMainDefinition(query)
          return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
        } catch {
          // If query parsing fails, use HTTP link
          return false
        }
      },
      wsLink,
      httpLink
    )
  } catch {
    // If split link creation fails, fall back to HTTP only
    return httpLink
  }
}

const splitLink = createSplitLink()

/**
 * Handle token refresh on authentication errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const handleTokenRefresh = async () => {
  try {
    const result = await refreshAccessToken()
    if (!result || !result.accessToken) {
      if (onTokenExpired) await onTokenExpired()
    }
  } catch {
    if (onTokenExpired) await onTokenExpired()
  }
}

/**
 * Error link to handle GraphQL and network errors
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const { message, extensions } of graphQLErrors) {
      const isAuthError =
        extensions?.code === 'UNAUTHENTICATED' ||
        message.toLowerCase().includes('unauthorized') ||
        message.toLowerCase().includes('authentication') ||
        message.toLowerCase().includes('token expired') ||
        message.toLowerCase().includes('invalid token')
      if (isAuthError) handleTokenRefresh()
    }
  }
  if (networkError) {
    const statusCode = (networkError as { statusCode?: number }).statusCode
    if (statusCode === 401) handleTokenRefresh()
  }
})

/**
 * Auth link to add access token to requests
 *
 * @author Thang Truong
 * @date 2025-01-27
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
 * Apollo Client instance with error handling and authentication
 * Wrapped in try-catch to provide better error messages
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
let client: ApolloClient<any>

try {
  client = new ApolloClient({
    link: from([errorLink, authLink, splitLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Add any custom cache policies here if needed
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: { errorPolicy: 'all' },
      query: { errorPolicy: 'all' },
      mutate: { errorPolicy: 'all' },
    },
    // Add connectToDevTools for better debugging in development
    connectToDevTools: import.meta.env.DEV,
  })
} catch (error) {
  // Provide helpful error message if client creation fails
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  throw new Error(
    `Failed to create Apollo Client: ${errorMessage}. ` +
    `Please check your GraphQL URL configuration (VITE_GRAPHQL_URL=${import.meta.env.VITE_GRAPHQL_URL || 'not set'})`
  )
}

export { client }
