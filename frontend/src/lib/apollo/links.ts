/**
 * Apollo Client Link Configuration
 * Creates HTTP, WebSocket, and split links for Apollo Client
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { createHttpLink, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { getGraphQLUrl, getWebSocketUrl } from './config'

let getAccessToken: (() => string | null) | null = null

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
 * HTTP link to GraphQL endpoint
 * Includes error handling for invalid URIs
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const createHttpLinkInstance = () => {
  const graphqlUrl = getGraphQLUrl()

  // Validate GraphQL URL - provide helpful error message
  if (!graphqlUrl || graphqlUrl === 'undefined/graphql' || !graphqlUrl.startsWith('http')) {
    const errorMessage = import.meta.env.DEV
      ? `Invalid GraphQL URL: "${graphqlUrl}". Please set VITE_GRAPHQL_URL environment variable to your backend URL (e.g., https://your-backend.onrender.com)`
      : 'Invalid GraphQL URL. Please configure VITE_GRAPHQL_URL environment variable.'
    throw new Error(errorMessage)
  }

  return createHttpLink({
    uri: graphqlUrl,
    credentials: 'include',
    fetchOptions: {
      mode: 'cors',
    },
  })
}

/**
 * WebSocket link for GraphQL subscriptions
 * Only created if WebSocket URL is available (local development)
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const createWebSocketLink = () => {
  const wsUrl = getWebSocketUrl()
  
  if (!wsUrl) {
    return null
  }

  return new GraphQLWsLink(
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
}

/**
 * Split link - uses WebSocket for subscriptions, HTTP for queries/mutations
 * Falls back to HTTP if WebSocket is not available (production/Vercel)
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const createSplitLink = (httpLink: ReturnType<typeof createHttpLinkInstance>, wsLink: ReturnType<typeof createWebSocketLink>) => {
  // In production (Vercel), wsLink is null, so use HTTP link directly
  if (!wsLink) {
    return httpLink
  }

  // In development, create split link for WebSocket subscriptions
  try {
    return split(
      ({ query }) => {
        try {
          const definition = getMainDefinition(query)
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          )
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

