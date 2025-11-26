/**
 * Projects Mutations
 * GraphQL mutations for project management
 * CRUD and like operations for projects
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Create project mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      status
      createdAt
      updatedAt
    }
  }
`

/**
 * Update project mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      status
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete project mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`

/**
 * Like project mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const LIKE_PROJECT_MUTATION = gql`
  mutation LikeProject($projectId: ID!) {
    likeProject(projectId: $projectId) {
      success
      message
      likesCount
      isLiked
    }
  }
`

