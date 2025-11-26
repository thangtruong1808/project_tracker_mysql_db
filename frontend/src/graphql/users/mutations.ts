/**
 * Users Mutations
 * GraphQL mutations for user management
 * CRUD operations for users
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Create user mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
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

/**
 * Update user mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
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

/**
 * Delete user mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`

