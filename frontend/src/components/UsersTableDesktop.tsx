/**
 * UsersTableDesktop Component
 * Desktop view for users table with sortable columns
 *
 * @author Thang Truong
 * @date 2025-11-26
 */

import React from 'react'

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

interface UsersTableDesktopProps {
  users: User[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (userId: string) => void
  onDelete: (userId: string) => void
  formatDate: (dateString: string | null | undefined) => string
  getSortIcon: (field: SortField) => React.ReactNode
}

/**
 * UsersTableDesktop Component
 * Renders the desktop view of the users table with full column support
 *
 * @author Thang Truong
 * @date 2025-11-26
 * @param users - Array of user objects to display
 * @param sortField - Currently active sort field
 * @param sortDirection - Current sort direction
 * @param onSort - Callback when column header is clicked
 * @param onEdit - Callback when edit button is clicked
 * @param onDelete - Callback when delete button is clicked
 * @param formatDate - Function to format date values
 * @param getSortIcon - Function to get sort icon for columns
 * @returns JSX element containing desktop table view
 */
const UsersTableDesktop: React.FC<UsersTableDesktopProps> = ({
  users,
  onSort,
  onEdit,
  onDelete,
  formatDate,
  getSortIcon,
}) => {
  const columns: Array<{ field: SortField; label: string }> = [
    { field: 'id', label: 'ID' },
    { field: 'firstName', label: 'First Name' },
    { field: 'lastName', label: 'Last Name' },
    { field: 'email', label: 'Email' },
    { field: 'role', label: 'Role' },
    { field: 'createdAt', label: 'Created At' },
    { field: 'updatedAt', label: 'Updated At' },
  ]

  return (
    /* Desktop Table Container */
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table Header with Sortable Columns */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => onSort(col.field)}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {getSortIcon(col.field)}
                </div>
              </th>
            ))}
            <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        {/* Table Body with User Data Rows */}
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-100 transition-colors">
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.firstName}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.lastName}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.updatedAt)}</td>
              <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                {/* Action Buttons */}
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
  )
}

export default UsersTableDesktop

