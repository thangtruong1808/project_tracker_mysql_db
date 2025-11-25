/**
 * GraphQL Schema
 * Defines all GraphQL types, queries, and mutations
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type Query {
    hello: String
    projects: [Project!]!
    project(id: ID!): Project
    users: [User!]!
    tags: [Tag!]!
    tag(id: ID!): Tag
    tasks: [Task!]!
    task(id: ID!): Task
    notifications: [Notification!]!
    notification(id: ID!): Notification
    activities: [ActivityLog!]!
    activity(id: ID!): ActivityLog
    teamMembers: [TeamMember!]!
    refreshTokenStatus: RefreshTokenStatus
    searchDashboard(input: SearchDashboardInput!): SearchResults!
  }

  type RefreshTokenStatus {
    isValid: Boolean!
    timeRemaining: Int
    isAboutToExpire: Boolean!
  }

  type Mutation {
    login(email: String!, password: String!): LoginResponse!
    register(input: RegisterInput!): LoginResponse!
    refreshToken(extendSession: Boolean): RefreshTokenResponse!
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    likeProject(projectId: ID!): LikeProjectResponse!
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    createTag(input: CreateTagInput!): Tag!
    updateTag(id: ID!, input: UpdateTagInput!): Tag!
    deleteTag(id: ID!): Boolean!
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    createNotification(input: CreateNotificationInput!): Notification!
    updateNotification(id: ID!, input: UpdateNotificationInput!): Notification!
    deleteNotification(id: ID!): Boolean!
    createActivity(input: CreateActivityLogInput!): ActivityLog!
    updateActivity(id: ID!, input: UpdateActivityLogInput!): ActivityLog!
    deleteActivity(id: ID!): Boolean!
    createTeamMember(input: CreateTeamMemberInput!): TeamMember!
    updateTeamMember(input: UpdateTeamMemberInput!): TeamMember!
    deleteTeamMember(projectId: ID!, userId: ID!): Boolean!
  }
  
  type LikeProjectResponse {
    success: Boolean!
    message: String!
    likesCount: Int!
  }

  type LoginResponse {
    accessToken: String!
    user: User!
  }

  type RefreshTokenResponse {
    accessToken: String!
  }

  type User {
    id: ID!
    uuid: String!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: String!
    owner: User
    likesCount: Int!
    commentsCount: Int!
    isLiked: Boolean!
    tasks: [Task!]!
    members: [TeamMember!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreateProjectInput {
    name: String!
    description: String
    status: String!
  }

  input UpdateProjectInput {
    name: String
    description: String
    status: String
  }

  input RegisterInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    role: String
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    email: String
    role: String
  }

  type Tag {
    id: ID!
    name: String!
    description: String
    title: String
    type: String
    category: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateTagInput {
    name: String!
    description: String
    title: String
    type: String
    category: String
  }

  input UpdateTagInput {
    name: String
    description: String
    title: String
    type: String
    category: String
  }

  type Task {
    id: ID!
    uuid: String!
    title: String!
    description: String!
    status: String!
    priority: String!
    dueDate: String
    projectId: String!
    assignedTo: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateTaskInput {
    title: String!
    description: String!
    status: String!
    priority: String!
    dueDate: String
    projectId: String!
    assignedTo: String
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: String
    priority: String
    dueDate: String
    projectId: String
    assignedTo: String
  }

  type Notification {
    id: ID!
    userId: String!
    message: String!
    isRead: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  input CreateNotificationInput {
    userId: String!
    message: String!
    isRead: Boolean
  }

  input UpdateNotificationInput {
    userId: String
    message: String
    isRead: Boolean
  }

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

  type TeamMember {
    id: ID!
    projectId: String!
    projectName: String!
    userId: String!
    memberName: String!
    memberEmail: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateTeamMemberInput {
    projectId: String!
    userId: String!
    role: String
  }

  input UpdateTeamMemberInput {
    projectId: String!
    userId: String!
    role: String!
  }

  type SearchResultProject {
    id: ID!
    name: String!
    status: String!
    description: String
    updatedAt: String!
  }

  type SearchResultTask {
    id: ID!
    title: String!
    status: String!
    projectId: String!
    description: String
    updatedAt: String!
  }

  type SearchResults {
    projects: [SearchResultProject!]!
    tasks: [SearchResultTask!]!
    projectTotal: Int!
    taskTotal: Int!
  }

  input SearchDashboardInput {
    query: String
    projectStatuses: [String!]
    taskStatuses: [String!]
    projectPage: Int
    projectPageSize: Int
    taskPage: Int
    taskPageSize: Int
  }
`

