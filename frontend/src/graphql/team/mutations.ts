/**
 * Team Mutations
 * GraphQL mutations for team member management
 * CRUD operations for team members
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { gql } from '@apollo/client'

/**
 * Create team member mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const CREATE_TEAM_MEMBER_MUTATION = gql`
  mutation CreateTeamMember($input: CreateTeamMemberInput!) {
    createTeamMember(input: $input) {
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

/**
 * Update team member mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const UPDATE_TEAM_MEMBER_MUTATION = gql`
  mutation UpdateTeamMember($input: UpdateTeamMemberInput!) {
    updateTeamMember(input: $input) {
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

/**
 * Delete team member mutation
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const DELETE_TEAM_MEMBER_MUTATION = gql`
  mutation DeleteTeamMember($projectId: ID!, $userId: ID!) {
    deleteTeamMember(projectId: $projectId, userId: $userId)
  }
`

