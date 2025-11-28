/**
 * Activities Feature Resolvers
 * Handles activity log queries and mutations
 * CRUD operations for activity logs
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { db } from '../../db'
import { formatDateToISO } from '../../utils/formatters'
import { requireAuthentication, resolveActivityAction } from '../../utils/helpers'

/**
 * Activities Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const activitiesQueryResolvers = {
  /**
   * Fetch all activity logs - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  activities: async (_: any, __: any, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to fetch activities.')
    const activities = (await db.query(
      `SELECT id, user_id, target_user_id, project_id, task_id, action, type, metadata, created_at, updated_at
      FROM activity_logs ORDER BY created_at DESC`
    )) as any[]

    return activities.map((a: any) => ({
      id: a.id.toString(),
      userId: a.user_id.toString(),
      targetUserId: a.target_user_id ? a.target_user_id.toString() : null,
      projectId: a.project_id ? a.project_id.toString() : null,
      taskId: a.task_id ? a.task_id.toString() : null,
      action: resolveActivityAction(a.type, a.action),
      type: a.type,
      metadata: a.metadata ? JSON.stringify(a.metadata) : null,
      createdAt: formatDateToISO(a.created_at),
      updatedAt: formatDateToISO(a.updated_at),
    }))
  },

  /**
   * Fetch single activity by ID - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  activity: async (_: any, { id }: { id: string }, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to fetch activity.')
    const activities = (await db.query(
      `SELECT id, user_id, target_user_id, project_id, task_id, action, type, metadata, created_at, updated_at
      FROM activity_logs WHERE id = ?`,
      [id]
    )) as any[]

    if (activities.length === 0) return null

    const a = activities[0]
    return {
      id: a.id.toString(),
      userId: a.user_id.toString(),
      targetUserId: a.target_user_id ? a.target_user_id.toString() : null,
      projectId: a.project_id ? a.project_id.toString() : null,
      taskId: a.task_id ? a.task_id.toString() : null,
      action: resolveActivityAction(a.type, a.action),
      type: a.type,
      metadata: a.metadata ? JSON.stringify(a.metadata) : null,
      createdAt: formatDateToISO(a.created_at),
      updatedAt: formatDateToISO(a.updated_at),
    }
  },
}

/**
 * Activities Mutation Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const activitiesMutationResolvers = {
  /**
   * Create activity mutation - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  createActivity: async (_: any, { input }: { input: any }, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to create activities.')
    const { userId, targetUserId, projectId, taskId, action, type, metadata } = input

    const result = (await db.query(
      `INSERT INTO activity_logs (user_id, target_user_id, project_id, task_id, action, type, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, targetUserId || null, projectId || null, taskId || null, action || null, type, metadata || null]
    )) as any

    const activities = (await db.query(
      'SELECT id, user_id, target_user_id, project_id, task_id, action, type, metadata, created_at, updated_at FROM activity_logs WHERE id = ?',
      [result.insertId]
    )) as any[]

    if (activities.length === 0) throw new Error('Failed to retrieve created activity')

    const a = activities[0]
    return {
      id: a.id.toString(),
      userId: a.user_id.toString(),
      targetUserId: a.target_user_id ? a.target_user_id.toString() : null,
      projectId: a.project_id ? a.project_id.toString() : null,
      taskId: a.task_id ? a.task_id.toString() : null,
      action: resolveActivityAction(a.type, a.action),
      type: a.type,
      metadata: a.metadata ? JSON.stringify(a.metadata) : null,
      createdAt: formatDateToISO(a.created_at),
      updatedAt: formatDateToISO(a.updated_at),
    }
  },

  /**
   * Update activity mutation - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  updateActivity: async (_: any, { id, input }: { id: string; input: any }, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to update activities.')
    const updates: string[] = []
    const values: any[] = []

    if (input.userId !== undefined) { updates.push('user_id = ?'); values.push(input.userId) }
    if (input.targetUserId !== undefined) { updates.push('target_user_id = ?'); values.push(input.targetUserId) }
    if (input.projectId !== undefined) { updates.push('project_id = ?'); values.push(input.projectId) }
    if (input.taskId !== undefined) { updates.push('task_id = ?'); values.push(input.taskId) }
    if (input.action !== undefined) { updates.push('action = ?'); values.push(input.action) }
    if (input.type !== undefined) { updates.push('type = ?'); values.push(input.type) }
    if (input.metadata !== undefined) { updates.push('metadata = ?'); values.push(input.metadata) }

    if (updates.length === 0) throw new Error('No fields to update')

    values.push(id)
    await db.query(
      `UPDATE activity_logs SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`,
      values
    )

    const activities = (await db.query(
      'SELECT id, user_id, target_user_id, project_id, task_id, action, type, metadata, created_at, updated_at FROM activity_logs WHERE id = ?',
      [id]
    )) as any[]

    if (activities.length === 0) throw new Error('Activity not found')

    const a = activities[0]
    return {
      id: a.id.toString(),
      userId: a.user_id.toString(),
      targetUserId: a.target_user_id ? a.target_user_id.toString() : null,
      projectId: a.project_id ? a.project_id.toString() : null,
      taskId: a.task_id ? a.task_id.toString() : null,
      action: resolveActivityAction(a.type, a.action),
      type: a.type,
      metadata: a.metadata ? JSON.stringify(a.metadata) : null,
      createdAt: formatDateToISO(a.created_at),
      updatedAt: formatDateToISO(a.updated_at),
    }
  },

  /**
   * Delete activity mutation - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  deleteActivity: async (_: any, { id }: { id: string }, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to delete activities.')
    const result = (await db.query('DELETE FROM activity_logs WHERE id = ?', [id])) as any
    if (result.affectedRows === 0) throw new Error('Activity not found')
    return true
  },
}

