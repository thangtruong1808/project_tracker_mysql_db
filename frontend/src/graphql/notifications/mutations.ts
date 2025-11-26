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

