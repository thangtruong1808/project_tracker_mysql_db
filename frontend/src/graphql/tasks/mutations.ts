/**
 * Tasks Mutations
 * GraphQL mutations for task management
 * CRUD and like operations for tasks
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Create task mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
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

/**
 * Update task mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
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

/**
 * Delete task mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`

/**
 * Like task mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const LIKE_TASK_MUTATION = gql`
  mutation LikeTask($taskId: ID!) {
    likeTask(taskId: $taskId) {
      success
      message
      likesCount
      isLiked
    }
  }
`

