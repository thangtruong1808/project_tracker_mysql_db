/**
 * StatusBadge Component
 * Displays a status badge with color coding based on status type
 * Used for projects and tasks status display
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface StatusBadgeProps {
  status: string
  type?: 'project' | 'task'
}

/**
 * Get status badge styling based on status value
 * Returns appropriate background and text colors for different statuses
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param status - The status string to style
 * @param type - Type of item (project or task)
 * @returns Object with background and text color classes
 */
const getStatusStyles = (status: string, type: 'project' | 'task' = 'project') => {
  const upperStatus = status.toUpperCase()
  
  if (type === 'project') {
    switch (upperStatus) {
      case 'PLANNING':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200'
        }
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200'
        }
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200'
        }
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200'
        }
    }
  } else {
    switch (upperStatus) {
      case 'TODO':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200'
        }
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200'
        }
      case 'DONE':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200'
        }
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200'
        }
    }
  }
}

/**
 * Format status string for display
 * Converts underscores to spaces and capitalizes words
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param status - The status string to format
 * @returns Formatted status string
 */
const formatStatus = (status: string): string => {
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * StatusBadge Component
 * Renders a styled badge showing the status
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const StatusBadge = ({ status, type = 'project' }: StatusBadgeProps) => {
  const styles = getStatusStyles(status, type)
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {formatStatus(status)}
    </span>
  )
}

export default StatusBadge

