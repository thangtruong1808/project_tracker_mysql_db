/**
 * Comments Subscriptions
 * GraphQL subscriptions for real-time comment updates
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { gql } from '@apollo/client'

/**
 * Comment created subscription
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const COMMENT_CREATED_SUBSCRIPTION = gql`
  subscription CommentCreated($projectId: ID!) {
    commentCreated(projectId: $projectId) {
      id
      uuid
      content
      projectId
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
 * Comment like updated subscription
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const COMMENT_LIKE_UPDATED_SUBSCRIPTION = gql`
  subscription CommentLikeUpdated($projectId: ID!) {
    commentLikeUpdated(projectId: $projectId) {
      id
      uuid
      content
      projectId
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
 * Comment updated subscription
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const COMMENT_UPDATED_SUBSCRIPTION = gql`
  subscription CommentUpdated($projectId: ID!) {
    commentUpdated(projectId: $projectId) {
      id
      uuid
      content
      projectId
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
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const COMMENT_DELETED_SUBSCRIPTION = gql`
  subscription CommentDeleted($projectId: ID!) {
    commentDeleted(projectId: $projectId) {
      id
      uuid
      content
      projectId
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

