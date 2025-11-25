/**
 * Team Utility Functions
 * Helper methods for formatting project team member data
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * Format date to Australia/Melbourne timezone
 *
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDateToMelbourne = (dateString: string | null): string => {
  if (!dateString) {
    return 'N/A'
  }
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return new Intl.DateTimeFormat('en-AU', {
      timeZone: 'Australia/Melbourne',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Format role label for display
 *
 * @param role - Role string from backend
 * @returns Human-friendly role text
 */
export const getRoleLabel = (role: string) => {
  if (!role) {
    return 'Viewer'
  }
  return role
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get Tailwind badge classes for role display
 *
 * @param role - Role string
 * @returns Tailwind class string
 */
export const getRoleBadge = (role: string) => {
  if (role === 'OWNER') {
    return 'bg-purple-100 text-purple-800'
  }
  if (role === 'EDITOR') {
    return 'bg-blue-100 text-blue-800'
  }
  return 'bg-gray-100 text-gray-800'
}

