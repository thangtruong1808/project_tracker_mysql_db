/**
 * Auth Mutation Resolvers
 * Handles authentication mutation operations
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS } from '../../constants/auth'
import { db } from '../../db'
import {
  calculateRefreshTokenExpiry,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenId,
  hashPassword,
  hashRefreshToken,
  setRefreshTokenCookie,
  verifyRefreshToken,
} from '../../utils/auth'
import { formatDateToISO } from '../../utils/formatters'

/**
 * Auth Mutation Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const authMutationResolvers = {
  /**
   * Login mutation - authenticates user with email and password
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  login: async (_: any, { email, password }: { email: string; password: string }, context: { res: any }) => {
    const users = (await db.query('SELECT * FROM users WHERE email = ? AND is_deleted = false', [email])) as any[]
    if (users.length === 0) throw new Error('Invalid email or password')

    const user = users[0]
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) throw new Error('Invalid email or password')

    const accessToken = generateAccessToken(user.id, user.email)
    const refreshTokenId = generateRefreshTokenId()
    const refreshToken = generateRefreshToken(user.id, refreshTokenId)
    const tokenHash = hashRefreshToken(refreshToken)
    const expiresAt = calculateRefreshTokenExpiry()

    await db.query(
      'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
      [refreshTokenId, user.id, tokenHash, expiresAt]
    )

    setRefreshTokenCookie(context.res, refreshToken)

    return {
      accessToken,
      user: {
        id: user.id.toString(),
        uuid: user.uuid,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        createdAt: formatDateToISO(user.created_at),
        updatedAt: formatDateToISO(user.updated_at),
      },
    }
  },

  /**
   * Register mutation - creates new user account
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  register: async (_: any, { input }: { input: any }, context: { res: any }) => {
    const existingUsers = (await db.query('SELECT * FROM users WHERE email = ? AND is_deleted = false', [input.email])) as any[]
    if (existingUsers.length > 0) throw new Error('Email already registered')

    const hashedPassword = await hashPassword(input.password)
    const result = (await db.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)',
      [input.firstName, input.lastName, input.email, hashedPassword]
    )) as any

    const userId = result.insertId
    const users = (await db.query('SELECT * FROM users WHERE id = ?', [userId])) as any[]
    if (users.length === 0) throw new Error('Failed to create user')

    const user = users[0]
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshTokenId = generateRefreshTokenId()
    const refreshToken = generateRefreshToken(user.id, refreshTokenId)
    const tokenHash = hashRefreshToken(refreshToken)
    const expiresAt = calculateRefreshTokenExpiry()

    await db.query(
      'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
      [refreshTokenId, user.id, tokenHash, expiresAt]
    )

    setRefreshTokenCookie(context.res, refreshToken)

    return {
      accessToken,
      user: {
        id: user.id.toString(),
        uuid: user.uuid,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        createdAt: formatDateToISO(user.created_at),
        updatedAt: formatDateToISO(user.updated_at),
      },
    }
  },

  /**
   * Refresh token mutation - generates new access token
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  refreshToken: async (_: any, { extendSession }: { extendSession?: boolean }, context: { req: any; res: any }) => {
    try {
      const refreshToken = context.req?.cookies?.refreshToken
      if (!refreshToken) throw new Error('Refresh token not found')

      const tokenHash = hashRefreshToken(refreshToken)
      let tokens = (await db.query(
        'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW() AND is_revoked = false',
        [tokenHash]
      )) as any[]

      if (tokens.length === 0 && extendSession === true) {
        const gracePeriodSeconds = REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS
        tokens = (await db.query(
          'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > DATE_SUB(NOW(), INTERVAL ? SECOND) AND is_revoked = false',
          [tokenHash, gracePeriodSeconds]
        )) as any[]
      }

      if (tokens.length === 0) throw new Error('Refresh token expired or invalid')

      const tokenRecord = tokens[0]
      const userId = tokenRecord.user_id

      const decoded = verifyRefreshToken(refreshToken)
      if (decoded && decoded.type !== 'refresh') throw new Error('Invalid refresh token type')

      const users = (await db.query('SELECT * FROM users WHERE id = ? AND is_deleted = false', [userId])) as any[]
      if (users.length === 0) throw new Error('User not found')

      const user = users[0]
      const newAccessToken = generateAccessToken(user.id, user.email)

      if (extendSession === true) {
        const newRefreshTokenId = generateRefreshTokenId()
        const newRefreshToken = generateRefreshToken(user.id, newRefreshTokenId)
        const newTokenHash = hashRefreshToken(newRefreshToken)
        const newExpiresAt = calculateRefreshTokenExpiry()

        await db.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash])
        await db.query(
          'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())',
          [newRefreshTokenId, user.id, newTokenHash, newExpiresAt]
        )

        setRefreshTokenCookie(context.res, newRefreshToken)
      }

      return { accessToken: newAccessToken }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to refresh token')
    }
  },

  /**
   * Reset password mutation - updates user password by email
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  resetPassword: async (_: any, { email, newPassword }: { email: string; newPassword: string }) => {
    const users = (await db.query('SELECT * FROM users WHERE email = ? AND is_deleted = false', [email])) as any[]
    if (users.length === 0) throw new Error('No account found with this email address')

    const hashedPassword = await hashPassword(newPassword)
    await db.query('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE email = ?', [hashedPassword, email])

    return true
  },
}

