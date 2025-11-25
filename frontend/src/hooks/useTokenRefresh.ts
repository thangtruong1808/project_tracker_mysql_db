/**
 * useTokenRefresh Hook
 * Custom hook for handling automatic token refresh logic
 * Monitors access token expiration and refreshes when needed
 * 
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useEffect } from 'react'
import { isTokenExpired } from '../utils/tokenRefresh'
import { REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS } from '../constants/auth'

interface UseTokenRefreshProps {
  accessToken: string | null
  isAuthenticated: boolean
  showExpirationDialog: boolean
  refreshTokenTimeRemaining: number | null
  onRefreshToken: () => Promise<boolean>
  onShowDialog: () => void
  dialogShownRef: React.MutableRefObject<boolean>
}

/**
 * useTokenRefresh Hook
 * Handles automatic access token refresh when expired
 * 
 * @param props - Token refresh configuration
 */
export const useTokenRefresh = ({
  accessToken,
  isAuthenticated,
  showExpirationDialog,
  refreshTokenTimeRemaining,
  onRefreshToken,
  onShowDialog,
  dialogShownRef,
}: UseTokenRefreshProps) => {

  /**
   * Silently auto-refreshes access token when it expires
   * This runs in the background without user interaction
   * Does NOT refresh if refresh token is about to expire (to allow dialog to appear)
   */
  useEffect(() => {
    if (!accessToken || !isAuthenticated) return
    if (showExpirationDialog) return

    const checkAndRefreshAccessToken = async () => {
      if (accessToken && isTokenExpired(accessToken)) {
        if (refreshTokenTimeRemaining === null) {
          return
        }

        if (refreshTokenTimeRemaining <= REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS && !dialogShownRef.current) {
          onShowDialog()
          dialogShownRef.current = true
        }

        const success = await onRefreshToken()
        if (!success && !dialogShownRef.current) {
          onShowDialog()
          dialogShownRef.current = true
        }
      }
    }

    checkAndRefreshAccessToken()
    const interval = setInterval(checkAndRefreshAccessToken, 5000)
    return () => clearInterval(interval)
  }, [accessToken, isAuthenticated, showExpirationDialog, refreshTokenTimeRemaining, onRefreshToken, onShowDialog, dialogShownRef])

  /**
   * Reset dialog shown flag when dialog is closed
   */
  useEffect(() => {
    if (!showExpirationDialog) {
      dialogShownRef.current = false
    }
  }, [showExpirationDialog, dialogShownRef])
}

