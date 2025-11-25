/**
 * DeleteCommentDialog Component
 * Custom confirmation dialog for deleting a comment
 * Displays detailed information about the comment to be deleted
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useToast } from '../hooks/useToast'
import { DELETE_COMMENT_MUTATION } from '../graphql/mutations'
import { PROJECT_QUERY } from '../graphql/queries'
import { useParams } from 'react-router-dom'

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Comment {
  id: string
  content: string
  user: CommentUser
  createdAt: string
  updatedAt: string
  likesCount: number
}

interface DeleteCommentDialogProps {
  comment: Comment | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => Promise<void>
  projectId: string
}

/** Format date for display */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Invalid date'
  }
}

/**
 * DeleteCommentDialog Component
 * Renders a professional confirmation dialog for deleting comments
 * Shows comment details and provides clear action buttons
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const DeleteCommentDialog = ({ comment, isOpen, onClose, onSuccess, projectId }: DeleteCommentDialogProps) => {
  const { id: projectIdFromParams } = useParams<{ id: string }>()
  const { showToast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const [deleteComment] = useMutation(DELETE_COMMENT_MUTATION, {
    refetchQueries: [{ query: PROJECT_QUERY, variables: { id: projectIdFromParams || projectId } }],
    awaitRefetchQueries: true,
    onError: async (error) => {
      setIsDeleting(false)
      await showToast(error.message || 'Failed to delete comment. Please try again.', 'error', 7000)
    },
  })

  /** Handle delete confirmation - deletes comment and triggers refetch */
  const handleDelete = async (): Promise<void> => {
    if (!comment) return
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await deleteComment({ variables: { commentId: comment.id } })
      await showToast('Comment deleted successfully!', 'success', 7000)
      await onSuccess()
      onClose()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment. Please try again.'
      await showToast(errorMessage, 'error', 7000)
    } finally {
      setIsDeleting(false)
    }
  }

  /** Handle close dialog - prevents close during deletion */
  const handleClose = (): void => {
    if (!isDeleting) onClose()
  }

  /** Handle backdrop click to close dialog */
  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget && !isDeleting) onClose()
  }

  if (!isOpen || !comment) {
    return null
  }

  const isEdited = comment.createdAt !== comment.updatedAt
  const truncatedContent = comment.content.length > 150 ? `${comment.content.substring(0, 150)}...` : comment.content

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      {/* Dialog container */}
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
        {/* Header section */}
        <div className="p-6 border-b border-gray-200 bg-red-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">Delete Comment</h2>
              <p className="text-sm text-gray-600 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
        </div>
        {/* Content section */}
        <div className="p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            Are you sure you want to delete this comment? Once deleted, this comment and all associated likes will be permanently removed.
          </p>
          {/* Comment preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">{comment.user.firstName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.user.firstName} {comment.user.lastName}</span>
                  {isEdited && <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">Edited</span>}
                </div>
                <p className="text-xs text-gray-500 mb-2">{formatDate(comment.createdAt)}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{truncatedContent}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>{comment.likesCount} like{comment.likesCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          {/* Warning message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700">
              <span className="font-medium">Warning:</span> This action is permanent and cannot be reversed.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Delete Comment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteCommentDialog

