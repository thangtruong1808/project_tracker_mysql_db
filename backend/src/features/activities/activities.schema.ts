/**
 * Activities Feature Schema
 * GraphQL type definitions for activity logs
 * Includes activity log types and CRUD inputs
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const activitiesTypeDefs = `
  type ActivityLog {
    id: ID!
    userId: String!
    targetUserId: String
    projectId: String
    taskId: String
    action: String
    type: String!
    metadata: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateActivityLogInput {
    userId: String!
    targetUserId: String
    projectId: String
    taskId: String
    action: String
    type: String!
    metadata: String
  }

  input UpdateActivityLogInput {
    userId: String
    targetUserId: String
    projectId: String
    taskId: String
    action: String
    type: String
    metadata: String
  }
`

export const activitiesQueryDefs = `
  activities: [ActivityLog!]!
  activity(id: ID!): ActivityLog
`

export const activitiesMutationDefs = `
  createActivity(input: CreateActivityLogInput!): ActivityLog!
  updateActivity(id: ID!, input: UpdateActivityLogInput!): ActivityLog!
  deleteActivity(id: ID!): Boolean!
`

