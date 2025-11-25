/**
 * ProjectDetailComments Component
 * Displays comments section for a project with authentication and membership check
 * Only authenticated users who are project members (or owner) can view and post comments
 *
 * @author Thang Truong
 * @date 2025-01-27
 */

import { useState, useMemo, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { CREATE_COMMENT_MUTATION } from '../graphql/mutations'
import { PROJECT_QUERY } from '../graphql/queries'
import { ProjectComment, ProjectMember, ProjectOwner } from '../types/comments'
import { useProjectCommentRealtime } from '../hooks/useProjectCommentRealtime'
import CommentItem from './CommentItem'
import ProjectDetailCommentsRestricted from './ProjectDetailCommentsRestricted'
import ProjectDetailCommentForm from './ProjectDetailCommentForm'

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
  const [deleteNotice, setDeleteNotice] = useState('')

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

  useProjectCommentRealtime({
    projectId,
    isProjectMember,
    onRefetch,
    showToast,
    onCommentDeleted: (message) => setDeleteNotice(message),
  })

  useEffect(() => {
    if (!deleteNotice) return
    const timer = setTimeout(() => setDeleteNotice(''), 6000)
    return () => clearTimeout(timer)
  }, [deleteNotice])

  const [createComment] = useMutation(CREATE_COMMENT_MUTATION, {
    refetchQueries: [{ query: PROJECT_QUERY, variables: { id } }],
    awaitRefetchQueries: true, // Wait for refetch to complete to ensure comments list updates
    onError: async (error) => {
      setIsSubmitting(false)
      await showToast(error.message || 'Failed to post comment. Please try again.', 'error', 7000)
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
      await showToast('Comment posted successfully!', 'success', 7000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to post comment. Please try again.'
      await showToast(errorMessage, 'error', 7000)
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
      {/* Comment delete notice */}
      {deleteNotice && (
        <div className="mb-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          {deleteNotice}
        </div>
      )}
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
              updatedAt={comment.updatedAt}
              projectId={projectId}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectDetailComments

