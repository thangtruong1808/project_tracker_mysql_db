/**
 * DeleteActivityLogDialog Component
 * Confirmation dialog for deleting activity log entries
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { DELETE_ACTIVITY_MUTATION } from '../graphql/mutations'
import { ACTIVITIES_QUERY } from '../graphql/queries'
import { getActivityTypeLabel } from '../utils/activityLogUtils'

interface ActivityLogSummary {
  id: string
  userId: string
  action: string | null
  type: string
}

interface DeleteActivityLogDialogProps {
  activity: ActivityLogSummary | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DeleteActivityLogDialog = ({ activity, isOpen, onClose, onSuccess }: DeleteActivityLogDialogProps) => {
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const [deleteActivity] = useMutation(DELETE_ACTIVITY_MUTATION, {
    refetchQueries: [{ query: ACTIVITIES_QUERY }],
    awaitRefetchQueries: true,
  })

  const handleDelete = async () => {
    if (!activity) return
    setIsDeleting(true)
    try {
      await deleteActivity({ variables: { id: activity.id } })
      await showToast('Activity log deleted successfully', 'success', 3000)
      onSuccess()
      onClose()
    } catch (error: any) {
      await showToast(error.message || 'Failed to delete activity log. Please try again.', 'error', 5000)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !activity) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Activity Log</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">Are you sure you want to delete this activity log? This action cannot be undone.</p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">ID:</span> #{activity.id}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">User:</span> {activity.userId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">Type:</span> {getActivityTypeLabel(activity.type)}
            </p>
            {activity.action && (
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">Action:</span> {activity.action}
              </p>
            )}
          </div>
        </div>
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
            {isDeleting ? 'Deleting...' : 'Delete Log'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteActivityLogDialog

