/**
 * Search Feature Schema
 * GraphQL type definitions for search functionality
 * Includes search result types and input
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const searchTypeDefs = `
  type SearchResultProject {
    id: ID!
    name: String!
    status: String!
    description: String
    owner: User
    likesCount: Int!
    commentsCount: Int!
    isLiked: Boolean!
    updatedAt: String!
  }

  type SearchResultTask {
    id: ID!
    title: String!
    status: String!
    projectId: String!
    description: String
    owner: User
    likesCount: Int!
    commentsCount: Int!
    isLiked: Boolean!
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

export const searchQueryDefs = `
  searchDashboard(input: SearchDashboardInput!): SearchResults!
`

export const searchMutationDefs = ``

