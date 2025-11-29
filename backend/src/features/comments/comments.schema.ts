/**
 * Comments Feature Schema
 * GraphQL type definitions for comments
 * Includes comment types, inputs, and like response types
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

export const commentsTypeDefs = `
  type Comment {
    id: ID!
    uuid: String!
    content: String!
    user: User!
    projectId: String
    likesCount: Int!
    isLiked: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type LikeCommentResponse {
    success: Boolean!
    message: String!
    likesCount: Int!
    isLiked: Boolean!
  }
`

export const commentsQueryDefs = ``

export const commentsMutationDefs = `
  createComment(projectId: ID!, content: String!): Comment!
  updateComment(commentId: ID!, content: String!): Comment!
  deleteComment(commentId: ID!): Boolean!
  likeComment(commentId: ID!): LikeCommentResponse!
`

export const commentsSubscriptionDefs = `
  commentCreated(projectId: ID!): Comment!
  commentLikeUpdated(projectId: ID!): Comment!
  commentUpdated(projectId: ID!): Comment!
  commentDeleted(projectId: ID!): Comment!
`

