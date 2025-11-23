import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type Query {
    hello: String
    projects: [Project!]!
    project(id: ID!): Project
  }

  type Mutation {
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
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
`

