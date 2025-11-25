/**
 * DeleteUserDialog Component
 * Confirmation dialog for deleting a user
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { DELETE_USER_MUTATION } from '../graphql/mutations'
import { USERS_QUERY } from '../graphql/queries'

interface User {
  id: string
  uuid: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface DeleteUserDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * DeleteUserDialog Component
 * Renders a confirmation dialog for deleting a user
 *
 * @param user - User object to delete (null when closed)
 * @param isOpen - Whether the dialog is open
 * @param onClose - Callback when dialog is closed
 * @param onSuccess - Callback when user is successfully deleted
 * @returns JSX element containing delete confirmation dialog
 */
const DeleteUserDialog = ({ user, isOpen, onClose, onSuccess }: DeleteUserDialogProps) => {
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Delete user mutation
   * Refetches users list after successful deletion
   */
  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    refetchQueries: [{ query: USERS_QUERY }],
    awaitRefetchQueries: true,
  })

  /**
   * Handle delete confirmation
   * Deletes the user and shows success/error message
   */
  const handleDelete = async () => {
    if (!user) return

    setIsDeleting(true)

    try {
      await deleteUser({
        variables: {
          id: user.id,
        },
      })

      await showToast('User deleted successfully', 'success', 7000)
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user. Please try again.'
      await showToast(errorMessage, 'error', 7000)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !user) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete User</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete{' '}
            <span className="font-semibold">
              {user.firstName} {user.lastName}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Role:</span> {user.role}
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
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteUserDialog

