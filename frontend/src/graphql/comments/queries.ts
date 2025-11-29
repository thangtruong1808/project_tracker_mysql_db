/**
 * Comments Queries
 * GraphQL queries for comment data
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { gql } from '@apollo/client'

/**
 * Comments query - fetch all comments
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const COMMENTS_QUERY = gql`
  query Comments {
    comments {
      id
      uuid
      content
      projectId
      user {
        id
        firstName
        lastName
        email
        role
      }
      likesCount
      isLiked
      createdAt
      updatedAt
    }
  }
`

