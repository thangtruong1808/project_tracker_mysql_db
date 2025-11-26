/**
 * Team Queries
 * GraphQL queries for team member data
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Team members query - fetch all team members
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const TEAM_MEMBERS_QUERY = gql`
  query TeamMembers {
    teamMembers {
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
  }
`

