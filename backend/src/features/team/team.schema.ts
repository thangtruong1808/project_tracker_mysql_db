/**
 * Team Feature Schema
 * GraphQL type definitions for team members (project_members)
 * Includes team member types and CRUD inputs
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

export const teamTypeDefs = `
  type TeamMember {
    id: ID!
    projectId: String!
    projectName: String!
    userId: String!
    memberName: String!
    memberEmail: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  input CreateTeamMemberInput {
    projectId: String!
    userId: String!
    role: String
  }

  input UpdateTeamMemberInput {
    projectId: String!
    userId: String!
    role: String!
  }
`

export const teamQueryDefs = `
  teamMembers: [TeamMember!]!
`

export const teamMutationDefs = `
  createTeamMember(input: CreateTeamMemberInput!): TeamMember!
  updateTeamMember(input: UpdateTeamMemberInput!): TeamMember!
  deleteTeamMember(projectId: ID!, userId: ID!): Boolean!
`

