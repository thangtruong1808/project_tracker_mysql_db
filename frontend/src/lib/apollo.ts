/**
 * Apollo Client Configuration
 * Handles GraphQL connection with proper URL validation
 * Supports both local development and production environments
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

/**
 * Access token getter function reference
 * @author Thang Truong
 * @date 2025-12-04
 */
let getAccessToken: (() => string | null) | null = null

/**
 * Sets the access token getter function
 * Called by AuthContext to provide token access
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @param getter - Function that returns current access token
 */
export const setAccessTokenGetter = (getter: () => string | null): void => {
  getAccessToken = getter
}

/**
 * Sets token expiration handler for refresh logic
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @param handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (_handler: () => Promise<void>): void => {
  // Token expiration handling placeholder
}

/**
 * Constructs GraphQL endpoint URL from environment
 * Prioritizes VITE_GRAPHQL_URL environment variable
 * Falls back to deployed backend URL for production
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns Validated GraphQL endpoint URL
 */
const getGraphQLUrl = (): string => {
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

  // Production fallback - deployed Vercel backend
  return 'https://project-tracker-mysql-db-wjay.vercel.app/graphql'
}

/**
 * HTTP link for GraphQL network requests
 * Configured with CORS credentials for cookie-based auth
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
const httpLink = new HttpLink({
  uri: getGraphQLUrl(),
  credentials: 'include',
  fetchOptions: {
    mode: 'cors',
  },
})

/**
 * Authentication link - adds Bearer token to requests
 * Retrieves token from AuthContext getter function
 *
 * @author Thang Truong
 * @date 2025-12-04
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
 * Error handling link for GraphQL and network errors
 * Processes errors silently without console output
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(() => {
      // Silent error handling - errors shown via UI toasts
    })
  }
  if (networkError) {
    // Network error handled by Apollo error policies
  }
})

/**
 * Apollo Client instance with configured link chain
 * Order: errorLink -> authLink -> httpLink
 * Ensures errors are caught, auth is added, then request is sent
 *
 * @author Thang Truong
 * @date 2025-12-04
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
