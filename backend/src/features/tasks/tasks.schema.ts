/**
 * Tasks Feature Schema
 * GraphQL type definitions for tasks
 * Includes task types, inputs, and like response types
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const tasksTypeDefs = `
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
    owner: User
    tags: [Tag!]!
    likesCount: Int!
    commentsCount: Int!
    isLiked: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type LikeTaskResponse {
    success: Boolean!
    message: String!
    likesCount: Int!
    isLiked: Boolean!
  }

  input CreateTaskInput {
    title: String!
    description: String!
    status: String!
    priority: String!
    dueDate: String
    projectId: String!
    assignedTo: String
    tagIds: [String!]
  }

  input UpdateTaskInput {
    title: String
    description: String
    status: String
    priority: String
    dueDate: String
    projectId: String
    assignedTo: String
    tagIds: [String!]
  }
`

export const tasksQueryDefs = `
  tasks: [Task!]!
  task(id: ID!): Task
`

export const tasksMutationDefs = `
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Boolean!
  likeTask(taskId: ID!): LikeTaskResponse!
`

