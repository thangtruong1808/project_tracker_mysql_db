/**
 * Notifications Feature Schema
 * GraphQL type definitions for notifications
 * Includes notification types and CRUD inputs
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const notificationsTypeDefs = `
  type Notification {
    id: ID!
    userId: String!
    message: String!
    isRead: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateNotificationInput {
    userId: String!
    message: String!
    isRead: Boolean
  }

  input UpdateNotificationInput {
    userId: String
    message: String
    isRead: Boolean
  }

  type BulkUpdateResult {
    success: Boolean!
    updatedCount: Int!
  }
`

export const notificationsQueryDefs = `
  notifications: [Notification!]!
  notification(id: ID!): Notification
`

export const notificationsMutationDefs = `
  createNotification(input: CreateNotificationInput!): Notification!
  updateNotification(id: ID!, input: UpdateNotificationInput!): Notification!
  deleteNotification(id: ID!): Boolean!
  markAllNotificationsAsRead(userId: ID!): BulkUpdateResult!
  markAllNotificationsAsUnread(userId: ID!): BulkUpdateResult!
  deleteAllReadNotifications(userId: ID!): BulkUpdateResult!
  deleteAllUnreadNotifications(userId: ID!): BulkUpdateResult!
`

export const notificationsSubscriptionDefs = `
  notificationCreated(userId: ID!): Notification!
`
