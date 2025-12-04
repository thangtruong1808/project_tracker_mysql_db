/**
 * Token Refresh Utility
 * Handles token refresh logic and token expiration checking
 *
 * @author Thang Truong
 * @date 2025-12-04
 */

import { client } from '../lib/apollo'
import { REFRESH_TOKEN_MUTATION } from '../graphql/mutations'
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS,
  ROTATION_SAFETY_MARGIN_SECONDS,
} from '../constants/auth'

/**
 * Convert time string to seconds
 * Parses time strings like '45s', '7d', '1h', '30m', etc.
 * @param timeString - Time string to parse (e.g., '10m', '1h', '7d')
 * @returns Number of seconds, or 0 if format is invalid
 */
const parseTimeStringToSeconds = (timeString: string): number => {
  const match = timeString.match(/^(\d+)([smhd])$/)
  if (!match) {
    return 0
  }

  const value = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 's': // seconds
      return value
    case 'm': // minutes
      return value * 60
    case 'h': // hours
      return value * 60 * 60
    case 'd': // days
      return value * 24 * 60 * 60
    default:
      return 0
  }
}

/**
 * Calculate refresh token rotation threshold in seconds
 * Prevents rotation when refresh token is close to expiration
 * Formula: REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS + ACCESS_TOKEN_EXPIRY (in seconds) + ROTATION_SAFETY_MARGIN_SECONDS
 * This ensures refresh token can reach dialog threshold without being rotated
 * When refresh token has <= this threshold remaining, rotation is stopped to allow dialog to appear
 * 
 * @author Thang Truong
 * @date 2025-12-04
 * @returns Threshold in seconds
 */
export const getRefreshTokenRotationThresholdSeconds = (): number => {
  // Parse ACCESS_TOKEN_EXPIRY to get seconds (e.g., '1m' = 60 seconds)
  // This must match the backend ACCESS_TOKEN_EXPIRY constant
  const accessTokenExpirySeconds = parseTimeStringToSeconds(ACCESS_TOKEN_EXPIRY)
  
  // Calculate threshold: dialog threshold + access token expiry + safety margin
  // This ensures we stop rotating when we're getting close to the dialog threshold
  // Example: With 10s dialog threshold, 60s access token expiry, and 10s safety margin = 10 + 60 + 10 = 80s
  // When refresh token has <= 80s remaining, we stop rotating to allow dialog to appear
  const threshold = REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS + accessTokenExpirySeconds + ROTATION_SAFETY_MARGIN_SECONDS
  
  // Return the calculated threshold
  return threshold
}

/**
 * Attempts to refresh the access token using the refresh token from HTTP-only cookie
 * Refresh token is automatically sent by browser as cookie
 * @param extendSession - If true, always rotates refresh token (user clicked "Yes" on dialog)
 *                        If false or undefined, only rotates if refresh token has >10 seconds remaining
 * @returns Object with new accessToken, or null if refresh fails
 */
export const refreshAccessToken = async (extendSession: boolean = false) => {
  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { extendSession },
    })

    if (data?.refreshToken) {
      return {
        accessToken: data.refreshToken.accessToken,
      }
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Checks if a JWT token is expired by decoding it
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp ? payload.exp < currentTime : true
  } catch {
    return true
  }
}

/**
 * Gets the expiration time of a JWT token in milliseconds
 * @param token - JWT token string
 * @returns Expiration time in milliseconds, or null if token is invalid
 */
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp) {
      return payload.exp * 1000
    }
    return null
  } catch {
    return null
  }
}

/**
 * Gets the time remaining until token expires in milliseconds
 * @param token - JWT token string
 * @returns Time remaining in milliseconds, or 0 if expired
 */
export const getTokenTimeRemaining = (token: string): number => {
  const expirationTime = getTokenExpirationTime(token)
  if (!expirationTime) {
    return 0
  }
  const remaining = expirationTime - Date.now()
  return Math.max(0, remaining)
}

/**
 * Checks if a JWT token is about to expire within the specified time window
 * @param token - JWT token string
 * @param secondsBeforeExpiry - Number of seconds before expiry to consider "about to expire" (default: 20)
 * @returns true if token expires within the time window, false otherwise
 */
export const isTokenAboutToExpire = (token: string, secondsBeforeExpiry: number = 20): boolean => {
  try {
    const timeRemaining = getTokenTimeRemaining(token)
    const thresholdMs = secondsBeforeExpiry * 1000
    return timeRemaining > 0 && timeRemaining <= thresholdMs
  } catch {
    return false
  }
}
