/**
 * Apollo Client Configuration
 * Handles GraphQL connection with environment-based URL configuration
 * No hardcoded URLs - uses VITE_GRAPHQL_URL for all environments
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { ApolloClient, InMemoryCache, HttpLink, from, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

/** Access token getter function reference @author Thang Truong @date 2025-12-04 */
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
 * @param _handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (_handler: () => Promise<void>): void => {
  // Token expiration handling placeholder
}

/**
 * Constructs GraphQL endpoint URL from environment variable
 * Development: Uses VITE_GRAPHQL_URL or defaults to localhost:4000
 * Production: Requires VITE_GRAPHQL_URL to be set
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

  // Development mode: default to localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:4000/graphql'
  }

  // Production: VITE_GRAPHQL_URL must be set
  throw new Error('VITE_GRAPHQL_URL environment variable is required in production')
}

/**
 * HTTP link for GraphQL network requests
 * @author Thang Truong
 * @date 2025-12-04
 */
const httpLink = new HttpLink({
  uri: getGraphQLUrl(),
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

/**
 * Authentication link - adds Bearer token to requests
 * @author Thang Truong
 * @date 2025-12-04
 */
const authLink = setContext(async (_, { headers }) => {
  const token = getAccessToken ? getAccessToken() : null
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

/**
 * Error handling link for GraphQL and network errors
 * @author Thang Truong
 * @date 2025-12-04
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) { graphQLErrors.forEach(() => { /* Silent error handling */ }) }
  if (networkError) { /* Network error handled by Apollo error policies */ }
})

/** Logging link for request pipeline @author Thang Truong @date 2025-12-04 */
const loggingLink = new ApolloLink((operation, forward) => forward(operation))

/**
 * Apollo Client instance with configured link chain
 * @author Thang Truong
 * @date 2025-12-04
 */
export const client = new ApolloClient({
  link: from([errorLink, loggingLink, authLink, httpLink]),
  cache: new InMemoryCache({
    dataIdFromObject: (object: any): string | undefined => {
      if (object.__typename && object.id) return `${object.__typename}:${object.id}`
      if (object.id) return String(object.id)
      return undefined
    },
  }),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all', fetchPolicy: 'cache-and-network' },
    query: { errorPolicy: 'all', fetchPolicy: 'network-only' },
    mutate: { errorPolicy: 'all' },
  },
  devtools: { enabled: import.meta.env.DEV },
})
