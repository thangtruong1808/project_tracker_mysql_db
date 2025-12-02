/**
 * Apollo Client Configuration - Fixed for 3.14.0
 * Properly handles URL validation and link chain initialization
 * Prevents Error 69 and 400 Bad Request errors
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

/**
 * Access token getter function
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
let getAccessToken: (() => string | null) | null = null

/**
 * Set access token getter
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param getter - Function that returns current access token
 */
export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessToken = getter
}

/**
 * Set token expiration handler
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (_handler: () => Promise<void>) => {
  // Token expiration handling can be added here
}

/**
 * Get GraphQL URL from environment or use fallback
 * Uses the actual deployed backend URL
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns GraphQL endpoint URL
 */
const getGraphQLUrl = (): string => {
  // Try environment variable first
  const envUrl = import.meta.env.VITE_GRAPHQL_URL
  
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '')
    if (!cleanUrl.endsWith('/graphql')) {
      cleanUrl = `${cleanUrl}/graphql`
    }
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl
    }
  }
  
  // Fallback to actual deployed backend URL
  return 'https://project-tracker-mysql-db-8cgm.vercel.app/graphql'
}

/**
 * HTTP link for GraphQL requests
 * Created with validated URL to prevent Error 69
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const httpLink = new HttpLink({
  uri: getGraphQLUrl(),
  credentials: 'include',
  fetchOptions: {
    mode: 'cors',
  },
})

/**
 * Auth link to add authorization header
 * Only adds header if token exists
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const authLink = setContext((_, { headers }) => {
  const token = getAccessToken ? getAccessToken() : null
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

/**
 * Error link for error handling
 * Handles GraphQL and network errors silently
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(() => {
      // Error handling logic can be added here
    })
  }
  if (networkError) {
    // Network error handling
  }
})

/**
 * Create Apollo Client with proper link chain
 * Link chain: errorLink -> authLink -> httpLink
 * This order ensures errors are caught, auth is added, then request is sent
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    dataIdFromObject: (object: any): string | undefined => {
      if (object.__typename && object.id) {
        return `${object.__typename}:${object.id}`
      }
      if (object.id) {
        return String(object.id)
      }
      return undefined
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  devtools: { enabled: true },
})
