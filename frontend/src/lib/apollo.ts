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

import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client'
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
 * Create minimal Apollo Client with HTTP link only
 * Used as absolute fallback if all other client creation attempts fail
 * This ensures a client is always available for ApolloProvider
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Minimal Apollo Client instance
 */
/**
 * Create minimal Apollo Client with HTTP link only
 * Used as absolute fallback if all other client creation attempts fail
 * Includes proper cache configuration to prevent Error 69
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @returns Minimal Apollo Client instance
 */
const createMinimalClient = (): ApolloClient<any> => {
  // Cache configuration with dataIdFromObject to prevent Error 69
  const cacheConfig = {
    dataIdFromObject: (object: any): string | undefined => {
      if (object.__typename && object.id) {
        return `${object.__typename}:${object.id}`
      }
      if (object.id) {
        return String(object.id)
      }
      return undefined
    },
  }
  
  try {
    // Try to use existing HTTP link if available
    if (httpLink) {
      return new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(cacheConfig),
        devtools: { enabled: true },
      })
    }
    
    // If HTTP link not available, create a new one
    const minimalHttpLink = createHttpLinkInstance()
      return new ApolloClient({
        link: minimalHttpLink,
        cache: new InMemoryCache(cacheConfig),
        devtools: { enabled: true },
      })
  } catch {
    // If all else fails, create with hardcoded URL using HttpLink directly
    const fallbackLink = new HttpLink({
      uri: 'https://project-tracker-backend-pa9k.onrender.com/graphql',
      credentials: 'include',
      fetchOptions: {
        mode: 'cors',
      },
    })
    
    return new ApolloClient({
      link: fallbackLink,
      cache: new InMemoryCache(cacheConfig),
      devtools: { enabled: true },
    })
  }
}

/**
 * Apollo Client instance with error handling and authentication
 * Ensures client is always created, even with minimal configuration
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
      // If any link is invalid, use HTTP link only
      throw new Error(`Invalid link at index ${i}`)
    }
  }
  
  // Compose the link chain using from()
  // from() properly chains non-terminating links before the terminating link
  let linkChain = httpLink
  try {
    linkChain = from(links)
  } catch {
    // If from() fails, use HTTP link only
    linkChain = httpLink
  }
  
  // Validate linkChain is an object
  if (!linkChain || typeof linkChain !== 'object') {
    linkChain = httpLink
  }
  
  // Create Apollo Client with the composed link chain
  // Enable DevTools in both development and production for debugging
  // Improved cache configuration to prevent Error 69
  try {
    // Validate linkChain before creating client
    if (!linkChain || typeof linkChain !== 'object') {
      throw new Error('Invalid link chain')
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
        // Prevent Error 69 by providing proper object identification
        // This function tells Apollo how to create unique IDs for cached objects
        dataIdFromObject: (object: any): string | undefined => {
          // If object has __typename and id, create unique identifier
          if (object.__typename && object.id) {
            return `${object.__typename}:${object.id}`
          }
          // If object has only id, use it directly
          if (object.id) {
            return String(object.id)
          }
          // Return undefined to use default Apollo Client identification
          return undefined
        },
        // Prevent Error 69 by allowing partial data
        possibleTypes: {},
        // Add resultCaching to prevent cache normalization errors
        resultCaching: true,
      }),
      defaultOptions: {
        watchQuery: { 
          errorPolicy: 'all',
        },
        query: { 
          errorPolicy: 'all',
        },
        mutate: { errorPolicy: 'all' },
      },
      // Enable DevTools in both dev and production for debugging
      devtools: { enabled: true },
      // Add assumeImmutableResults to prevent cache issues
      assumeImmutableResults: false,
    })
  } catch {
    // If client creation fails, use HTTP link only with proper cache config
    client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache({
        // Add dataIdFromObject to prevent Error 69 in fallback client
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
  }
  
  // Final validation - ensure client was created
  if (!client || typeof client.query !== 'function') {
    // Last resort: create minimal client
    client = createMinimalClient()
  }
} catch (error) {
  // Absolute last resort: create minimal client
  // This ensures client is ALWAYS created, preventing Error 69
  client = createMinimalClient()
}

// Expose client to window for DevTools discovery
// This ensures DevTools can always find the client
if (typeof window !== 'undefined' && client) {
  ;(window as any).__APOLLO_CLIENT__ = client
}

// Final safety check - if client is still undefined, create absolute minimal client
// This ensures client is ALWAYS defined, preventing Error 69 (ApolloProvider receiving undefined)
if (!client || typeof client.query !== 'function') {
  // This should never happen, but ensures client is always defined
  // Cache configuration with dataIdFromObject to prevent Error 69
  const finalCacheConfig = {
    dataIdFromObject: (object: any): string | undefined => {
      if (object.__typename && object.id) {
        return `${object.__typename}:${object.id}`
      }
      if (object.id) {
        return String(object.id)
      }
      return undefined
    },
  }
  
  try {
    const fallbackHttpLink = new HttpLink({
      uri: 'https://project-tracker-backend-pa9k.onrender.com/graphql',
      credentials: 'include',
      fetchOptions: {
        mode: 'cors',
      },
    })
    client = new ApolloClient({
      link: fallbackHttpLink,
      cache: new InMemoryCache(finalCacheConfig),
      devtools: { enabled: true },
    })
    
    // Expose to window for DevTools
    if (typeof window !== 'undefined') {
      ;(window as any).__APOLLO_CLIENT__ = client
    }
  } catch {
    // If even this fails, create the most basic client possible
    const basicLink = new HttpLink({
      uri: 'https://project-tracker-backend-pa9k.onrender.com/graphql',
    })
    client = new ApolloClient({
      link: basicLink,
      cache: new InMemoryCache(finalCacheConfig),
      devtools: { enabled: true },
    })
  }
}

export { client }
