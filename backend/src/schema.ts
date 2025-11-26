/**
 * GraphQL Schema
 * Aggregates all feature schemas into one unified schema
 * Organized by features for better maintainability
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from 'graphql-tag'

import {
  authTypeDefs,
  authQueryDefs,
  authMutationDefs,
  usersTypeDefs,
  usersQueryDefs,
  usersMutationDefs,
  tagsTypeDefs,
  tagsQueryDefs,
  tagsMutationDefs,
  projectsTypeDefs,
  projectsQueryDefs,
  projectsMutationDefs,
  tasksTypeDefs,
  tasksQueryDefs,
  tasksMutationDefs,
  commentsTypeDefs,
  commentsMutationDefs,
  commentsSubscriptionDefs,
  notificationsTypeDefs,
  notificationsQueryDefs,
  notificationsMutationDefs,
  notificationsSubscriptionDefs,
  activitiesTypeDefs,
  activitiesQueryDefs,
  activitiesMutationDefs,
  teamTypeDefs,
  teamQueryDefs,
  teamMutationDefs,
  searchTypeDefs,
  searchQueryDefs,
} from './features'

/**
 * Combine all feature type definitions
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const typeDefs = gql`
  ${usersTypeDefs}
  ${authTypeDefs}
  ${tagsTypeDefs}
  ${projectsTypeDefs}
  ${tasksTypeDefs}
  ${commentsTypeDefs}
  ${notificationsTypeDefs}
  ${activitiesTypeDefs}
  ${teamTypeDefs}
  ${searchTypeDefs}

  type Query {
    hello: String
    ${authQueryDefs}
    ${usersQueryDefs}
    ${tagsQueryDefs}
    ${projectsQueryDefs}
    ${tasksQueryDefs}
    ${notificationsQueryDefs}
    ${activitiesQueryDefs}
    ${teamQueryDefs}
    ${searchQueryDefs}
  }

  type Mutation {
    ${authMutationDefs}
    ${usersMutationDefs}
    ${tagsMutationDefs}
    ${projectsMutationDefs}
    ${tasksMutationDefs}
    ${commentsMutationDefs}
    ${notificationsMutationDefs}
    ${activitiesMutationDefs}
    ${teamMutationDefs}
  }

  type Subscription {
    ${commentsSubscriptionDefs}
    ${notificationsSubscriptionDefs}
  }
`
