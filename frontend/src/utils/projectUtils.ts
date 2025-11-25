/**
 * Project Utility Functions
 * Shared utility functions for project-related components
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * Get status badge styling
 *
 * @param status - Project status
 * @returns CSS classes for status badge
 */
export const getStatusBadge = (status: string) => {
  const statusStyles: Record<string, string> = {
    PLANNING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
  }
  return statusStyles[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status label
 *
 * @param status - Project status
 * @returns Human-readable status label
 */
export const getStatusLabel = (status: string) => {
  const statusLabels: Record<string, string> = {
    PLANNING: 'Planning',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
  }
  return statusLabels[status] || status
}

/**
 * Format date to Melbourne timezone
 * Converts any date from database to Melbourne timezone for display
 * Handles invalid dates gracefully
 *
 * @param dateString - ISO date string from database (any timezone)
 * @returns Formatted date string in Melbourne timezone or fallback message
 */
export const formatDateToMelbourne = (dateString: string | null | undefined) => {
  try {
    if (!dateString) {
      return 'N/A'
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return date.toLocaleDateString('en-AU', {
      timeZone: 'Australia/Melbourne',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

