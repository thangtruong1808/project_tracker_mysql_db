/**
 * Apollo Client Configuration
 * Simple and robust GraphQL client setup with proper cache policies
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

/** Error link - swallows errors silently @author Thang Truong @date 2025-12-04 */
const errorLink = onError(() => {})

/**
 * Cache type policies - prevents Error 69 by defining merge behavior for arrays
 * Replace incoming arrays instead of merging to avoid cache conflicts
 * @author Thang Truong
 * @date 2025-12-04
 */
const typePolicies = {
  Query: {
    fields: {
      projects: { merge: (_: unknown, incoming: unknown[]) => incoming },
      users: { merge: (_: unknown, incoming: unknown[]) => incoming },
      tasks: { merge: (_: unknown, incoming: unknown[]) => incoming },
      tags: { merge: (_: unknown, incoming: unknown[]) => incoming },
      notifications: { merge: (_: unknown, incoming: unknown[]) => incoming },
      activities: { merge: (_: unknown, incoming: unknown[]) => incoming },
      teamMembers: { merge: (_: unknown, incoming: unknown[]) => incoming },
      comments: { merge: (_: unknown, incoming: unknown[]) => incoming },
    },
  },
}

/**
 * Apollo Client instance with proper cache configuration
 * @author Thang Truong
 * @date 2025-12-04
 */
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({ typePolicies }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
})
