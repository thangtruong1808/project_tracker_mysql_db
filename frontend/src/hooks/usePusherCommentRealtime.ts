/**
 * usePusherCommentRealtime Hook
 * Handles Pusher subscriptions for comment real-time updates
 *
 * @author Thang Truong
 * @date 2025-12-09
 */

import { useEffect, useRef, useCallback } from 'react'
import { subscribeToPusherEvent } from '../lib/pusher'

type ToastVariant = 'success' | 'info' | 'error'
type PusherData = { data?: { commentCreated?: CommentPayload; commentLikeUpdated?: CommentPayload; commentUpdated?: CommentPayload; commentDeleted?: CommentPayload } }
type CommentPayload = { id?: string; uuid?: string; projectId?: string; likesCount?: number; updatedAt?: string }

interface UsePusherCommentRealtimeParams {
  projectId: string
  isProjectMember: boolean
  onRefetch?: () => Promise<void>
  showToast: (message: string, variant: ToastVariant, duration?: number) => Promise<void> | void
  onCommentDeleted?: (message: string) => Promise<void> | void
}

/**
 * Initialize Pusher-based comment subscriptions
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
  const processedIds = useRef<Set<string>>(new Set())

  const handleEvent = useCallback(async (
    eventData: unknown,
    dataKey: 'commentCreated' | 'commentLikeUpdated' | 'commentUpdated' | 'commentDeleted',
    message: string,
    isDelete = false
  ): Promise<void> => {
    if (!onRefetch) return
    const data = eventData as PusherData
    const payload = data?.data?.[dataKey]
    if (!payload) return
    const eventProjectId = String(payload.projectId || '')
    if (eventProjectId !== String(projectId)) return
    const eventKey = `${dataKey}-${payload.id || ''}-${payload.likesCount || 0}-${payload.updatedAt || ''}`
    if (processedIds.current.has(eventKey)) return
    processedIds.current.add(eventKey)
    await showToast(message, 'info', isDelete ? 2500 : 7000)
    if (isDelete && onCommentDeleted) {
      await onCommentDeleted('A comment was removed by a team member.')
    }
    await onRefetch()
  }, [projectId, onRefetch, showToast, onCommentDeleted])

  useEffect(() => {
    if (!isProjectMember || !projectId || !onRefetch) return
    const channel = 'project-tracker'
    const unsub1 = subscribeToPusherEvent(channel, 'comment_created', (d) => handleEvent(d, 'commentCreated', 'New comment received!'))
    const unsub2 = subscribeToPusherEvent(channel, 'comment_like_updated', (d) => handleEvent(d, 'commentLikeUpdated', 'Comment likes updated!'))
    const unsub3 = subscribeToPusherEvent(channel, 'comment_updated', (d) => handleEvent(d, 'commentUpdated', 'Comment updated!'))
    const unsub4 = subscribeToPusherEvent(channel, 'comment_deleted', (d) => handleEvent(d, 'commentDeleted', 'Comment removed.', true))
    return () => { unsub1(); unsub2(); unsub3(); unsub4() }
  }, [projectId, isProjectMember, onRefetch, handleEvent])
}

