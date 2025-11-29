/**
 * Type Resolvers
 * Resolves nested fields for GraphQL types
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { db } from '../../db'
import { formatDateToISO, mapTeamMemberRecord } from '../../utils/formatters'
import { tryGetUserIdFromRequest } from '../../utils/helpers'

/**
 * Task type resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const taskTypeResolvers = {
  tags: async (parent: { id: string }) => {
    try {
      const taskId = Number(parent.id)
      const tags = (await db.query(
        `SELECT t.id, t.name, t.description, t.title, t.type, t.category, t.created_at, t.updated_at
        FROM tags t INNER JOIN task_tags tt ON t.id = tt.tag_id WHERE tt.task_id = ? ORDER BY t.name ASC`,
        [taskId]
      )) as any[]

      return tags.map((tag: any) => ({
        id: tag.id.toString(),
        name: tag.name,
        description: tag.description || null,
        title: tag.title || null,
        type: tag.type || null,
        category: tag.category || null,
        createdAt: formatDateToISO(tag.created_at),
        updatedAt: formatDateToISO(tag.updated_at),
      }))
    } catch {
      return []
    }
  },
}

/**
 * Project type resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const projectTypeResolvers = {
  tasks: async (parent: { id: string }, _: any, context: { req: any }) => {
    try {
      const projectId = Number(parent.id)
      const userId = tryGetUserIdFromRequest(context.req)

      const tasks = (await db.query(
        `SELECT t.id, t.uuid, t.title, t.description, t.status, t.priority, t.due_date,
          t.project_id, t.assigned_to, t.created_at, t.updated_at,
          u.id as owner_user_id, u.first_name as owner_first_name, u.last_name as owner_last_name,
          u.email as owner_email, u.role as owner_role, u.uuid as owner_uuid,
          u.created_at as owner_created_at, u.updated_at as owner_updated_at,
          COALESCE(tl.likes_count, 0) as likes_count,
          0 as comments_count
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id AND u.is_deleted = false
        LEFT JOIN (SELECT task_id, COUNT(*) as likes_count FROM task_likes GROUP BY task_id) tl ON t.id = tl.task_id
        WHERE t.project_id = ? AND t.is_deleted = false ORDER BY t.created_at DESC`,
        [projectId]
      )) as any[]

      let userLikedTasks: Set<number> = new Set()
      if (userId && tasks.length > 0) {
        const taskIds = tasks.map((t: any) => t.id)
        const placeholders = taskIds.map(() => '?').join(',')
        const userLikes = (await db.query(
          `SELECT task_id FROM task_likes WHERE user_id = ? AND task_id IN (${placeholders})`,
          [userId, ...taskIds]
        )) as any[]
        userLikedTasks = new Set(userLikes.map((like: any) => Number(like.task_id)))
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
        owner: task.owner_user_id ? {
          id: task.owner_user_id.toString(), uuid: task.owner_uuid || '',
          firstName: task.owner_first_name || '', lastName: task.owner_last_name || '',
          email: task.owner_email || '', role: task.owner_role || '',
          createdAt: formatDateToISO(task.owner_created_at), updatedAt: formatDateToISO(task.owner_updated_at),
        } : null,
        likesCount: Number(task.likes_count || 0),
        commentsCount: Number(task.comments_count || 0),
        isLiked: userId ? userLikedTasks.has(Number(task.id)) : false,
        createdAt: formatDateToISO(task.created_at),
        updatedAt: formatDateToISO(task.updated_at),
      }))
    } catch {
      return []
    }
  },

  members: async (parent: { id: string }) => {
    try {
      const projectId = Number(parent.id)
      const members = (await db.query(
        `SELECT pm.project_id, pm.user_id, pm.role, pm.created_at, pm.updated_at,
          p.name AS project_name, u.first_name, u.last_name, u.email
        FROM project_members pm
        INNER JOIN projects p ON p.id = pm.project_id
        INNER JOIN users u ON u.id = pm.user_id AND u.is_deleted = false
        WHERE pm.project_id = ? AND pm.is_deleted = false`,
        [projectId]
      )) as any[]

      return members.map((member: any) => mapTeamMemberRecord(member))
    } catch {
      return []
    }
  },

  comments: async (parent: { id: string }, _: any, context: { req: any }) => {
    try {
      const projectId = Number(parent.id)
      const userId = tryGetUserIdFromRequest(context.req)

      const comments = (await db.query(
        `SELECT c.id, c.uuid, c.content, c.project_id, c.created_at, c.updated_at,
          u.id as user_id, u.first_name, u.last_name, u.email, u.role, u.uuid as user_uuid,
          u.created_at as user_created_at, u.updated_at as user_updated_at,
          COALESCE(cl.likes_count, 0) as likes_count
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false
        LEFT JOIN (SELECT comment_id, COUNT(*) as likes_count FROM comment_likes GROUP BY comment_id) cl ON c.id = cl.comment_id
        WHERE c.project_id = ? AND c.is_deleted = false ORDER BY c.created_at DESC`,
        [projectId]
      )) as any[]

      let userLikedComments: Set<number> = new Set()
      if (userId && comments.length > 0) {
        const commentIds = comments.map((c: any) => c.id)
        const placeholders = commentIds.map(() => '?').join(',')
        const userLikes = (await db.query(
          `SELECT comment_id FROM comment_likes WHERE user_id = ? AND comment_id IN (${placeholders})`,
          [userId, ...commentIds]
        )) as any[]
        userLikedComments = new Set(userLikes.map((like: any) => Number(like.comment_id)))
      }

      return comments.map((c: any) => ({
        id: c.id.toString(),
        uuid: c.uuid || '',
        content: c.content,
        projectId: c.project_id ? c.project_id.toString() : null,
        user: c.user_id ? {
          id: c.user_id.toString(), uuid: c.user_uuid || '', firstName: c.first_name || '',
          lastName: c.last_name || '', email: c.email || '', role: c.role || '',
          createdAt: formatDateToISO(c.user_created_at), updatedAt: formatDateToISO(c.user_updated_at),
        } : null,
        likesCount: Number(c.likes_count || 0),
        isLiked: userId ? userLikedComments.has(Number(c.id)) : false,
        createdAt: formatDateToISO(c.created_at),
        updatedAt: formatDateToISO(c.updated_at),
      }))
    } catch {
      return []
    }
  },
}

