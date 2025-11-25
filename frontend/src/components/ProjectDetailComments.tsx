/**
 * ProjectDetailComments Component
 * Displays comments section for a project with authentication and membership check
 * Only authenticated users who are project members (or owner) can view and post comments
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState, useMemo, useEffect, useRef } from 'react'
import { useMutation, useSubscription } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { CREATE_COMMENT_MUTATION } from '../graphql/mutations'
import { PROJECT_QUERY } from '../graphql/queries'
import { COMMENT_CREATED_SUBSCRIPTION } from '../graphql/subscriptions'
import CommentItem from './CommentItem'
import ProjectDetailCommentsRestricted from './ProjectDetailCommentsRestricted'
import ProjectDetailCommentForm from './ProjectDetailCommentForm'

interface CommentUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface ProjectComment {
  id: string
  uuid: string
  content: string
  taskId: string
  user: CommentUser
  likesCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectMember {
  id: string
  projectId: string
  projectName: string
  userId: string
  memberName: string
  memberEmail: string
  role: string
  createdAt: string
  updatedAt: string
}

interface ProjectOwner {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface ProjectDetailCommentsProps {
  comments: ProjectComment[]
  projectId: string
  members: ProjectMember[]
  owner: ProjectOwner | null
  onRefetch?: () => Promise<void>
}

/**
 * ProjectDetailComments Component
 * Renders comments section with authentication and membership check
 * Only project members (or owner) can view and post comments
 *
 * @author Thang Truong
 * @date 2025-01-27
 */
const ProjectDetailComments = ({ comments, projectId, members, owner, onRefetch }: ProjectDetailCommentsProps) => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const processedCommentIds = useRef<Set<string>>(new Set())

  /**
   * Check if authenticated user is a project member or owner
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const isProjectMember = useMemo(() => {
    if (!isAuthenticated || !user) return false
    
    const userId = user.id
    const isOwner = owner?.id === userId
    const isMember = members.some(member => member.userId === userId)
    
    return isOwner || isMember
  }, [isAuthenticated, user, owner, members])


  /**
   * Subscribe to real-time comment updates
   * Receives new comments immediately when posted by other members
   * Subscription is optional - page works even if WebSocket is unavailable
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const { data: subscriptionData, error: subscriptionError } = useSubscription(COMMENT_CREATED_SUBSCRIPTION, {
    variables: { projectId },
    skip: !isProjectMember || !projectId,
    errorPolicy: 'ignore', // Don't treat subscription errors as fatal
    shouldResubscribe: true, // Retry subscription on reconnect
  })

  /**
   * Handle new comments received via subscription
   * Triggers refetch to get latest comments from server when new comment is received
   * Prevents duplicate toast messages for the same comment
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  useEffect(() => {
    const handleNewComment = async (): Promise<void> => {
      if (subscriptionData?.commentCreated && onRefetch) {
        const newComment = subscriptionData.commentCreated
        const commentId = newComment.id || newComment.uuid
        
        // Check if this comment has already been processed (prevent duplicate toasts)
        if (!commentId || processedCommentIds.current.has(commentId)) {
          return
        }
        
        // Mark comment as processed
        processedCommentIds.current.add(commentId)
        
        // Show toast notification for new comment
        await showToast('New comment received!', 'info', 3000)
        // Refetch comments from server to get latest data
        await onRefetch()
      }
    }
    handleNewComment()
  }, [subscriptionData, showToast, onRefetch])

  /**
   * Handle subscription errors silently
   * Real-time updates are optional - comments still work via polling/refetch
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  useEffect(() => {
    // Log subscription errors but don't show toast to user
    // Real-time updates are a nice-to-have, not required
    if (subscriptionError && isProjectMember && projectId) {
      // Silent failure - comments will still update via refetchQueries after mutations
    }
  }, [subscriptionError, isProjectMember, projectId])

  const [createComment] = useMutation(CREATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: PROJECT_QUERY, variables: { id } }],
    awaitRefetchQueries: true, // Wait for refetch to complete to ensure comments list updates
    onError: async (error) => {
      setIsSubmitting(false)
      await showToast(error.message || 'Failed to post comment. Please try again.', 'error', 5000)
    },
  })

  /**
   * Handle comment submission
   * Only authenticated project members (or owner) can post comments
   *
   * @author Thang Truong
   * @date 2025-01-27
   */
  const handleCommentSubmit = async (content: string): Promise<void> => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await createComment({
        variables: {
          projectId,
          content,
        },
      })
      await showToast('Comment posted successfully!', 'success', 3000)
    } catch (error: any) {
      await showToast(error.message || 'Failed to post comment. Please try again.', 'error', 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated || !isProjectMember) {
    return <ProjectDetailCommentsRestricted commentsCount={comments.length} isAuthenticated={isAuthenticated} />
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {/* Comments section container */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h2>
      {/* Comment form component */}
      <ProjectDetailCommentForm onSubmit={handleCommentSubmit} isSubmitting={isSubmitting} />
      {/* Comments list container */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              id={comment.id}
              content={comment.content}
              user={comment.user}
              likesCount={comment.likesCount}
              isLiked={comment.isLiked}
              createdAt={comment.createdAt}
              projectId={projectId}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectDetailComments

