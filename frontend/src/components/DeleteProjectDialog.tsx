/**
 * DeleteProjectDialog Component
 * Confirmation dialog for deleting a project
 *
 * @author Thang Truong
 * @date 2024-12-24
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { DELETE_PROJECT_MUTATION } from '../graphql/mutations'
import { PROJECTS_QUERY } from '../graphql/queries'
import { getStatusLabel } from '../utils/projectUtils'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
}

interface DeleteProjectDialogProps {
  project: Project | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * DeleteProjectDialog Component
 * Renders a confirmation dialog for deleting a project
 *
 * @param project - Project object to delete (null when closed)
 * @param isOpen - Whether the dialog is open
 * @param onClose - Callback when dialog is closed
 * @param onSuccess - Callback when project is successfully deleted
 * @returns JSX element containing delete confirmation dialog
 */
const DeleteProjectDialog = ({ project, isOpen, onClose, onSuccess }: DeleteProjectDialogProps) => {
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Delete project mutation
   * Refetches projects list after successful deletion
   */
  const [deleteProject] = useMutation(DELETE_PROJECT_MUTATION, {
    refetchQueries: [{ query: PROJECTS_QUERY }],
    awaitRefetchQueries: true,
  })

  /**
   * Handle delete confirmation
   * Deletes the project and shows success/error message
   */
  const handleDelete = async () => {
    if (!project) return

    setIsDeleting(true)

    try {
      await deleteProject({
        variables: {
          id: project.id,
        },
      })

      await showToast('Project deleted successfully', 'success', 7000)
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project. Please try again.'
      await showToast(errorMessage, 'error', 7000)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !project) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Project</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{project.name}</span>? This action cannot be undone.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span> {getStatusLabel(project.status)}
            </p>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                <span className="font-medium">Description:</span> {project.description}
              </p>
            )}
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
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteProjectDialog

