/**
 * Notification Utility Functions
 * Helper functions for notification-related operations
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
 * Get read status badge styling
 *
 * @param isRead - Notification read status
 * @returns CSS classes for read status badge
 */
export const getReadStatusBadge = (isRead: boolean) => {
  return isRead
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800'
}

/**
 * Get read status label for display
 *
 * @param isRead - Notification read status
 * @returns Human-readable read status label
 */
export const getReadStatusLabel = (isRead: boolean) => {
  return isRead ? 'Read' : 'Unread'
}

