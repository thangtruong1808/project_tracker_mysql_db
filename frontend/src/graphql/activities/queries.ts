/**
 * Activities Queries
 * GraphQL queries for activity log data
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Activities query - fetch all activity logs
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const ACTIVITIES_QUERY = gql`
  query Activities {
    activities {
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
 * Activity query - fetch single activity by ID
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const ACTIVITY_QUERY = gql`
  query Activity($id: ID!) {
    activity(id: $id) {
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

