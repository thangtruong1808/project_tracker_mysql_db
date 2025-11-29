/**
 * CommentItem Component
 * Displays a single comment with user info, content, like, edit, and delete functionality
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { LIKE_COMMENT_MUTATION, UPDATE_COMMENT_MUTATION } from '../graphql/mutations'
import { PROJECT_QUERY } from '../graphql/queries'
import { useParams } from 'react-router-dom'
import CommentEditForm from './CommentEditForm'
import CommentHeader from './CommentHeader'
import DeleteCommentDialog from './DeleteCommentDialog'

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string
}

interface CommentItemProps {
  id: string
  content: string
  user: CommentUser
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
  projectId: string
}

/**
 * CommentItem Component
 * Displays comment with like, edit, and delete functionality for authenticated users
 * Only comment owners can edit and delete their comments
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const CommentItem = ({ id, content, user, likesCount, isLiked, createdAt, updatedAt, projectId }: CommentItemProps) => {
  const { id: projectIdFromParams } = useParams<{ id: string }>()
  const { isAuthenticated, user: currentUser } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isCommentOwner = Boolean(isAuthenticated && currentUser && currentUser.id === user.id)
  const isEdited = createdAt !== updatedAt

  const [likeComment] = useMutation(LIKE_COMMENT_MUTATION, {
    refetchQueries: [{ query: PROJECT_QUERY, variables: { id: projectIdFromParams || projectId } }],
    onError: async (error) => {
      setIsSubmitting(false)
      await showToast(error.message || 'Failed to like comment. Please try again.', 'error', 7000)
    },
  })

  const [updateComment] = useMutation(UPDATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: PROJECT_QUERY, variables: { id: projectIdFromParams || projectId } }],
    awaitRefetchQueries: true,
    onError: async (error) => {
      setIsSubmitting(false)
      await showToast(error.message || 'Failed to update comment. Please try again.', 'error', 7000)
    },
  })

  /**
   * Handle like button click
   * Backend checks DB and returns updated isLiked status
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleLike = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation()
    if (!isAuthenticated) {
      await showToast(
        'Please log in to like comments. Authentication is required to show your appreciation!',
        'info',
        5000
      )
      return
    }
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await likeComment({ variables: { commentId: id } })
      if (result.data?.likeComment?.success) {
        await showToast(result.data.likeComment.message || 'Comment liked successfully!', 'success', 7000)
      } else {
        await showToast(result.data?.likeComment?.message || 'Unable to like comment. Please try again.', 'info', 7000)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to like comment. Please try again.'
      await showToast(errorMessage, 'error', 7000)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle edit button click - enables edit mode
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setIsEditing(true)
  }

  /**
   * Handle save edited comment
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleSaveEdit = async (newContent: string): Promise<void> => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await updateComment({ variables: { commentId: id, content: newContent } })
      await showToast('Comment updated successfully!', 'success', 7000)
      setIsEditing(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update comment. Please try again.'
      await showToast(errorMessage, 'error', 7000)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle cancel edit
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleCancelEdit = (): void => {
    setIsEditing(false)
  }

  /** Handle delete button click - opens confirmation dialog */
  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }

  /** Handle delete dialog close */
  const handleDeleteDialogClose = (): void => {
    setIsDeleteDialogOpen(false)
  }

  /** Handle delete success - refetch handled by dialog mutation */
  const handleDeleteSuccess = async (): Promise<void> => {
    setIsDeleteDialogOpen(false)
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        {/* Edit form container */}
        <CommentEditForm
          initialContent={content}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          isSubmitting={isSubmitting}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      {/* Comment container */}
      <div className="flex items-start gap-3">
        {/* User avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">{user.firstName.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* Comment header with user info, timestamp, edited badge, and action buttons */}
          <CommentHeader
            user={user}
            createdAt={createdAt}
            isEdited={isEdited}
            isCommentOwner={isCommentOwner}
            isSubmitting={isSubmitting}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          {/* Comment text */}
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-2">{content}</p>
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Like comment`}
          >
            <svg
              className={`w-4 h-4 flex-shrink-0 transition-colors ${isLiked
                ? 'text-blue-600 fill-blue-600'
                : 'text-gray-400 hover:text-blue-500'
                }`}
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            <span className="font-medium">{likesCount}</span>
          </button>
        </div>
      </div>
      {/* Delete confirmation dialog */}
      {isDeleteDialogOpen && (
        <DeleteCommentDialog
          comment={{
            id,
            uuid: id,
            content,
            projectId: projectIdFromParams || projectId || null,
            user: { ...user, role: user.role || '' },
            likesCount,
            isLiked: false,
            createdAt,
            updatedAt,
          }}
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  )
}

export default CommentItem

