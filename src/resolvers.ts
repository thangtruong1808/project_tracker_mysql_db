/**
 * GraphQL Resolvers
 * Handles all GraphQL queries and mutations
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { db } from './db'
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenId,
  hashRefreshToken,
  hashPassword,
  verifyRefreshToken,
  calculateRefreshTokenExpiry,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  parseTimeStringToSeconds,
} from './utils/auth'
import {
  REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS,
  REFRESH_TOKEN_EXPIRY,
} from './constants/auth'
import { v4 as uuidv4 } from 'uuid'

export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    projects: async () => {
      const projects = (await db.query(
        'SELECT * FROM projects WHERE is_deleted = false ORDER BY created_at DESC'
      )) as any[]
      return projects
    },
    project: async (_: any, { id }: { id: string }) => {
      const projects = (await db.query(
        'SELECT * FROM projects WHERE id = ? AND is_deleted = false',
        [id]
      )) as any[]
      return projects[0] || null
    },
    /**
     * Refresh token status query
     * Checks refresh token expiration status from HTTP-only cookie
     * Returns whether token is valid, time remaining, and if it's about to expire
     * 
     * @author Thang Truong
     * @date 2024-12-24
     * @param context - GraphQL context containing request object
     * @returns Refresh token status information
     */
    refreshTokenStatus: async (_: any, __: any, context: { req: any }) => {
      try {
        // Get refresh token from HTTP-only cookie
        const refreshToken = context.req.cookies?.refreshToken
        if (!refreshToken) {
          return {
            isValid: false,
            timeRemaining: null,
            isAboutToExpire: false,
          }
        }

        // Check if refresh token exists in database
        const tokenHash = hashRefreshToken(refreshToken)
        const tokens = (await db.query(
          'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW() AND is_revoked = false',
          [tokenHash]
        )) as any[]

        if (tokens.length === 0) {
          return {
            isValid: false,
            timeRemaining: null,
            isAboutToExpire: false,
          }
        }

        const tokenRecord = tokens[0]
        
        // Calculate elapsed time since refresh token creation (count from zero)
        // created_at is stored when refresh token is first created
        const createdAt = new Date(tokenRecord.created_at)
        const currentTime = new Date()
        const elapsedMs = currentTime.getTime() - createdAt.getTime()
        const elapsedSeconds = Math.floor(elapsedMs / 1000)
        
        // Parse REFRESH_TOKEN_EXPIRY to get total lifetime in seconds
        const refreshTokenExpirySeconds = parseTimeStringToSeconds(REFRESH_TOKEN_EXPIRY)
        
        // Calculate time remaining: REFRESH_TOKEN_EXPIRY - elapsed time
        const timeRemainingSeconds = Math.max(0, refreshTokenExpirySeconds - elapsedSeconds)
        
        // Check if token is about to expire
        // Dialog should appear when elapsed time >= (REFRESH_TOKEN_EXPIRY - REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS)
        // Which means: timeRemaining <= REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS
        const isAboutToExpire = elapsedSeconds >= (refreshTokenExpirySeconds - REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS) && elapsedSeconds < refreshTokenExpirySeconds

        return {
          isValid: true,
          timeRemaining: timeRemainingSeconds,
          isAboutToExpire,
        }
      } catch {
        return {
          isValid: false,
          timeRemaining: null,
          isAboutToExpire: false,
        }
      }
    },
  },
  Mutation: {
    /**
     * Login mutation - authenticates user and returns tokens
     * Sets refresh token as HTTP-only cookie and returns access token in response
     * @param email - User email address
     * @param password - User password
     * @param context - GraphQL context containing request and response objects
     * @returns Access token and user data (refresh token sent as HTTP-only cookie)
     */
    login: async (_: any, { email, password }: { email: string; password: string }, context: { req: any; res: any }) => {
      try {
        // Find user by email
        const users = (await db.query(
          'SELECT * FROM users WHERE email = ? AND is_deleted = false',
          [email]
        )) as any[]

        if (users.length === 0) {
          throw new Error('Invalid email or password')
        }

        const user = users[0]

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.email)
        const refreshTokenId = generateRefreshTokenId()
        const refreshToken = generateRefreshToken(user.id, refreshTokenId)

        // Hash refresh token for storage
        const tokenHash = hashRefreshToken(refreshToken)

        // Calculate expiry date based on REFRESH_TOKEN_EXPIRY constant
        const expiresAt = calculateRefreshTokenExpiry()

        // Store refresh token in database
        await db.query(
          'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
          [refreshTokenId, user.id, tokenHash, expiresAt]
        )

        // Set refresh token as HTTP-only cookie (more secure than returning in response)
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
          },
        }
      } catch (error: any) {
        // Re-throw authentication errors as-is
        if (error.message === 'Invalid email or password') {
          throw error
        }
        // Provide helpful error messages for database connection issues
        if (error.code === 'ER_BAD_DB_ERROR' || error.message?.includes('does not exist')) {
          throw new Error(
            'Database connection error. Please verify:\n' +
            '1. DB_NAME in .env file is set to: project_tracker_mysql_db\n' +
            '2. The database exists (run: npm run migrate)\n' +
            '3. Your database credentials are correct'
          )
        }
        // Re-throw other errors
        throw error
      }
    },
    /**
     * Register mutation - creates a new user account
     * Sets refresh token as HTTP-only cookie and returns access token in response
     * @param input - Registration data containing firstName, lastName, email, and password
     * @param context - GraphQL context containing request and response objects
     * @returns Access token and user data (refresh token sent as HTTP-only cookie)
     */
    register: async (_: any, { input }: { input: { firstName: string; lastName: string; email: string; password: string } }, context: { req: any; res: any }) => {
      // Check if user with email already exists
      const existingUsers = (await db.query(
        'SELECT * FROM users WHERE email = ? AND is_deleted = false',
        [input.email]
      )) as any[]

      if (existingUsers.length > 0) {
        throw new Error('Email already registered')
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password)

      // Generate UUID for user
      const userUuid = uuidv4()

      // Insert new user into database
      const result = (await db.query(
        'INSERT INTO users (uuid, first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
        [userUuid, input.firstName, input.lastName, input.email, hashedPassword, 'Frontend Developer']
      )) as any

      const userId = result.insertId

      // Generate tokens for new user
      const accessToken = generateAccessToken(userId, input.email)
      const refreshTokenId = generateRefreshTokenId()
      const refreshToken = generateRefreshToken(userId, refreshTokenId)

      // Hash refresh token for storage
      const tokenHash = hashRefreshToken(refreshToken)

      // Calculate expiry date based on REFRESH_TOKEN_EXPIRY constant
      const expiresAt = calculateRefreshTokenExpiry()

      // Store refresh token in database
      await db.query(
        'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
        [refreshTokenId, userId, tokenHash, expiresAt]
      )

      // Fetch created user
      const users = (await db.query('SELECT * FROM users WHERE id = ?', [userId])) as any[]
      const user = users[0]

      // Set refresh token as HTTP-only cookie (more secure than returning in response)
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
        },
      }
    },
    /**
     * Refresh token mutation - generates new access token using refresh token from HTTP-only cookie
     * Reads refresh token from cookie and sets new refresh token as HTTP-only cookie
     * @param extendSession - If true, always rotate refresh token (user clicked "Yes" on dialog)
     *                        If false or undefined, only rotate if refresh token has >REFRESH_TOKEN_ROTATION_THRESHOLD_SECONDS remaining
     * @param context - GraphQL context containing request and response objects
     * @returns New access token (refresh token sent as HTTP-only cookie if rotated)
     */
    /**
     * Refresh token mutation
     * Refreshes access token and optionally rotates refresh token
     * Prevents refresh token rotation when close to expiration to allow dialog to appear
     * 
     * @author Thang Truong
     * @date 2024-12-24
     * @param extendSession - If true, always rotates refresh token (user clicked "Yes" on dialog)
     * @param context - GraphQL context containing request and response objects
     * @returns New access token
     */
    refreshToken: async (_: any, { extendSession }: { extendSession?: boolean }, context: { req: any; res: any }) => {
      try {
        // Get refresh token from HTTP-only cookie (more secure than mutation parameter)
        const refreshToken = context.req.cookies?.refreshToken
        if (!refreshToken) {
          throw new Error('Refresh token not found')
        }

        // Check if refresh token exists in database first
        // This allows refresh even if JWT token is slightly expired but database record is still valid
        // If extendSession is true, allow extension even if token is slightly expired (within dialog threshold)
        const tokenHash = hashRefreshToken(refreshToken)
        let tokens = (await db.query(
          'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > NOW() AND is_revoked = false',
          [tokenHash]
        )) as any[]

        // If token not found and extendSession is true, check if token exists but is slightly expired
        // This allows extending session even if token expired within the dialog threshold window
        if (tokens.length === 0 && extendSession === true) {
          // Check if token exists but is expired (within dialog threshold grace period)
          const gracePeriodSeconds = REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS
          tokens = (await db.query(
            'SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > DATE_SUB(NOW(), INTERVAL ? SECOND) AND is_revoked = false',
            [tokenHash, gracePeriodSeconds]
          )) as any[]
        }

        if (tokens.length === 0) {
          throw new Error('Refresh token expired or invalid')
        }

        // Get user information from database record
        // Allow refresh even if JWT token is slightly expired but database record is still valid
        const tokenRecord = tokens[0]
        const userId = tokenRecord.user_id

        // Verify JWT token to ensure it's a valid refresh token format
        // If JWT is expired but database record is valid, we still allow refresh
        const decoded = verifyRefreshToken(refreshToken)
        if (decoded && decoded.type !== 'refresh') {
          throw new Error('Invalid refresh token type')
        }

        // Get user information
        const users = (await db.query('SELECT * FROM users WHERE id = ? AND is_deleted = false', [
          userId,
        ])) as any[]

        if (users.length === 0) {
          throw new Error('User not found')
        }

        const user = users[0]

        // Generate new access token
        // Access token is rotated every ACCESS_TOKEN_EXPIRY (60 seconds) when it expires
        const newAccessToken = generateAccessToken(user.id, user.email)

        // Only rotate refresh token if user explicitly extends session (clicked "Yes" on dialog)
        // Otherwise, refresh token lifetime is counted from created_at (elapsed time from zero)
        // This allows elapsed time tracking from zero to REFRESH_TOKEN_EXPIRY
        if (extendSession === true) {
          // User clicked "Yes" on dialog - rotate refresh token to extend session
          // Always rotate refresh token when user explicitly extends, even if slightly expired
          // This allows extending session even if token expired within dialog threshold window
          // 
          // @author Thang Truong
          // @date 2024-12-24
          
          // Generate new refresh token (rotate refresh token to extend session)
          const newRefreshTokenId = generateRefreshTokenId()
          const newRefreshToken = generateRefreshToken(user.id, newRefreshTokenId)
          const newTokenHash = hashRefreshToken(newRefreshToken)

          // Calculate new expiry date based on REFRESH_TOKEN_EXPIRY constant
          // This resets the session by creating a new refresh token with a new expiration
          const newExpiresAt = calculateRefreshTokenExpiry()

          // Delete old refresh token and insert new one with updated expires_at and created_at
          // created_at is reset to NOW() to start counting elapsed time from zero again
          await db.query('DELETE FROM refresh_tokens WHERE token_hash = ?', [tokenHash])
          await db.query(
            'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, NOW())',
            [newRefreshTokenId, user.id, newTokenHash, newExpiresAt]
          )

          // Set new refresh token as HTTP-only cookie (rotate refresh token)
          setRefreshTokenCookie(context.res, newRefreshToken)
        }
        // If extendSession is false/undefined, do NOT rotate refresh token
        // This allows elapsed time to continue counting from created_at until REFRESH_TOKEN_EXPIRY

        return {
          accessToken: newAccessToken,
        }
      } catch (error: any) {
        throw new Error(error.message || 'Failed to refresh token')
      }
    },
    createProject: async (_: any, { input }: { input: any }) => {
      const { name, description, status } = input
      const result = (await db.query(
        'INSERT INTO projects (name, description, status) VALUES (?, ?, ?)',
        [name, description || null, status]
      )) as any
      const projects = (await db.query('SELECT * FROM projects WHERE id = ?', [
        result.insertId,
      ])) as any[]
      return projects[0]
    },
    updateProject: async (_: any, { id, input }: { id: string; input: any }) => {
      const updates: string[] = []
      const values: any[] = []

      if (input.name !== undefined) {
        updates.push('name = ?')
        values.push(input.name)
      }
      if (input.description !== undefined) {
        updates.push('description = ?')
        values.push(input.description)
      }
      if (input.status !== undefined) {
        updates.push('status = ?')
        values.push(input.status)
      }

      if (updates.length === 0) {
        throw new Error('No fields to update')
      }

      values.push(id)
      await db.query(
        `UPDATE projects SET ${updates.join(', ')}, updatedAt = NOW() WHERE id = ?`,
        values
      )

      const projects = (await db.query('SELECT * FROM projects WHERE id = ?', [id])) as any[]
      return projects[0]
    },
    deleteProject: async (_: any, { id }: { id: string }) => {
      await db.query('DELETE FROM projects WHERE id = ?', [id])
      return true
    },
  },
}

