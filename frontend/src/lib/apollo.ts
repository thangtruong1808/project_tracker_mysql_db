/**
 * Apollo Client Configuration
 * Simple and robust GraphQL client setup
 * Uses VITE_GRAPHQL_URL environment variable
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

/** Access token getter @author Thang Truong @date 2025-12-04 */
let getAccessToken: (() => string | null) | null = null

/**
 * Sets access token getter function
 * @author Thang Truong
 * @date 2025-12-04
 */
export const setAccessTokenGetter = (getter: () => string | null): void => {
  getAccessToken = getter
}

/**
 * Token expiration handler setter
 * @author Thang Truong
 * @date 2025-12-04
 */
export const setTokenExpirationHandler = (_handler: () => Promise<void>): void => {}

/**
 * Gets the GraphQL URL from environment variable
 * @author Thang Truong
 * @date 2025-12-04
 */
const getGraphQLUrl = (): string => {
  try {
    const envUrl = import.meta.env.VITE_GRAPHQL_URL
    if (envUrl) {
      const url = String(envUrl).trim().replace(/\/+$/, '')
      return url.endsWith('/graphql') ? url : `${url}/graphql`
    }
  } catch {
    // Silent catch
  }
  return import.meta.env.DEV ? 'http://localhost:4000/graphql' : '/graphql'
}

/** HTTP link @author Thang Truong @date 2025-12-04 */
const httpLink = new HttpLink({ uri: getGraphQLUrl() })

/** Auth link @author Thang Truong @date 2025-12-04 */
const authLink = setContext((_, { headers }) => {
  const token = getAccessToken?.() || null
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } }
})

/** Error link @author Thang Truong @date 2025-12-04 */
const errorLink = onError(() => {})

/**
 * Apollo Client instance
 * @author Thang Truong
 * @date 2025-12-04
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
