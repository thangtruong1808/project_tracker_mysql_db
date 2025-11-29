/**
 * Projects Mutation Resolvers
 * Handles project mutation operations
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { db } from '../../db'
import { verifyAccessToken } from '../../utils/auth'
import { formatDateToISO, formatUser } from '../../utils/formatters'
import { tryGetUserIdFromRequest, getUserDisplayName, notifyProjectParticipants } from '../../utils/helpers'

/**
 * Projects Mutation Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const projectsMutationResolvers = {
  /**
   * Create project mutation - saves owner_id from authenticated user
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  createProject: async (_: any, { input }: { input: any }, context: { req: any }) => {
    const { name, description, status } = input
    const ownerId = tryGetUserIdFromRequest(context.req)

    const result = (await db.query(
      'INSERT INTO projects (name, description, status, owner_id) VALUES (?, ?, ?, ?)',
      [name, description || null, status, ownerId]
    )) as any

    const projects = (await db.query(
      `SELECT p.id, p.name, p.description, p.status, p.owner_id, p.created_at, p.updated_at,
        u.id as owner_user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
        u.email as owner_email, u.role as owner_role, u.uuid as owner_uuid,
        u.created_at as owner_created_at, u.updated_at as owner_updated_at
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id AND u.is_deleted = false
      WHERE p.id = ?`,
      [result.insertId]
    )) as any[]

    if (projects.length === 0) throw new Error('Failed to retrieve created project')

    const project = projects[0]
    return {
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      owner: formatUser(project, 'owner_'),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      createdAt: formatDateToISO(project.created_at),
      updatedAt: formatDateToISO(project.updated_at),
    }
  },

  /**
   * Update project mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  updateProject: async (_: any, { id, input }: { id: string; input: any }, context: { req: any }) => {
    const actorUserId = tryGetUserIdFromRequest(context.req)
    const updates: string[] = []
    const values: any[] = []

    if (input.name !== undefined) { updates.push('name = ?'); values.push(input.name) }
    if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description) }
    if (input.status !== undefined) { updates.push('status = ?'); values.push(input.status) }

    if (updates.length === 0) throw new Error('No fields to update')

    values.push(id)
    await db.query(
      `UPDATE projects SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false`,
      values
    )

    const projects = (await db.query(
      'SELECT id, name, description, status, created_at, updated_at FROM projects WHERE id = ? AND is_deleted = false',
      [id]
    )) as any[]

    if (projects.length === 0) throw new Error('Project not found')

    const project = projects[0]
    if (actorUserId) {
      const actorName = await getUserDisplayName(actorUserId)
      await notifyProjectParticipants({
        projectId: Number(project.id),
        actorUserId,
        message: `${actorName} updated project "${project.name}".`,
      })
    }

    return {
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: formatDateToISO(project.created_at),
      updatedAt: formatDateToISO(project.updated_at),
    }
  },

  /**
   * Delete project mutation (soft delete)
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  deleteProject: async (_: any, { id }: { id: string }, context: { req: any }) => {
    const actorUserId = tryGetUserIdFromRequest(context.req)
    if (!actorUserId) throw new Error('Authentication required. Please login to delete projects.')

    const projectTasks = (await db.query(
      'SELECT id FROM tasks WHERE project_id = ? AND is_deleted = false',
      [id]
    )) as any[]
    const taskIds = projectTasks.map((t: any) => t.id)

    if (taskIds.length > 0) {
      const taskPlaceholders = taskIds.map(() => '?').join(',')
      await db.query(`DELETE FROM task_tags WHERE task_id IN (${taskPlaceholders})`, taskIds)
      await db.query(`DELETE FROM task_likes WHERE task_id IN (${taskPlaceholders})`, taskIds)

      // Comments are now project-level, so delete comments directly by project_id
      const projectComments = (await db.query(
        `SELECT id FROM comments WHERE project_id = ? AND is_deleted = false`,
        [id]
      )) as any[]
      const commentIds = projectComments.map((c: any) => c.id)

      if (commentIds.length > 0) {
        const commentPlaceholders = commentIds.map(() => '?').join(',')
        await db.query(`DELETE FROM comment_likes WHERE comment_id IN (${commentPlaceholders})`, commentIds)
      }
    }

    await db.query('DELETE FROM project_likes WHERE project_id = ?', [id])

    const result = (await db.query(
      'UPDATE projects SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false',
      [id]
    )) as any

    if (result.affectedRows === 0) throw new Error('Project not found or already deleted')
    return true
  },

  /**
   * Like project mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  likeProject: async (_: any, { projectId }: { projectId: string }, context: { req: any }) => {
    const authHeader = context.req?.headers?.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new Error('Authentication required. Please login to like projects.')

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId)
      throw new Error('Invalid or expired token. Please login again.')

    const userId = decoded.userId

    const projects = (await db.query(
      'SELECT id, name FROM projects WHERE id = ? AND is_deleted = false',
      [projectId]
    )) as any[]
    if (projects.length === 0) throw new Error('Project not found or has been deleted')

    const existingLikes = (await db.query(
      'SELECT id FROM project_likes WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    )) as any[]

    if (existingLikes.length > 0) {
      await db.query('DELETE FROM project_likes WHERE user_id = ? AND project_id = ?', [userId, projectId])
      const likesCountResult = (await db.query(
        'SELECT COUNT(*) as count FROM project_likes WHERE project_id = ?',
        [projectId]
      )) as any[]
      return { success: true, message: 'Project unliked successfully', likesCount: Number(likesCountResult[0]?.count || 0), isLiked: false }
    }

    await db.query('INSERT INTO project_likes (user_id, project_id) VALUES (?, ?)', [userId, projectId])
    const likesCountResult = (await db.query(
      'SELECT COUNT(*) as count FROM project_likes WHERE project_id = ?',
      [projectId]
    )) as any[]

    const actorName = await getUserDisplayName(userId)
    await notifyProjectParticipants({
      projectId: Number(projectId),
      actorUserId: userId,
      message: `${actorName} liked project "${projects[0].name}".`,
    })

    return { success: true, message: 'Project liked successfully', likesCount: Number(likesCountResult[0]?.count || 0), isLiked: true }
  },
}

