/**
 * Features Index
 * Aggregates all feature schema and resolvers
 * Central export point for all features
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

// Auth feature
export { authTypeDefs, authQueryDefs, authMutationDefs } from './auth'
export { authQueryResolvers, authMutationResolvers } from './auth'

// Users feature
export { usersTypeDefs, usersQueryDefs, usersMutationDefs } from './users'
export { usersQueryResolvers, usersMutationResolvers } from './users'

// Tags feature
export { tagsTypeDefs, tagsQueryDefs, tagsMutationDefs } from './tags'
export { tagsQueryResolvers, tagsMutationResolvers } from './tags'

// Projects feature
export { projectsTypeDefs, projectsQueryDefs, projectsMutationDefs } from './projects'
export { projectsQueryResolvers, projectsMutationResolvers } from './projects'

// Tasks feature
export { tasksTypeDefs, tasksQueryDefs, tasksMutationDefs } from './tasks'
export { tasksQueryResolvers, tasksMutationResolvers } from './tasks'

// Comments feature
export { commentsTypeDefs, commentsQueryDefs, commentsMutationDefs, commentsSubscriptionDefs } from './comments'
export { commentsMutationResolvers, commentsSubscriptionResolvers } from './comments'

// Subscriptions feature
export { notificationSubscriptionResolvers } from './subscriptions'

// Notifications feature
export { notificationsTypeDefs, notificationsQueryDefs, notificationsMutationDefs, notificationsSubscriptionDefs } from './notifications'
export { notificationsQueryResolvers, notificationsMutationResolvers } from './notifications'

// Activities feature
export { activitiesTypeDefs, activitiesQueryDefs, activitiesMutationDefs } from './activities'
export { activitiesQueryResolvers, activitiesMutationResolvers } from './activities'

// Team feature
export { teamTypeDefs, teamQueryDefs, teamMutationDefs } from './team'
export { teamQueryResolvers, teamMutationResolvers } from './team'

// Search feature
export { searchTypeDefs, searchQueryDefs, searchMutationDefs } from './search'
export { searchQueryResolvers, searchMutationResolvers } from './search'

// Type resolvers
export { taskTypeResolvers, projectTypeResolvers } from './types'
