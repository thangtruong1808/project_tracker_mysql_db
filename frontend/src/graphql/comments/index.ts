/**
 * Comments GraphQL Index
 * Exports all comment-related queries, mutations, and subscriptions
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

export { COMMENTS_QUERY } from './queries'
export {
  CREATE_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
  LIKE_COMMENT_MUTATION,
} from './mutations'
export {
  COMMENT_CREATED_SUBSCRIPTION,
  COMMENT_LIKE_UPDATED_SUBSCRIPTION,
  COMMENT_UPDATED_SUBSCRIPTION,
  COMMENT_DELETED_SUBSCRIPTION,
} from './subscriptions'

