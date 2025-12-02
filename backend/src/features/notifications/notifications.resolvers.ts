/**
 * Notifications Feature Resolvers
 * Handles notification queries and mutations
 * CRUD operations for notifications
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { db } from '../../db'
import { formatDateToISO } from '../../utils/formatters'
import { requireAuthentication } from '../../utils/helpers'
import { pubsub } from '../../utils/pubsub'

/**
 * Notifications Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const notificationsQueryResolvers = {
  /**
   * Fetch all notifications for authenticated user
   * Requires authentication and filters by user ID
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  notifications: async (_: any, __: any, context: { req: any }) => {
    const userId = requireAuthentication(context, 'Authentication required to fetch notifications.')
    const notifications = (await db.query(
      'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )) as any[]
    return notifications.map((n: any) => ({
      id: n.id.toString(),
      userId: n.user_id.toString(),
      message: n.message,
      isRead: Boolean(n.is_read),
      createdAt: formatDateToISO(n.created_at),
      updatedAt: formatDateToISO(n.updated_at),
    }))
  },

  /**
   * Fetch single notification by ID
   * Requires authentication and verifies ownership
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  notification: async (_: any, { id }: { id: string }, context: { req: any }) => {
    const userId = requireAuthentication(context, 'Authentication required to fetch notification.')
    const notifications = (await db.query(
      'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    )) as any[]
    if (notifications.length === 0) return null
    const n = notifications[0]
    return {
      id: n.id.toString(),
      userId: n.user_id.toString(),
      message: n.message,
      isRead: Boolean(n.is_read),
      createdAt: formatDateToISO(n.created_at),
      updatedAt: formatDateToISO(n.updated_at),
    }
  },
}

/**
 * Notifications Mutation Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const notificationsMutationResolvers = {
  /**
   * Create notification mutation - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  createNotification: async (_: any, { input }: { input: any }, context: { req: any }) => {
    const authUserId = requireAuthentication(context, 'Authentication required to create notifications.')
    const { userId, message, isRead } = input
    const targetUserId = userId ? Number(userId) : authUserId
    const result = (await db.query(
      'INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)',
      [targetUserId, message, isRead || false]
    )) as any
    const notifications = (await db.query(
      'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
      [result.insertId]
    )) as any[]
    if (notifications.length === 0) throw new Error('Failed to retrieve created notification')
    const n = notifications[0]
    const payload = {
      id: n.id.toString(),
      userId: n.user_id.toString(),
      message: n.message,
      isRead: Boolean(n.is_read),
      createdAt: formatDateToISO(n.created_at),
      updatedAt: formatDateToISO(n.updated_at),
    }
    // Publish to Pusher for real-time updates
    await pubsub.publish(`NOTIFICATION_CREATED_${payload.userId}`, { notificationCreated: payload })
    return payload
  },

  /**
   * Update notification mutation - requires authentication and ownership
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  updateNotification: async (_: any, { id, input }: { id: string; input: any }, context: { req: any }) => {
    const userId = requireAuthentication(context, 'Authentication required to update notifications.')
    const updates: string[] = []
    const values: any[] = []
    if (input.message !== undefined) { updates.push('message = ?'); values.push(input.message) }
    if (input.isRead !== undefined) { updates.push('is_read = ?'); values.push(input.isRead) }
    if (updates.length === 0) throw new Error('No fields to update')
    values.push(id, userId)
    await db.query(`UPDATE notifications SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND user_id = ?`, values)
    const notifications = (await db.query(
      'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    )) as any[]
    if (notifications.length === 0) throw new Error('Notification not found or access denied')
    const n = notifications[0]
    return {
      id: n.id.toString(),
      userId: n.user_id.toString(),
      message: n.message,
      isRead: Boolean(n.is_read),
      createdAt: formatDateToISO(n.created_at),
      updatedAt: formatDateToISO(n.updated_at),
    }
  },

  /**
   * Delete notification mutation - requires authentication and ownership
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  deleteNotification: async (_: any, { id }: { id: string }, context: { req: any }) => {
    const userId = requireAuthentication(context, 'Authentication required to delete notifications.')
    const result = (await db.query('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId])) as any
    if (result.affectedRows === 0) throw new Error('Notification not found or access denied')
    return true
  },

  /**
   * Mark all notifications as read for authenticated user
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  markAllNotificationsAsRead: async (_: any, { userId }: { userId: string }, context: { req: any }) => {
    const authUserId = requireAuthentication(context, 'Authentication required.')
    const targetUserId = userId ? Number(userId) : authUserId
    if (targetUserId !== authUserId) throw new Error('You can only update your own notifications.')
    const result = (await db.query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP(3) WHERE user_id = ? AND is_read = false',
      [targetUserId]
    )) as any
    return { success: true, updatedCount: result.affectedRows || 0 }
  },

  /**
   * Mark all notifications as unread for authenticated user
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  markAllNotificationsAsUnread: async (_: any, { userId }: { userId: string }, context: { req: any }) => {
    const authUserId = requireAuthentication(context, 'Authentication required.')
    const targetUserId = userId ? Number(userId) : authUserId
    if (targetUserId !== authUserId) throw new Error('You can only update your own notifications.')
    const result = (await db.query(
      'UPDATE notifications SET is_read = false, updated_at = CURRENT_TIMESTAMP(3) WHERE user_id = ? AND is_read = true',
      [targetUserId]
    )) as any
    return { success: true, updatedCount: result.affectedRows || 0 }
  },

  /**
   * Delete all read notifications for authenticated user
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  deleteAllReadNotifications: async (_: any, { userId }: { userId: string }, context: { req: any }) => {
    const authUserId = requireAuthentication(context, 'Authentication required.')
    const targetUserId = userId ? Number(userId) : authUserId
    if (targetUserId !== authUserId) throw new Error('You can only delete your own notifications.')
    const result = (await db.query('DELETE FROM notifications WHERE user_id = ? AND is_read = true', [targetUserId])) as any
    return { success: true, updatedCount: result.affectedRows || 0 }
  },

  /**
   * Delete all unread notifications for authenticated user
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  deleteAllUnreadNotifications: async (_: any, { userId }: { userId: string }, context: { req: any }) => {
    const authUserId = requireAuthentication(context, 'Authentication required.')
    const targetUserId = userId ? Number(userId) : authUserId
    if (targetUserId !== authUserId) throw new Error('You can only delete your own notifications.')
    const result = (await db.query('DELETE FROM notifications WHERE user_id = ? AND is_read = false', [targetUserId])) as any
    return { success: true, updatedCount: result.affectedRows || 0 }
  },
}
