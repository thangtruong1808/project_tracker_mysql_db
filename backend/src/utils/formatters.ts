/**
 * Shared Formatters Utility
 * Common formatting functions used across all resolvers
 * Provides date formatting, user formatting, and other shared utilities
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

/**
 * Convert MySQL DATETIME to ISO string for proper serialization
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param dateValue - Date value from database
 * @returns ISO formatted date string
 */
export const formatDateToISO = (dateValue: any): string => {
  try {
    if (!dateValue) {
      return new Date().toISOString()
    }
    if (dateValue instanceof Date) {
      return dateValue.toISOString()
    }
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue)
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
    }
    return new Date().toISOString()
  } catch {
    return new Date().toISOString()
  }
}

/**
 * Format user object for GraphQL response
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param record - Database record containing user fields
 * @param prefix - Field name prefix (e.g., 'owner_', 'user_')
 * @returns Formatted user object or null
 */
export const formatUser = (record: any, prefix: string = 'owner_'): any | null => {
  const userId = record[`${prefix}user_id`]
  if (!userId) {
    return null
  }
  return {
    id: userId.toString(),
    uuid: record[`${prefix}uuid`] || '',
    firstName: record[`${prefix}first_name`] || '',
    lastName: record[`${prefix}last_name`] || '',
    email: record[`${prefix}email`] || '',
    role: record[`${prefix}role`] || '',
    createdAt: formatDateToISO(record[`${prefix}created_at`]),
    updatedAt: formatDateToISO(record[`${prefix}updated_at`]),
  }
}

/**
 * Format team member name from first and last name
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param firstName - User first name
 * @param lastName - User last name
 * @returns Formatted full name
 */
export const formatTeamMemberName = (firstName?: string, lastName?: string): string => {
  const parts = [firstName || '', lastName || ''].map((value) => value?.trim()).filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : 'Unknown Member'
}

/**
 * Map database team member record to GraphQL response format
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param member - Database member record
 * @returns Formatted team member object
 */
export const mapTeamMemberRecord = (member: any) => ({
  id: `${member.project_id}-${member.user_id}`,
  projectId: member.project_id.toString(),
  projectName: member.project_name || 'Unknown Project',
  userId: member.user_id.toString(),
  memberName: formatTeamMemberName(member.first_name, member.last_name),
  memberEmail: member.email || 'N/A',
  role: member.role || 'VIEWER',
  createdAt: formatDateToISO(member.created_at),
  updatedAt: formatDateToISO(member.updated_at),
})

