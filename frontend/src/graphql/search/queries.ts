/**
 * Search Queries
 * GraphQL queries for search functionality
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Dashboard search query
 * Retrieves projects and tasks matching search filters
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const SEARCH_DASHBOARD_QUERY = gql`
  query SearchDashboard($input: SearchDashboardInput!) {
    searchDashboard(input: $input) {
      projects {
        id
        name
        status
        description
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
        updatedAt
      }
      tasks {
        id
        title
        status
        projectId
        description
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
        updatedAt
      }
      projectTotal
      taskTotal
    }
  }
`

