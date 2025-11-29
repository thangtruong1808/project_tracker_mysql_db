/**
 * CommentsTable Component
 * Displays comments in a sortable table with responsive layouts
 * Delegates to desktop, tablet, and mobile sub-components
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import CommentsTableDesktop from './CommentsTableDesktop'
import CommentsTableMobile from './CommentsTableMobile'
import CommentsTableTablet from './CommentsTableTablet'
import CommentsTableLoading from './CommentsTableLoading'

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface Comment {
  id: string
  uuid: string
  content: string
  projectId: string | null
  user: CommentUser
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'content' | 'projectId' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

interface CommentsTableProps {
  comments: Comment[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (commentId: string) => void
  onDelete: (commentId: string) => void
  isLoading?: boolean
}

/**
 * CommentsTable Component
 * Renders a responsive comments table with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @param comments - Array of comment objects to display
 * @param sortField - Currently active sort field
 * @param sortDirection - Current sort direction (ASC or DESC)
 * @param onSort - Callback when column header is clicked
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param isLoading - Whether data is loading
 * @returns JSX element containing responsive comments table
 */
const CommentsTable = ({
  comments,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  isLoading = false,
}: CommentsTableProps) => {
  /**
   * Format date to Melbourne timezone
   *
   * @author Thang Truong
   * @date 2025-11-27
   * @param dateString - ISO date string from database
   * @returns Formatted date string in Melbourne timezone
   */
  const formatDateToMelbourne = (dateString: string | null | undefined) => {
    try {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString('en-AU', {
        timeZone: 'Australia/Melbourne',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'Invalid Date'
    }
  }

  /**
   * Get sort icon for column header
   *
   * @author Thang Truong
   * @date 2025-11-27
   * @param field - The field to check
   * @returns JSX element with sort icon
   */
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'ASC' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (isLoading) return <CommentsTableLoading />

  if (comments.length === 0) {
    return (
      /* Empty State Display */
      <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No comments found</h3>
        <p className="text-sm sm:text-base text-gray-600">No comments to display</p>
      </div>
    )
  }

  return (
    /* Responsive Comments Table Container */
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table View */}
      <CommentsTableDesktop comments={comments} onSort={onSort} onEdit={onEdit} onDelete={onDelete} formatDate={formatDateToMelbourne} getSortIcon={getSortIcon} />
      {/* Tablet Table View */}
      <div className="hidden md:block lg:hidden">
        <CommentsTableTablet comments={comments} sortField={sortField} sortDirection={sortDirection} onSort={onSort} onEdit={onEdit} onDelete={onDelete} getSortIcon={getSortIcon} />
      </div>
      {/* Mobile Card View */}
      <div className="md:hidden">
        <CommentsTableMobile comments={comments} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

export default CommentsTable

