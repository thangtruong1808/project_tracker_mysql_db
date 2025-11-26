/**
 * Projects Feature Schema
 * GraphQL type definitions for projects
 * Includes project types, inputs, and like response types
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const projectsTypeDefs = `
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
    comments: [Comment!]!
    createdAt: String!
    updatedAt: String!
  }

  type LikeProjectResponse {
    success: Boolean!
    message: String!
    likesCount: Int!
    isLiked: Boolean!
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
`

export const projectsQueryDefs = `
  projects: [Project!]!
  project(id: ID!): Project
`

export const projectsMutationDefs = `
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!
  likeProject(projectId: ID!): LikeProjectResponse!
`

