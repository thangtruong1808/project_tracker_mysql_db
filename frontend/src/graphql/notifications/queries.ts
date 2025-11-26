/**
 * Notifications Queries
 * GraphQL queries for notification data
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Notifications query - fetch all notifications
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications {
      id
      userId
      message
      isRead
      createdAt
      updatedAt
    }
  }
`

