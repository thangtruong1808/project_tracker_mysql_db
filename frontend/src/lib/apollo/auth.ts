/**
 * Apollo Client Authentication Link
 * Handles token refresh and authentication headers
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { refreshAccessToken } from '../../utils/tokenRefresh'

let onTokenExpired: (() => Promise<void>) | null = null
let getAccessToken: (() => string | null) | null = null

/**
 * Set the token expiration handler callback
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @param handler - Function to call when token expires
 */
export const setTokenExpirationHandler = (handler: () => Promise<void>) => {
  onTokenExpired = handler
}

/**
 * Set the access token getter function
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @param getter - Function that returns current access token
 */
export const setAccessTokenGetter = (getter: () => string | null) => {
  getAccessToken = getter
}

/**
 * Handle token refresh on authentication errors
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
const handleTokenRefresh = async () => {
  try {
    const result = await refreshAccessToken()
    if (!result || !result.accessToken) {
      if (onTokenExpired) await onTokenExpired()
    }
  } catch {
    if (onTokenExpired) await onTokenExpired()
  }
}

/**
 * Error link to handle GraphQL and network errors
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
/**
 * Error link to handle GraphQL and network errors
 * Automatically refreshes token on authentication errors
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns Apollo error link
 */
export const createErrorLink = () => {
  return onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      for (const { message, extensions } of graphQLErrors) {
        const isAuthError =
          extensions?.code === 'UNAUTHENTICATED' ||
          message.toLowerCase().includes('unauthorized') ||
          message.toLowerCase().includes('authentication') ||
          message.toLowerCase().includes('token expired') ||
          message.toLowerCase().includes('invalid token')
        if (isAuthError) {
          // Handle token refresh asynchronously
          handleTokenRefresh().catch(() => {
            // Silently handle refresh errors
          })
        }
      }
    }
    if (networkError) {
      const statusCode = (networkError as { statusCode?: number }).statusCode
      if (statusCode === 401) {
        // Handle token refresh asynchronously
        handleTokenRefresh().catch(() => {
          // Silently handle refresh errors
        })
      }
    }
  })
}

/**
 * Auth link to add access token to requests
 *
 * @author Thang Truong
 * @date 2025-12-04
 */
/**
 * Auth link to add access token to requests
 * Apollo Client automatically sets content-type, so we don't override it
 *
 * @author Thang Truong
 * @date 2025-12-04
 * @returns Apollo context link
 */
export const createAuthLink = () => {
  return setContext((_, { headers }) => {
    const accessToken = getAccessToken ? getAccessToken() : null
    return {
      headers: {
        ...headers,
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
    }
  })
}

