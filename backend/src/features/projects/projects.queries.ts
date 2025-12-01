/**
 * Projects Query Resolvers
 * Handles project query operations
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { db } from '../../db'
import { formatDateToISO, formatUser } from '../../utils/formatters'
import { tryGetUserIdFromRequest } from '../../utils/helpers'

/**
 * Projects Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const projectsQueryResolvers = {
  /**
   * Fetch all projects with owner, likes, and comments
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  projects: async (_: any, __: any, context: { req: any }) => {
    try {
      const projects = (await db.query(
        `SELECT p.id, p.name, p.description, p.status, p.owner_id, p.created_at, p.updated_at,
          u.id as owner_user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
          u.email as owner_email, u.role as owner_role, u.uuid as owner_uuid,
          u.created_at as owner_created_at, u.updated_at as owner_updated_at,
          COALESCE(pl.likes_count, 0) as likes_count, COALESCE(pc.comments_count, 0) as comments_count
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id AND u.is_deleted = false
        LEFT JOIN (SELECT project_id, COUNT(*) as likes_count FROM project_likes GROUP BY project_id) pl ON p.id = pl.project_id
        LEFT JOIN (SELECT project_id, COUNT(*) as comments_count FROM comments WHERE is_deleted = false GROUP BY project_id) pc ON p.id = pc.project_id
        WHERE p.is_deleted = false ORDER BY p.created_at DESC`
      )) as any[]

      const userId = tryGetUserIdFromRequest(context.req)
      let userLikedProjects: Set<number> = new Set()

      if (userId) {
        const userLikes = (await db.query(
          'SELECT project_id FROM project_likes WHERE user_id = ?',
          [userId]
        )) as any[]
        userLikedProjects = new Set(userLikes.map((like: any) => Number(like.project_id)))
      }

      return projects.map((project: any) => ({
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        owner: formatUser(project, 'owner_'),
        likesCount: Number(project.likes_count || 0),
        commentsCount: Number(project.comments_count || 0),
        isLiked: userId ? userLikedProjects.has(Number(project.id)) : false,
        createdAt: formatDateToISO(project.created_at),
        updatedAt: formatDateToISO(project.updated_at),
      }))
    } catch (error: any) {
      // Provide helpful error messages for common database issues
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error(
          'Database tables not found. Please run the migration script: npm run migrate'
        )
      }
      if (error.code === 'ER_BAD_DB_ERROR') {
        throw new Error(
          `Database '${process.env.DB_NAME}' does not exist. Please run the migration script: npm run migrate`
        )
      }
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new Error(
          'Database access denied. Please check your database credentials in the .env file.'
        )
      }
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        throw new Error(
          'Database connection failed. Please check your database configuration and ensure DB_SSL_REJECT_UNAUTHORIZED=false is set for FreeSQLDatabase.'
        )
      }
      if (error.code === 'ER_HOST_NOT_PRIVILEGED' || error.message?.includes('is blocked')) {
        throw new Error(
          'Database host is temporarily blocked due to too many connection errors. Please wait a few minutes and try again. The connection pool has been optimized to prevent this.'
        )
      }
      if (error.code === 'ER_NOT_SUPPORTED_AUTH_MODE' || error.message?.includes('does not support secure connection')) {
        throw new Error(
          'SSL connection error. For FreeSQLDatabase, ensure DB_SSL_REJECT_UNAUTHORIZED=false is set in your .env file.'
        )
      }
      throw error
    }
  },

  /**
   * Fetch single project by ID with tasks, members, and comments
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  project: async (_: any, { id }: { id: string }, context: { req: any }) => {
    try {
      const projects = (await db.query(
      `SELECT p.id, p.name, p.description, p.status, p.owner_id, p.created_at, p.updated_at,
        u.id as owner_user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
        u.email as owner_email, u.role as owner_role, u.uuid as owner_uuid,
        u.created_at as owner_created_at, u.updated_at as owner_updated_at,
        COALESCE(pl.likes_count, 0) as likes_count, COALESCE(pc.comments_count, 0) as comments_count
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id AND u.is_deleted = false
      LEFT JOIN (SELECT project_id, COUNT(*) as likes_count FROM project_likes GROUP BY project_id) pl ON p.id = pl.project_id
      LEFT JOIN (SELECT project_id, COUNT(*) as comments_count FROM comments WHERE is_deleted = false GROUP BY project_id) pc ON p.id = pc.project_id
      WHERE p.id = ? AND p.is_deleted = false`,
      [id]
    )) as any[]

    if (projects.length === 0) return null

    const project = projects[0]
    const userId = tryGetUserIdFromRequest(context.req)

    let isLiked = false
    if (userId) {
      const userLikes = (await db.query(
        'SELECT id FROM project_likes WHERE user_id = ? AND project_id = ?',
        [userId, id]
      )) as any[]
      isLiked = userLikes.length > 0
    }

      return {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        status: project.status,
        owner: formatUser(project, 'owner_'),
        likesCount: Number(project.likes_count || 0),
        commentsCount: Number(project.comments_count || 0),
        isLiked,
        createdAt: formatDateToISO(project.created_at),
        updatedAt: formatDateToISO(project.updated_at),
      }
    } catch (error: any) {
      // Provide helpful error messages for common database issues
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error(
          'Database tables not found. Please run the migration script: npm run migrate'
        )
      }
      if (error.code === 'ER_BAD_DB_ERROR') {
        throw new Error(
          `Database '${process.env.DB_NAME}' does not exist. Please run the migration script: npm run migrate`
        )
      }
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        throw new Error(
          'Database access denied. Please check your database credentials in the .env file.'
        )
      }
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        throw new Error(
          'Database connection failed. Please check your database configuration and ensure DB_SSL_REJECT_UNAUTHORIZED=false is set for FreeSQLDatabase.'
        )
      }
      if (error.code === 'ER_HOST_NOT_PRIVILEGED' || error.message?.includes('is blocked')) {
        throw new Error(
          'Database host is temporarily blocked due to too many connection errors. Please wait a few minutes and try again. The connection pool has been optimized to prevent this.'
        )
      }
      if (error.code === 'ER_NOT_SUPPORTED_AUTH_MODE' || error.message?.includes('does not support secure connection')) {
        throw new Error(
          'SSL connection error. For FreeSQLDatabase, ensure DB_SSL_REJECT_UNAUTHORIZED=false is set in your .env file.'
        )
      }
      throw error
    }
  },
}

