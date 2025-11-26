/**
 * Tasks Queries
 * GraphQL queries for task data
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Tasks query - fetch all tasks
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const TASKS_QUERY = gql`
  query Tasks {
    tasks {
      id
      uuid
      title
      description
      status
      priority
      dueDate
      projectId
      assignedTo
      tags {
        id
        name
        description
        category
      }
      createdAt
      updatedAt
    }
  }
`

