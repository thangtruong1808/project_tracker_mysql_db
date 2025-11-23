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
  }

  type Mutation {
    login(email: String!, password: String!): LoginResponse!
    register(input: RegisterInput!): LoginResponse!
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
  }

  type LoginResponse {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type User {
    id: ID!
    uuid: String!
    firstName: String!
    lastName: String!
    email: String!
    role: String!
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
`

