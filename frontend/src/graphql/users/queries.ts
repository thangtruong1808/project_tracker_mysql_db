/**
 * Users Queries
 * GraphQL queries for user data
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Users query - fetch all users
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const USERS_QUERY = gql`
  query Users {
    users {
      id
      uuid
      firstName
      lastName
      email
      role
      createdAt
      updatedAt
    }
  }
`

