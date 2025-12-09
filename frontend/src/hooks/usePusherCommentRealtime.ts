/**
 * usePusherCommentRealtime Hook
 * Handles Pusher subscriptions for comment real-time updates
 * Replaces GraphQL subscriptions with Pusher for better compatibility
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useEffect, useRef } from 'react'
import { subscribeToPusherEvent } from '../lib/pusher'

type ToastVariant = 'success' | 'info' | 'error'

interface UsePusherCommentRealtimeParams {
  projectId: string
  isProjectMember: boolean
  onRefetch?: () => Promise<void>
  showToast: (message: string, variant: ToastVariant, duration?: number) => Promise<void> | void
  onCommentDeleted?: (message: string) => Promise<void> | void
}

/**
 * Initialize Pusher-based comment subscriptions
 * Handles comment create, like, update, and delete events via Pusher
 *
 * @author Thang Truong
 * @date 2025-01-27
 * @param params - Hook parameters
 */
export const usePusherCommentRealtime = ({
  projectId,
  isProjectMember,
  onRefetch,
  showToast,
  onCommentDeleted,
}: UsePusherCommentRealtimeParams): void => {
  const processedCommentIds = useRef<Set<string>>(new Set())
  const processedLikeEvents = useRef<Set<string>>(new Set())
  const processedEditEvents = useRef<Set<string>>(new Set())
  const processedDeleteEvents = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!isProjectMember || !projectId || !onRefetch) {
      return
    }

    const channel = 'project-tracker'
    const unsubscribes: Array<() => void> = []

    /**
     * Handle comment created event
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    const unsubscribeCreated = subscribeToPusherEvent(
      channel,
      'comment_created',
      async (data: any) => {
        if (data?.data?.commentCreated) {
          const newComment = data.data.commentCreated
          if (newComment.projectId === projectId) {
            const commentId = newComment.id || newComment.uuid
            if (!commentId || processedCommentIds.current.has(commentId)) {
              return
            }
            processedCommentIds.current.add(commentId)
            await showToast('New comment received!', 'info', 7000)
            await onRefetch()
          }
        }
      }
    )

    /**
     * Handle comment like updated event
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    const unsubscribeLike = subscribeToPusherEvent(
      channel,
      'comment_like_updated',
      async (data: any) => {
        if (data?.data?.commentLikeUpdated) {
          const likeEvent = data.data.commentLikeUpdated
          if (likeEvent.projectId === projectId) {
            const eventKey = `${likeEvent.id}-${likeEvent.likesCount}-${likeEvent.updatedAt}`
            if (processedLikeEvents.current.has(eventKey)) {
              return
            }
            processedLikeEvents.current.add(eventKey)
            await showToast('Comment likes updated!', 'info', 2500)
            await onRefetch()
          }
        }
      }
    )

    /**
     * Handle comment updated event
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    const unsubscribeUpdated = subscribeToPusherEvent(
      channel,
      'comment_updated',
      async (data: any) => {
        if (data?.data?.commentUpdated) {
          const updatedComment = data.data.commentUpdated
          if (updatedComment.projectId === projectId) {
            const eventKey = `${updatedComment.id}-${updatedComment.updatedAt}`
            if (processedEditEvents.current.has(eventKey)) {
              return
            }
            processedEditEvents.current.add(eventKey)
            await showToast('Comment updated!', 'info', 2500)
            await onRefetch()
          }
        }
      }
    )

    /**
     * Handle comment deleted event
     *
     * @author Thang Truong
     * @date 2025-01-27
     */
    const unsubscribeDeleted = subscribeToPusherEvent(
      channel,
      'comment_deleted',
      async (data: any) => {
        if (data?.data?.commentDeleted) {
          const deletedComment = data.data.commentDeleted
          if (deletedComment.projectId === projectId) {
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
      }
    )

    unsubscribes.push(unsubscribeCreated, unsubscribeLike, unsubscribeUpdated, unsubscribeDeleted)

    // Cleanup all subscriptions on unmount
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [projectId, isProjectMember, onRefetch, showToast, onCommentDeleted])
}

