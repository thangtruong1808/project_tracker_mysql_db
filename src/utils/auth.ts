/**
 * Authentication Utilities
 * Handles JWT token generation and password hashing
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// Get JWT_SECRET from environment variables
// Must be set in .env file - no default value for security
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is required but not set. Please add JWT_SECRET to your .env file.'
  )
}

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

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
 * Generate refresh token ID
 * @returns Unique refresh token ID
 */
export const generateRefreshTokenId = (): string => {
  return uuidv4()
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

