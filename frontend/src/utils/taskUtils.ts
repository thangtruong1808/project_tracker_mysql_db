/**
 * Task Utility Functions
 * Helper functions for task-related operations
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * Format date to Melbourne timezone
 * Converts ISO date string to Melbourne timezone format
 *
 * @param dateString - ISO date string
 * @returns Formatted date string in Melbourne timezone
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
  } catch (error) {
    return 'Invalid Date'
  }
}

/**
 * Get status badge styling based on task status
 *
 * @param status - Task status string
 * @returns CSS classes for status badge
 */
export const getStatusBadge = (status: string) => {
  const statusStyles: Record<string, string> = {
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    DONE: 'bg-green-100 text-green-800',
  }
  return statusStyles[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status label for display
 *
 * @param status - Task status string
 * @returns Human-readable status label
 */
export const getStatusLabel = (status: string) => {
  const statusLabels: Record<string, string> = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done',
  }
  return statusLabels[status] || status
}

/**
 * Get priority badge styling based on task priority
 *
 * @param priority - Task priority string
 * @returns CSS classes for priority badge
 */
export const getPriorityBadge = (priority: string) => {
  const priorityStyles: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
  }
  return priorityStyles[priority] || 'bg-gray-100 text-gray-800'
}

/**
 * Get priority label for display
 *
 * @param priority - Task priority string
 * @returns Human-readable priority label
 */
export const getPriorityLabel = (priority: string) => {
  const priorityLabels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  }
  return priorityLabels[priority] || priority
}

