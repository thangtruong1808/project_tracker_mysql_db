/**
 * DeleteTaskDialog Component
 * Confirmation dialog for deleting a task
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { DELETE_TASK_MUTATION } from '../graphql/mutations'
import { TASKS_QUERY } from '../graphql/queries'
import { getStatusLabel, getPriorityLabel } from '../utils/taskUtils'

interface Task {
  id: string
  uuid: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  projectId: string
  assignedTo: string | null
}

interface DeleteTaskDialogProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * DeleteTaskDialog Component
 * Renders a confirmation dialog for deleting a task
 *
 * @param task - Task object to delete (null when closed)
 * @param isOpen - Whether the dialog is open
 * @param onClose - Callback when dialog is closed
 * @param onSuccess - Callback when task is successfully deleted
 * @returns JSX element containing delete confirmation dialog
 */
const DeleteTaskDialog = ({ task, isOpen, onClose, onSuccess }: DeleteTaskDialogProps) => {
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Delete task mutation
   * Refetches tasks list after successful deletion
   */
  const [deleteTask] = useMutation(DELETE_TASK_MUTATION, {
    refetchQueries: [{ query: TASKS_QUERY }],
    awaitRefetchQueries: true,
  })

  /**
   * Handle delete confirmation
   * Deletes the task and shows success/error message
   */
  const handleDelete = async () => {
    if (!task) return

    setIsDeleting(true)

    try {
      await deleteTask({
        variables: {
          id: task.id,
        },
      })

      await showToast('Task deleted successfully', 'success', 3000)
      onSuccess()
      onClose()
    } catch (error: any) {
      await showToast(
        error.message || 'Failed to delete task. Please try again.',
        'error',
        5000
      )
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !task) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Task</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{task.title}</span>? This action cannot be undone.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1 line-clamp-2">
              <span className="font-medium">Description:</span> {task.description}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Status:</span> {getStatusLabel(task.status)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Priority:</span> {getPriorityLabel(task.priority)}
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
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteTaskDialog

