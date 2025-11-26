/**
 * Notifications Subscriptions
 * GraphQL subscriptions for real-time notification updates
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Notification created subscription
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const NOTIFICATION_CREATED_SUBSCRIPTION = gql`
  subscription NotificationCreated($userId: ID!) {
    notificationCreated(userId: $userId) {
      id
      userId
      message
      isRead
      createdAt
      updatedAt
    }
  }
`

