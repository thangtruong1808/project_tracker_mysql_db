/**
 * Notifications Feature Resolvers
 * Handles notification queries and mutations
 * CRUD operations for notifications
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { db } from '../../db'
import { formatDateToISO } from '../../utils/formatters'

/**
 * Notifications Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const notificationsQueryResolvers = {
  /**
   * Fetch all notifications ordered by creation date
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  notifications: async () => {
    const notifications = (await db.query(
      'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications ORDER BY created_at DESC'
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
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  notification: async (_: any, { id }: { id: string }) => {
    const notifications = (await db.query(
      'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
      [id]
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
 * @date 2025-11-26
 */
export const notificationsMutationResolvers = {
  /**
   * Create notification mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  createNotification: async (_: any, { input }: { input: any }) => {
    const { userId, message, isRead } = input
    const result = (await db.query(
      'INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)',
      [userId, message, isRead || false]
    )) as any
    const notifications = (await db.query(
      'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
      [result.insertId]
    )) as any[]
    if (notifications.length === 0) throw new Error('Failed to retrieve created notification')
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
   * Update notification mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  updateNotification: async (_: any, { id, input }: { id: string; input: any }) => {
    const updates: string[] = []
    const values: any[] = []
    if (input.userId !== undefined) { updates.push('user_id = ?'); values.push(input.userId) }
    if (input.message !== undefined) { updates.push('message = ?'); values.push(input.message) }
    if (input.isRead !== undefined) { updates.push('is_read = ?'); values.push(input.isRead) }
    if (updates.length === 0) throw new Error('No fields to update')
    values.push(id)
    await db.query(`UPDATE notifications SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?`, values)
    const notifications = (await db.query(
      'SELECT id, user_id, message, is_read, created_at, updated_at FROM notifications WHERE id = ?',
      [id]
    )) as any[]
    if (notifications.length === 0) throw new Error('Notification not found')
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
   * Delete notification mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  deleteNotification: async (_: any, { id }: { id: string }) => {
    const result = (await db.query('DELETE FROM notifications WHERE id = ?', [id])) as any
    if (result.affectedRows === 0) throw new Error('Notification not found')
    return true
  },

  /**
   * Mark all notifications as read for a specific user
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  markAllNotificationsAsRead: async (_: any, { userId }: { userId: string }) => {
    const result = (await db.query(
      'UPDATE notifications SET is_read = true, updated_at = CURRENT_TIMESTAMP(3) WHERE user_id = ? AND is_read = false',
      [userId]
    )) as any
    return { success: true, updatedCount: result.affectedRows || 0 }
  },

  /**
   * Mark all notifications as unread for a specific user
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  markAllNotificationsAsUnread: async (_: any, { userId }: { userId: string }) => {
    const result = (await db.query(
      'UPDATE notifications SET is_read = false, updated_at = CURRENT_TIMESTAMP(3) WHERE user_id = ? AND is_read = true',
      [userId]
    )) as any
    return { success: true, updatedCount: result.affectedRows || 0 }
  },

  /**
   * Delete all read notifications for a specific user
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  deleteAllReadNotifications: async (_: any, { userId }: { userId: string }) => {
    const result = (await db.query('DELETE FROM notifications WHERE user_id = ? AND is_read = true', [userId])) as any
    return { success: true, updatedCount: result.affectedRows || 0 }
  },

  /**
   * Delete all unread notifications for a specific user
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  deleteAllUnreadNotifications: async (_: any, { userId }: { userId: string }) => {
    const result = (await db.query('DELETE FROM notifications WHERE user_id = ? AND is_read = false', [userId])) as any
    return { success: true, updatedCount: result.affectedRows || 0 }
  },
}
