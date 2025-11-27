/**
 * Auth Mutations
 * GraphQL mutations for authentication
 * Login, register, and token refresh operations
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Login mutation
 * Authenticates user and returns access token and user data
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        uuid
        firstName
        lastName
        email
        role
      }
    }
  }
`

/**
 * Register mutation
 * Creates a new user account and returns access token and user data
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        uuid
        firstName
        lastName
        email
        role
      }
    }
  }
`

/**
 * Refresh token mutation
 * Generates new access token using refresh token from HTTP-only cookie
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($extendSession: Boolean) {
    refreshToken(extendSession: $extendSession) {
      accessToken
    }
  }
`

/**
 * Reset password mutation
 * Updates user password by email address
 *
 * @author Thang Truong
 * @date 2025-11-27
 */
export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($email: String!, $newPassword: String!) {
    resetPassword(email: $email, newPassword: $newPassword)
  }
`

