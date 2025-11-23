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
} from './utils/auth'
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
  },
  Mutation: {
    /**
     * Login mutation - authenticates user and returns tokens
     * @param email - User email address
     * @param password - User password
     * @returns Access token, refresh token, and user data
     */
    login: async (_: any, { email, password }: { email: string; password: string }) => {
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

        // Calculate expiry date (7 days from now)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        // Store refresh token in database
        await db.query(
          'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
          [refreshTokenId, user.id, tokenHash, expiresAt]
        )

        return {
          accessToken,
          refreshToken,
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
     * @param input - Registration data containing firstName, lastName, email, and password
     * @returns Access token, refresh token, and user data
     */
    register: async (_: any, { input }: { input: { firstName: string; lastName: string; email: string; password: string } }) => {
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

      // Calculate expiry date (7 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Store refresh token in database
      await db.query(
        'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
        [refreshTokenId, userId, tokenHash, expiresAt]
      )

      // Fetch created user
      const users = (await db.query('SELECT * FROM users WHERE id = ?', [userId])) as any[]
      const user = users[0]

      return {
        accessToken,
        refreshToken,
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

