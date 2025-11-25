/**
 * NotificationsTable Component
 * Displays notifications in a sortable table with action buttons
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import NotificationsTableMobile from './NotificationsTableMobile'
import NotificationsTableTablet from './NotificationsTableTablet'
import NotificationsTableLoading from './NotificationsTableLoading'
import { formatDateToMelbourne, getReadStatusBadge, getReadStatusLabel } from '../utils/notificationUtils'

interface Notification {
  id: string
  userId: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

type SortField = 'id' | 'message' | 'isRead' | 'createdAt' | 'updatedAt'
type SortDirection = 'ASC' | 'DESC'

interface NotificationsTableProps {
  notifications: Notification[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (notificationId: string) => void
  onDelete: (notificationId: string) => void
  isLoading?: boolean
}

/**
 * NotificationsTable Component
 * Renders a sortable table of notifications with edit and delete actions
 * @param notifications - Array of notification objects to display
 * @param sortField - Currently active sort field
 * @param sortDirection - Current sort direction (ASC or DESC)
 * @param onSort - Callback function when column header is clicked
 * @param onEdit - Callback function when edit button is clicked
 * @param onDelete - Callback function when delete button is clicked
 * @param isLoading - Whether data is currently loading
 * @returns JSX element containing notifications table
 */
const NotificationsTable = ({
  notifications,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  isLoading = false,
}: NotificationsTableProps) => {
  /**
   * Get sort icon for column header
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
    return <NotificationsTableLoading />
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
        <p className="text-sm sm:text-base text-gray-600">No notifications to display</p>
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
              <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th
                onClick={() => onSort('message')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Message
                  {getSortIcon('message')}
                </div>
              </th>
              <th
                onClick={() => onSort('isRead')}
                className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Status
                  {getSortIcon('isRead')}
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
            {notifications.map((notification) => (
              <tr key={notification.id} className="hover:bg-gray-100 transition-colors">
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {notification.id}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {notification.userId}
                </td>
                <td className="px-4 xl:px-6 py-4 text-sm text-gray-700 max-w-xs">
                  <div className="truncate">{notification.message}</div>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getReadStatusBadge(notification.isRead)}`}>
                    {getReadStatusLabel(notification.isRead)}
                  </span>
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateToMelbourne(notification.createdAt)}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDateToMelbourne(notification.updatedAt)}
                </td>
                <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(notification.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium"
                      aria-label="Edit notification"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(notification.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                      aria-label="Delete notification"
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

      {/* Tablet Table View */}
      <div className="hidden md:block lg:hidden">
        <NotificationsTableTablet
          notifications={notifications}
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
        <NotificationsTableMobile notifications={notifications} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  )
}

export default NotificationsTable

