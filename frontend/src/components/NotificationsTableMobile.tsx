/**
 * NotificationsTableMobile Component
 * Mobile card view for displaying notifications on small screens
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { formatDateToMelbourne, getReadStatusBadge, getReadStatusLabel } from '../utils/notificationUtils'

interface Notification {
  id: string
  userId: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationsTableMobileProps {
  notifications: Notification[]
  onEdit: (notificationId: string) => void
  onDelete: (notificationId: string) => void
}

/**
 * NotificationsTableMobile Component
 * Renders notifications as cards for mobile devices
 *
 * @param notifications - Array of notification objects to display
 * @param onEdit - Callback function when edit button is clicked
 * @param onDelete - Callback function when delete button is clicked
 * @returns JSX element containing mobile card view
 */
const NotificationsTableMobile = ({ notifications, onEdit, onDelete }: NotificationsTableMobileProps) => {
  return (
    <div className="space-y-3 p-3">
      {notifications.map((notification) => (
        <div key={notification.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 line-clamp-3">{notification.message}</p>
            </div>
            <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getReadStatusBadge(notification.isRead)} flex-shrink-0`}>
              {getReadStatusLabel(notification.isRead)}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-3 space-y-1">
            <p>ID: {notification.id}</p>
            <p>User ID: {notification.userId}</p>
            <p>Created: {formatDateToMelbourne(notification.createdAt)}</p>
            <p>Updated: {formatDateToMelbourne(notification.updatedAt)}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              onClick={() => onEdit(notification.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-xs font-medium touch-manipulation"
              aria-label="Edit notification"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(notification.id)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-200 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium touch-manipulation"
              aria-label="Delete notification"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationsTableMobile

