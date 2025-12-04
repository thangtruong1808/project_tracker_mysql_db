/**
 * Apollo Client Configuration
 * Handles GraphQL connection with environment-based URL configuration
 * Uses VITE_GRAPHQL_URL environment variable for API endpoint
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
 * @author Thang Truong
 * @date 2025-12-04
 * @param getter - Function that returns current access token
 */
export const setAccessTokenGetter = (getter: () => string | null): void => {
  getAccessToken = getter
}

/**
 * Sets token expiration handler for refresh logic
 * @author Thang Truong
 * @date 2025-12-04
 * @param _handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (_handler: () => Promise<void>): void => {}

/**
 * Constructs GraphQL endpoint URL from environment variable
 * Uses VITE_GRAPHQL_URL in production, defaults to localhost in development
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns GraphQL endpoint URL
 */
const getGraphQLUrl = (): string => {
  const envUrl = import.meta.env.VITE_GRAPHQL_URL

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '')
    if (!cleanUrl.endsWith('/graphql')) cleanUrl = `${cleanUrl}/graphql`
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl
  }

  // Development: default to localhost
  if (import.meta.env.DEV) return 'http://localhost:4000/graphql'

  // Production fallback: derive from window location for same-origin API
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host.includes('vercel.app')) {
      // Construct backend URL pattern: frontend is project-tracker-mysql-db, backend is project-tracker-mysql-db-wjay
      const backendUrl = `https://project-tracker-mysql-db-wjay.vercel.app/graphql`
      return backendUrl
    }
  }

  return 'http://localhost:4000/graphql'
}

/** HTTP link for GraphQL requests @author Thang Truong @date 2025-12-04 */
const httpLink = new HttpLink({
  uri: getGraphQLUrl(),
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

/** Auth link - adds Bearer token @author Thang Truong @date 2025-12-04 */
const authLink = setContext(async (_, { headers }) => {
  const token = getAccessToken ? getAccessToken() : null
  return {
    headers: { ...headers, 'Content-Type': 'application/json', 'Accept': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}) },
  }
})

/** Error handling link @author Thang Truong @date 2025-12-04 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) graphQLErrors.forEach(() => { /* Silent */ })
  if (networkError) { /* Silent */ }
})

/** Pass-through link @author Thang Truong @date 2025-12-04 */
const loggingLink = new ApolloLink((operation, forward) => forward(operation))

/**
 * Apollo Client instance with proper cache configuration
 * @author Thang Truong
 * @date 2025-12-04
 */
export const client = new ApolloClient({
  link: from([errorLink, loggingLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          projects: { merge: (_existing, incoming) => incoming },
          users: { merge: (_existing, incoming) => incoming },
          tasks: { merge: (_existing, incoming) => incoming },
          tags: { merge: (_existing, incoming) => incoming },
          notifications: { merge: (_existing, incoming) => incoming },
          activities: { merge: (_existing, incoming) => incoming },
          teamMembers: { merge: (_existing, incoming) => incoming },
          comments: { merge: (_existing, incoming) => incoming },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all', fetchPolicy: 'network-only', notifyOnNetworkStatusChange: true },
    query: { errorPolicy: 'all', fetchPolicy: 'network-only' },
    mutate: { errorPolicy: 'all' },
  },
  devtools: { enabled: import.meta.env.DEV },
})
