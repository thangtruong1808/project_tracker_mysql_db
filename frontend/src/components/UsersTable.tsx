/**
 * UsersTable Component
 * Displays users in a sortable table with responsive layouts
 * Delegates to desktop, tablet, and mobile sub-components
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import UsersTableDesktop from './UsersTableDesktop'
import UsersTableMobile from './UsersTableMobile'
import UsersTableTablet from './UsersTableTablet'
import UsersTableLoading from './UsersTableLoading'

interface User {
  id: string
  uuid: string
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

interface UsersTableProps {
  users: User[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (userId: string) => void
  onDelete: (userId: string) => void
  isLoading?: boolean
}

/**
 * UsersTable Component
 * Renders a responsive users table with edit and delete actions
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param users - Array of user objects to display
 * @param sortField - Currently active sort field
 * @param sortDirection - Current sort direction (ASC or DESC)
 * @param onSort - Callback when column header is clicked
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param isLoading - Whether data is loading
 * @returns JSX element containing responsive users table
 */
const UsersTable = ({
  users,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  isLoading = false,
}: UsersTableProps) => {
  /**
   * Format date to Melbourne timezone
   *
   * @author Thang Truong
   * @date 2025-11-26
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
   * @date 2025-11-26
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

  if (isLoading) return <UsersTableLoading />

  if (users.length === 0) {
    return (
      /* Empty State Display */
      <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No users found</h3>
        <p className="text-sm sm:text-base text-gray-600">No users to display</p>
      </div>
    )
  }

  return (
    /* Responsive Users Table Container */
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table View */}
      <UsersTableDesktop
        users={users}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
        onEdit={onEdit}
        onDelete={onDelete}
        formatDate={formatDateToMelbourne}
        getSortIcon={getSortIcon}
      />
      {/* Tablet Table View */}
      <div className="hidden md:block lg:hidden">
        <UsersTableTablet
          users={users}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={onSort}
          onEdit={onEdit}
          onDelete={onDelete}
          getSortIcon={getSortIcon}
        />
      </div>
      {/* Mobile Card View */}
      <div className="md:hidden">
        <UsersTableMobile users={users} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

export default UsersTable
