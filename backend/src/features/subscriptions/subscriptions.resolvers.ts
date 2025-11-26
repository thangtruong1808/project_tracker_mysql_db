/**
 * Subscriptions Feature Resolvers
 * Handles GraphQL subscription resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { pubsub } from '../../utils/pubsub'

/**
 * Notification Subscription Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const notificationSubscriptionResolvers = {
  notificationCreated: {
    subscribe: (_: any, { userId }: { userId: string }) => pubsub.asyncIterator(`NOTIFICATION_CREATED_${userId}`),
    resolve: (payload: any) => payload.notificationCreated,
  },
}

