/**
 * Activity Log Utility Functions
 * Helper methods for formatting activity log data for UI consumption
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

/**
 * Format date to Melbourne timezone for consistent UI display
 *
 * @param dateString - ISO date string
 * @returns Formatted date string or fallback text
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
 * Get badge styling for activity type
 *
 * @param type - Activity type string
 * @returns Tailwind classes for badge
 */
export const getActivityTypeBadge = (type: string) => {
  if (!type) {
    return 'bg-gray-100 text-gray-800'
  }

  if (type.startsWith('USER_')) {
    return 'bg-blue-100 text-blue-800'
  }
  if (type.startsWith('PROJECT_')) {
    return 'bg-purple-100 text-purple-800'
  }
  if (type.startsWith('TASK_')) {
    return 'bg-green-100 text-green-800'
  }
  return 'bg-gray-100 text-gray-800'
}

/**
 * Convert activity type constant to user-friendly label
 *
 * @param type - Activity type constant (e.g., USER_CREATED)
 * @returns Human-readable label (e.g., User Created)
 */
export const getActivityTypeLabel = (type: string) => {
  if (!type) {
    return 'Unknown'
  }
  return type
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format metadata string for card/table display
 *
 * @param metadata - Metadata JSON string or null
 * @returns Pretty formatted string for UI
 */
export const formatMetadataPreview = (metadata: string | null) => {
  if (!metadata) {
    return 'No metadata'
  }
  try {
    const parsed = JSON.parse(metadata)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return metadata
  }
}

