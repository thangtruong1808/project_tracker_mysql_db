/**
 * UsersTable Component
 * Displays users in a sortable table with action buttons
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

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
 * Renders a sortable table of users with edit and delete actions
 *
 * @param users - Array of user objects to display
 * @param sortField - Currently active sort field
 * @param sortDirection - Current sort direction (ASC or DESC)
 * @param onSort - Callback function when column header is clicked
 * @param onEdit - Callback function when edit button is clicked
 * @param onDelete - Callback function when delete button is clicked
 * @returns JSX element containing users table
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
   * Converts any date from database to Melbourne timezone for display
   * Handles invalid dates gracefully
   *
   * @param dateString - ISO date string from database (any timezone)
   * @returns Formatted date string in Melbourne timezone or fallback message
   */
  const formatDateToMelbourne = (dateString: string | null | undefined) => {
    try {
      // Handle null or undefined values
      if (!dateString) {
        return 'N/A'
      }

      // Parse the date string (should be ISO format from backend)
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }

      // Convert to Melbourne timezone (Australia/Melbourne)
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

  /**
   * Get sort icon for column header
   *
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

  if (isLoading) {
    return <UsersTableLoading />
  }

  if (users.length === 0) {
    return (
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => onSort('id')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  ID
                  {getSortIcon('id')}
                </div>
              </th>
              <th
                onClick={() => onSort('firstName')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  First Name
                  {getSortIcon('firstName')}
                </div>
              </th>
              <th
                onClick={() => onSort('lastName')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Last Name
                  {getSortIcon('lastName')}
                </div>
              </th>
              <th
                onClick={() => onSort('email')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Email
                  {getSortIcon('email')}
                </div>
              </th>
              <th
                onClick={() => onSort('role')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Role
                  {getSortIcon('role')}
                </div>
              </th>
              <th
                onClick={() => onSort('createdAt')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Created At
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th
                onClick={() => onSort('updatedAt')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Updated At
                  {getSortIcon('updatedAt')}
                </div>
              </th>
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100 transition-colors">
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.id}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.firstName}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {user.lastName}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {user.email}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateToMelbourne(user.createdAt)}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateToMelbourne(user.updatedAt)}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(user.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                      aria-label="Edit user"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                      aria-label="Delete user"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet Table View - Hide ID and dates */}
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

