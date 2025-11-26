/**
 * GraphQL Subscriptions Index
 * Re-exports all subscriptions from feature modules
 * Maintains backward compatibility while organizing by features
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

// Comments subscriptions
export {
  COMMENT_CREATED_SUBSCRIPTION,
  COMMENT_LIKE_UPDATED_SUBSCRIPTION,
  COMMENT_UPDATED_SUBSCRIPTION,
  COMMENT_DELETED_SUBSCRIPTION,
} from './comments'

// Notifications subscriptions
export { NOTIFICATION_CREATED_SUBSCRIPTION } from './notifications'
