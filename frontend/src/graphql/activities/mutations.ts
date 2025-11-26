/**
 * Activities Mutations
 * GraphQL mutations for activity log management
 * CRUD operations for activity logs
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Create activity mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($input: CreateActivityLogInput!) {
    createActivity(input: $input) {
      id
      userId
      targetUserId
      projectId
      taskId
      action
      type
      metadata
      createdAt
      updatedAt
    }
  }
`

/**
 * Update activity mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const UPDATE_ACTIVITY_MUTATION = gql`
  mutation UpdateActivity($id: ID!, $input: UpdateActivityLogInput!) {
    updateActivity(id: $id, input: $input) {
      id
      userId
      targetUserId
      projectId
      taskId
      action
      type
      metadata
      createdAt
      updatedAt
    }
  }
`

/**
 * Delete activity mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_ACTIVITY_MUTATION = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`

