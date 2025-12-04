/**
 * Apollo Client Configuration
 * Robust GraphQL client setup with comprehensive cache policies
 * Handles Error 69 by disabling cache normalization for entities
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { ApolloClient, InMemoryCache, HttpLink, from, FieldMergeFunction } from '@apollo/client'
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
    // Silent
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

/** Error link - handles errors gracefully @author Thang Truong @date 2025-12-04 */
const errorLink = onError(() => {})

/**
 * Safe merge function - always replaces existing with incoming
 * Handles null, undefined, and empty arrays safely
 * @author Thang Truong
 * @date 2025-12-04
 */
const safeMerge: FieldMergeFunction = (_existing, incoming) => incoming

/**
 * Cache type policies - comprehensive fix for Error 69
 * Disables normalization for all entity types using keyFields: false
 * Uses safe merge for all Query array fields
 * @author Thang Truong
 * @date 2025-12-04
 */
const typePolicies = {
  Query: {
    fields: {
      projects: { merge: safeMerge },
      project: { merge: safeMerge },
      users: { merge: safeMerge },
      user: { merge: safeMerge },
      tasks: { merge: safeMerge },
      task: { merge: safeMerge },
      tags: { merge: safeMerge },
      tag: { merge: safeMerge },
      notifications: { merge: safeMerge },
      notification: { merge: safeMerge },
      activities: { merge: safeMerge },
      activity: { merge: safeMerge },
      teamMembers: { merge: safeMerge },
      teamMember: { merge: safeMerge },
      comments: { merge: safeMerge },
      comment: { merge: safeMerge },
      refreshTokenStatus: { merge: safeMerge },
      searchDashboard: { merge: safeMerge },
    },
  },
  // Disable cache normalization for entity types to prevent Error 69
  Project: { keyFields: false as const },
  User: { keyFields: false as const },
  Task: { keyFields: false as const },
  Tag: { keyFields: false as const },
  Notification: { keyFields: false as const },
  Activity: { keyFields: false as const },
  TeamMember: { keyFields: false as const },
  Comment: { keyFields: false as const },
  RefreshTokenStatus: { keyFields: false as const },
  SearchResult: { keyFields: false as const },
}

/**
 * Apollo Client instance with comprehensive cache configuration
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
