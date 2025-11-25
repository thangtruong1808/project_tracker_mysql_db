/**
 * CommentHeader Component
 * Displays comment header with user info, timestamp, edited badge, and action buttons
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface CommentHeaderProps {
  user: CommentUser
  createdAt: string
  isEdited: boolean
  isCommentOwner: boolean
  isSubmitting: boolean
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}

/**
 * Format date for display
 * @author Thang Truong
 * @date 2025-01-27
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * CommentHeader Component
 * Renders comment header with user info, timestamp, edited badge, and action buttons
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const CommentHeader = ({ user, createdAt, isEdited, isCommentOwner, isSubmitting, onEdit, onDelete }: CommentHeaderProps) => {
  return (
    <div className="flex items-center gap-2 mb-1 flex-wrap">
      {/* User name */}
      <span className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</span>
      {/* Timestamp */}
      <span className="text-xs text-gray-500">{formatDate(createdAt)}</span>
      {/* Edited badge */}
      {isEdited && (
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
          Edited
        </span>
      )}
      {/* Edit and delete buttons - only for comment owner */}
      {isCommentOwner && (
        <div className="flex items-center gap-2 ml-auto">
          {/* Edit button */}
          <button
            onClick={onEdit}
            disabled={isSubmitting}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Edit comment"
            title="Edit comment"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {/* Delete button */}
          <button
            onClick={onDelete}
            disabled={isSubmitting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete comment"
            title="Delete comment"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default CommentHeader

