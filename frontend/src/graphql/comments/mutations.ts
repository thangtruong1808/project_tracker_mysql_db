/**
 * Comments Mutations
 * GraphQL mutations for comment management
 * CRUD and like operations for comments
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Create comment mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($projectId: ID!, $content: String!) {
    createComment(projectId: $projectId, content: $content) {
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
 * Update comment mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($commentId: ID!, $content: String!) {
    updateComment(commentId: $commentId, content: $content) {
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
 * Delete comment mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId)
  }
`

/**
 * Like comment mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const LIKE_COMMENT_MUTATION = gql`
  mutation LikeComment($commentId: ID!) {
    likeComment(commentId: $commentId) {
      success
      message
      likesCount
      isLiked
    }
  }
`

