/**
 * Comments Feature Resolvers - Handles comment queries, mutations and subscriptions
 * @author Thang Truong
 * @date 2025-12-09
 */

import { db } from '../../db'
import { pubsub } from '../../utils/pubsub'
import { verifyAccessToken } from '../../utils/auth'
import { formatDateToISO } from '../../utils/formatters'
import { getUserDisplayName, notifyProjectParticipants, requireAuthentication, tryGetUserIdFromRequest } from '../../utils/helpers'

/**
 * Build comment payload for subscription
 * @author Thang Truong
 * @date 2025-11-27
 */
const buildCommentPayload = async (commentId: number | string, likesCount: number, isLiked: boolean) => {
  const comments = (await db.query(
    `SELECT c.id, c.uuid, c.content, c.project_id, c.created_at, c.updated_at,
      u.id as user_id, u.first_name, u.last_name, u.email, u.role, u.uuid as user_uuid,
      u.created_at as user_created_at, u.updated_at as user_updated_at
    FROM comments c LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false WHERE c.id = ?`,
    [commentId]
  )) as any[]
  if (comments.length === 0) return null
  const c = comments[0]
  return {
    id: c.id.toString(), uuid: c.uuid || '', content: c.content, projectId: c.project_id ? c.project_id.toString() : null,
    user: c.user_id ? {
      id: c.user_id.toString(), uuid: c.user_uuid || '', firstName: c.first_name || '',
      lastName: c.last_name || '', email: c.email || '', role: c.role || '',
      createdAt: formatDateToISO(c.user_created_at), updatedAt: formatDateToISO(c.user_updated_at),
    } : null,
    likesCount, isLiked, createdAt: formatDateToISO(c.created_at), updatedAt: formatDateToISO(c.updated_at),
  }
}

/**
 * Comments Query Resolvers
 * @author Thang Truong
 * @date 2025-11-27
 */
export const commentsQueryResolvers = {
  /**
   * Fetch all comments - requires authentication
   *
   * @author Thang Truong
   * @date 2025-11-27
   */
  comments: async (_: any, __: any, context: { req: any }) => {
    requireAuthentication(context, 'Authentication required to fetch comments.')
    const userId = tryGetUserIdFromRequest(context.req)
    const comments = (await db.query(
      `SELECT c.id, c.uuid, c.content, c.project_id, c.created_at, c.updated_at,
        u.id as user_id, u.first_name, u.last_name, u.email, u.role, u.uuid as user_uuid,
        u.created_at as user_created_at, u.updated_at as user_updated_at,
        COALESCE(cl.likes_count, 0) as likes_count
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id AND u.is_deleted = false
      LEFT JOIN (SELECT comment_id, COUNT(*) as likes_count FROM comment_likes GROUP BY comment_id) cl ON c.id = cl.comment_id
      WHERE c.is_deleted = false ORDER BY c.created_at DESC`
    )) as any[]
    let userLikedComments: Set<number> = new Set()
    const validComments = comments.filter((c: any) => c.user_id)
    if (userId && validComments.length > 0) {
      const commentIds = validComments.map((c: any) => c.id)
      const placeholders = commentIds.map(() => '?').join(',')
      const userLikes = (await db.query(
        `SELECT comment_id FROM comment_likes WHERE user_id = ? AND comment_id IN (${placeholders})`,
        [userId, ...commentIds]
      )) as any[]
      userLikedComments = new Set(userLikes.map((like: any) => Number(like.comment_id)))
    }
    return validComments.map((c: any) => ({
      id: c.id.toString(),
      uuid: c.uuid || '',
      content: c.content,
      projectId: c.project_id ? c.project_id.toString() : null,
      user: {
        id: c.user_id.toString(), uuid: c.user_uuid || '', firstName: c.first_name || '',
        lastName: c.last_name || '', email: c.email || '', role: c.role || '',
        createdAt: formatDateToISO(c.user_created_at), updatedAt: formatDateToISO(c.user_updated_at),
      },
      likesCount: Number(c.likes_count || 0),
      isLiked: userId ? userLikedComments.has(Number(c.id)) : false,
      createdAt: formatDateToISO(c.created_at),
      updatedAt: formatDateToISO(c.updated_at),
    }))
  },
}

/**
 * Comments Mutation Resolvers
 * @author Thang Truong
 * @date 2025-11-27
 */
export const commentsMutationResolvers = {
  /** Create comment mutation - @author Thang Truong @date 2025-11-27 */
  createComment: async (_: any, { projectId, content }: { projectId: string; content: string }, context: { req: any }) => {
    const authHeader = context.req?.headers?.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Authentication required. Please login to post comments.')
    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) throw new Error('Invalid or expired token. Please login again.')
    const userId = decoded.userId
    const trimmedContent = content.trim()
    if (!trimmedContent) throw new Error('Comment content cannot be empty')
    const projects = (await db.query('SELECT id, name, owner_id FROM projects WHERE id = ? AND is_deleted = false', [projectId])) as any[]
    if (projects.length === 0) throw new Error('Project not found or has been deleted')
    const projectName = projects[0].name || 'Unnamed Project'
    const { v4: uuidv4 } = await import('uuid')
    const commentUuid = uuidv4()
    const result = (await db.query('INSERT INTO comments (uuid, project_id, user_id, content) VALUES (?, ?, ?, ?)', [commentUuid, projectId, userId, trimmedContent])) as any
    const payload = await buildCommentPayload(result.insertId, 0, false)
    if (payload) {
      await pubsub.publish(`COMMENT_CREATED_${projectId}`, { commentCreated: payload })
      const actorName = await getUserDisplayName(userId)
      await notifyProjectParticipants({ projectId: Number(projectId), actorUserId: userId, message: `${actorName} posted a comment on project "${projectName}".` })
    }
    return payload
  },

  /** Update comment mutation - @author Thang Truong @date 2025-11-27 */
  updateComment: async (_: any, { commentId, content }: { commentId: string; content: string }, context: { req: any }) => {
    const authHeader = context.req?.headers?.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Authentication required. Please login to edit comments.')
    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) throw new Error('Invalid or expired token. Please login again.')
    const userId = decoded.userId
    if (!content || !content.trim()) throw new Error('Comment content cannot be empty.')
    const comments = (await db.query(
      `SELECT c.id, c.user_id, c.project_id FROM comments c WHERE c.id = ? AND c.is_deleted = false`,
      [commentId]
    )) as any[]
    if (comments.length === 0) throw new Error('Comment not found or has been deleted')
    if (Number(comments[0].user_id) !== Number(userId)) throw new Error('You can only edit your own comments')
    const projectId = comments[0].project_id
    await db.query('UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [content.trim(), commentId])
    const likesResult = (await db.query('SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?', [commentId])) as any[]
    const userLike = (await db.query('SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, userId])) as any[]
    const payload = await buildCommentPayload(commentId, Number(likesResult[0]?.count || 0), userLike.length > 0)
    if (payload && projectId) await pubsub.publish(`COMMENT_UPDATED_${projectId}`, { commentUpdated: payload })
    return payload
  },

  /** Delete comment mutation - @author Thang Truong @date 2025-11-27 */
  deleteComment: async (_: any, { commentId }: { commentId: string }, context: { req: any }) => {
    const authHeader = context.req?.headers?.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Authentication required. Please login to delete comments.')
    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) throw new Error('Invalid or expired token. Please login again.')
    const userId = decoded.userId
    const comments = (await db.query(
      `SELECT c.id, c.user_id, c.uuid, c.content, c.project_id, c.created_at, c.updated_at,
        u.id as user_uid, u.first_name, u.last_name, u.email, u.role, u.uuid as user_uuid,
        u.created_at as user_created_at, u.updated_at as user_updated_at
      FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ? AND c.is_deleted = false`,
      [commentId]
    )) as any[]
    if (comments.length === 0) throw new Error('Comment not found or has been deleted')
    if (Number(comments[0].user_id) !== Number(userId)) throw new Error('You can only delete your own comments')
    const projectId = comments[0].project_id
    await db.query('DELETE FROM comment_likes WHERE comment_id = ?', [commentId])
    await db.query('UPDATE comments SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?', [commentId])
    const c = comments[0]
    const payload = {
      id: c.id.toString(), uuid: c.uuid || '', content: c.content, projectId: c.project_id ? c.project_id.toString() : null,
      user: c.user_uid ? { id: c.user_uid.toString(), uuid: c.user_uuid || '', firstName: c.first_name || '',
        lastName: c.last_name || '', email: c.email || '', role: c.role || '',
        createdAt: formatDateToISO(c.user_created_at), updatedAt: formatDateToISO(c.user_updated_at) } : null,
      likesCount: 0, isLiked: false, createdAt: formatDateToISO(c.created_at), updatedAt: formatDateToISO(c.updated_at),
    }
    if (projectId) await pubsub.publish(`COMMENT_DELETED_${projectId}`, { commentDeleted: payload })
    return true
  },

  /** Like comment mutation - @author Thang Truong @date 2025-11-27 */
  likeComment: async (_: any, { commentId }: { commentId: string }, context: { req: any }) => {
    const authHeader = context.req?.headers?.authorization || ''
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Authentication required. Please login to like comments.')
    const token = authHeader.replace('Bearer ', '')
    const decoded = verifyAccessToken(token)
    if (!decoded || !decoded.userId) throw new Error('Invalid or expired token. Please login again.')
    const userId = decoded.userId
    const comments = (await db.query(`SELECT c.id, c.project_id FROM comments c WHERE c.id = ? AND c.is_deleted = false`, [commentId])) as any[]
    if (comments.length === 0) throw new Error('Comment not found or has been deleted')
    const projectId = comments[0].project_id
    const existingLikes = (await db.query('SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?', [userId, commentId])) as any[]
    let isLiked = false, message = ''
    if (existingLikes.length > 0) { await db.query('DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?', [userId, commentId]); message = 'Comment unliked successfully' }
    else { await db.query('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userId, commentId]); isLiked = true; message = 'Comment liked successfully' }
    const likesResult = (await db.query('SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?', [commentId])) as any[]
    const likesCount = Number(likesResult[0]?.count || 0)
    const payload = await buildCommentPayload(commentId, likesCount, isLiked)
    if (payload && projectId) await pubsub.publish(`COMMENT_LIKE_UPDATED_${projectId}`, { commentLikeUpdated: payload })
    return { success: true, message, likesCount, isLiked }
  },
}

/** Comments Subscription Resolvers - @author Thang Truong @date 2025-11-27 */
export const commentsSubscriptionResolvers = {
  commentCreated: { subscribe: (_: any, { projectId }: { projectId: string }) => pubsub.asyncIterator(`COMMENT_CREATED_${projectId}`), resolve: (payload: any) => payload.commentCreated },
  commentLikeUpdated: { subscribe: (_: any, { projectId }: { projectId: string }) => pubsub.asyncIterator(`COMMENT_LIKE_UPDATED_${projectId}`), resolve: (payload: any) => payload.commentLikeUpdated },
  commentUpdated: { subscribe: (_: any, { projectId }: { projectId: string }) => pubsub.asyncIterator(`COMMENT_UPDATED_${projectId}`), resolve: (payload: any) => payload.commentUpdated },
  commentDeleted: { subscribe: (_: any, { projectId }: { projectId: string }) => pubsub.asyncIterator(`COMMENT_DELETED_${projectId}`), resolve: (payload: any) => payload.commentDeleted },
}
