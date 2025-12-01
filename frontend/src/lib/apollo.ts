/**
 * Apollo Client Configuration
 * Main entry point for Apollo Client setup
 * Sets up GraphQL client with authentication headers and error handling
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

// Must import before Apollo to suppress WebSocket errors
import './suppressWebSocketErrors'

import { ApolloClient, InMemoryCache, from } from '@apollo/client'
import { createErrorLink, createAuthLink, setTokenExpirationHandler as setAuthTokenExpirationHandler, setAccessTokenGetter as setAuthAccessTokenGetter } from './apollo/auth'
import { createHttpLinkInstance, createWebSocketLink, createSplitLink, setAccessTokenGetter as setLinksAccessTokenGetter } from './apollo/links'

// Enable detailed error messages in development
// This helps debug Apollo Client errors during development
// Note: @apollo/client/dev is only available in development builds
// Load synchronously using dynamic import with immediate execution
if (import.meta.env.DEV) {
  // Load dev messages immediately to help with debugging
  import('@apollo/client/dev')
    .then(({ loadErrorMessages, loadDevMessages }) => {
      loadDevMessages()
      loadErrorMessages()
    })
    .catch(() => {
      // Silently fail if dev module is not available (expected in production builds)
    })
}

/**
 * Set the token expiration handler callback
 * Re-exports from auth module for backward compatibility
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (handler: () => Promise<void>) => {
  setAuthTokenExpirationHandler(handler)
}

/**
 * Set the access token getter function
 * Re-exports from auth module for backward compatibility
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param getter - Function that returns current access token
 */
export const setAccessTokenGetter = (getter: () => string | null) => {
  setAuthAccessTokenGetter(getter)
  setLinksAccessTokenGetter(getter)
}

// Create links
const httpLink = createHttpLinkInstance()
const wsLink = createWebSocketLink()
const splitLink = createSplitLink(httpLink, wsLink)

// Ensure splitLink is a valid Apollo Link
if (!splitLink || typeof splitLink !== 'object') {
  throw new Error('Failed to create Apollo Client link chain. splitLink is invalid.')
}

// Create auth and error links
const errorLink = createErrorLink()
const authLink = createAuthLink()

// Validate all links are properly initialized before creating client
if (!errorLink || !authLink || !splitLink) {
  throw new Error(
    'Failed to initialize Apollo Client link chain. ' +
    `errorLink: ${!!errorLink}, authLink: ${!!authLink}, splitLink: ${!!splitLink}. ` +
    'Please check your GraphQL URL configuration.'
  )
}

/**
 * Apollo Client instance with error handling and authentication
 * Wrapped in try-catch to provide better error messages
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
let client: ApolloClient<any>

try {
  // Compose the link chain: error handling -> authentication -> split (WebSocket/HTTP)
  // The from() function composes multiple links into a single link
  // Ensure all links are valid Apollo Links before composition
  const links = [errorLink, authLink, splitLink].filter(Boolean)
  
  if (links.length !== 3) {
    throw new Error(
      `Invalid link chain: expected 3 links, got ${links.length}. ` +
      `errorLink: ${!!errorLink}, authLink: ${!!authLink}, splitLink: ${!!splitLink}`
    )
  }
  
  const linkChain = from(links as any)
  
  // Validate linkChain is properly created and has required methods
  if (!linkChain || typeof linkChain !== 'object') {
    throw new Error('Failed to compose Apollo Client link chain: linkChain is invalid')
  }
  
  client = new ApolloClient({
    link: linkChain,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Add any custom cache policies here if needed
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: { errorPolicy: 'all' },
      query: { errorPolicy: 'all' },
      mutate: { errorPolicy: 'all' },
    },
    // Enable devtools for better debugging in development
    // Use new devtools.enabled format instead of deprecated connectToDevTools
    devtools: {
      enabled: import.meta.env.DEV,
    },
  })
} catch (error) {
  // Provide helpful error message if client creation fails
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'not set'
  throw new Error(
    `Failed to create Apollo Client: ${errorMessage}. ` +
    `GraphQL URL: ${graphqlUrl}. ` +
    `Please check your VITE_GRAPHQL_URL environment variable.`
  )
}

export { client }
