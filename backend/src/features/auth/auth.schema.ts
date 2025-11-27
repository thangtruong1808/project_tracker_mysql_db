/**
 * Auth Feature Schema
 * GraphQL type definitions for authentication
 * Includes login, register, and token refresh types
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const authTypeDefs = `
  type LoginResponse {
    accessToken: String!
    user: User!
  }

  type RefreshTokenResponse {
    accessToken: String!
  }

  type RefreshTokenStatus {
    isValid: Boolean!
    timeRemaining: Int
    isAboutToExpire: Boolean!
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }
`

export const authQueryDefs = `
  refreshTokenStatus: RefreshTokenStatus
`

export const authMutationDefs = `
  login(email: String!, password: String!): LoginResponse!
  register(input: RegisterInput!): LoginResponse!
  refreshToken(extendSession: Boolean): RefreshTokenResponse!
  resetPassword(email: String!, newPassword: String!): Boolean!
`

