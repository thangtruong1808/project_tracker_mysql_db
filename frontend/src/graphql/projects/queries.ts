/**
 * Projects Queries
 * GraphQL queries for project data
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { gql } from '@apollo/client'

/**
 * Projects query - fetch all projects
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const PROJECTS_QUERY = gql`
  query Projects {
    projects {
      id
      name
      description
      status
      owner {
        id
        firstName
        lastName
        email
        role
      }
      likesCount
      commentsCount
      isLiked
      createdAt
      updatedAt
    }
  }
`

/**
 * Project query - fetch single project by ID
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const PROJECT_QUERY = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      owner {
        id
        firstName
        lastName
        email
        role
      }
      likesCount
      commentsCount
      isLiked
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
        owner {
          id
          firstName
          lastName
          email
          role
        }
        tags {
          id
          name
          description
          category
        }
        likesCount
        commentsCount
        isLiked
        createdAt
        updatedAt
      }
      members {
        id
        projectId
        projectName
        userId
        memberName
        memberEmail
        role
        createdAt
        updatedAt
      }
      comments {
        id
        uuid
        content
        projectId
        user {
          id
          firstName
          lastName
          email
        }
        likesCount
        isLiked
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`

