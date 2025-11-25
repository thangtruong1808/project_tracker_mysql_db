/**
 * useProjectCommentRealtime Hook
 * Handles GraphQL subscriptions for comment create, like, and update events
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
import { useEffect, useRef } from 'react'
import { useSubscription } from '@apollo/client'
import {
  COMMENT_CREATED_SUBSCRIPTION,
  COMMENT_DELETED_SUBSCRIPTION,
  COMMENT_LIKE_UPDATED_SUBSCRIPTION,
  COMMENT_UPDATED_SUBSCRIPTION,
} from '../graphql/subscriptions'

type ToastVariant = 'success' | 'info' | 'error'

interface UseProjectCommentRealtimeParams {
  projectId: string
  isProjectMember: boolean
  onRefetch?: () => Promise<void>
  showToast: (message: string, variant: ToastVariant, duration?: number) => void | Promise<void>
  onCommentDeleted?: (message: string) => void | Promise<void>
}

/**
 * Initialize comment-related subscriptions and side effects
 * Keeps comments list, likes, and edits synchronized across clients
 *
 * @author Thang Truong
 * @date 2025-11-25
 */
export const useProjectCommentRealtime = ({
  projectId,
  isProjectMember,
  onRefetch,
  showToast,
  onCommentDeleted,
}: UseProjectCommentRealtimeParams): void => {
  const processedCommentIds = useRef<Set<string>>(new Set())
  const processedLikeEvents = useRef<Set<string>>(new Set())
  const processedEditEvents = useRef<Set<string>>(new Set())
  const processedDeleteEvents = useRef<Set<string>>(new Set())

  const {
    data: commentSubscriptionData,
    error: commentSubscriptionError,
  } = useSubscription(COMMENT_CREATED_SUBSCRIPTION, {
    variables: { projectId },
    skip: !isProjectMember || !projectId,
    errorPolicy: 'ignore',
    shouldResubscribe: true,
  })

  const { data: likeSubscriptionData, error: likeSubscriptionError } = useSubscription(
    COMMENT_LIKE_UPDATED_SUBSCRIPTION,
    {
      variables: { projectId },
      skip: !isProjectMember || !projectId,
      errorPolicy: 'ignore',
      shouldResubscribe: true,
    }
  )

  const {
    data: editSubscriptionData,
    error: editSubscriptionError,
  } = useSubscription(COMMENT_UPDATED_SUBSCRIPTION, {
    variables: { projectId },
    skip: !isProjectMember || !projectId,
    errorPolicy: 'ignore',
    shouldResubscribe: true,
  })

  const {
    data: deleteSubscriptionData,
    error: deleteSubscriptionError,
  } = useSubscription(COMMENT_DELETED_SUBSCRIPTION, {
    variables: { projectId },
    skip: !isProjectMember || !projectId,
    errorPolicy: 'ignore',
    shouldResubscribe: true,
  })

  useEffect(() => {
    const handleNewComment = async (): Promise<void> => {
      if (commentSubscriptionData?.commentCreated && onRefetch) {
        const newComment = commentSubscriptionData.commentCreated
        const commentId = newComment.id || newComment.uuid
        if (!commentId || processedCommentIds.current.has(commentId)) {
          return
        }
        processedCommentIds.current.add(commentId)
        await showToast('New comment received!', 'info', 7000)
        await onRefetch()
      }
    }
    handleNewComment()
  }, [commentSubscriptionData, onRefetch, showToast])

  useEffect(() => {
    const handleLikeUpdate = async (): Promise<void> => {
      if (likeSubscriptionData?.commentLikeUpdated && onRefetch) {
        const likeEvent = likeSubscriptionData.commentLikeUpdated
        const eventKey = `${likeEvent.id}-${likeEvent.likesCount}-${likeEvent.updatedAt}`
        if (processedLikeEvents.current.has(eventKey)) {
          return
        }
        processedLikeEvents.current.add(eventKey)
        await showToast('Comment likes updated!', 'info', 2500)
        await onRefetch()
      }
    }
    handleLikeUpdate()
  }, [likeSubscriptionData, onRefetch, showToast])

  useEffect(() => {
    const handleEditUpdate = async (): Promise<void> => {
      if (editSubscriptionData?.commentUpdated && onRefetch) {
        const updatedComment = editSubscriptionData.commentUpdated
        const eventKey = `${updatedComment.id}-${updatedComment.updatedAt}`
        if (processedEditEvents.current.has(eventKey)) {
          return
        }
        processedEditEvents.current.add(eventKey)
        await showToast('Comment updated!', 'info', 2500)
        await onRefetch()
      }
    }
    handleEditUpdate()
  }, [editSubscriptionData, onRefetch, showToast])

  useEffect(() => {
    const handleDeleteUpdate = async (): Promise<void> => {
      if (deleteSubscriptionData?.commentDeleted && onRefetch) {
        const deletedComment = deleteSubscriptionData.commentDeleted
        const eventKey = `${deletedComment.id}-${deletedComment.updatedAt}`
        if (processedDeleteEvents.current.has(eventKey)) {
          return
        }
        processedDeleteEvents.current.add(eventKey)
        const friendlyMessage = 'A team member removed a comment. Your list has been refreshed.'
        await showToast(friendlyMessage, 'info', 2500)
        if (onCommentDeleted) {
          await onCommentDeleted('A comment was just removed by a team member. We updated the list for you.')
        }
        await onRefetch()
      }
    }
    handleDeleteUpdate()
  }, [deleteSubscriptionData, onCommentDeleted, onRefetch, showToast])

  useEffect(() => {
    if (
      (commentSubscriptionError || likeSubscriptionError || editSubscriptionError || deleteSubscriptionError) &&
      isProjectMember &&
      projectId
    ) {
      // Silent failure - comments will still update after refetch
    }
  }, [
    commentSubscriptionError,
    likeSubscriptionError,
    editSubscriptionError,
    deleteSubscriptionError,
    isProjectMember,
    projectId,
  ])
}

