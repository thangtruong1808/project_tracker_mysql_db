/**
 * Auth Query Resolvers
 * Handles authentication query operations
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS } from '../../constants/auth'
import { db } from '../../db'
import { hashRefreshToken } from '../../utils/auth'

/**
 * Auth Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const authQueryResolvers = {
  /**
   * Check refresh token status from HTTP-only cookie
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  refreshTokenStatus: async (_: any, __: any, context: { req: any }) => {
    try {
      const refreshToken = context.req?.cookies?.refreshToken
      if (!refreshToken) {
        return { isValid: false, timeRemaining: null, isAboutToExpire: false }
      }

      const tokenHash = hashRefreshToken(refreshToken)
      const tokens = (await db.query(
        'SELECT expires_at FROM refresh_tokens WHERE token_hash = ? AND is_revoked = false',
        [tokenHash]
      )) as any[]

      if (tokens.length === 0) {
        return { isValid: false, timeRemaining: null, isAboutToExpire: false }
      }

      const expiresAt = new Date(tokens[0].expires_at)
      const now = new Date()
      const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))

      if (timeRemaining <= 0) {
        return { isValid: false, timeRemaining: 0, isAboutToExpire: false }
      }

      const dialogThreshold = REFRESH_TOKEN_DIALOG_THRESHOLD_SECONDS
      const isAboutToExpire = timeRemaining <= dialogThreshold && timeRemaining > 0

      return {
        isValid: true,
        timeRemaining,
        isAboutToExpire,
      }
    } catch {
      return { isValid: false, timeRemaining: null, isAboutToExpire: false }
    }
  },
}

