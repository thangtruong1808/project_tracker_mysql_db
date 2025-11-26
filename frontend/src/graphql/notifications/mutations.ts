/**
 * Notifications Mutations
 * GraphQL mutations for notification management
 * CRUD operations for notifications
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Create notification mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const CREATE_NOTIFICATION_MUTATION = gql`
  mutation CreateNotification($input: CreateNotificationInput!) {
    createNotification(input: $input) {
      id
      userId
      message
      isRead
      createdAt
      updatedAt
    }
  }
`

/**
 * Update notification mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const UPDATE_NOTIFICATION_MUTATION = gql`
  mutation UpdateNotification($id: ID!, $input: UpdateNotificationInput!) {
    updateNotification(id: $id, input: $input) {
      id
      userId
      message
      isRead
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete notification mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`

/**
 * Mark all notifications as read for a user
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead($userId: ID!) {
    markAllNotificationsAsRead(userId: $userId) {
      success
      updatedCount
    }
  }
`

/**
 * Mark all notifications as unread for a user
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const MARK_ALL_NOTIFICATIONS_UNREAD_MUTATION = gql`
  mutation MarkAllNotificationsAsUnread($userId: ID!) {
    markAllNotificationsAsUnread(userId: $userId) {
      success
      updatedCount
    }
  }
`

/**
 * Delete all read notifications for a user
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_ALL_READ_NOTIFICATIONS_MUTATION = gql`
  mutation DeleteAllReadNotifications($userId: ID!) {
    deleteAllReadNotifications(userId: $userId) {
      success
      updatedCount
    }
  }
`

/**
 * Delete all unread notifications for a user
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_ALL_UNREAD_NOTIFICATIONS_MUTATION = gql`
  mutation DeleteAllUnreadNotifications($userId: ID!) {
    deleteAllUnreadNotifications(userId: $userId) {
      success
      updatedCount
    }
  }
`
