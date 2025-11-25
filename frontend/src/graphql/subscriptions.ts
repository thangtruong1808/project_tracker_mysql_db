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

