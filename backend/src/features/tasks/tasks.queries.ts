/**
 * Tasks Query Resolvers
 * Handles task query operations with likes and comments count
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { db } from '../../db'
import { formatDateToISO } from '../../utils/formatters'
import { tryGetUserIdFromRequest } from '../../utils/helpers'

/**
 * Tasks Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const tasksQueryResolvers = {
  /**
   * Fetch all tasks with tags, likes count, and comments count
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  tasks: async (_: any, __: any, context: { req: any }) => {
    const userId = tryGetUserIdFromRequest(context.req)

    const tasks = (await db.query(
      `SELECT t.id, t.uuid, t.title, t.description, t.status, t.priority, t.due_date,
        t.project_id, t.assigned_to, t.created_at, t.updated_at,
        COALESCE(tl.likes_count, 0) as likes_count,
        COALESCE(tc.comments_count, 0) as comments_count
      FROM tasks t
      LEFT JOIN (SELECT task_id, COUNT(*) as likes_count FROM task_likes GROUP BY task_id) tl ON t.id = tl.task_id
      LEFT JOIN (SELECT task_id, COUNT(*) as comments_count FROM comments WHERE is_deleted = false GROUP BY task_id) tc ON t.id = tc.task_id
      WHERE t.is_deleted = false ORDER BY t.created_at DESC`
    )) as any[]

    const taskIds = tasks.map((t: any) => t.id)
    const taskTagsMap = new Map<number, any[]>()
    let userLikedTasks: Set<number> = new Set()

    if (taskIds.length > 0) {
      const placeholders = taskIds.map(() => '?').join(',')

      /** Fetch tags for all tasks */
      const taskTags = (await db.query(
        `SELECT tt.task_id, tg.id, tg.name, tg.description, tg.category
        FROM task_tags tt INNER JOIN tags tg ON tt.tag_id = tg.id
        WHERE tt.task_id IN (${placeholders})`,
        taskIds
      )) as any[]

      taskTags.forEach((tag: any) => {
        const tags = taskTagsMap.get(tag.task_id) || []
        tags.push({ id: tag.id.toString(), name: tag.name, description: tag.description, category: tag.category })
        taskTagsMap.set(tag.task_id, tags)
      })

      /** Fetch user's liked tasks if authenticated */
      if (userId) {
        const userLikes = (await db.query(
          `SELECT task_id FROM task_likes WHERE user_id = ? AND task_id IN (${placeholders})`,
          [userId, ...taskIds]
        )) as any[]
        userLikedTasks = new Set(userLikes.map((like: any) => Number(like.task_id)))
      }
    }

    return tasks.map((task: any) => ({
      id: task.id.toString(),
      uuid: task.uuid || '',
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date ? formatDateToISO(task.due_date) : null,
      projectId: task.project_id.toString(),
      assignedTo: task.assigned_to ? task.assigned_to.toString() : null,
      tags: taskTagsMap.get(task.id) || [],
      likesCount: Number(task.likes_count || 0),
      commentsCount: Number(task.comments_count || 0),
      isLiked: userId ? userLikedTasks.has(Number(task.id)) : false,
      createdAt: formatDateToISO(task.created_at),
      updatedAt: formatDateToISO(task.updated_at),
    }))
  },

  /**
   * Fetch single task by ID with likes and comments count
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  task: async (_: any, { id }: { id: string }, context: { req: any }) => {
    const userId = tryGetUserIdFromRequest(context.req)

    const tasks = (await db.query(
      `SELECT t.id, t.uuid, t.title, t.description, t.status, t.priority, t.due_date,
        t.project_id, t.assigned_to, t.created_at, t.updated_at,
        COALESCE(tl.likes_count, 0) as likes_count,
        COALESCE(tc.comments_count, 0) as comments_count
      FROM tasks t
      LEFT JOIN (SELECT task_id, COUNT(*) as likes_count FROM task_likes GROUP BY task_id) tl ON t.id = tl.task_id
      LEFT JOIN (SELECT task_id, COUNT(*) as comments_count FROM comments WHERE is_deleted = false GROUP BY task_id) tc ON t.id = tc.task_id
      WHERE t.id = ? AND t.is_deleted = false`,
      [id]
    )) as any[]

    if (tasks.length === 0) return null

    const task = tasks[0]

    /** Fetch tags for the task */
    const taskTags = (await db.query(
      `SELECT tg.id, tg.name, tg.description, tg.category
      FROM task_tags tt INNER JOIN tags tg ON tt.tag_id = tg.id WHERE tt.task_id = ?`,
      [id]
    )) as any[]

    /** Check if user has liked this task */
    let isLiked = false
    if (userId) {
      const userLike = (await db.query(
        `SELECT id FROM task_likes WHERE user_id = ? AND task_id = ?`,
        [userId, id]
      )) as any[]
      isLiked = userLike.length > 0
    }

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
      tags: taskTags.map((tag: any) => ({
        id: tag.id.toString(), name: tag.name, description: tag.description, category: tag.category
      })),
      likesCount: Number(task.likes_count || 0),
      commentsCount: Number(task.comments_count || 0),
      isLiked,
      createdAt: formatDateToISO(task.created_at),
      updatedAt: formatDateToISO(task.updated_at),
    }
  },
}
