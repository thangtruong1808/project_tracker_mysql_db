/**
 * TokenStatusPoller Component
 * Polls refresh token status from backend to check expiration
 * Only renders when user is authenticated to avoid useQuery outside Apollo context
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { REFRESH_TOKEN_STATUS_QUERY } from '../graphql/queries'

const TokenStatusPoller = () => {
  const { isAuthenticated, updateTokenStatus } = useAuth()

  /**
   * Poll refresh token status from backend to check expiration
   * Refresh token is in HTTP-only cookie (not accessible to JavaScript)
   * This query polls the backend to check if refresh token is about to expire
   * Only runs when authenticated to ensure Apollo context is available
   */
  const { data: tokenStatusData, error } = useQuery(REFRESH_TOKEN_STATUS_QUERY, {
    skip: !isAuthenticated, // Only poll when authenticated
    pollInterval: 500, // Poll every 500ms to catch expiration quickly
    fetchPolicy: 'network-only', // Always fetch fresh data
    errorPolicy: 'all', // Continue even if query errors
  })

  /**
   * Update token status in AuthContext when query data changes
   * Stops polling when user is not authenticated to prevent unnecessary updates
   */
  useEffect(() => {
    if (!isAuthenticated) {
      updateTokenStatus(null)
      return
    }

    if (error) {
      // If query fails, refresh token might be invalid or expired
      // Only update if still authenticated (avoid race condition with logout)
      if (isAuthenticated) {
        updateTokenStatus({
          isValid: false,
          timeRemaining: null,
          isAboutToExpire: false,
        })
      }
      return
    }

    if (tokenStatusData?.refreshTokenStatus && isAuthenticated) {
      updateTokenStatus(tokenStatusData.refreshTokenStatus)
    }
  }, [tokenStatusData, error, isAuthenticated, updateTokenStatus])

  // This component doesn't render anything - it just polls and updates context
  return null
}

export default TokenStatusPoller

