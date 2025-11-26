/**
 * GraphQL Mutations Index
 * Re-exports all mutations from feature modules
 * Maintains backward compatibility while organizing by features
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

// Auth mutations
export { LOGIN_MUTATION, REGISTER_MUTATION, REFRESH_TOKEN_MUTATION } from './auth'

// Users mutations
export { CREATE_USER_MUTATION, UPDATE_USER_MUTATION, DELETE_USER_MUTATION } from './users'

// Projects mutations
export {
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
  LIKE_PROJECT_MUTATION,
} from './projects'

// Tasks mutations
export {
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  LIKE_TASK_MUTATION,
} from './tasks'

// Tags mutations
export { CREATE_TAG_MUTATION, UPDATE_TAG_MUTATION, DELETE_TAG_MUTATION } from './tags'

// Comments mutations
export {
  CREATE_COMMENT_MUTATION,
  UPDATE_COMMENT_MUTATION,
  DELETE_COMMENT_MUTATION,
  LIKE_COMMENT_MUTATION,
} from './comments'

// Notifications mutations
export {
  CREATE_NOTIFICATION_MUTATION,
  UPDATE_NOTIFICATION_MUTATION,
  DELETE_NOTIFICATION_MUTATION,
} from './notifications'

// Activities mutations
export { CREATE_ACTIVITY_MUTATION, UPDATE_ACTIVITY_MUTATION, DELETE_ACTIVITY_MUTATION } from './activities'

// Team mutations
export { CREATE_TEAM_MEMBER_MUTATION, UPDATE_TEAM_MEMBER_MUTATION, DELETE_TEAM_MEMBER_MUTATION } from './team'
