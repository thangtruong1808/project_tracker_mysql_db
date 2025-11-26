/**
 * Users Feature Schema
 * GraphQL type definitions for users
 * Includes user types and CRUD inputs
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const usersTypeDefs = `
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

export const usersQueryDefs = `
  users: [User!]!
`

export const usersMutationDefs = `
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
`

