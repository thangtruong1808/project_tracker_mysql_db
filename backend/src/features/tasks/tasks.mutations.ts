/**
 * Tasks Mutation Resolvers
 * Handles task mutation operations
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { db } from '../../db'
import { verifyAccessToken } from '../../utils/auth'
import { formatDateToISO } from '../../utils/formatters'
import { getUserDisplayName, notifyProjectParticipants } from '../../utils/helpers'
import { randomUUID } from 'crypto'

/**
 * Tasks Mutation Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const tasksMutationResolvers = {
  /**
   * Create task mutation
   * Generates UUID server-side to avoid database defaults causing duplicates
   *
   * @author Thang Truong
   * @date 2025-12-09
   */
  createTask: async (_: any, { input }: { input: any }) => {
    const { title, description, status, priority, dueDate, projectId, assignedTo, tagIds } = input
    const taskUuid = randomUUID()

    const result = (await db.query(
      'INSERT INTO tasks (uuid, title, description, status, priority, due_date, project_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [taskUuid, title, description, status, priority, dueDate || null, projectId, assignedTo || null]
    )) as any

    const taskId = result.insertId

    if (tagIds && tagIds.length > 0) {
      const tagValues = tagIds.map((tagId: string) => [taskId, tagId])
      await db.query(
        `INSERT INTO task_tags (task_id, tag_id) VALUES ${tagValues.map(() => '(?, ?)').join(', ')}`,
        tagValues.flat()
      )
    }

    const tasks = (await db.query(
      'SELECT id, uuid, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at FROM tasks WHERE id = ?',
      [taskId]
    )) as any[]

    if (tasks.length === 0) throw new Error('Failed to retrieve created task')

    const task = tasks[0]
    const taskTags = (await db.query(
      'SELECT tg.id, tg.name, tg.description, tg.category FROM task_tags tt INNER JOIN tags tg ON tt.tag_id = tg.id WHERE tt.task_id = ?',
      [taskId]
    )) as any[]

    return {
      id: task.id.toString(),
      uuid: task.uuid || '',
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date ? formatDateToISO(task.due_date) : null,
      projectId: task.project_id.toString(),
      assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
      tags: taskTags.map((t: any) => ({ id: t.id.toString(), name: t.name, description: t.description, category: t.category })),
      createdAt: formatDateToISO(task.created_at),
      updatedAt: formatDateToISO(task.updated_at),
    }
  },

  /**
   * Update task mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  updateTask: async (_: any, { id, input }: { id: string; input: any }) => {
    const updates: string[] = []
    const values: any[] = []

    if (input.title !== undefined) { updates.push('title = ?'); values.push(input.title) }
    if (input.description !== undefined) { updates.push('description = ?'); values.push(input.description) }
    if (input.status !== undefined) { updates.push('status = ?'); values.push(input.status) }
    if (input.priority !== undefined) { updates.push('priority = ?'); values.push(input.priority) }
    if (input.dueDate !== undefined) { updates.push('due_date = ?'); values.push(input.dueDate) }
    if (input.projectId !== undefined) { updates.push('project_id = ?'); values.push(input.projectId) }
    if (input.assignedTo !== undefined) { updates.push('assigned_to = ?'); values.push(input.assignedTo || null) }

    if (updates.length > 0) {
      values.push(id)
      await db.query(
        `UPDATE tasks SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false`,
        values
      )
    }

    if (input.tagIds !== undefined) {
      await db.query('DELETE FROM task_tags WHERE task_id = ?', [id])
      if (input.tagIds.length > 0) {
        const tagValues = input.tagIds.map((tagId: string) => [id, tagId])
        await db.query(
          `INSERT INTO task_tags (task_id, tag_id) VALUES ${tagValues.map(() => '(?, ?)').join(', ')}`,
          tagValues.flat()
        )
      }
    }

    const tasks = (await db.query(
      'SELECT id, uuid, title, description, status, priority, due_date, project_id, assigned_to, created_at, updated_at FROM tasks WHERE id = ? AND is_deleted = false',
      [id]
    )) as any[]

    if (tasks.length === 0) throw new Error('Task not found')

    const task = tasks[0]
    const taskTags = (await db.query(
      'SELECT tg.id, tg.name, tg.description, tg.category FROM task_tags tt INNER JOIN tags tg ON tt.tag_id = tg.id WHERE tt.task_id = ?',
      [id]
    )) as any[]

    return {
      id: task.id.toString(),
      uuid: task.uuid || '',
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date ? formatDateToISO(task.due_date) : null,
      projectId: task.project_id.toString(),
      assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
      tags: taskTags.map((t: any) => ({ id: t.id.toString(), name: t.name, description: t.description, category: t.category })),
      createdAt: formatDateToISO(task.created_at),
      updatedAt: formatDateToISO(task.updated_at),
    }
  },

  /**
   * Delete task mutation (soft delete)
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  deleteTask: async (_: any, { id }: { id: string }) => {
    await db.query('DELETE FROM task_tags WHERE task_id = ?', [id])
    await db.query('DELETE FROM task_likes WHERE task_id = ?', [id])

    // Comments are now project-level, not task-level, so no need to delete comments when deleting a task

    const result = (await db.query(
      'UPDATE tasks SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND is_deleted = false',
      [id]
    )) as any

    if (result.affectedRows === 0) throw new Error('Task not found or already deleted')
    return true
  },

  /**
   * Like task mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  likeTask: async (_: any, { taskId }: { taskId: string }, context: { req: any }) => {
    const authHeader = context.req?.headers?.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new Error('Authentication required. Please login to like tasks.')

    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId)
      throw new Error('Invalid or expired token. Please login again.')

    const userId = decoded.userId

    const tasks = (await db.query(
      `SELECT t.id, t.title, t.project_id, p.name as project_name, p.owner_id FROM tasks t
      INNER JOIN projects p ON t.project_id = p.id AND p.is_deleted = false
      WHERE t.id = ? AND t.is_deleted = false`,
      [taskId]
    )) as any[]

    if (tasks.length === 0) throw new Error('Task not found or has been deleted')
    const task = tasks[0]
    const projectName = task.project_name || 'Unnamed Project'

    const existingLikes = (await db.query('SELECT id FROM task_likes WHERE user_id = ? AND task_id = ?', [userId, taskId])) as any[]

    if (existingLikes.length > 0) {
      await db.query('DELETE FROM task_likes WHERE user_id = ? AND task_id = ?', [userId, taskId])
      const likesCountResult = (await db.query('SELECT COUNT(*) as count FROM task_likes WHERE task_id = ?', [taskId])) as any[]
      return { success: true, message: 'Task unliked successfully', likesCount: Number(likesCountResult[0]?.count || 0), isLiked: false }
    }

    await db.query('INSERT INTO task_likes (user_id, task_id) VALUES (?, ?)', [userId, taskId])
    const likesCountResult = (await db.query('SELECT COUNT(*) as count FROM task_likes WHERE task_id = ?', [taskId])) as any[]

    const actorName = await getUserDisplayName(userId)
    await notifyProjectParticipants({
      projectId: Number(task.project_id),
      actorUserId: userId,
      message: `${actorName} liked task "${task.title}" in project "${projectName}".`,
    })

    return { success: true, message: 'Task liked successfully', likesCount: Number(likesCountResult[0]?.count || 0), isLiked: true }
  },
}

