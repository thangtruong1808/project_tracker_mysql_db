/**
 * Authentication Utilities
 * Handles JWT token generation and password hashing
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Get JWT_SECRET from environment variables
// Must be set in .env file - no default value for security
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is required but not set. Please add JWT_SECRET to your .env file.'
  )
}

import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS,
  ROTATION_SAFETY_MARGIN_SECONDS,
} from '../constants/auth'

/**
 * Convert time string to seconds
 * Parses time strings like '45s', '7d', '1h', '30m', etc.
 * @param timeString - Time string to parse (e.g., '10m', '1h', '7d')
 * @returns Number of seconds, or 0 if format is invalid
 */
export const parseTimeStringToSeconds = (timeString: string): number => {
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
 * Calculate expiration date based on REFRESH_TOKEN_EXPIRY constant
 * Parses time strings like '45s', '7d', '1h', etc.
 * @returns Date object representing the expiration time
 */
export const calculateRefreshTokenExpiry = (): Date => {
  const expiresAt = new Date()
  
  // Parse REFRESH_TOKEN_EXPIRY string (e.g., '45s', '7d', '1h', '30m')
  const match = REFRESH_TOKEN_EXPIRY.match(/^(\d+)([smhd])$/)
  if (!match) {
    // Default to 7 days if format is invalid
    expiresAt.setDate(expiresAt.getDate() + 7)
    return expiresAt
  }

  const value = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 's': // seconds
      expiresAt.setSeconds(expiresAt.getSeconds() + value)
      break
    case 'm': // minutes
      expiresAt.setMinutes(expiresAt.getMinutes() + value)
      break
    case 'h': // hours
      expiresAt.setHours(expiresAt.getHours() + value)
      break
    case 'd': // days
      expiresAt.setDate(expiresAt.getDate() + value)
      break
    default:
      // Default to 7 days if unit is unknown
      expiresAt.setDate(expiresAt.getDate() + 7)
  }

  return expiresAt
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
 * Set refresh token as HTTP-only cookie
 * Uses sameSite: 'none' with secure: true for cross-origin deployments (Vercel)
 * @author Thang Truong
 * @date 2025-12-09
 * @param res - Express response object
 * @param refreshToken - Refresh token to set in cookie
 */
export const setRefreshTokenCookie = (res: any, refreshToken: string): void => {
  const expiresAt = calculateRefreshTokenExpiry()
  const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000)
  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: maxAge * 1000,
    path: '/',
  })
}

/**
 * Clear refresh token cookie
 * Uses sameSite: 'none' with secure: true for cross-origin deployments (Vercel)
 * @author Thang Truong
 * @date 2025-12-09
 * @param res - Express response object
 */
export const clearRefreshTokenCookie = (res: any): void => {
  const isProduction = process.env.NODE_ENV === 'production'
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  })
}

/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare password with hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Boolean indicating if passwords match
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate access token
 * @param userId - User ID
 * @param email - User email
 * @returns JWT access token
 */
export const generateAccessToken = (userId: number, email: string): string => {
  return jwt.sign(
    { userId, email, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  )
}

/**
 * Generate refresh token ID using native crypto
 * Uses crypto.randomUUID() which is available in Node.js 16+
 *
 * @author Thang Truong
 * @date 2025-12-09
 * @returns Unique refresh token ID
 */
export const generateRefreshTokenId = (): string => {
  return crypto.randomUUID()
}

/**
 * Hash refresh token for storage
 * @param token - Plain refresh token
 * @returns Hashed token
 */
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Generate refresh token JWT
 * @param userId - User ID
 * @param tokenId - Refresh token ID
 * @returns JWT refresh token
 */
export const generateRefreshToken = (userId: number, tokenId: string): string => {
  return jwt.sign(
    { userId, tokenId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  )
}

/**
 * Verify access token
 * @param token - JWT access token
 * @returns Decoded token payload or null
 */
export const verifyAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Verify refresh token
 * @param token - JWT refresh token
 * @returns Decoded token payload or null
 */
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

