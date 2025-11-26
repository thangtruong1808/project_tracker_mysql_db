/**
 * Team Feature Resolvers
 * Handles team member queries and mutations
 * CRUD operations for project team members
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import { db } from '../../db'
import { mapTeamMemberRecord, formatDateToISO, formatTeamMemberName } from '../../utils/formatters'

/**
 * Fetch team member record from database
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
const fetchTeamMemberRecord = async (projectId: string | number, userId: string | number) => {
  const rows = (await db.query(
    `SELECT pm.project_id, pm.user_id, pm.role, pm.created_at, pm.updated_at,
      p.name AS project_name, u.first_name, u.last_name, u.email
    FROM project_members pm
    INNER JOIN projects p ON p.id = pm.project_id
    INNER JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = ? AND pm.user_id = ? LIMIT 1`,
    [projectId, userId]
  )) as any[]

  if (rows.length === 0) throw new Error('Team member not found')
  return mapTeamMemberRecord(rows[0])
}

/**
 * Team Query Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const teamQueryResolvers = {
  /**
   * Fetch all team members
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  teamMembers: async () => {
    const members = (await db.query(
      `SELECT pm.project_id, pm.user_id, pm.role, pm.created_at, pm.updated_at,
        p.name AS project_name, u.first_name, u.last_name, u.email
      FROM project_members pm
      INNER JOIN projects p ON p.id = pm.project_id
      INNER JOIN users u ON u.id = pm.user_id
      WHERE pm.is_deleted = false
      ORDER BY pm.created_at DESC`
    )) as any[]

    return members.map((member: any) => mapTeamMemberRecord(member))
  },
}

/**
 * Team Mutation Resolvers
 *
 * @author Thang Truong
 * @date 2025-11-26
 */
export const teamMutationResolvers = {
  /**
   * Create team member mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  createTeamMember: async (_: any, { input }: { input: any }) => {
    const { projectId, userId, role } = input
    const memberRole = role || 'VIEWER'

    const existingMembers = (await db.query(
      'SELECT project_id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    )) as any[]

    if (existingMembers.length > 0) {
      await db.query(
        'UPDATE project_members SET is_deleted = false, role = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE project_id = ? AND user_id = ?',
        [memberRole, projectId, userId]
      )
    } else {
      await db.query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES (?, ?, ?)',
        [projectId, userId, memberRole]
      )
    }

    return fetchTeamMemberRecord(projectId, userId)
  },

  /**
   * Update team member mutation
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  updateTeamMember: async (_: any, { input }: { input: any }) => {
    const { projectId, userId, role } = input

    await db.query(
      'UPDATE project_members SET role = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE project_id = ? AND user_id = ? AND is_deleted = false',
      [role, projectId, userId]
    )

    return fetchTeamMemberRecord(projectId, userId)
  },

  /**
   * Delete team member mutation (soft delete)
   *
   * @author Thang Truong
   * @date 2025-11-26
   */
  deleteTeamMember: async (_: any, { projectId, userId }: { projectId: string; userId: string }) => {
    const result = (await db.query(
      'UPDATE project_members SET is_deleted = true, updated_at = CURRENT_TIMESTAMP(3) WHERE project_id = ? AND user_id = ? AND is_deleted = false',
      [projectId, userId]
    )) as any

    if (result.affectedRows === 0) throw new Error('Team member not found or already removed')
    return true
  },
}

