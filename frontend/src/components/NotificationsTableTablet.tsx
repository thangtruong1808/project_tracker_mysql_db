/**
 * NotificationsTableTablet Component
 * Tablet view for displaying notifications with simplified columns
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { getReadStatusBadge, getReadStatusLabel } from '../utils/notificationUtils'

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

interface NotificationsTableTabletProps {
  notifications: Notification[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit: (notificationId: string) => void
  onDelete: (notificationId: string) => void
  getSortIcon: (field: SortField) => JSX.Element
}

/**
 * NotificationsTableTablet Component
 * Renders notifications table for tablet devices with simplified columns
 *
 * @param notifications - Array of notification objects to display
 * @param sortField - Currently active sort field
 * @param sortDirection - Current sort direction (ASC or DESC)
 * @param onSort - Callback function when column header is clicked
 * @param onEdit - Callback function when edit button is clicked
 * @param onDelete - Callback function when delete button is clicked
 * @param getSortIcon - Function to get sort icon for column
 * @returns JSX element containing tablet table view
 */
const NotificationsTableTablet = ({
  notifications,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  getSortIcon,
}: NotificationsTableTabletProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => onSort('message')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Message
                {getSortIcon('message')}
              </div>
            </th>
            <th
              onClick={() => onSort('isRead')}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Status
                {getSortIcon('isRead')}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notifications.map((notification) => (
            <tr key={notification.id} className="hover:bg-gray-100 transition-colors">
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900 line-clamp-2">{notification.message}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getReadStatusBadge(notification.isRead)}`}>
                  {getReadStatusLabel(notification.isRead)}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
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
  )
}

export default NotificationsTableTablet

