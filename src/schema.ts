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
    refreshTokenStatus: RefreshTokenStatus
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
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
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
`

