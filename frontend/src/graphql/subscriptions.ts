/**
 * GraphQL Subscriptions
 * Defines all GraphQL subscription operations for real-time updates
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { gql } from '@apollo/client'

/**
 * Comment created subscription
 * Real-time subscription for new comments on a project
 * Only project members (or owner) will receive updates
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const COMMENT_CREATED_SUBSCRIPTION = gql`
  subscription CommentCreated($projectId: ID!) {
    commentCreated(projectId: $projectId) {
      id
      uuid
      content
      taskId
      user {
        id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
    }
  }
`

/**
 * Comment like updated subscription
 * Broadcasts comment like/unlike events to keep UI in sync in real-time
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
export const COMMENT_LIKE_UPDATED_SUBSCRIPTION = gql`
  subscription CommentLikeUpdated($projectId: ID!) {
    commentLikeUpdated(projectId: $projectId) {
      id
      likesCount
      isLiked
      updatedAt
    }
  }
`

/**
 * Comment updated subscription
 * Real-time updates for edited comments in a project
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
export const COMMENT_UPDATED_SUBSCRIPTION = gql`
  subscription CommentUpdated($projectId: ID!) {
    commentUpdated(projectId: $projectId) {
      id
      uuid
      content
      taskId
      user {
        id
        firstName
        lastName
        email
      }
      likesCount
      isLiked
      createdAt
      updatedAt
    }
  }
`

/**
 * Comment deleted subscription
 * Notifies clients when a comment is removed so they can refresh instantly
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
export const COMMENT_DELETED_SUBSCRIPTION = gql`
  subscription CommentDeleted($projectId: ID!) {
    commentDeleted(projectId: $projectId) {
      id
      uuid
      taskId
      updatedAt
    }
  }
`

/**
 * Notification created subscription
 * Streams new notifications to subscribed users in real-time
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

