/**
 * Shared Helpers Utility - Common helper functions used across all resolvers
 * @author Thang Truong
 * @date 2025-12-09
 */

import { db } from '../db'
import { verifyAccessToken } from './auth'
import { pubsub } from './pubsub'
import { formatDateToISO } from './formatters'

const userNameCache = new Map<number, string>()

/**
 * Try to extract user ID from request authorization header
 * @author Thang Truong
 * @date 2025-11-26
 */
export const tryGetUserIdFromRequest = (req: any): number | null => {
  try {
    const authHeader = req?.headers?.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null
    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)
    return decoded?.userId ? Number(decoded.userId) : null
  } catch {
    return null
  }
}

/**
 * Get authenticated user ID from context, throws if not authenticated
 * @author Thang Truong
 * @date 2025-11-26
 */
export const requireAuthentication = (context: { req: any }, errorMessage?: string): number => {
  const userId = tryGetUserIdFromRequest(context.req)
  if (!userId) throw new Error(errorMessage || 'Authentication required. Please login.')
  return userId
}

/**
 * Get user display name from cache or database
 * @author Thang Truong
 * @date 2025-11-26
 */
export const getUserDisplayName = async (userId: number): Promise<string> => {
  if (userNameCache.has(userId)) return userNameCache.get(userId) as string
  const users = (await db.query('SELECT first_name, last_name FROM users WHERE id = ?', [userId])) as any[]
  const displayName = users.length
    ? `${users[0].first_name || ''} ${users[0].last_name || ''}`.trim() || 'A team member'
    : 'A team member'
  userNameCache.set(userId, displayName)
  return displayName
}

/**
 * Create a notification record and publish to subscription
 * @author Thang Truong
 * @date 2025-11-26
 */
export const createNotificationRecord = async (userId: number, message: string, isRead = false) => {
  const result = (await db.query(
    'INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)',
    [userId, message, isRead]
  )) as any
  const notifications = (await db.query(
    'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
    [result.insertId]
  )) as any[]
  if (notifications.length === 0) throw new Error('Failed to retrieve created notification')
  const notification = notifications[0]
  const payload = {
    id: notification.id.toString(),
    userId: notification.user_id.toString(),
    message: notification.message,
    isRead: Boolean(notification.is_read),
    createdAt: formatDateToISO(notification.created_at),
    updatedAt: formatDateToISO(notification.updated_at),
  }
  await pubsub.publish(`NOTIFICATION_CREATED_${payload.userId}`, { notificationCreated: payload })
  return payload
}

/**
 * Notify all project participants except the actor
 * @author Thang Truong
 * @date 2025-11-26
 */
export const notifyProjectParticipants = async ({
  projectId, actorUserId, message,
}: { projectId: number | string; actorUserId?: number | null; message: string }) => {
  const projectIdNumber = Number(projectId)
  if (Number.isNaN(projectIdNumber)) return
  const projects = (await db.query(
    'SELECT owner_id FROM projects WHERE id = ? AND is_deleted = false', [projectIdNumber]
  )) as any[]
  if (projects.length === 0) return
  const ownerId = projects[0].owner_id ? Number(projects[0].owner_id) : null
  const members = (await db.query(
    'SELECT user_id FROM project_members WHERE project_id = ? AND is_deleted = false', [projectIdNumber]
  )) as any[]
  const recipientIds = new Set<number>()
  if (ownerId) recipientIds.add(ownerId)
  members.forEach((member: any) => { if (member.user_id) recipientIds.add(Number(member.user_id)) })
  if (actorUserId) recipientIds.delete(Number(actorUserId))
  if (recipientIds.size === 0) return
  await Promise.all([...recipientIds].map((recipientId) => createNotificationRecord(recipientId, message)))
}

/**
 * Build SQL status filter clause
 * @author Thang Truong
 * @date 2025-11-26
 */
export const buildStatusFilterClause = (column: string, statuses: string[], values: any[]): string => {
  if (!statuses || statuses.length === 0) return ''
  const placeholders = statuses.map(() => '?').join(', ')
  values.push(...statuses)
  return ` AND ${column} IN (${placeholders})`
}

/**
 * Clamp page size to valid range (default: 12, max: 50)
 * @author Thang Truong
 * @date 2025-11-26
 */
export const clampPageSize = (value?: number | null): number => {
  if (!value || value <= 0) return 12
  return Math.min(value, 50)
}

/**
 * Clamp page number to minimum of 1
 * @author Thang Truong
 * @date 2025-11-26
 */
export const clampPageNumber = (value?: number | null): number => (!value || value <= 0) ? 1 : value

/**
 * Apply search filters to SQL query
 * @author Thang Truong
 * @date 2025-11-26
 */
export const applySearchFilters = (
  baseSql: string, searchTerm: string, statuses: string[], values: any[], textColumns: string[]
): string => {
  let sql = baseSql
  if (searchTerm && textColumns.length > 0) {
    const likeClause = textColumns.map((column) => `${column} LIKE ?`).join(' OR ')
    sql += ` AND (${likeClause})`
    const likeTerm = `%${searchTerm}%`
    textColumns.forEach(() => values.push(likeTerm))
  }
  sql += buildStatusFilterClause('status', statuses, values)
  return sql
}

/**
 * Resolve activity action label from type
 * @author Thang Truong
 * @date 2025-11-26
 */
export const resolveActivityAction = (type: string, customAction?: string | null): string => {
  if (customAction && customAction.trim()) return customAction.trim()
  const actionLabels: Record<string, string> = {
    USER_CREATED: 'User created', USER_UPDATED: 'User updated', USER_DELETED: 'User deleted',
    PROJECT_CREATED: 'Project created', PROJECT_UPDATED: 'Project updated', PROJECT_DELETED: 'Project deleted',
    TASK_CREATED: 'Task created', TASK_UPDATED: 'Task updated', TASK_DELETED: 'Task deleted',
  }
  return actionLabels[type] || 'Activity recorded'
}
