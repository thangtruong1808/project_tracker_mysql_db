/**
 * Apollo Client Configuration - Simplified for 3.14.0
 * Direct setup to avoid Error 69 and 400 Bad Request
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getGraphQLUrl } from './apollo/config'

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
 */
export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessToken = getter
}

/**
 * Set token expiration handler (no-op for now)
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const setTokenExpirationHandler = (_handler: () => Promise<void>) => {
  // Token expiration handling can be added here
}

/**
 * HTTP link for GraphQL requests
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const httpLink = new HttpLink({
  uri: getGraphQLUrl(),
  credentials: 'include',
})

/**
 * Auth link to add authorization header
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
 * Apollo Client instance
 * Simple link chain: errorLink -> authLink -> httpLink
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
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
  devtools: { enabled: true },
})

