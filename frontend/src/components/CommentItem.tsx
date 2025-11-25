/**
 * CommentItem Component
 * Displays a single comment with user info, content, and like functionality
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { LIKE_COMMENT_MUTATION } from '../graphql/mutations'
import { PROJECT_QUERY } from '../graphql/queries'
import { useParams } from 'react-router-dom'

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface CommentItemProps {
  id: string
  content: string
  user: CommentUser
  likesCount: number
  isLiked: boolean
  createdAt: string
  projectId: string
}

/**
 * Format date for display
 * @author Thang Truong
 * @date 2025-01-27
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * CommentItem Component
 * Displays comment with like functionality for authenticated users
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const CommentItem = ({ id, content, user, likesCount, isLiked, createdAt, projectId }: CommentItemProps) => {
  const { id: projectIdFromParams } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [likeComment] = useMutation(LIKE_COMMENT_MUTATION, {
    refetchQueries: [{ query: PROJECT_QUERY, variables: { id: projectIdFromParams || projectId } }],
    onError: async (error) => {
      setIsSubmitting(false)
      await showToast(error.message || 'Failed to like comment. Please try again.', 'error', 5000)
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
        await showToast(result.data.likeComment.message || 'Comment liked successfully!', 'success', 3000)
      } else {
        await showToast(result.data?.likeComment?.message || 'Unable to like comment. Please try again.', 'info', 3000)
      }
    } catch (error: any) {
      await showToast(error.message || 'Failed to like comment. Please try again.', 'error', 5000)
    } finally {
      setIsSubmitting(false)
    }
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</span>
            <span className="text-xs text-gray-500">{formatDate(createdAt)}</span>
          </div>
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
    </div>
  )
}

export default CommentItem

