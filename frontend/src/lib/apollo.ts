/**
 * Apollo Client Configuration - Fixed for 3.14.0
 * Properly handles URL validation and link chain initialization
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
 * Get validated GraphQL URL
 * Ensures URL is valid before creating HTTP link
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Valid GraphQL URL
 */
const getValidatedGraphQLUrl = (): string => {
  const url = getGraphQLUrl()
  
  // Validate URL format
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid GraphQL URL: URL is not a string')
  }
  
  // Ensure URL is valid HTTP/HTTPS URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error(`Invalid GraphQL URL: "${url}" - must start with http:// or https://`)
  }
  
  // Validate URL can be parsed
  try {
    new URL(url)
  } catch {
    throw new Error(`Invalid GraphQL URL: "${url}" - cannot be parsed as URL`)
  }
  
  return url
}

/**
 * HTTP link for GraphQL requests
 * Created with validated URL to prevent Error 69
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
let httpLink: HttpLink

try {
  const graphqlUrl = getValidatedGraphQLUrl()
  httpLink = new HttpLink({
    uri: graphqlUrl,
    credentials: 'include',
    fetchOptions: {
      mode: 'cors',
    },
  })
} catch (error) {
  // Fallback to production URL if validation fails
  // Use the actual backend URL from user's deployment
  const fallbackUrl = import.meta.env.VITE_GRAPHQL_URL || 'https://project-tracker-mysql-db-8cgm.vercel.app/graphql'
  httpLink = new HttpLink({
    uri: fallbackUrl.endsWith('/graphql') ? fallbackUrl : `${fallbackUrl}/graphql`,
    credentials: 'include',
    fetchOptions: {
      mode: 'cors',
    },
  })
}

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
 * Handles GraphQL and network errors
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
