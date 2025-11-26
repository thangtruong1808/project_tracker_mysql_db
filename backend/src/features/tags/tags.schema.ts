/**
 * Tags Feature Schema
 * GraphQL type definitions for tags
 * Includes tag types and CRUD inputs
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const tagsTypeDefs = `
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
`

export const tagsQueryDefs = `
  tags: [Tag!]!
  tag(id: ID!): Tag
`

export const tagsMutationDefs = `
  createTag(input: CreateTagInput!): Tag!
  updateTag(id: ID!, input: UpdateTagInput!): Tag!
  deleteTag(id: ID!): Boolean!
`

