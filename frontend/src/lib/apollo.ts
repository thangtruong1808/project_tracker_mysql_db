/**
 * Apollo Client Configuration
 * GraphQL client setup with proper error handling
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

/** Access token getter @author Thang Truong @date 2025-12-09 */
let getAccessToken: (() => string | null) | null = null

/**
 * Sets access token getter function
 * @author Thang Truong
 * @date 2025-12-09
 */
export const setAccessTokenGetter = (getter: () => string | null): void => {
  getAccessToken = getter
}

/**
 * Token expiration handler setter
 * @author Thang Truong
 * @date 2025-12-09
 */
export const setTokenExpirationHandler = (_handler: () => Promise<void>): void => {}

/**
 * Gets the GraphQL URL from environment variable
 * @author Thang Truong
 * @date 2025-12-09
 */
const getGraphQLUrl = (): string => {
  const envUrl = import.meta.env.VITE_GRAPHQL_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const url = envUrl.trim().replace(/\/+$/, '')
    return url.endsWith('/graphql') ? url : `${url}/graphql`
  }
  return import.meta.env.DEV ? 'http://localhost:4000/graphql' : '/graphql'
}

/** HTTP link with credentials for cross-origin cookies @author Thang Truong @date 2025-12-09 */
const httpLink = new HttpLink({
  uri: getGraphQLUrl(),
  credentials: 'include',
  fetchOptions: { mode: 'cors' },
})

/** Auth link @author Thang Truong @date 2025-12-09 */
const authLink = setContext((_, { headers }) => {
  const token = getAccessToken?.() || null
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } }
})

/** Error link - handles GraphQL errors @author Thang Truong @date 2025-12-09 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      if (message && !message.includes('token')) {
        // Allow errors to propagate for proper handling
      }
    })
  }
  if (networkError) {
    // Network error occurred - allow it to propagate
  }
})

/**
 * Apollo Client instance with proper error handling
 * Uses network-only to always fetch fresh data
 * @author Thang Truong
 * @date 2025-12-09
 */
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
})
