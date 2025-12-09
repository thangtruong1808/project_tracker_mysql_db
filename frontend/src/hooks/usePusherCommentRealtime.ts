/**
 * usePusherCommentRealtime Hook
 * Handles Pusher subscriptions for comment real-time updates
 * Waits for channel to be ready before subscribing
 * Uses simplified deduplication to prevent blocking
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useEffect, useRef } from 'react'
import { subscribeToPusherEvent } from '../lib/pusher'
import { usePusher } from '../context/PusherContext'

type ToastVariant = 'success' | 'info' | 'error'
type PusherData = {
  data?: {
    commentCreated?: CommentPayload
    commentLikeUpdated?: CommentPayload
    commentUpdated?: CommentPayload
    commentDeleted?: CommentPayload
  }
}
type CommentPayload = {
  id?: string
  uuid?: string
  projectId?: string
  likesCount?: number
  updatedAt?: string
}

interface UsePusherCommentRealtimeParams {
  projectId: string
  isProjectMember: boolean
  onRefetch?: () => Promise<void>
  showToast: (message: string, variant: ToastVariant, duration?: number) => Promise<void> | void
  onCommentDeleted?: (message: string) => Promise<void> | void
}

/**
 * Initialize Pusher-based comment subscriptions
 * Subscribes only once per projectId change to prevent loops
 * @author Thang Truong
 * @date 2025-12-09
 * @param params - Hook parameters
 */
export const usePusherCommentRealtime = ({
  projectId,
  isProjectMember,
  onRefetch,
  showToast,
  onCommentDeleted,
}: UsePusherCommentRealtimeParams): void => {
  const { channelReady } = usePusher()
  /** Store callbacks in refs to prevent re-subscription on callback changes */
  const onRefetchRef = useRef(onRefetch)
  const showToastRef = useRef(showToast)
  const onCommentDeletedRef = useRef(onCommentDeleted)
  const projectIdRef = useRef(projectId)

  /** Update refs when props change without triggering re-subscription */
  useEffect(() => {
    onRefetchRef.current = onRefetch
    showToastRef.current = showToast
    onCommentDeletedRef.current = onCommentDeleted
    projectIdRef.current = projectId
  }, [onRefetch, showToast, onCommentDeleted, projectId])

  /**
   * Subscribe to Pusher events - only re-subscribes when projectId, membership, or channel ready state changes
   * @author Thang Truong
   * @date 2025-12-09
   */
  useEffect(() => {
    if (!isProjectMember || !projectId || !onRefetch || !channelReady) return

    /**
     * Handle incoming Pusher events for comments
     * @author Thang Truong
     * @date 2025-12-09
     */
    const handleEvent = async (
      eventData: unknown,
      dataKey: 'commentCreated' | 'commentLikeUpdated' | 'commentUpdated' | 'commentDeleted',
      message: string,
      isDelete = false
    ): Promise<void> => {
      if (!onRefetchRef.current) return
      const data = eventData as PusherData
      const payload = data?.data?.[dataKey]
      if (!payload) return
      const eventProjectId = String(payload.projectId || '')
      if (eventProjectId !== String(projectIdRef.current)) return
      await showToastRef.current(message, 'info', isDelete ? 2500 : 7000)
      if (isDelete && onCommentDeletedRef.current) {
        await onCommentDeletedRef.current('A comment was removed by a team member.')
      }
      await onRefetchRef.current()
    }

    const channel = 'project-tracker'
    const unsub1 = subscribeToPusherEvent(channel, 'comment_created', (d) =>
      handleEvent(d, 'commentCreated', 'New comment received!')
    )
    const unsub2 = subscribeToPusherEvent(channel, 'comment_like_updated', (d) =>
      handleEvent(d, 'commentLikeUpdated', 'Comment likes updated!')
    )
    const unsub3 = subscribeToPusherEvent(channel, 'comment_updated', (d) =>
      handleEvent(d, 'commentUpdated', 'Comment updated!')
    )
    const unsub4 = subscribeToPusherEvent(channel, 'comment_deleted', (d) =>
      handleEvent(d, 'commentDeleted', 'Comment removed.', true)
    )

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
    }
  }, [projectId, isProjectMember, channelReady]) // Wait for channelReady
}
