/**
 * GraphQL Resolvers
 * Aggregates all feature resolvers into unified resolver object
 * Organized by features for better maintainability
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import {
  authQueryResolvers,
  authMutationResolvers,
  usersQueryResolvers,
  usersMutationResolvers,
  tagsQueryResolvers,
  tagsMutationResolvers,
  projectsQueryResolvers,
  projectsMutationResolvers,
  tasksQueryResolvers,
  tasksMutationResolvers,
  commentsQueryResolvers,
  commentsMutationResolvers,
  commentsSubscriptionResolvers,
  notificationsQueryResolvers,
  notificationsMutationResolvers,
  notificationSubscriptionResolvers,
  activitiesQueryResolvers,
  activitiesMutationResolvers,
  teamQueryResolvers,
  teamMutationResolvers,
  searchQueryResolvers,
  taskTypeResolvers,
  projectTypeResolvers,
} from './features'

/**
 * Combined GraphQL resolvers from all features
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
export const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
    ...authQueryResolvers,
    ...usersQueryResolvers,
    ...tagsQueryResolvers,
    ...projectsQueryResolvers,
    ...tasksQueryResolvers,
    ...commentsQueryResolvers,
    ...notificationsQueryResolvers,
    ...activitiesQueryResolvers,
    ...teamQueryResolvers,
    ...searchQueryResolvers,
  },
  Mutation: {
    ...authMutationResolvers,
    ...usersMutationResolvers,
    ...tagsMutationResolvers,
    ...projectsMutationResolvers,
    ...tasksMutationResolvers,
    ...commentsMutationResolvers,
    ...notificationsMutationResolvers,
    ...activitiesMutationResolvers,
    ...teamMutationResolvers,
  },
  Subscription: {
    ...commentsSubscriptionResolvers,
    ...notificationSubscriptionResolvers,
  },
  Task: taskTypeResolvers,
  Project: projectTypeResolvers,
}
