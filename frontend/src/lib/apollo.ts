/**
 * Apollo Client Configuration
 * Sets up GraphQL client with authentication headers and error handling
 *
 * @author Thang Truong
 * @date 2025-11-26
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

let onTokenExpired: (() => Promise<void>) | null = null
let getAccessToken: (() => string | null) | null = null

/**
 * Set the token expiration handler callback
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (handler: () => Promise<void>) => {
  onTokenExpired = handler
}

/**
 * Set the access token getter function
 *
 * @author Thang Truong
 * @date 2025-11-26
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
  if (productionUrl) {
    return productionUrl.endsWith('/graphql') ? productionUrl : `${productionUrl}/graphql`
  }
  
  // Option 2: Local development - fallback to localhost
  return 'http://localhost:4000/graphql'
}

/**
 * Get WebSocket URL from environment variable
 * Supports two options:
 * 1. VITE_GRAPHQL_URL - For production (Hostinger/Vercel) - uses WSS
 * 2. Falls back to localhost for local development - uses WS
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns WebSocket endpoint URL
 */
const getWebSocketUrl = (): string => {
  // Option 1: Production URL (Hostinger/Vercel) - convert HTTPS to WSS
  const productionUrl = import.meta.env.VITE_GRAPHQL_URL
  if (productionUrl) {
    const httpUrl = productionUrl.replace(/^https?:\/\//, '')
    return `wss://${httpUrl.replace(/\/graphql$/, '')}/graphql`
  }
  
  // Option 2: Local development - use WS protocol
  return 'ws://localhost:4000/graphql'
}

/**
 * HTTP link to GraphQL endpoint
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const httpLink = createHttpLink({
  uri: getGraphQLUrl(),
  credentials: 'include',
})

/**
 * WebSocket link for GraphQL subscriptions
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const wsLink = new GraphQLWsLink(
  createClient({
    url: getWebSocketUrl(),
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

/**
 * Split link - uses WebSocket for subscriptions, HTTP for queries/mutations
 *
 * @author Thang Truong
 * @date 2025-11-26
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
 * Handle token refresh on authentication errors
 *
 * @author Thang Truong
 * @date 2025-11-26
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
 * @date 2025-11-26
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
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const client = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
})
