/**
 * AuthContext
 * Manages user authentication state and tokens
 * Handles token refresh and automatic authentication on app initialization
 * Monitors refresh token expiration and triggers dialog when refresh token is about to expire
 * Silently auto-refreshes access token when it expires
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { refreshAccessToken } from '../utils/tokenRefresh'
import { setAccessTokenGetter } from '../lib/apollo'
import {
  REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS,
} from '../constants/auth'
import { useTokenRefresh } from '../hooks/useTokenRefresh'

interface User {
  id: string
  uuid: string
  firstName: string
  lastName: string
  email: string
  role: string
  name: string
  initials: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
  showExpirationDialog: boolean
  refreshTokenTimeRemaining: number | null
  setShowExpirationDialog: (show: boolean) => void
  updateTokenStatus: (status: { isValid: boolean; timeRemaining: number | null; isAboutToExpire: boolean } | null) => void
  login: (userData: User, accessToken: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [showExpirationDialog, setShowExpirationDialog] = useState(false)
  const [refreshTokenTimeRemaining, setRefreshTokenTimeRemaining] = useState<number | null>(null)

  /**
   * Login user and store access token in memory (refresh token in HTTP-only cookie)
   * Access token stored in memory only (not localStorage) for security
   * Refresh token stored as HTTP-only cookie by server (not accessible to JavaScript)
   * @param userData - User data from backend
   * @param newAccessToken - JWT access token (stored in memory only)
   */
  const login = async (userData: User, newAccessToken: string) => {
    setUser(userData)
    setAccessToken(newAccessToken)
    setIsAuthenticated(true)
    setShowExpirationDialog(false)
    dialogShownRef.current = false
    // Store user in localStorage (not sensitive data)
    localStorage.setItem('user', JSON.stringify(userData))
    // Access token NOT stored in localStorage - kept in memory only for security
    // Refresh token is in HTTP-only cookie (set by server, not accessible to JavaScript)
  }

  /**
   * Logout user and clear all stored data
   * Clears access token from memory and user from localStorage
   * Refresh token cookie will be cleared by server on next request or logout endpoint
   */
  const logout = async () => {
    setUser(null)
    setAccessToken(null)
    setIsAuthenticated(false)
    setShowExpirationDialog(false)
    dialogShownRef.current = false
    localStorage.removeItem('user')
    // Access token already cleared from memory
    // Refresh token cookie will be cleared by server
  }

  /**
   * Attempts to refresh the access token using refresh token from HTTP-only cookie
   * Refresh token is automatically sent by browser as cookie
   * @returns true if refresh was successful, false otherwise
   */
  const handleRefreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const result = await refreshAccessToken()
      if (result && result.accessToken) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          // Update access token in memory (refresh token is in HTTP-only cookie)
          setAccessToken(result.accessToken)
          setUser(userData)
          setIsAuthenticated(true)
          return true
        }
      }
      return false
    } catch {
      return false
    }
  }, [])

  /**
   * Dialog shown ref for tracking if dialog has been displayed
   * Used to prevent multiple dialog displays
   */
  const dialogShownRef = useRef(false)

  /**
   * Use token refresh hook for automatic token refresh
   * Handles automatic access token refresh when expired
   */
  useTokenRefresh({
    accessToken,
    isAuthenticated,
    showExpirationDialog,
    refreshTokenTimeRemaining,
    onRefreshToken: handleRefreshToken,
    onShowDialog: () => {
      setShowExpirationDialog(true)
      dialogShownRef.current = true
    },
    dialogShownRef,
  })

  /**
   * Callback to update token status from external component
   * @param status - Token status from backend query
   */
  const updateTokenStatus = useCallback((status: { isValid: boolean; timeRemaining: number | null; isAboutToExpire: boolean } | null) => {
    if (!isAuthenticated) {
      setShowExpirationDialog(false)
      setRefreshTokenTimeRemaining(null)
      dialogShownRef.current = false
      return
    }
    if (!status) return

    if (status.timeRemaining !== null && status.timeRemaining !== undefined) {
      setRefreshTokenTimeRemaining(status.timeRemaining)
    }

    if (!status.isValid || (status.timeRemaining !== null && status.timeRemaining <= 0)) {
      if (dialogShownRef.current) return
      return
    }

    if (status.isAboutToExpire && status.isValid) {
      if (!dialogShownRef.current) {
        setShowExpirationDialog(true)
        dialogShownRef.current = true
      }
    } else {
      if (dialogShownRef.current && status.isValid && status.timeRemaining && status.timeRemaining > REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS) {
        setShowExpirationDialog(false)
        dialogShownRef.current = false
      }
    }
  }, [isAuthenticated])

  /**
   * Provide access token getter to Apollo Client
   * This allows Apollo Client to access the current access token from memory
   */
  useEffect(() => {
    setAccessTokenGetter(() => accessToken)
  }, [accessToken])

  /**
   * Initialize auth state from localStorage on mount
   * Attempts to refresh token if access token is expired
   * Refresh token is in HTTP-only cookie (not in localStorage)
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user')

      if (storedUser) {
        try {
          // Access token stored in memory only, not in localStorage
          // Since we don't persist access token in localStorage, we always try to refresh
          // Try to refresh access token using refresh token from HTTP-only cookie
          const refreshed = await handleRefreshToken()
          if (!refreshed) {
            // Refresh failed - clear auth state (refresh token might be expired)
            setUser(null)
            setAccessToken(null)
            setIsAuthenticated(false)
            localStorage.removeItem('user')
          }
        } catch {
          // Error initializing - clear auth state
          setUser(null)
          setAccessToken(null)
          setIsAuthenticated(false)
          localStorage.removeItem('user')
        }
      }
    }

    initializeAuth()
  }, [handleRefreshToken])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        accessToken,
        showExpirationDialog,
        refreshTokenTimeRemaining,
        setShowExpirationDialog,
        updateTokenStatus,
        login,
        logout,
        refreshAccessToken: handleRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
