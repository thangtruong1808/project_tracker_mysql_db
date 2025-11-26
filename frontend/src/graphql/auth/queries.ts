/**
 * Auth Queries
 * GraphQL queries for authentication
 * Token status and validation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Refresh token status query
 * Checks refresh token expiration status from HTTP-only cookie
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const REFRESH_TOKEN_STATUS_QUERY = gql`
  query RefreshTokenStatus {
    refreshTokenStatus {
      isValid
      timeRemaining
      isAboutToExpire
    }
  }
`

