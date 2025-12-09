/**
 * Users Feature Resolvers
 * Handles user queries and mutations
 * CRUD operations for user management
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import crypto from 'crypto'
import { db } from '../../db'
import { hashPassword } from '../../utils/auth'
import { formatDateToISO } from '../../utils/formatters'
import { requireAuthentication } from '../../utils/helpers'

/**
 * Users Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const usersQueryResolvers = {
  /**
   * Fetch all users - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  users: async (_: any, __: any, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to fetch users.')
    const users = (await db.query(
      'SELECT id, uuid, first_name, last_name, email, role, created_at, updated_at FROM users WHERE is_deleted = false ORDER BY created_at DESC'
    )) as any[]
    return users.map((user: any) => ({
      id: user.id.toString(),
      uuid: user.uuid,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      createdAt: formatDateToISO(user.created_at),
      updatedAt: formatDateToISO(user.updated_at),
    }))
  },
}

/**
 * Users Mutation Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const usersMutationResolvers = {
  /**
   * Create user mutation - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  createUser: async (_: any, { input }: { input: any }, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to create users.')
    const existingUsers = (await db.query(
      'SELECT * FROM users WHERE email = ? AND is_deleted = false',
      [input.email]
    )) as any[]

    if (existingUsers.length > 0) {
      throw new Error('Email already registered')
    }

    const hashedPassword = await hashPassword(input.password)
    const userUuid = crypto.randomUUID()
    const userRole = input.role || 'Frontend Developer'

    const result = (await db.query(
      'INSERT INTO users (uuid, first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [userUuid, input.firstName, input.lastName, input.email, hashedPassword, userRole]
    )) as any

    const userId = result.insertId

    const users = (await db.query(
      'SELECT id, uuid, first_name, last_name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    )) as any[]

    if (users.length === 0) {
      throw new Error('Failed to create user')
    }

    const user = users[0]

    return {
      id: user.id.toString(),
      uuid: user.uuid,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      createdAt: formatDateToISO(user.created_at),
      updatedAt: formatDateToISO(user.updated_at),
    }
  },

  /**
   * Update user mutation - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  updateUser: async (_: any, { id, input }: { id: string; input: any }, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to update users.')
    const updates: string[] = []
    const values: any[] = []

    if (input.firstName !== undefined) {
      updates.push('first_name = ?')
      values.push(input.firstName)
    }
    if (input.lastName !== undefined) {
      updates.push('last_name = ?')
      values.push(input.lastName)
    }
    if (input.email !== undefined) {
      updates.push('email = ?')
      values.push(input.email)
    }
    if (input.role !== undefined) {
      updates.push('role = ?')
      values.push(input.role)
    }

    if (updates.length === 0) {
      throw new Error('No fields to update')
    }

    values.push(id)
    await db.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false`,
      values
    )

    const users = (await db.query(
      'SELECT id, uuid, first_name, last_name, email, role, created_at, updated_at FROM users WHERE id = ? AND is_deleted = false',
      [id]
    )) as any[]

    if (users.length === 0) {
      throw new Error('User not found')
    }

    const user = users[0]

    return {
      id: user.id.toString(),
      uuid: user.uuid,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      createdAt: formatDateToISO(user.created_at),
      updatedAt: formatDateToISO(user.updated_at),
    }
  },

  /**
   * Delete user mutation (soft delete) - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  deleteUser: async (_: any, { id }: { id: string }, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to delete users.')
    const result = (await db.query(
      'UPDATE users SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false',
      [id]
    )) as any

    if (result.affectedRows === 0) {
      throw new Error('User not found or already deleted')
    }

    return true
  },
}

