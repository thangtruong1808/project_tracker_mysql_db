/**
 * DeleteNotificationDialog Component
 * Confirmation dialog for deleting a notification
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { DELETE_NOTIFICATION_MUTATION } from '../graphql/mutations'
import { NOTIFICATIONS_QUERY } from '../graphql/queries'
import { getReadStatusLabel } from '../utils/notificationUtils'

interface Notification {
  id: string
  userId: string
  message: string
  isRead: boolean
}

interface DeleteNotificationDialogProps {
  notification: Notification | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * DeleteNotificationDialog Component
 * Renders a confirmation dialog for deleting a notification
 *
 * @param notification - Notification object to delete (null when closed)
 * @param isOpen - Whether the dialog is open
 * @param onClose - Callback when dialog is closed
 * @param onSuccess - Callback when notification is successfully deleted
 * @returns JSX element containing delete confirmation dialog
 */
const DeleteNotificationDialog = ({ notification, isOpen, onClose, onSuccess }: DeleteNotificationDialogProps) => {
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Delete notification mutation
   * Refetches notifications list after successful deletion
   */
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION_MUTATION, {
    refetchQueries: [{ query: NOTIFICATIONS_QUERY }],
    awaitRefetchQueries: true,
  })

  /**
   * Handle delete confirmation
   * Deletes the notification and shows success/error message
   */
  const handleDelete = async () => {
    if (!notification) return

    setIsDeleting(true)

    try {
      await deleteNotification({
        variables: {
          id: notification.id,
        },
      })

      await showToast('Notification deleted successfully', 'success', 3000)
      onSuccess()
      onClose()
    } catch (error: any) {
      await showToast(
        error.message || 'Failed to delete notification. Please try again.',
        'error',
        5000
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !notification) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Notification</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this notification? This action cannot be undone.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1 line-clamp-2">
              <span className="font-medium">Message:</span> {notification.message}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">User ID:</span> {notification.userId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span> {getReadStatusLabel(notification.isRead)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete Notification'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteNotificationDialog

