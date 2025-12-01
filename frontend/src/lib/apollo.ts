/**
 * Apollo Client Configuration
 * Main entry point for Apollo Client setup
 * Sets up GraphQL client with authentication headers and error handling
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

// Must import before Apollo to suppress WebSocket errors
// This file suppresses WebSocket-related console errors
import './suppressWebSocketErrors'

import { ApolloClient, InMemoryCache, from } from '@apollo/client'
import { createErrorLink, createAuthLink, setTokenExpirationHandler as setAuthTokenExpirationHandler, setAccessTokenGetter as setAuthAccessTokenGetter } from './apollo/auth'
import { createHttpLinkInstance, createWebSocketLink, createSplitLink, setAccessTokenGetter as setLinksAccessTokenGetter } from './apollo/links'

// Enable detailed error messages in both development and production
// This helps debug Apollo Client errors
// Load error messages to get better error details
try {
  // Try to load dev messages - available in dev builds
  if (import.meta.env.DEV) {
    import('@apollo/client/dev')
      .then(({ loadErrorMessages, loadDevMessages }) => {
        loadDevMessages()
        loadErrorMessages()
      })
      .catch(() => {
        // Silently fail if dev module is not available
      })
  }
} catch {
  // Silently fail if import fails
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

/**
 * Create Apollo Client links with error handling
 * Wraps link creation in try-catch to provide better error messages
 * Uses HTTP-only link in production to avoid WebSocket issues
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
let httpLink: ReturnType<typeof createHttpLinkInstance>
let terminatingLink: ReturnType<typeof createHttpLinkInstance> | ReturnType<typeof createSplitLink>
let errorLink: ReturnType<typeof createErrorLink>
let authLink: ReturnType<typeof createAuthLink>

try {
  // Create HTTP link - this is required and always works
  httpLink = createHttpLinkInstance()
  
  // Validate HTTP link was created
  if (!httpLink || typeof httpLink !== 'object') {
    throw new Error('Failed to create HTTP link - link is invalid')
  }
  
  // In production, use HTTP-only to avoid WebSocket link chain issues
  // WebSocket can be added later if needed, but HTTP-only is more reliable
  if (import.meta.env.PROD) {
    // Production: Use HTTP link directly (no WebSocket to avoid link chain issues)
    terminatingLink = httpLink
  } else {
    // Development: Try to create WebSocket link, but fall back to HTTP if it fails
    let wsLink: ReturnType<typeof createWebSocketLink> | null = null
    try {
      wsLink = createWebSocketLink()
    } catch {
      // WebSocket link creation failed - use HTTP only
      wsLink = null
    }
    
    // Create split link only if WebSocket is available
    if (wsLink) {
      try {
        terminatingLink = createSplitLink(httpLink, wsLink)
        // Validate split link
        if (!terminatingLink || typeof terminatingLink !== 'object') {
          terminatingLink = httpLink
        }
      } catch {
        // Split link creation failed - use HTTP only
        terminatingLink = httpLink
      }
    } else {
      terminatingLink = httpLink
    }
  }
  
  // Create auth and error links
  errorLink = createErrorLink()
  authLink = createAuthLink()
  
  // Validate all required links are properly initialized
  if (!httpLink || !terminatingLink || !errorLink || !authLink) {
    throw new Error(
      'Failed to initialize Apollo Client link chain. ' +
      `httpLink: ${!!httpLink}, terminatingLink: ${!!terminatingLink}, errorLink: ${!!errorLink}, authLink: ${!!authLink}`
    )
  }
  
  // Ensure terminating link is a valid Apollo Link
  if (typeof terminatingLink !== 'object' || terminatingLink === null) {
    throw new Error('Failed to create Apollo Client link chain. Terminating link is invalid.')
  }
} catch (linkError) {
  const errorMessage = linkError instanceof Error ? linkError.message : 'Unknown error'
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'not set'
  throw new Error(
    `Failed to create Apollo Client links: ${errorMessage}. ` +
    `GraphQL URL: ${graphqlUrl}. ` +
    `Please check your configuration.`
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
  // Compose the link chain: error handling -> authentication -> terminating link (HTTP or split)
  // The from() function composes multiple links into a single link
  // Order is critical: non-terminating links (error, auth) before terminating link
  const links = [errorLink, authLink, terminatingLink]
  
  // Validate all links exist and are objects
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    if (!link || typeof link !== 'object' || link === null) {
      throw new Error(
        `Invalid link at index ${i}. ` +
        `Expected Apollo Link object, got: ${link === null ? 'null' : link === undefined ? 'undefined' : typeof link}`
      )
    }
  }
  
  // Compose the link chain using from()
  // from() properly chains non-terminating links before the terminating link
  const linkChain = from(links)
  
  // Validate linkChain is an object
  if (!linkChain || typeof linkChain !== 'object') {
    throw new Error('Link chain composition failed - result is not a valid Apollo Link')
  }
  
  // Create Apollo Client with the composed link chain
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
    devtools: {
      enabled: import.meta.env.DEV,
    },
  })
  
  // Final validation - ensure client was created
  if (!client) {
    throw new Error('Apollo Client was not created successfully')
  }
} catch (error) {
  // Provide helpful error message if client creation fails
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'not set'
  const isProduction = import.meta.env.PROD
  
  throw new Error(
    `Failed to create Apollo Client: ${errorMessage}. ` +
    `GraphQL URL: ${graphqlUrl}. ` +
    `Environment: ${isProduction ? 'production' : 'development'}. ` +
    `Please check your configuration.`
  )
}

export { client }
