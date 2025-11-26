/**
 * Notifications GraphQL Index
 * Exports all notification-related queries, mutations, and subscriptions
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export {
  CREATE_NOTIFICATION_MUTATION,
  UPDATE_NOTIFICATION_MUTATION,
  DELETE_NOTIFICATION_MUTATION,
} from './mutations'
export { NOTIFICATIONS_QUERY } from './queries'
export { NOTIFICATION_CREATED_SUBSCRIPTION } from './subscriptions'

