/**
 * DeleteCommentDialog Component
 * Confirmation dialog for deleting a comment
 *
 * @author Thang Truong
 * @date 2025-11-27
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { DELETE_COMMENT_MUTATION } from '../graphql/mutations'
import { COMMENTS_QUERY } from '../graphql/queries'

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface Comment {
  id: string
  uuid: string
  content: string
  projectId: string | null
  user: CommentUser
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

interface DeleteCommentDialogProps {
  comment: Comment | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * DeleteCommentDialog Component
 * Renders a confirmation dialog for deleting a comment
 *
 * @author Thang Truong
 * @date 2025-11-27
 * @param comment - Comment object to delete (null when closed)
 * @param isOpen - Whether the dialog is open
 * @param onClose - Callback when dialog is closed
 * @param onSuccess - Callback when comment is successfully deleted
 * @returns JSX element containing delete confirmation dialog
 */
const DeleteCommentDialog = ({ comment, isOpen, onClose, onSuccess }: DeleteCommentDialogProps) => {
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * Delete comment mutation
   * Refetches comments list after successful deletion
   * @author Thang Truong
   * @date 2025-11-27
   */
  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
    refetchQueries: [{ query: COMMENTS_QUERY }],
    awaitRefetchQueries: true,
  })

  /**
   * Handle delete confirmation
   * Deletes the comment and shows success/error message
   * @author Thang Truong
   * @date 2025-11-27
   */
  const handleDelete = async (): Promise<void> => {
    if (!comment) return

    setIsDeleting(true)

    try {
      await deleteComment({
        variables: {
          commentId: comment.id,
        },
      })

      await showToast('Comment deleted successfully', 'success', 7000)
      onSuccess()
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment. Please try again.'
      await showToast(errorMessage, 'error', 7000)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !comment) {
    return null
  }

  return (
    /* Delete Comment Dialog */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Comment</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 line-clamp-3">
              <span className="font-medium">Content:</span> {comment.content}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">User:</span> {comment.user.firstName} {comment.user.lastName}
            </p>
            {comment.projectId && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Project ID:</span> {comment.projectId}
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
            {isDeleting ? 'Deleting...' : 'Delete Comment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteCommentDialog
