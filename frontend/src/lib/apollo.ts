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
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
let httpLink: ReturnType<typeof createHttpLinkInstance>
let wsLink: ReturnType<typeof createWebSocketLink> | null
let splitLink: ReturnType<typeof createSplitLink>
let errorLink: ReturnType<typeof createErrorLink>
let authLink: ReturnType<typeof createAuthLink>

try {
  // Create HTTP link - this is required
  httpLink = createHttpLinkInstance()
  
  // Create WebSocket link - this is optional and may return null
  try {
    wsLink = createWebSocketLink()
  } catch (wsError) {
    // WebSocket link creation failed - continue without it
    wsLink = null
  }
  
  // Create split link - falls back to HTTP if WebSocket is not available
  splitLink = createSplitLink(httpLink, wsLink)
  
  // Create auth and error links
  errorLink = createErrorLink()
  authLink = createAuthLink()
  
  // Validate all required links are properly initialized
  if (!httpLink || !splitLink || !errorLink || !authLink) {
    throw new Error(
      'Failed to initialize Apollo Client link chain. ' +
      `httpLink: ${!!httpLink}, splitLink: ${!!splitLink}, errorLink: ${!!errorLink}, authLink: ${!!authLink}. ` +
      'Please check your GraphQL URL configuration.'
    )
  }
  
  // Ensure splitLink is a valid Apollo Link
  // The split link is a terminating link and should be an object
  if (typeof splitLink !== 'object' || splitLink === null) {
    throw new Error('Failed to create Apollo Client link chain. splitLink is invalid.')
  }
} catch (linkError) {
  const errorMessage = linkError instanceof Error ? linkError.message : 'Unknown error'
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'not set'
  throw new Error(
    `Failed to create Apollo Client links: ${errorMessage}. ` +
    `GraphQL URL: ${graphqlUrl}. ` +
    `Please check your VITE_GRAPHQL_URL environment variable in Render.`
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
  // Order is important: non-terminating links (error, auth) before terminating link (split/http)
  const links = [errorLink, authLink, splitLink]
  
  // Basic validation - ensure links are not null/undefined
  if (links.some(link => link === null || link === undefined)) {
    throw new Error(
      'One or more Apollo Client links are null or undefined. ' +
      `errorLink: ${!!errorLink}, authLink: ${!!authLink}, splitLink: ${!!splitLink}`
    )
  }
  
  // Validate each link is an object (Apollo Links are objects)
  for (let i = 0; i < links.length; i++) {
    const link = links[i]
    if (typeof link !== 'object' || link === null) {
      throw new Error(
        `Link at index ${i} is not a valid Apollo Link object. ` +
        `Type: ${typeof link}, Value: ${link}`
      )
    }
  }
  
  // Compose the link chain using from()
  // from() properly chains non-terminating links before the terminating link
  let linkChain
  try {
    linkChain = from(links)
  } catch (chainError) {
    throw new Error(
      `Failed to compose link chain: ${chainError instanceof Error ? chainError.message : 'Unknown error'}. ` +
      `Make sure all links are valid Apollo Link instances.`
    )
  }
  
  // Validate linkChain is an object
  if (!linkChain || typeof linkChain !== 'object') {
    throw new Error('Link chain composition returned invalid result')
  }
  
  // Create Apollo Client with the composed link chain
  try {
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
  } catch (clientError) {
    throw new Error(
      `ApolloClient constructor failed: ${clientError instanceof Error ? clientError.message : 'Unknown error'}. ` +
      `This usually means the link chain is invalid.`
    )
  }
  
  // Final validation - ensure client was created
  if (!client) {
    throw new Error('Apollo Client was not created successfully')
  }
} catch (error) {
  // Provide helpful error message if client creation fails
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'not set'
  const isProduction = import.meta.env.PROD
  
  // Log detailed error information for debugging
  const detailedError = new Error(
    `Failed to create Apollo Client: ${errorMessage}\n` +
    `GraphQL URL: ${graphqlUrl}\n` +
    `Environment: ${isProduction ? 'production' : 'development'}\n` +
    `Please check:\n` +
    `1. VITE_GRAPHQL_URL is set correctly${isProduction ? ' in Render/Vercel environment variables' : ''}\n` +
    `2. The URL is accessible and points to a valid GraphQL endpoint\n` +
    `3. The backend server is running and CORS is configured correctly`
  )
  
  // In production, we still need to throw to prevent the app from running with invalid client
  // But we provide detailed error message
  throw detailedError
}

export { client }
